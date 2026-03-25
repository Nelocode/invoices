'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export interface Cliente {
    id: string
    nombre: string
    email: string | null
    telefono: string | null
    empresa: string | null
    identificacion: string | null
    direccion: string | null
    user_id?: string
    empresa_id: string
}

interface ClientesManagerProps {
    initialClientes: Cliente[]
    userId: string
    empresaId?: string | null
}

export default function ClientesManager({ initialClientes, userId, empresaId }: ClientesManagerProps) {
    const [clientes, setClientes] = useState(initialClientes)
    const [searchTerm, setSearchTerm] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editing, setEditing] = useState<Cliente | null>(null)

    // Form states
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [telefono, setTelefono] = useState('')
    const [empresa, setEmpresa] = useState('')
    const [identificacion, setIdentificacion] = useState('')
    const [direccion, setDireccion] = useState('')

    const router = useRouter()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const resetForm = () => {
        setNombre('')
        setEmail('')
        setTelefono('')
        setEmpresa('')
        setIdentificacion('')
        setDireccion('')
        setEditing(null)
    }

    const openEdit = (c: Cliente) => {
        setEditing(c)
        setNombre(c.nombre)
        setEmail(c.email || '')
        setTelefono(c.telefono || '')
        setEmpresa(c.empresa || '')
        setIdentificacion(c.identificacion || '')
        setDireccion(c.direccion || '')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const payload = {
            nombre,
            email: email || null,
            telefono: telefono || null,
            empresa: empresa || null,
            identificacion: identificacion || null,
            direccion: direccion || null,
            user_id: userId,
            empresa_id: empresaId
        }

        if (editing) {
            const { data, error } = await supabase
                .from('clientes')
                .update(payload)
                .eq('id', editing.id)
                .select()
                .single()

            if (!error && data) {
                setClientes(prev => prev.map(c => c.id === data.id ? data : c))
                resetForm()
                router.refresh()
            } else {
                alert('Error al actualizar: ' + error?.message)
            }
        } else {
            const { data, error } = await supabase
                .from('clientes')
                .insert([payload])
                .select()
                .single()

            if (!error && data) {
                setClientes(prev => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)))
                resetForm()
                router.refresh()
            } else {
                alert('Error al crear: ' + error?.message)
            }
        }
        setIsSubmitting(false)
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar cliente: ${name}?`)) return

        // Optimistic UI update could be applied here
        const { error } = await supabase.from('clientes').delete().eq('id', id)
        if (!error) {
            setClientes(prev => prev.filter(c => c.id !== id))
            router.refresh()
        } else {
            alert('No se puede eliminar. Verifica que no tenga cotizaciones asociadas.')
        }
    }

    const filtered = clientes.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.empresa && c.empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="flex h-full min-h-[500px]">
            {/* Lista Principal */}
            <div className="flex-1 flex flex-col border-r border-white/5">
                <div className="p-4 border-b border-white/5 bg-[#0B0314]/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="relative max-w-md">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar cliente por nombre, empresa o correo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {!empresaId ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-medium mb-1">Debes unirte a una Empresa</h3>
                            <p className="text-slate-500 text-sm">Ve a tu perfil para crear o unirte a un espacio de trabajo antes de agregar clientes.</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-medium mb-1">No hay clientes</h3>
                            <p className="text-slate-500 text-sm">Empieza agregando tu primer cliente en el panel lateral.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {filtered.map(c => (
                                <div key={c.id} className="bg-slate-900/40 border border-white/5 hover:border-fuchsia-500/30 rounded-xl p-4 transition-all group relative">
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <button onClick={() => openEdit(c)} className="p-1.5 bg-slate-800 hover:bg-fuchsia-500 hover:text-white rounded-lg text-slate-400 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                                        </button>
                                        <button onClick={() => handleDelete(c.id, c.nombre)} className="p-1.5 bg-slate-800 hover:bg-red-500 hover:text-white rounded-lg text-slate-400 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                        </button>
                                    </div>
                                    <h4 className="text-white font-medium mb-1 truncate pr-16">{c.nombre}</h4>
                                    <div className="space-y-1 mt-3">
                                        {c.empresa && (
                                            <div className="flex gap-2 text-xs">
                                                <span className="text-slate-500 font-medium w-16 shrink-0">Empresa:</span>
                                                <span className="text-slate-300 truncate">{c.empresa} {c.identificacion && `(${c.identificacion})`}</span>
                                            </div>
                                        )}
                                        {c.email && (
                                            <div className="flex gap-2 text-xs">
                                                <span className="text-slate-500 font-medium w-16 shrink-0">Email:</span>
                                                <span className="text-slate-300 truncate">{c.email}</span>
                                            </div>
                                        )}
                                        {c.telefono && (
                                            <div className="flex gap-2 text-xs">
                                                <span className="text-slate-500 font-medium w-16 shrink-0">Teléf:</span>
                                                <span className="text-slate-300 truncate">{c.telefono}</span>
                                            </div>
                                        )}
                                        {c.direccion && (
                                            <div className="flex gap-2 text-xs">
                                                <span className="text-slate-500 font-medium w-16 shrink-0">Dir:</span>
                                                <span className="text-slate-300 truncate" title={c.direccion}>{c.direccion}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Panel Formulario Lateral */}
            <div className="w-96 bg-[#0B0314]/80 p-6 flex flex-col custom-scrollbar overflow-y-auto hidden lg:flex border-l border-white/5 shadow-[-4px_0_24px_rgba(252,126,191,0.03)] relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fc7ebf]/5 blur-3xl rounded-full pointer-events-none" />
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    {editing ? (
                        <>
                            <svg className="w-5 h-5 text-fuchsia-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                            Editar Cliente
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 text-fuchsia-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Nuevo Cliente
                        </>
                    )}
                </h3>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nombre / Razón Social *</label>
                            <input
                                type="text"
                                required
                                disabled={!empresaId}
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                placeholder="Ej: Juan Pérez o Acme Corp"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all placeholder:text-slate-600 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Empresa / Contacto</label>
                            <input
                                type="text"
                                value={empresa}
                                onChange={e => setEmpresa(e.target.value)}
                                placeholder="Si el cliente es la empresa..."
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Identificación (NIT, CC)</label>
                            <input
                                type="text"
                                value={identificacion}
                                onChange={e => setIdentificacion(e.target.value)}
                                placeholder="000.000.000-0"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="cliente@correo.com"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Teléfono</label>
                            <input
                                type="text"
                                value={telefono}
                                onChange={e => setTelefono(e.target.value)}
                                placeholder="+57 300 000 0000"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dirección</label>
                            <textarea
                                value={direccion}
                                onChange={e => setDireccion(e.target.value)}
                                placeholder="Calle Falsa 123, Ciudad"
                                rows={2}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all resize-none placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/5 flex gap-3 pb-8 lg:pb-0">
                        {editing && (
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting || !empresaId}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{
                                background: 'linear-gradient(135deg, #fc7ebf 0%, #a855f7 100%)',
                                boxShadow: '0 4px 15px rgba(252,126,191,0.2)'
                            }}
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                            ) : (
                                editing ? 'Guardar Cambios' : 'Agregar Cliente'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
