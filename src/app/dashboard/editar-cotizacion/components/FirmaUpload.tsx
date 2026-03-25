'use client'

import { useState, useRef } from 'react'
import { uploadFirma } from '../actions'

interface FirmaUploadProps {
    firmaUrl: string | null
    onUploaded: (url: string) => void
}

export function FirmaUpload({ firmaUrl, onUploaded }: FirmaUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten archivos de imagen')
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('El archivo debe pesar menos de 2MB')
            return
        }

        setUploading(true)
        setError(null)

        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadFirma(formData)

        if (result.error) {
            setError(result.error)
        } else if (result.url) {
            onUploaded(result.url)
        }

        setUploading(false)
    }

    return (
        <div>
            {firmaUrl ? (
                <div className="flex items-center gap-4">
                    <div className="w-40 h-20 bg-white rounded-lg p-2 flex items-center justify-center">
                        <img src={firmaUrl} alt="Firma" className="max-w-full max-h-full object-contain" />
                    </div>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors cursor-pointer"
                    >
                        Cambiar firma
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-6 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-fuchsia-500/50 hover:text-fuchsia-400 transition-all cursor-pointer disabled:opacity-50"
                >
                    {uploading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Subiendo...
                        </span>
                    ) : (
                        <span className="flex flex-col items-center gap-1">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <span className="text-sm">Subir imagen de firma (PNG, JPG)</span>
                            <span className="text-xs text-slate-500">Máximo 2MB</span>
                        </span>
                    )}
                </button>
            )}

            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
            />
        </div>
    )
}
