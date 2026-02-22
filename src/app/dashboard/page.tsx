import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('usuarios')
        .select('nombre_completo, empresa')
        .eq('id', user!.id)
        .single()

    const { count: itemsCount } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })

    const { count: cotizacionesCount } = await supabase
        .from('cotizaciones')
        .select('*', { count: 'exact', head: true })

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                    ¡Hola, {profile?.nombre_completo?.split(' ')[0] || 'Usuario'}! 👋
                </h1>
                <p className="text-slate-400 mt-1">
                    Aquí tienes un resumen de tu cuenta
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Items */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-fuchsia-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{itemsCount || 0}</p>
                    <p className="text-sm text-slate-400 mt-1">Ítems en catálogo</p>
                </div>

                {/* Cotizaciones */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{cotizacionesCount || 0}</p>
                    <p className="text-sm text-slate-400 mt-1">Cotizaciones creadas</p>
                </div>

                {/* Empresa */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white truncate">{profile?.empresa || '—'}</p>
                    <p className="text-sm text-slate-400 mt-1">Tu empresa</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Acciones rápidas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                        href="/dashboard/items"
                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-fuchsia-500/30 hover:bg-slate-800 transition-all duration-200 group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center group-hover:bg-fuchsia-500/20 transition-colors">
                            <svg className="w-5 h-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Agregar Ítem</p>
                            <p className="text-xs text-slate-500">Añade productos o servicios</p>
                        </div>
                    </a>
                    <a
                        href="/dashboard/crear-cotizacion"
                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 hover:bg-slate-800 transition-all duration-200 group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Nueva Cotización</p>
                            <p className="text-xs text-slate-500">Crea una cotización para tu cliente</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    )
}
