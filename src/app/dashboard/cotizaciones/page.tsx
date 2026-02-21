import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import KanbanBoard from './KanbanBoard'

export default async function CotizacionesPage() {
    const supabase = await createClient()

    const { data: cotizaciones } = await supabase
        .from('cotizaciones')
        .select('id, cliente_nombre, cliente_email, total, estado, creado_en')
        .order('creado_en', { ascending: false })

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">Cotizaciones (Pipeline)</h1>
                    <p className="text-white/50 mt-1">Gestiona el estado de tus cotizaciones</p>
                </div>
                <Link
                    href="/dashboard/crear-cotizacion"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all"
                    style={{
                        background: 'linear-gradient(135deg, #fc7ebf 0%, #a855f7 100%)',
                        boxShadow: '0 4px 20px rgba(252,126,191,0.25)',
                    }}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Nueva Cotización
                </Link>
            </div>

            {(!cotizaciones || cotizaciones.length === 0) ? (
                <div className="rounded-2xl p-12 text-center mt-10" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(252,126,191,0.1)' }}>
                        <svg className="w-8 h-8" style={{ color: '#fc7ebf' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Sin cotizaciones aún</h3>
                    <p className="text-white/50 text-sm mb-4">Crea tu primera cotización para verla en el tablero</p>
                    <Link
                        href="/dashboard/crear-cotizacion"
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl transition-colors"
                        style={{ color: '#fc7ebf', background: 'rgba(252,126,191,0.08)', border: '1px solid rgba(252,126,191,0.2)' }}
                    >
                        Crear Cotización
                    </Link>
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <KanbanBoard initialCotizaciones={cotizaciones} />
                </div>
            )}
        </div>
    )
}

