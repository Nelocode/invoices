import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './components/ProfileForm'

export default async function PerfilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('usuarios')
        .select('nombre_completo, empresa, telefono, logo_url')
        .eq('id', user.id)
        .single()

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Mi Perfil</h1>
                <p className="mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Personaliza tu cuenta y logo de empresa</p>
            </div>

            <ProfileForm
                initialLogoUrl={profile?.logo_url || null}
                userName={profile?.nombre_completo || user.email || 'Usuario'}
                userCompany={profile?.empresa || null}
                userEmail={user.email || ''}
            />
        </div>
    )
}
