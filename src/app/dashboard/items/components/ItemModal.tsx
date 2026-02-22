'use client'

import { useState, useEffect, useRef } from 'react'
import type { ItemFormData } from '../actions'
import { AIWriterButton } from '@/components/AIWriterButton'

interface Item {
    id: string
    nombre: string
    codigo_sku: string | null
    descripcion: string | null
    precio_base: number
    notas_internas: string | null
    categoria: string
    recurrencia: string | null
    creado_en: string
}

interface ItemModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: ItemFormData) => Promise<void>
    item?: Item | null
    loading: boolean
}

export function ItemModal({ isOpen, onClose, onSubmit, item, loading }: ItemModalProps) {
    const formRef = useRef<HTMLFormElement>(null)
    const [nombre, setNombre] = useState('')
    const [codigoSku, setCodigoSku] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [precioBase, setPrecioBase] = useState('')
    const [notasInternas, setNotasInternas] = useState('')
    const [categoria, setCategoria] = useState('Pago único')
    const [recurrencia, setRecurrencia] = useState('Mensual')

    useEffect(() => {
        if (item) {
            setNombre(item.nombre)
            setCodigoSku(item.codigo_sku || '')
            setDescripcion(item.descripcion || '')
            setPrecioBase(String(item.precio_base))
            setNotasInternas(item.notas_internas || '')
            setCategoria(item.categoria || 'Pago único')
            setRecurrencia(item.recurrencia || 'Mensual')
        } else {
            setNombre('')
            setCodigoSku('')
            setDescripcion('')
            setPrecioBase('')
            setNotasInternas('')
            setCategoria('Pago único')
            setRecurrencia('Mensual')
        }
    }, [item, isOpen])

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        await onSubmit({
            nombre,
            codigo_sku: codigoSku,
            descripcion,
            precio_base: parseFloat(precioBase) || 0,
            notas_internas: notasInternas,
            categoria,
            recurrencia: categoria === 'Pago recurrente' ? recurrencia : undefined,
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl animate-slide-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-white">
                        {item ? 'Editar Ítem' : 'Nuevo Ítem'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Nombre <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                required
                                placeholder="Ej: Diseño de vivienda campestre"
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Código SKU
                            </label>
                            <input
                                type="text"
                                value={codigoSku}
                                onChange={e => setCodigoSku(e.target.value)}
                                placeholder="Ej: SRV-001"
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Precio base <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                                <input
                                    type="number"
                                    value={precioBase}
                                    onChange={e => setPrecioBase(e.target.value)}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Categoría <span className="text-red-400">*</span>
                            </label>
                            <select
                                value={categoria}
                                onChange={e => setCategoria(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                            >
                                <option value="Pago único">Pago único</option>
                                <option value="Pago recurrente">Pago recurrente</option>
                                <option value="Costo adicional">Costo adicional (Informativo)</option>
                            </select>
                        </div>

                        {categoria === 'Pago recurrente' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Recurrencia <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={recurrencia}
                                    onChange={e => setRecurrencia(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                                >
                                    <option value="Hora">Por Hora</option>
                                    <option value="Día">Diario</option>
                                    <option value="Mes">Mensual</option>
                                    <option value="Trimestre">Trimestral</option>
                                    <option value="Semestre">Semestral</option>
                                    <option value="Año">Anual</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Descripción
                        </label>
                        <div className="relative">
                            <textarea
                                value={descripcion}
                                onChange={e => setDescripcion(e.target.value)}
                                rows={2}
                                placeholder="Descripción visible para el cliente"
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all resize-none pr-12"
                            />
                            <div className="absolute top-2 right-2">
                                <AIWriterButton currentText={descripcion} context={`Descripción breve comercial del ítem: ${nombre}`} onUpdate={setDescripcion} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Notas internas
                        </label>
                        <textarea
                            value={notasInternas}
                            onChange={e => setNotasInternas(e.target.value)}
                            rows={2}
                            placeholder="Solo visibles para ti (no aparecen en la cotización)"
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-medium rounded-xl hover:from-fuchsia-500 hover:to-purple-500 transition-all shadow-lg shadow-fuchsia-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Guardando...
                                </span>
                            ) : (
                                item ? 'Guardar Cambios' : 'Crear Ítem'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
