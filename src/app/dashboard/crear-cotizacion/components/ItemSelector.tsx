'use client'

import { useState, useRef, useEffect } from 'react'

interface Item {
    id: string
    nombre: string
    codigo_sku: string | null
    precio_base: number
}

export interface LineItem {
    item_id: string
    nombre: string
    codigo_sku: string | null
    cantidad: number
    precio_unitario: number
    precio_total: number
}

interface ItemSelectorProps {
    catalogItems: Item[]
    lineItems: LineItem[]
    onAdd: (item: Item) => void
    onRemove: (index: number) => void
    onQuantityChange: (index: number, cantidad: number) => void
    onPriceChange: (index: number, precio: number) => void
}

export function ItemSelector({ catalogItems, lineItems, onAdd, onRemove, onQuantityChange, onPriceChange }: ItemSelectorProps) {
    const [search, setSearch] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const filtered = catalogItems.filter(item =>
        !lineItems.some(li => li.item_id === item.id) &&
        (item.nombre.toLowerCase().includes(search.toLowerCase()) ||
            (item.codigo_sku && item.codigo_sku.toLowerCase().includes(search.toLowerCase())))
    )

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const formatPrice = (n: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

    return (
        <div className="space-y-4">
            {/* Buscador */}
            <div className="relative" ref={dropdownRef}>
                <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Buscar ítem del catálogo para agregar..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>

                {showDropdown && filtered.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
                        {filtered.map(item => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => { onAdd(item); setSearch(''); setShowDropdown(false) }}
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700/50 transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl"
                            >
                                <div>
                                    <p className="text-sm text-white">{item.nombre}</p>
                                    {item.codigo_sku && <p className="text-xs text-slate-500 font-mono">{item.codigo_sku}</p>}
                                </div>
                                <span className="text-sm text-emerald-400 font-medium shrink-0 ml-3">{formatPrice(item.precio_base)}</span>
                            </button>
                        ))}
                    </div>
                )}

                {showDropdown && search && filtered.length === 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-4 text-center">
                        <p className="text-sm text-slate-400">No se encontraron ítems</p>
                    </div>
                )}
            </div>

            {/* Líneas de detalle */}
            {lineItems.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                    {/* Header desktop */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-4">Ítem</div>
                        <div className="col-span-2 text-center">Cant.</div>
                        <div className="col-span-3 text-right">Precio Unit.</div>
                        <div className="col-span-2 text-right">Total</div>
                        <div className="col-span-1"></div>
                    </div>

                    {lineItems.map((line, idx) => (
                        <div key={line.item_id} className="border-b border-slate-800/50 last:border-0">
                            {/* Desktop */}
                            <div className="hidden sm:grid grid-cols-12 gap-2 items-center px-4 py-3">
                                <div className="col-span-4">
                                    <p className="text-sm text-white truncate">{line.nombre}</p>
                                    {line.codigo_sku && <p className="text-xs text-slate-500 font-mono">{line.codigo_sku}</p>}
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    <input
                                        type="number"
                                        value={line.cantidad}
                                        onChange={e => onQuantityChange(idx, Math.max(1, parseInt(e.target.value) || 1))}
                                        min={1}
                                        className="w-16 px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                                        <input
                                            type="number"
                                            value={line.precio_unitario}
                                            onChange={e => onPriceChange(idx, parseFloat(e.target.value) || 0)}
                                            min={0}
                                            step={0.01}
                                            className="w-full pl-7 pr-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className="text-sm font-semibold text-emerald-400">{formatPrice(line.precio_total)}</span>
                                </div>
                                <div className="col-span-1 text-right">
                                    <button
                                        type="button"
                                        onClick={() => onRemove(idx)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Mobile */}
                            <div className="sm:hidden p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-white">{line.nombre}</p>
                                        {line.codigo_sku && <p className="text-xs text-slate-500 font-mono">{line.codigo_sku}</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRemove(idx)}
                                        className="p-1 rounded text-slate-400 hover:text-red-400 cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Cant.</label>
                                        <input
                                            type="number"
                                            value={line.cantidad}
                                            onChange={e => onQuantityChange(idx, Math.max(1, parseInt(e.target.value) || 1))}
                                            min={1}
                                            className="w-full px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">P. Unit.</label>
                                        <input
                                            type="number"
                                            value={line.precio_unitario}
                                            onChange={e => onPriceChange(idx, parseFloat(e.target.value) || 0)}
                                            min={0}
                                            className="w-full px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Total</label>
                                        <p className="py-1.5 text-sm font-semibold text-emerald-400 text-center">{formatPrice(line.precio_total)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {lineItems.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                    Busca y agrega ítems del catálogo a esta cotización
                </p>
            )}
        </div>
    )
}
