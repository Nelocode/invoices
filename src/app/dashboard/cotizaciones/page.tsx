import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CotizacionesPage() {
    const supabase = await createClient()

    const { data: cotizaciones } = await supabase
        .from('cotizaciones')
        .select('id, cliente_nombre, cliente_email, total, estado, creado_en')
        .order('creado_en', { ascending: false })

    const formatPrice = (n: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    const estadoStyles: Record<string, string> = {
        'Pagado': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Enviado': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Ganado': 'bg-green-500/10 text-green-400 border-green-500/20',
        'Perdido': 'bg-red-500/10 text-red-400 border-red-500/20',
        'En proceso': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    }

    const estadoDot: Record<string, string> = {
        'Pagado': 'bg-emerald-400',
        'Enviado': 'bg-blue-400',
        'Ganado': 'bg-green-400',
        'Perdido': 'bg-red-400',
        'En proceso': 'bg-amber-400',
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">Cotizaciones</h1>
                    <p className="text-white/50 mt-1">Historial de cotizaciones generadas</p>
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
                <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(252,126,191,0.1)' }}>
                        <svg className="w-8 h-8" style={{ color: '#fc7ebf' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Sin cotizaciones aún</h3>
                    <p className="text-white/50 text-sm mb-4">Crea tu primera cotización para verla aquí</p>
                    <Link
                        href="/dashboard/crear-cotizacion"
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl transition-colors"
                        style={{ color: '#fc7ebf', background: 'rgba(252,126,191,0.08)', border: '1px solid rgba(252,126,191,0.2)' }}
                    >
                        Crear Cotización
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {cotizaciones.map((cot) => (
                        <Link
                            key={cot.id}
                            href={`/dashboard/cotizacion/${cot.id}`}
                            className="flex items-center justify-between p-5 rounded-2xl transition-all duration-200 group"
                            style={{
                                background: 'rgba(255,255,255,0.025)',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(252,126,191,0.08)' }}>
                                    <svg className="w-5 h-5" style={{ color: '#fc7ebf' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-white truncate">
                                        {cot.cliente_nombre}
                                    </div>
                                    <div className="text-xs text-white/40 mt-0.5">
                                        #{cot.id.slice(0, 8).toUpperCase()} · {formatDate(cot.creado_en)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${estadoStyles[cot.estado] || estadoStyles['En proceso']}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${estadoDot[cot.estado] || estadoDot['En proceso']}`} />
                                    {cot.estado}
                                </span>
                                <span className="text-sm font-bold text-white min-w-[100px] text-right">
                                    {formatPrice(cot.total)}
                                </span>
                                <svg className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
