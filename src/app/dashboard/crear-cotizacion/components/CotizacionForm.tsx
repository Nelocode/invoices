'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveCotizacion } from '../actions'
import { ItemSelector, type LineItem } from './ItemSelector'
import { FirmaUpload } from './FirmaUpload'
import { AICotizar } from './AICotizar'
import { AIWriterButton } from '@/components/AIWriterButton'

interface CatalogItem {
    id: string
    nombre: string
    codigo_sku: string | null
    precio_base: number
    categoria: string
    recurrencia: string | null
}

interface CotizacionFormProps {
    catalogItems: CatalogItem[]
}

export function CotizacionForm({ catalogItems }: CotizacionFormProps) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Datos del cliente
    const [clienteNombre, setClienteNombre] = useState('')
    const [clienteEmail, setClienteEmail] = useState('')

    // Líneas de ítems
    const [lineItems, setLineItems] = useState<LineItem[]>([])

    // Tax
    const [taxPercent, setTaxPercent] = useState(0)

    // Toggles
    const [showNotas, setShowNotas] = useState(false)
    const [showLegal, setShowLegal] = useState(false)
    const [showExclusiones, setShowExclusiones] = useState(false)

    const [notas, setNotas] = useState('')
    const [temaLegal, setTemaLegal] = useState('')
    const [exclusiones, setExclusiones] = useState('')

    // Firma
    const [firmaUrl, setFirmaUrl] = useState<string | null>(null)

    // Cálculos (Excluyendo Costos Adicionales)
    const subtotal = lineItems
        .filter(li => li.categoria !== 'Costo adicional')
        .reduce((sum, li) => sum + li.precio_total, 0)
    const impuestos = subtotal * (taxPercent / 100)
    const total = subtotal + impuestos

    const formatPrice = (n: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

    function handleAddItem(item: CatalogItem) {
        setLineItems(prev => [...prev, {
            item_id: item.id,
            nombre: item.nombre,
            codigo_sku: item.codigo_sku,
            cantidad: 1,
            precio_unitario: item.precio_base,
            precio_total: item.precio_base,
            categoria: item.categoria,
            recurrencia: item.recurrencia,
        }])
    }

    function handleRemoveItem(index: number) {
        setLineItems(prev => prev.filter((_, i) => i !== index))
    }

    function handleQuantityChange(index: number, cantidad: number) {
        setLineItems(prev => prev.map((li, i) =>
            i === index ? { ...li, cantidad, precio_total: li.precio_unitario * cantidad } : li
        ))
    }

    function handlePriceChange(index: number, precio: number) {
        setLineItems(prev => prev.map((li, i) =>
            i === index ? { ...li, precio_unitario: precio, precio_total: precio * li.cantidad } : li
        ))
    }

    // Handler para resultados de IA
    function handleAIResult(result: {
        cliente_nombre?: string
        cliente_email?: string
        items: { item_id: string; nombre: string; cantidad: number; precio_unitario: number }[]
        notas_sugeridas?: string
    }) {
        // Auto-completar cliente
        if (result.cliente_nombre) setClienteNombre(result.cliente_nombre)
        if (result.cliente_email) setClienteEmail(result.cliente_email)

        // Auto-completar ítems
        if (result.items && result.items.length > 0) {
            const newItems: LineItem[] = result.items.map(item => {
                const catalogItem = catalogItems.find(c => c.id === item.item_id)
                return {
                    item_id: item.item_id,
                    nombre: item.nombre,
                    codigo_sku: catalogItem?.codigo_sku || null,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario,
                    precio_total: item.precio_unitario * item.cantidad,
                    categoria: catalogItem?.categoria || 'Pago único',
                    recurrencia: catalogItem?.recurrencia || null,
                }
            })
            setLineItems(prev => [...prev, ...newItems])
        }

        // Auto-completar notas si las hay
        if (result.notas_sugeridas) {
            setNotas(prev => prev ? prev + '\n' + result.notas_sugeridas : result.notas_sugeridas!)
            setShowNotas(true)
        }
    }

    async function handleSave() {
        if (!clienteNombre.trim()) {
            setError('El nombre del cliente es obligatorio')
            return
        }
        if (lineItems.length === 0) {
            setError('Agrega al menos un ítem a la cotización')
            return
        }

        setSaving(true)
        setError(null)

        const result = await saveCotizacion({
            cliente_nombre: clienteNombre.trim(),
            cliente_email: clienteEmail.trim(),
            subtotal,
            impuestos,
            total,
            notas_visibles: showNotas ? notas : null,
            temas_legales_visibles: showLegal ? temaLegal : null,
            exclusiones_visibles: showExclusiones ? exclusiones : null,
            firma_url: firmaUrl,
            items: lineItems.map(li => ({
                item_id: li.item_id,
                cantidad: li.cantidad,
                precio_unitario: li.precio_unitario,
                precio_total: li.precio_total,
                categoria: li.categoria,
                recurrencia: li.recurrencia,
            })),
        })

        if (result.error) {
            setError(result.error)
            setSaving(false)
            return
        }

        setSuccess(true)
        setSaving(false)

        setTimeout(() => {
            router.push(`/dashboard/cotizacion/${result.id}`)
        }, 2000)
    }

    if (success) {
        return (
            <div className="bg-[#0B0314]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">¡Cotización guardada!</h3>
                <p className="text-slate-400 text-sm">Redirigiendo al dashboard...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Error */}
            {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* 1. Datos del cliente */}
            <section className="bg-[#0B0314]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Datos del Cliente
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Nombre <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={clienteNombre}
                            onChange={e => setClienteNombre(e.target.value)}
                            placeholder="Nombre del cliente o empresa"
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            value={clienteEmail}
                            onChange={e => setClienteEmail(e.target.value)}
                            placeholder="cliente@empresa.com"
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* 2. Ítems de la cotización */}
            <section className="bg-[#0B0314]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    Ítems de la Cotización
                </h2>

                {/* Botón IA */}
                <div className="mb-4">
                    <AICotizar catalogItems={catalogItems} onResult={handleAIResult} />
                </div>

                <ItemSelector
                    catalogItems={catalogItems}
                    lineItems={lineItems}
                    onAdd={handleAddItem}
                    onRemove={handleRemoveItem}
                    onQuantityChange={handleQuantityChange}
                    onPriceChange={handlePriceChange}
                />
            </section>

            {/* 3. Resumen financiero */}
            <section className="bg-[#0B0314]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                    Resumen
                </h2>
                <div className="max-w-sm ml-auto space-y-3">
                    {lineItems.some(li => li.categoria === 'Costo adicional') && (
                        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <p className="text-xs text-amber-400 leading-relaxed">
                                <strong>Nota:</strong> Los costos adicionales son informativos y no se suman al total de la cotización ya que se pagan directamente a terceros.
                            </p>
                        </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm gap-4">
                        <span className="text-slate-400 shrink-0">Impuestos</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={taxPercent}
                                onChange={e => setTaxPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                                min={0}
                                max={100}
                                step={0.5}
                                className="w-20 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
                            />
                            <span className="text-slate-500 text-sm">%</span>
                            <span className="text-white font-medium ml-2">{formatPrice(impuestos)}</span>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-xl font-bold text-emerald-400">{formatPrice(total)}</span>
                    </div>
                </div>
            </section>

            {/* 4. Secciones opcionales con toggles */}
            <section className="bg-[#0B0314]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 space-y-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                    Secciones Adicionales
                </h2>

                {/* Notas */}
                <ToggleSection
                    label="Notas visibles al cliente"
                    enabled={showNotas}
                    onToggle={() => setShowNotas(!showNotas)}
                >
                    <div className="relative">
                        <textarea
                            value={notas}
                            onChange={e => setNotas(e.target.value)}
                            rows={3}
                            placeholder="Ej: Este presupuesto tiene validez de 30 días..."
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all resize-none pr-12"
                        />
                        <div className="absolute top-2 right-2">
                            <AIWriterButton currentText={notas} context="Notas generales de la cotización, aclaratoria de comercialización o validez" onUpdate={setNotas} />
                        </div>
                    </div>
                </ToggleSection>

                {/* Temas legales */}
                <ToggleSection
                    label="Temas legales"
                    enabled={showLegal}
                    onToggle={() => setShowLegal(!showLegal)}
                >
                    <div className="relative">
                        <textarea
                            value={temaLegal}
                            onChange={e => setTemaLegal(e.target.value)}
                            rows={3}
                            placeholder="Ej: Los precios no incluyen IVA. Términos y condiciones aplican..."
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all resize-none pr-12"
                        />
                        <div className="absolute top-2 right-2">
                            <AIWriterButton currentText={temaLegal} context="Términos legales y condiciones comerciales" onUpdate={setTemaLegal} />
                        </div>
                    </div>
                </ToggleSection>

                {/* Exclusiones */}
                <ToggleSection
                    label="Exclusiones"
                    enabled={showExclusiones}
                    onToggle={() => setShowExclusiones(!showExclusiones)}
                >
                    <div className="relative">
                        <textarea
                            value={exclusiones}
                            onChange={e => setExclusiones(e.target.value)}
                            rows={3}
                            placeholder="Ej: No incluye transporte, instalación ni materiales adicionales..."
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all resize-none pr-12"
                        />
                        <div className="absolute top-2 right-2">
                            <AIWriterButton currentText={exclusiones} context="Cosas que no están incluidas o cubiertas en el servicio/producto" onUpdate={setExclusiones} />
                        </div>
                    </div>
                </ToggleSection>
            </section>

            {/* 5. Firma */}
            <section className="bg-[#0B0314]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                    Firma (Opcional)
                </h2>
                <FirmaUpload firmaUrl={firmaUrl} onUploaded={setFirmaUrl} />
            </section>

            {/* 6. Botón guardar */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold rounded-xl hover:from-fuchsia-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all shadow-lg shadow-fuchsia-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                    {saving ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Guardando...
                        </span>
                    ) : (
                        'Guardar Cotización'
                    )}
                </button>
            </div>
        </div>
    )
}

// Toggle switch component
function ToggleSection({
    label,
    enabled,
    onToggle,
    children,
}: {
    label: string
    enabled: boolean
    onToggle: () => void
    children: React.ReactNode
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">{label}</span>
                <button
                    type="button"
                    onClick={onToggle}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${enabled ? 'bg-fuchsia-600' : 'bg-slate-700'
                        }`}
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                    />
                </button>
            </div>
            {enabled && (
                <div className="animate-slide-in">
                    {children}
                </div>
            )}
        </div>
    )
}
