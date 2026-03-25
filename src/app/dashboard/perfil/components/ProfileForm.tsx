'use client'

import { useState, useTransition } from 'react'
import { LogoUpload } from './LogoUpload'
import { savePaymentInfo, createEmpresa, joinEmpresa } from '../actions'

interface ProfileFormProps {
    initialLogoUrl: string | null
    userName: string
    userCompany: string | null
    userEmail: string
    initialBankInfo?: string | null
    initialPaymentLink?: string | null
    userEmpresa?: { id: string, nombre: string, clave_acceso: string, rol: string } | null
}

export function ProfileForm({ initialLogoUrl, userName, userCompany, userEmail, initialBankInfo, initialPaymentLink, userEmpresa }: ProfileFormProps) {
    const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl)
    const [bankInfo, setBankInfo] = useState(initialBankInfo || '')
    const [paymentLink, setPaymentLink] = useState(initialPaymentLink || '')
    const [isPending, startTransition] = useTransition()
    const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Workspace Management States
    const [joinCode, setJoinCode] = useState('')
    const [newCompanyName, setNewCompanyName] = useState('')
    const [isCopying, setIsCopying] = useState(false)

    const handleCopyCode = async () => {
        if (!userEmpresa?.clave_acceso) return
        try {
            await navigator.clipboard.writeText(userEmpresa.clave_acceso)
            setIsCopying(true)
            setTimeout(() => setIsCopying(false), 2000)
            setToastMessage({ type: 'success', text: 'Clave de acceso copiada al portapapeles' })
        } catch (err) {
            setToastMessage({ type: 'error', text: 'No se pudo copiar la clave' })
        }
    }

    const handleCreateWorkspace = () => {
        if (!newCompanyName.trim()) return
        setToastMessage(null)
        startTransition(async () => {
            try {
                const { error } = await createEmpresa(newCompanyName)
                if (error) {
                    setToastMessage({ type: 'error', text: 'Error al crear la empresa: ' + error })
                } else {
                    setToastMessage({ type: 'success', text: '¡Empresa creada exitosamente!' })
                    setNewCompanyName('')
                }
            } catch (err) {
                setToastMessage({ type: 'error', text: 'Exception: ' + err })
            }
        })
    }

    const handleJoinWorkspace = () => {
        if (!joinCode.trim()) return
        setToastMessage(null)
        startTransition(async () => {
            try {
                const { error } = await joinEmpresa(joinCode)
                if (error) {
                    setToastMessage({ type: 'error', text: 'Error al unirse a la empresa: ' + error })
                } else {
                    setToastMessage({ type: 'success', text: '¡Te has unido a la empresa exitosamente!' })
                    setJoinCode('')
                }
            } catch (err) {
                setToastMessage({ type: 'error', text: 'Exception: ' + err })
            }
        })
    }

    const handleSavePaymentInfo = () => {
        setToastMessage(null)
        startTransition(async () => {
            const { error } = await savePaymentInfo(bankInfo, paymentLink)
            if (error) {
                setToastMessage({ type: 'error', text: 'Error al guardar los datos de pago' })
            } else {
                setToastMessage({ type: 'success', text: 'Datos de pago guardados correctamente' })
                setTimeout(() => setToastMessage(null), 3000)
            }
        })
    }

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Logo */}
            <section
                className="rounded-2xl p-6"
                style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                    <svg className="w-5 h-5" style={{ color: '#fc7ebf' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                    Logo de tu empresa
                </h2>
                <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Este logo aparecerá en tus cotizaciones y documentos PDF
                </p>
                <LogoUpload logoUrl={logoUrl} onUploaded={setLogoUrl} />
            </section>

            {/* Info del perfil (solo lectura) */}
            <section
                className="rounded-2xl p-6"
                style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" style={{ color: '#fc7ebf' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Información de perfil
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Nombre</label>
                        <div className="px-4 py-2.5 rounded-xl text-sm text-white" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {userName}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Empresa</label>
                        <div className="px-4 py-2.5 rounded-xl text-sm text-white" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {userCompany || '—'}
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Email</label>
                        <div className="px-4 py-2.5 rounded-xl text-sm text-white" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {userEmail}
                        </div>
                    </div>
                </div>
            </section>

            {/* Gestión del Espacio de Trabajo (Empresa) */}
            <section
                className="rounded-2xl p-6"
                style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" style={{ color: '#fc7ebf' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                    Espacio de Trabajo (Empresa)
                </h2>

                {userEmpresa ? (
                    // Ya pertenece a una empresa
                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#fc7ebf]/10 blur-3xl rounded-full pointer-events-none" />
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                            <div>
                                <h3 className="text-white font-medium text-lg">{userEmpresa.nombre}</h3>
                                <p className="text-sm text-fuchsia-400 mt-0.5">Rol: <span className="capitalize">{userEmpresa.rol}</span></p>
                            </div>

                            {userEmpresa.rol === 'admin' && (
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-white/10 w-full sm:w-auto text-center sm:text-left">
                                    <p className="text-xs text-slate-400 mb-1">Clave de acceso para colaboradores:</p>
                                    <div className="flex items-center gap-2 bg-black/40 rounded px-2 py-1.5 font-mono text-fuchsia-300 font-semibold tracking-wider justify-center">
                                        {userEmpresa.clave_acceso}
                                        <button
                                            onClick={handleCopyCode}
                                            className="ml-2 hover:text-white transition-colors"
                                            title="Copiar código"
                                        >
                                            {isCopying ? (
                                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-4 max-w-lg">
                            Al formar parte de un espacio de trabajo, compartes con los demás colaboradores el catálogo de ítems y la base de clientes.
                        </p>
                    </div>
                ) : (
                    // No pertenece a ninguna empresa, mostrar formulario para Unirse / Crear
                    <>
                        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Únete a una empresa existente mediante un código o crea tu propio espacio de trabajo.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                            {/* Unirse */}
                            <div className="p-5 rounded-xl bg-slate-900/50 border border-white/5 flex flex-col h-full">
                                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                                    Unirse a Espacio Existente
                                </h3>
                                <p className="text-xs text-slate-400 mb-4 flex-1">
                                    Si tu empresa ya usa Cotiware, pide al administrador la clave de acceso para vincular tu cuenta.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={joinCode}
                                        onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                        placeholder="CÓDIGO (Ej: ABC123)"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500/50 transition-colors uppercase"
                                    />
                                    <button
                                        onClick={handleJoinWorkspace}
                                        disabled={isPending || !joinCode.trim()}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        Unirme
                                    </button>
                                </div>
                            </div>

                            {/* Divisor OR en desktop */}
                            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 items-center justify-center z-10">
                                <span className="text-[10px] font-bold text-slate-400">O</span>
                            </div>

                            {/* Crear Nuevo */}
                            <div className="p-5 rounded-xl bg-slate-900/50 border border-white/5 flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full pointer-events-none" />
                                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" /></svg>
                                    Crear Espacio de Trabajo
                                </h3>
                                <p className="text-xs text-slate-400 mb-4 flex-1">
                                    Empieza uno nuevo para tu empresa y luego invita a tu equipo compartiéndoles la clave que se generará.
                                </p>
                                <div className="flex gap-2 relative z-10">
                                    <input
                                        type="text"
                                        value={newCompanyName}
                                        onChange={e => setNewCompanyName(e.target.value)}
                                        placeholder="Nombre de la Empresa"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                    <button
                                        onClick={handleCreateWorkspace}
                                        disabled={isPending || !newCompanyName.trim()}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-[#fc7ebf] hover:opacity-90 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                                    >
                                        Crear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* Opciones de pago */}
            <section
                className="rounded-2xl p-6"
                style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                            <svg className="w-5 h-5" style={{ color: '#fc7ebf' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Datos Bancarios y Link de Pago
                        </h2>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Esta información aparecerá en la parte inferior de tus documentos.
                        </p>
                    </div>
                    <button
                        onClick={handleSavePaymentInfo}
                        disabled={isPending}
                        className="px-4 py-2 bg-[#fc7ebf] hover:bg-[#fc7ebf]/90 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {isPending ? 'Guardando...' : 'Guardar Información'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Información Bancaria</label>
                        <textarea
                            value={bankInfo}
                            onChange={(e) => setBankInfo(e.target.value)}
                            placeholder={"Banco: Bancolombia\nCuenta: Ahorros 123-456789\nTitular: Mi Empresa SAS\nNIT: 900.000.000-0"}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#fc7ebf]/50 focus:ring-1 focus:ring-[#fc7ebf]/50 transition-all font-mono text-xs"
                            rows={5}
                        />
                        <p className="text-xs text-white/40 mt-2">Puedes incluir números de cuenta, NIT, y cualquier dato necesario para realizar transferencias.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Link de Pago en Línea (Ej: Wompi, PayPal)</label>
                        <input
                            type="url"
                            value={paymentLink}
                            onChange={(e) => setPaymentLink(e.target.value)}
                            placeholder="https://checkout.wompi.co/l/..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#fc7ebf]/50 focus:ring-1 focus:ring-[#fc7ebf]/50 transition-all text-sm mb-4"
                        />
                        <label className="block text-sm font-medium text-white/70 mb-2 mt-4 text-center border border-white/10 rounded-xl bg-white/5 p-4 py-8 pointer-events-none opacity-50">
                            Integra pasarelas de pago por API en versiones futuras
                        </label>
                    </div>
                </div>

                {toastMessage && (
                    <div className={`mt-4 p-3 rounded-lg text-sm border ${toastMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {toastMessage.text}
                    </div>
                )}
            </section>
        </div>
    )
}
