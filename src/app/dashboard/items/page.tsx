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
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Catálogo de Ítems</h1>
                <p className="text-slate-400 mt-1">Gestiona tus productos y servicios</p>
            </div>

            <ItemsTable initialItems={items || []} />
        </div>
    )
}
