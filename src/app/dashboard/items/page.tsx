import { createClient } from '@/lib/supabase/server'
import { ItemsTable } from './components/ItemsTable'

export default async function ItemsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>No autorizado</div>
    }

    const { data: profile } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    const empresaId = profile?.empresa_id

    let items = []
    if (empresaId) {
        const { data } = await supabase
            .from('items')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('creado_en', { ascending: false })

        items = data || []
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600">Catálogo de Ítems</h1>
                <p className="text-slate-400 mt-1">Gestiona los productos y servicios que ofreces</p>
            </div>

            <ItemsTable initialItems={items || []} empresaId={empresaId} />
        </div>
    )
}
