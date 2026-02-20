'use client'

import { useState } from 'react'
import { LogoUpload } from './LogoUpload'

interface ProfileFormProps {
    initialLogoUrl: string | null
    userName: string
    userCompany: string | null
    userEmail: string
}

export function ProfileForm({ initialLogoUrl, userName, userCompany, userEmail }: ProfileFormProps) {
    const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl)

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
        </div>
    )
}
