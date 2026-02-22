import { createClient } from '@/lib/supabase/server'
import { CotizacionForm } from './components/CotizacionForm'

export default async function CrearCotizacionPage() {
    const supabase = await createClient()

    const { data: items } = await supabase
        .from('items')
        .select('id, nombre, codigo_sku, precio_base, categoria, recurrencia')
        .order('nombre', { ascending: true })

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600">Nueva Cotización</h1>
                <p className="text-slate-400 mt-1">Completa los datos para crear tu cotización</p>
            </div>

            <CotizacionForm catalogItems={items || []} />
        </div>
    )
}
