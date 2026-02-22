'use client'

import { useState } from 'react'
import { createItem, updateItem, deleteItem } from '../actions'
import type { ItemFormData } from '../actions'
import { ItemModal } from './ItemModal'
import { DeleteConfirm } from './DeleteConfirm'

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

interface ItemsTableProps {
    initialItems: Item[]
}

export function ItemsTable({ initialItems }: ItemsTableProps) {
    const [items, setItems] = useState<Item[]>(initialItems)
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Item | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const filteredItems = items.filter(item =>
        item.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (item.codigo_sku && item.codigo_sku.toLowerCase().includes(search.toLowerCase())) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(search.toLowerCase()))
    )

    function openCreate() {
        setEditingItem(null)
        setModalOpen(true)
        setError(null)
    }

    function openEdit(item: Item) {
        setEditingItem(item)
        setModalOpen(true)
        setError(null)
    }

    async function handleSubmit(data: ItemFormData) {
        setLoading(true)
        setError(null)

        try {
            if (editingItem) {
                const result = await updateItem(editingItem.id, data)
                if (result.error) {
                    setError(result.error)
                    setLoading(false)
                    return
                }
                setItems(prev => prev.map(i =>
                    i.id === editingItem.id
                        ? { ...i, ...data, codigo_sku: data.codigo_sku || null, descripcion: data.descripcion || null, notas_internas: data.notas_internas || null, categoria: data.categoria, recurrencia: data.recurrencia || null }
                        : i
                ))
            } else {
                const result = await createItem(data)
                if (result.error) {
                    setError(result.error)
                    setLoading(false)
                    return
                }
                // Recargar la página para obtener el nuevo item con su ID del servidor
                window.location.reload()
            }
        } catch {
            setError('Error inesperado')
        }

        setLoading(false)
        setModalOpen(false)
    }

    async function handleDelete() {
        if (!deleteTarget) return
        setLoading(true)

        try {
            const result = await deleteItem(deleteTarget.id)
            if (result.error) {
                setError(result.error)
                setLoading(false)
                return
            }
            setItems(prev => prev.filter(i => i.id !== deleteTarget.id))
        } catch {
            setError('Error al eliminar')
        }

        setLoading(false)
        setDeleteTarget(null)
    }

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

    const formatDate = (date: string) =>
        new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))

    return (
        <div>
            {/* Error global */}
            {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, SKU o descripción..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                    />
                </div>
                <button
                    onClick={openCreate}
                    className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-medium rounded-xl hover:from-fuchsia-500 hover:to-purple-500 transition-all shadow-lg shadow-fuchsia-500/25 text-sm whitespace-nowrap cursor-pointer"
                >
                    + Nuevo Ítem
                </button>
            </div>

            {/* Content */}
            {filteredItems.length === 0 ? (
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        {search ? 'Sin resultados' : 'Sin ítems todavía'}
                    </h3>
                    <p className="text-slate-400 text-sm mb-6">
                        {search
                            ? 'No se encontraron ítems con ese criterio de búsqueda.'
                            : 'Agrega productos o servicios a tu catálogo para usarlos en cotizaciones.'}
                    </p>
                    {!search && (
                        <button
                            onClick={openCreate}
                            className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-medium rounded-xl hover:from-fuchsia-500 hover:to-purple-500 transition-all shadow-lg shadow-fuchsia-500/25 text-sm cursor-pointer"
                        >
                            Crear primer ítem
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ítem</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">SKU</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Categoría</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Precio base</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredItems.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-white">{item.nombre}</p>
                                            {item.descripcion && (
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.descripcion}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.codigo_sku ? (
                                                <span className="px-2.5 py-1 text-xs font-mono bg-slate-800 text-slate-300 rounded-lg">
                                                    {item.codigo_sku}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300">
                                                {item.categoria}
                                                {item.categoria === 'Pago recurrente' && item.recurrencia && (
                                                    <span className="text-slate-500">/ {item.recurrencia}</span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-emerald-400">{formatPrice(item.precio_base)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-500">{formatDate(item.creado_en)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 transition-all cursor-pointer"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(item)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {filteredItems.map(item => (
                            <div key={item.id} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-white truncate">{item.nombre}</p>
                                        {item.codigo_sku && (
                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-300 rounded-md">
                                                {item.codigo_sku}
                                            </span>
                                        )}
                                        <span className="inline-block mt-1 ml-2 px-2 py-0.5 text-xs font-medium bg-slate-800 text-slate-300 rounded-md">
                                            {item.categoria}
                                            {item.categoria === 'Pago recurrente' && item.recurrencia && ` / ${item.recurrencia}`}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-400 ml-3 shrink-0">{formatPrice(item.precio_base)}</span>
                                </div>
                                {item.descripcion && (
                                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.descripcion}</p>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                                    <span className="text-xs text-slate-500">{formatDate(item.creado_en)}</span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEdit(item)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 transition-all cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(item)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Count */}
                    <p className="text-xs text-slate-500 mt-4 text-center">
                        {filteredItems.length} de {items.length} ítem{items.length !== 1 ? 's' : ''}
                    </p>
                </>
            )}

            {/* Modals */}
            <ItemModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                item={editingItem}
                loading={loading}
            />

            <DeleteConfirm
                isOpen={!!deleteTarget}
                itemName={deleteTarget?.nombre || ''}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={loading}
            />
        </div>
    )
}
