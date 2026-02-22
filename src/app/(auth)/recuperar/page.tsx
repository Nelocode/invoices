'use client'

import { useState } from 'react'
import { recuperarPassword } from '../actions'

export default function RecuperarPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setStatus('loading')
        setMessage(null)

        const result = await recuperarPassword(formData)

        if (result?.error) {
            setStatus('error')
            setMessage(result.error)
        } else {
            setStatus('success')
            setMessage('Hemos enviado un enlace a tu correo con las instrucciones.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-fuchsia-950 px-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Recuperar Contraseña</h1>
                    <p className="text-slate-400 mt-1">Ingresa tu correo asociado</p>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    {status === 'error' && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {message}
                        </div>
                    )}

                    {status === 'success' ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">¡Correo enviado!</h3>
                            <p className="text-slate-400 text-sm mb-6">{message}</p>
                            <a href="/login" className="inline-block w-full py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors">
                                Volver al login
                            </a>
                        </div>
                    ) : (
                        <form action={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="tu@empresa.com"
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold rounded-xl hover:from-fuchsia-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 shadow-lg shadow-fuchsia-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {status === 'loading' ? 'Enviando...' : 'Enviar instrucciones'}
                            </button>

                            <div className="mt-4 text-center">
                                <a
                                    href="/login"
                                    className="text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    Volver al login
                                </a>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
