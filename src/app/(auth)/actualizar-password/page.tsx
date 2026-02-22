'use client'

import { useState } from 'react'
import { actualizarPassword } from '../actions'

export default function ActualizarPasswordPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [message, setMessage] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        if (formData.get('password') !== formData.get('confirm_password')) {
            setStatus('error')
            setMessage('Las contraseñas no coinciden')
            return
        }

        setStatus('loading')
        setMessage(null)

        const result = await actualizarPassword(formData)

        if (result?.error) {
            setStatus('error')
            setMessage(result.error)
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
                    <h1 className="text-2xl font-bold text-white">Nueva Contraseña</h1>
                    <p className="text-slate-400 mt-1">Elige una nueva contraseña segura</p>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    {status === 'error' && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {message}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                                Nueva Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="Al menos 6 caracteres"
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-300 mb-1.5">
                                Confirmar Contraseña
                            </label>
                            <input
                                id="confirm_password"
                                name="confirm_password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="Repite la contraseña"
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold rounded-xl hover:from-fuchsia-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 shadow-lg shadow-fuchsia-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {status === 'loading' ? 'Actualizando...' : 'Guardar nueva contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
