'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ItemFormData {
    nombre: string
    codigo_sku: string
    descripcion: string
    precio_base: number
    notas_internas: string
    categoria: string
    recurrencia?: string
}

export async function getItems() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('creado_en', { ascending: false })

    if (error) return { data: null, error: error.message }
    return { data, error: null }
}

export async function createItem(formData: ItemFormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase.from('items').insert({
        usuario_id: user.id,
        nombre: formData.nombre,
        codigo_sku: formData.codigo_sku || null,
        descripcion: formData.descripcion || null,
        precio_base: formData.precio_base,
        notas_internas: formData.notas_internas || null,
        categoria: formData.categoria || 'Pago único',
        recurrencia: formData.categoria === 'Pago recurrente' ? formData.recurrencia : null,
    })

    if (error) return { error: error.message }

    revalidatePath('/dashboard/items')
    revalidatePath('/dashboard')
    return { error: null }
}

export async function updateItem(id: string, formData: ItemFormData) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('items')
        .update({
            nombre: formData.nombre,
            codigo_sku: formData.codigo_sku || null,
            descripcion: formData.descripcion || null,
            precio_base: formData.precio_base,
            notas_internas: formData.notas_internas || null,
            categoria: formData.categoria || 'Pago único',
            recurrencia: formData.categoria === 'Pago recurrente' ? formData.recurrencia : null,
        })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/items')
    revalidatePath('/dashboard')
    return { error: null }
}

export async function deleteItem(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/items')
    revalidatePath('/dashboard')
    return { error: null }
}
