'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CotizacionLineItem {
    item_id: string
    cantidad: number
    precio_unitario: number
    precio_total: number
}

export interface CotizacionFormData {
    cliente_nombre: string
    cliente_email: string
    subtotal: number
    impuestos: number
    total: number
    notas_visibles: string | null
    temas_legales_visibles: string | null
    exclusiones_visibles: string | null
    firma_url: string | null
    items: CotizacionLineItem[]
}

export async function saveCotizacion(data: CotizacionFormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado', id: null }

    // 1. Insertar la cotización
    const { data: cotizacion, error: cotError } = await supabase
        .from('cotizaciones')
        .insert({
            usuario_id: user.id,
            cliente_nombre: data.cliente_nombre,
            cliente_email: data.cliente_email || null,
            subtotal: data.subtotal,
            impuestos: data.impuestos,
            total: data.total,
            notas_visibles: data.notas_visibles,
            temas_legales_visibles: data.temas_legales_visibles,
            exclusiones_visibles: data.exclusiones_visibles,
            firma_url: data.firma_url,
            estado: 'En proceso',
        })
        .select('id')
        .single()

    if (cotError) return { error: cotError.message, id: null }

    // 2. Insertar las líneas de detalle
    if (data.items.length > 0) {
        const lineItems = data.items.map(item => ({
            cotizacion_id: cotizacion.id,
            item_id: item.item_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            precio_total: item.precio_total,
        }))

        const { error: lineError } = await supabase
            .from('cotizacion_items')
            .insert(lineItems)

        if (lineError) return { error: lineError.message, id: cotizacion.id }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/crear-cotizacion')
    return { error: null, id: cotizacion.id }
}

export async function uploadFirma(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado', url: null }

    const file = formData.get('file') as File
    if (!file) return { error: 'No se seleccionó archivo', url: null }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
        .from('firmas')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        })

    if (error) return { error: error.message, url: null }

    const { data: { publicUrl } } = supabase.storage
        .from('firmas')
        .getPublicUrl(fileName)

    return { error: null, url: publicUrl }
}
