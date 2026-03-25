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
    tipo_documento: string
    cliente_nombre: string
    cliente_email: string
    subtotal: number
    impuestos: number
    total: number
    notas_visibles: string | null
    temas_legales_visibles: string | null
    exclusiones_visibles: string | null
    texto_anexos: string | null
    mostrar_anexos: boolean
    firma_url: string | null
    items: CotizacionLineItem[]
    empresa_id?: string | null
}

export async function updateCotizacion(id: string, data: CotizacionFormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado', id: null }

    // 1. Actualizar la cotización
    const { error: cotError } = await supabase
        .from('cotizaciones')
        .update({
            tipo_documento: data.tipo_documento,
            cliente_nombre: data.cliente_nombre,
            cliente_email: data.cliente_email || null,
            subtotal: data.subtotal,
            impuestos: data.impuestos,
            total: data.total,
            notas_visibles: data.notas_visibles,
            temas_legales_visibles: data.temas_legales_visibles,
            exclusiones_visibles: data.exclusiones_visibles,
            texto_anexos: data.texto_anexos,
            mostrar_anexos: data.mostrar_anexos,
            firma_url: data.firma_url,
            empresa_id: data.empresa_id || null,
        })
        .eq('id', id)

    if (cotError) return { error: cotError.message, id: null }

    // 2. Eliminar líneas de detalle anteriores
    const { error: delError } = await supabase
        .from('cotizacion_items')
        .delete()
        .eq('cotizacion_id', id)

    if (delError) return { error: delError.message, id }

    // 3. Insertar las nuevas líneas de detalle
    if (data.items.length > 0) {
        const lineItems = data.items.map(item => ({
            cotizacion_id: id,
            item_id: item.item_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            precio_total: item.precio_total,
        }))

        const { error: lineError } = await supabase
            .from('cotizacion_items')
            .insert(lineItems)

        if (lineError) return { error: lineError.message, id }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/editar-cotizacion/${id}`)
    return { error: null, id }
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
