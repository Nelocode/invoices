'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

type Cotizacion = {
    id: string
    cliente_nombre: string
    cliente_email: string
    total: number
    estado: string
    creado_en: string
}

const ESTADOS = [
    { id: 'En proceso', label: 'En proceso', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
    { id: 'Enviado', label: 'Enviado', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
    { id: 'Pagado', label: 'Pagado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
    { id: 'Ganado', label: 'Terminado Ganado', color: 'bg-green-500/10 text-green-400 border-green-500/20', dot: 'bg-green-400' },
    { id: 'Perdido', label: 'Terminado Perdido', color: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' }
]

export default function KanbanBoard({ initialCotizaciones }: { initialCotizaciones: Cotizacion[] }) {
    const [cotizaciones, setCotizaciones] = useState(initialCotizaciones)
    const [updating, setUpdating] = useState<string | null>(null)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const formatPrice = (n: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    const handleChangeEstado = async (id: string, nuevoEstado: string) => {
        setUpdating(id)
        const { error } = await supabase
            .from('cotizaciones')
            .update({ estado: nuevoEstado })
            .eq('id', id)

        if (!error) {
            setCotizaciones(prev =>
                prev.map(cot => cot.id === id ? { ...cot, estado: nuevoEstado } : cot)
            )
        } else {
            alert('Error al actualizar el estado')
        }
        setUpdating(null)
    }

    const grouped = ESTADOS.reduce((acc, estado) => {
        acc[estado.id] = cotizaciones.filter(c => c.estado === estado.id || (estado.id === 'En proceso' && !ESTADOS.find(e => e.id === c.estado)))
        return acc
    }, {} as Record<string, Cotizacion[]>)

    return (
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
            {ESTADOS.map((estado) => (
                <div key={estado.id} className="flex-none w-80 min-h-[500px] rounded-2xl bg-slate-900/50 border border-slate-800 p-4 snap-start flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${estado.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
                            {estado.label}
                        </div>
                        <span className="text-sm text-slate-500 font-medium">
                            {grouped[estado.id].length}
                        </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                        {grouped[estado.id].length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <p className="text-slate-500 text-sm">Vacío</p>
                            </div>
                        ) : (
                            grouped[estado.id].map(cot => (
                                <div
                                    key={cot.id}
                                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors"
                                >
                                    <Link href={`/dashboard/cotizacion/${cot.id}`} className="block mb-3">
                                        <div className="font-semibold text-white mb-1 truncate" title={cot.cliente_nombre}>
                                            {cot.cliente_nombre}
                                        </div>
                                        <div className="text-xs text-slate-400 flex justify-between">
                                            <span>#{cot.id.slice(0, 8).toUpperCase()}</span>
                                            <span>{formatDate(cot.creado_en)}</span>
                                        </div>
                                        <div className="mt-2 text-sm font-bold text-white">
                                            {formatPrice(cot.total)}
                                        </div>
                                    </Link>

                                    <div className="pt-3 border-t border-slate-700/50">
                                        <select
                                            value={cot.estado}
                                            onChange={(e) => handleChangeEstado(cot.id, e.target.value)}
                                            disabled={updating === cot.id}
                                            className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-fuchsia-500 disabled:opacity-50"
                                        >
                                            {ESTADOS.map(e => (
                                                <option key={e.id} value={e.id}>{e.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
