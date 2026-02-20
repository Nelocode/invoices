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
        .select('nombre_completo, empresa, telefono, logo_url')
        .eq('id', user.id)
        .single()

    return { ...profile, email: user.email }
}
