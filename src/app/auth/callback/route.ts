import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    // En entornos de Docker detrás de un proxy (Easypanel), request.url puede ser evaluado como 0.0.0.0
    // Por eso usamos prioritariamente NEXT_PUBLIC_SITE_URL.
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin

    const getRedirectUrl = (path: string) => {
        const cleanPath = path.startsWith('/') ? path : `/${path}`
        return `${baseUrl}${cleanPath}`
    }

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(getRedirectUrl(next))
        }
    }

    // Si hay error o el código expiró/ya se usó, redirigir a login con mensaje
    return NextResponse.redirect(getRedirectUrl('/login'))
}
