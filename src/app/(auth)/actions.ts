'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const nombreCompleto = formData.get('nombre_completo') as string
    const empresa = formData.get('empresa') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nombre_completo: nombreCompleto,
                empresa: empresa,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function recuperarPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/actualizar-password`,
    })

    if (error) {
        return { error: error.message }
    }
    return { success: true }
}

export async function actualizarPassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return { error: error.message }
    }
    redirect('/dashboard')
}
