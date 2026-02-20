'use client'

import { useState } from 'react'

interface CatalogItem {
    id: string
    nombre: string
    codigo_sku: string | null
    precio_base: number
}

interface AIResult {
    cliente_nombre?: string
    cliente_email?: string
    items: {
        item_id: string
        nombre: string
        cantidad: number
        precio_unitario: number
    }[]
    no_encontrados?: string[]
    notas_sugeridas?: string
}

interface AICotizarProps {
    catalogItems: CatalogItem[]
    onResult: (result: AIResult) => void
}

export function AICotizar({ catalogItems, onResult }: AICotizarProps) {
    const [open, setOpen] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [warnings, setWarnings] = useState<string[]>([])

    async function handleSubmit() {
        if (!mensaje.trim()) return

        setLoading(true)
        setError(null)
        setWarnings([])

        try {
            const res = await fetch('/api/ai-cotizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mensaje: mensaje.trim(),
                    catalogo: catalogItems,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error al procesar la solicitud')
                setLoading(false)
                return
            }

            // Mostrar advertencias de ítems no encontrados
            if (data.no_encontrados && data.no_encontrados.length > 0) {
                setWarnings(data.no_encontrados)
            }

            onResult(data)
            setMensaje('')
            setOpen(false)
        } catch {
            setError('Error de conexión. Intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
                }}
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                Cotizar con IA
            </button>
        )
    }

    return (
        <div
            className="rounded-2xl p-5 space-y-4 animate-in"
            style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(236,72,153,0.06) 50%, rgba(245,158,11,0.04) 100%)',
                border: '1px solid rgba(139,92,246,0.2)',
            }}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                    Asistente de Cotización con IA
                </h3>
                <button
                    type="button"
                    onClick={() => { setOpen(false); setError(null); setWarnings([]) }}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div>
                <textarea
                    value={mensaje}
                    onChange={e => setMensaje(e.target.value)}
                    rows={3}
                    placeholder='Ej: "Necesito cotizarle a Juan Pérez 3 diseños arquitectónicos y 2 asesorías técnicas"'
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmit()
                        }
                    }}
                    disabled={loading}
                />
                <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Describe la cotización en lenguaje natural. La IA la mapeará a tu catálogo automáticamente.
                </p>
            </div>

            {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {warnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                    <p className="font-medium mb-1">⚠️ Ítems no encontrados en tu catálogo:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        {warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !mensaje.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: loading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        boxShadow: loading ? 'none' : '0 4px 15px rgba(139,92,246,0.3)',
                    }}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Procesando...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                            Generar Cotización
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
