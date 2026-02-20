'use client'

import { useState } from 'react'

interface DeleteConfirmProps {
    isOpen: boolean
    itemName: string
    onClose: () => void
    onConfirm: () => Promise<void>
    loading: boolean
}

export function DeleteConfirm({ isOpen, itemName, onClose, onConfirm, loading }: DeleteConfirmProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 animate-slide-in">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-white text-center mb-2">
                    Eliminar ítem
                </h3>
                <p className="text-sm text-slate-400 text-center mb-6">
                    ¿Estás seguro de eliminar <span className="text-white font-medium">&ldquo;{itemName}&rdquo;</span>? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 px-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
