'use client'

import { useState, useRef } from 'react'
import { uploadLogo } from '../actions'

interface LogoUploadProps {
    logoUrl: string | null
    onUploaded: (url: string) => void
}

export function LogoUpload({ logoUrl, onUploaded }: LogoUploadProps) {
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

        if (file.size > 5 * 1024 * 1024) {
            setError('El archivo debe pesar menos de 5MB')
            return
        }

        setUploading(true)
        setError(null)

        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadLogo(formData)

        if (result.error) {
            setError(result.error)
        } else if (result.url) {
            onUploaded(result.url)
        }

        setUploading(false)
    }

    return (
        <div>
            <div className="flex items-center gap-6">
                {/* Preview */}
                <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '2px dashed rgba(252,126,191,0.2)',
                    }}
                    onClick={() => inputRef.current?.click()}
                >
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                        <svg className="w-8 h-8" style={{ color: 'rgba(252,126,191,0.4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                    )}
                </div>

                {/* Actions */}
                <div>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        style={{
                            color: '#fc7ebf',
                            background: 'rgba(252,126,191,0.08)',
                            border: '1px solid rgba(252,126,191,0.2)',
                        }}
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                {logoUrl ? 'Cambiar logo' : 'Subir logo'}
                            </>
                        )}
                    </button>
                    <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        PNG, JPG o SVG · Máximo 5MB
                    </p>
                </div>
            </div>

            {error && (
                <p className="mt-3 text-sm text-red-400">{error}</p>
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
