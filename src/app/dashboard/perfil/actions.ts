'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadLogo(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado', url: null }

    const file = formData.get('file') as File
    if (!file) return { error: 'No se seleccionó archivo', url: null }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
        })

    if (error) return { error: error.message, url: null }

    const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)

    // Guardar la URL en el perfil del usuario
    const { error: updateError } = await supabase
        .from('usuarios')
        .update({ logo_url: publicUrl })
        .eq('id', user.id)

    if (updateError) return { error: updateError.message, url: null }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/perfil')

    return { error: null, url: publicUrl }
}

export async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('usuarios')
        .select('nombre_completo, empresa, telefono, logo_url, info_bancaria, link_pago')
        .eq('id', user.id)
        .single()

    return { ...profile, email: user.email }
}

export async function savePaymentInfo(bankInfo: string | null, paymentLink: string | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    const { error: updateError } = await supabase
        .from('usuarios')
        .update({
            info_bancaria: bankInfo,
            link_pago: paymentLink
        })
        .eq('id', user.id)

    if (updateError) return { error: updateError.message }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/perfil')
    revalidatePath('/dashboard/crear-cotizacion')

    return { error: null }
}

export async function createEmpresa(nombre: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }
    if (!nombre.trim()) return { error: 'El nombre de la empresa es requerido' }

    // Generar una clave de acceso aleatoria (ej: 6 caracteres en mayúsculas)
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let clave_acceso = ''
    for (let i = 0; i < 6; i++) {
        clave_acceso += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    // 1. Crear la empresa
    const { data: empresa, error: createError } = await supabase
        .from('empresas')
        .insert([{ nombre: nombre.trim(), clave_acceso }])
        .select()
        .single()

    if (createError) return { error: createError.message }

    // 2. Asignar el usuario actual como administrador de esta empresa
    const { error: setCompanyError } = await supabase
        .from('usuarios')
        .update({
            empresa_id: empresa.id,
            rol: 'admin' // Al ser el creador, es admin
        })
        .eq('id', user.id)

    if (setCompanyError) return { error: setCompanyError.message }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/perfil')

    return { error: null, empresa }
}

export async function joinEmpresa(claveAcceso: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }
    if (!claveAcceso.trim()) return { error: 'La clave de acceso es requerida' }

    // 1. Buscar la empresa con esa clave
    const { data: empresa, error: searchError } = await supabase
        .from('empresas')
        .select('id, nombre')
        .eq('clave_acceso', claveAcceso.trim().toUpperCase())
        .single()

    if (searchError || !empresa) {
        return { error: 'Clave de acceso inválida o empresa no encontrada' }
    }

    // 2. Asociar el usuario a la empresa como colaborador
    const { error: joinError } = await supabase
        .from('usuarios')
        .update({
            empresa_id: empresa.id,
            rol: 'colaborador' // Por defecto se une como colaborador
        })
        .eq('id', user.id)

    if (joinError) return { error: joinError.message }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/perfil')

    return { error: null, empresa }
}
