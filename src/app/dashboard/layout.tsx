import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from './components/Sidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Obtener perfil del usuario
    const { data: profile } = await supabase
        .from('usuarios')
        .select('nombre_completo, empresa')
        .eq('id', user.id)
        .single()

    return (
        <div className="flex h-screen bg-slate-950">
            <Sidebar
                userName={profile?.nombre_completo || user.email || 'Usuario'}
                userCompany={profile?.empresa || ''}
                userEmail={user.email || ''}
            />
            <main className="flex-1 overflow-auto">
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
