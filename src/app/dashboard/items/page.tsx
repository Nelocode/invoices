import { createClient } from '@/lib/supabase/server'
import { ItemsTable } from './components/ItemsTable'

export default async function ItemsPage() {
    const supabase = await createClient()

    const { data: items } = await supabase
        .from('items')
        .select('*')
        .order('creado_en', { ascending: false })

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600">Catálogo de Ítems</h1>
                <p className="text-slate-400 mt-1">Gestiona los productos y servicios que ofreces</p>
            </div>

            <ItemsTable initialItems={items || []} />
        </div>
    )
}
