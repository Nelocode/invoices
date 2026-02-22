'use client'

import { useState } from 'react'

interface Props {
    currentText: string
    context: string
    onUpdate: (newText: string) => void
    size?: 'sm' | 'md'
}

export function AIWriterButton({ currentText, context, onUpdate, size = 'sm' }: Props) {
    const [loading, setLoading] = useState(false)

    const handleMagic = async () => {
        if (!currentText.trim()) return

        setLoading(true)
        try {
            const res = await fetch('/api/ai-writer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texto: currentText, contexto: context }),
            })

            const data = await res.json()
            if (data.result) {
                onUpdate(data.result)
            }
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    return (
        <button
            type="button"
            onClick={handleMagic}
            disabled={loading || !currentText.trim()}
            title="Mejorar redacción con IA✨"
            className={`flex items-center justify-center shrink-0 rounded text-fuchsia-400 hover:bg-fuchsia-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'}`}
        >
            {loading ? (
                <svg className="animate-spin w-4 h-4 text-fuchsia-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : (
                <span className={size === 'sm' ? 'text-base' : 'text-lg'}>✨</span>
            )}
        </button>
    )
}
