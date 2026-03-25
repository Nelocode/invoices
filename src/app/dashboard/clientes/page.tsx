import { createClient } from '@/lib/supabase/server'
import ClientesManager from '@/app/dashboard/clientes/ClientesManager'

export default async function ClientesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>No autorizado</div>
    }

    // Obtener la empresa del usuario
    const { data: profile } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    const empresaId = profile?.empresa_id

    // Obtener los clientes de la empresa
    let clientes = []
    if (empresaId) {
        const { data } = await supabase
            .from('clientes')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('nombre', { ascending: true })
        clientes = data || []
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">Mis Clientes</h1>
                    <p className="text-white/50 mt-1">Gestiona tu base de datos de clientes para agilizar rus cotizaciones</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-[#0B0314]/60 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <ClientesManager initialClientes={clientes || []} userId={user.id} empresaId={empresaId} />
            </div>
        </div>
    )
}
