import { createClient } from '@/lib/supabase/server'
import { CotizacionForm } from './components/CotizacionForm'

export default async function CrearCotizacionPage() {
    const supabase = await createClient()

    const { data: items } = await supabase
        .from('items')
        .select('id, nombre, codigo_sku, precio_base, categoria, recurrencia')
        .order('nombre', { ascending: true })

    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user?.id)
        .single()

    const empresaId = profile?.empresa_id

    // Obtener los clientes vinculados a la empresa o al usuario
    let clientes = []
    if (empresaId) {
        const { data } = await supabase
            .from('clientes')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('nombre', { ascending: true })
        clientes = data || []
    } else {
        const { data } = await supabase
            .from('clientes')
            .select('*')
            .eq('user_id', user?.id)
            .order('nombre', { ascending: true })
        clientes = data || []
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600">Nueva Cotización</h1>
                <p className="text-slate-400 mt-1">Completa los datos para crear tu cotización</p>
            </div>

            <CotizacionForm catalogItems={items || []} clientes={clientes || []} empresaId={empresaId} />
        </div>
    )
}
