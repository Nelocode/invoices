'use client'

import { useRef } from 'react'
import { DescargarPDFButton } from './DescargarPDFButton'

interface LineItem {
    nombre: string
    codigo_sku: string | null
    cantidad: number
    precio_unitario: number
    precio_total: number
}

export interface CotizacionData {
    id: string
    cliente_nombre: string
    cliente_email: string | null
    subtotal: number
    impuestos: number
    total: number
    notas_visibles: string | null
    temas_legales_visibles: string | null
    exclusiones_visibles: string | null
    firma_url: string | null
    estado: string
    creado_en: string
    usuario_nombre: string
    usuario_empresa: string | null
    usuario_email: string
    usuario_logo_url: string | null
    items: LineItem[]
}

export function DocumentoRender({ data }: { data: CotizacionData }) {
    const docRef = useRef<HTMLDivElement>(null)

    const formatPrice = (n: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    const cotNumber = data.id.slice(0, 8).toUpperCase()

    return (
        <div>
            {/* Toolbar - NO se incluye en el PDF */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <a
                        href="/dashboard/cotizaciones"
                        className="flex items-center gap-2 text-sm text-white/60 hover:text-[#fc7ebf] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Volver a Cotizaciones
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${data.estado === 'Pagado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        data.estado === 'Enviado' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            data.estado === 'Ganado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                data.estado === 'Perdido' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${data.estado === 'Pagado' ? 'bg-emerald-400' :
                            data.estado === 'Enviado' ? 'bg-blue-400' :
                                data.estado === 'Ganado' ? 'bg-green-400' :
                                    data.estado === 'Perdido' ? 'bg-red-400' :
                                        'bg-amber-400'
                            }`} />
                        {data.estado}
                    </span>
                    <DescargarPDFButton targetRef={docRef} cotizacionId={cotNumber} />
                </div>
            </div>

            {/* ========== DOCUMENTO RENDERIZABLE ========== */}
            <div
                ref={docRef}
                style={{
                    width: '794px',
                    minHeight: '1123px',
                    margin: '0 auto',
                    background: '#090117',
                    color: '#ffffff',
                    fontFamily: 'Geist, system-ui, -apple-system, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative glow top-right */}
                <div style={{
                    position: 'absolute',
                    top: '-80px',
                    right: '-80px',
                    width: '260px',
                    height: '260px',
                    background: 'radial-gradient(circle, rgba(252,126,191,0.12) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }} />

                {/* ===== HEADER ===== */}
                <div style={{
                    padding: '40px 48px 32px 48px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                    {/* Logo + Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                            src={data.usuario_logo_url || '/brainware-logo.webp'}
                            alt={data.usuario_empresa || 'Brainware'}
                            style={{ height: '40px', maxWidth: '180px', width: 'auto', objectFit: 'contain' }}
                            crossOrigin="anonymous"
                        />
                    </div>
                    {/* Cotización info */}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: '#fc7ebf',
                            marginBottom: '4px',
                        }}>
                            COTIZACIÓN
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                            #{cotNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                            {formatDate(data.creado_en)}
                        </div>
                    </div>
                </div>

                {/* ===== FROM / TO ===== */}
                <div style={{
                    padding: '28px 48px',
                    display: 'flex',
                    gap: '48px',
                }}>
                    {/* De */}
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#fc7ebf',
                            marginBottom: '10px',
                        }}>
                            DE
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700 }}>
                            {data.usuario_empresa || data.usuario_nombre}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                            {data.usuario_nombre}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                            {data.usuario_email}
                        </div>
                    </div>
                    {/* Para */}
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#fc7ebf',
                            marginBottom: '10px',
                        }}>
                            PARA
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700 }}>
                            {data.cliente_nombre}
                        </div>
                        {data.cliente_email && (
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                                {data.cliente_email}
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== TABLA DE ÍTEMS ===== */}
                <div style={{ padding: '0 48px 24px 48px' }}>
                    {/* Header de tabla */}
                    <div style={{
                        display: 'flex',
                        padding: '12px 16px',
                        background: 'rgba(252,126,191,0.06)',
                        borderRadius: '10px 10px 0 0',
                        border: '1px solid rgba(252,126,191,0.1)',
                        borderBottom: 'none',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#fc7ebf',
                    }}>
                        <div style={{ flex: 3 }}>Descripción</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>Cant.</div>
                        <div style={{ flex: 1.5, textAlign: 'right' }}>P. Unitario</div>
                        <div style={{ flex: 1.5, textAlign: 'right' }}>Total</div>
                    </div>

                    {/* Filas */}
                    {data.items.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            padding: '14px 16px',
                            borderLeft: '1px solid rgba(255,255,255,0.05)',
                            borderRight: '1px solid rgba(255,255,255,0.05)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                            fontSize: '12px',
                            alignItems: 'center',
                        }}>
                            <div style={{ flex: 3 }}>
                                <div style={{ fontWeight: 600 }}>{item.nombre}</div>
                                {item.codigo_sku && (
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                                        SKU: {item.codigo_sku}
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                                {item.cantidad}
                            </div>
                            <div style={{ flex: 1.5, textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>
                                {formatPrice(item.precio_unitario)}
                            </div>
                            <div style={{ flex: 1.5, textAlign: 'right', fontWeight: 600 }}>
                                {formatPrice(item.precio_total)}
                            </div>
                        </div>
                    ))}

                    {/* Resumen financiero */}
                    <div style={{
                        borderLeft: '1px solid rgba(255,255,255,0.05)',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '0 0 10px 10px',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            padding: '12px 16px 6px 16px',
                            fontSize: '12px',
                        }}>
                            <div style={{ width: '200px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Subtotal</span>
                                <span style={{ fontWeight: 500 }}>{formatPrice(data.subtotal)}</span>
                            </div>
                        </div>
                        {data.impuestos > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                padding: '6px 16px',
                                fontSize: '12px',
                            }}>
                                <div style={{ width: '200px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Impuestos</span>
                                    <span style={{ fontWeight: 500 }}>{formatPrice(data.impuestos)}</span>
                                </div>
                            </div>
                        )}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            padding: '12px 16px',
                            background: 'rgba(252,126,191,0.06)',
                            borderTop: '1px solid rgba(252,126,191,0.12)',
                        }}>
                            <div style={{ width: '200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fc7ebf' }}>TOTAL</span>
                                <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                                    {formatPrice(data.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== SECCIONES OPCIONALES ===== */}
                <div style={{ padding: '0 48px 24px 48px' }}>
                    {data.notas_visibles && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '16px 20px',
                            background: 'rgba(255,255,255,0.025)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            <div style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#fc7ebf',
                                marginBottom: '8px',
                            }}>
                                NOTAS
                            </div>
                            <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-wrap' }}>
                                {data.notas_visibles}
                            </div>
                        </div>
                    )}

                    {data.temas_legales_visibles && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '16px 20px',
                            background: 'rgba(255,255,255,0.025)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            <div style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#fc7ebf',
                                marginBottom: '8px',
                            }}>
                                TÉRMINOS LEGALES
                            </div>
                            <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-wrap' }}>
                                {data.temas_legales_visibles}
                            </div>
                        </div>
                    )}

                    {data.exclusiones_visibles && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '16px 20px',
                            background: 'rgba(255,255,255,0.025)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            <div style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#fc7ebf',
                                marginBottom: '8px',
                            }}>
                                EXCLUSIONES
                            </div>
                            <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-wrap' }}>
                                {data.exclusiones_visibles}
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== FIRMA ===== */}
                {data.firma_url && (
                    <div style={{ padding: '0 48px 24px 48px' }}>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(255,255,255,0.025)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            <div style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#fc7ebf',
                                marginBottom: '12px',
                            }}>
                                FIRMA AUTORIZADA
                            </div>
                            <img
                                src={data.firma_url}
                                alt="Firma"
                                style={{ maxHeight: '80px', width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.8 }}
                                crossOrigin="anonymous"
                            />
                            <div style={{
                                marginTop: '12px',
                                paddingTop: '10px',
                                borderTop: '1px solid rgba(255,255,255,0.08)',
                                fontSize: '11px',
                                color: 'rgba(255,255,255,0.5)',
                            }}>
                                {data.usuario_nombre}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== DATOS DE PAGO / FOOTER ===== */}
                <div style={{
                    padding: '24px 48px 32px 48px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    marginTop: 'auto',
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '40px',
                    }}>
                        {/* Datos bancarios */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#fc7ebf',
                                marginBottom: '10px',
                            }}>
                                DATOS BANCARIOS
                            </div>
                            <div style={{ fontSize: '11px', lineHeight: 1.8, color: 'rgba(255,255,255,0.5)' }}>
                                <div><span style={{ color: 'rgba(255,255,255,0.7)' }}>Banco:</span> Bancolombia</div>
                                <div><span style={{ color: 'rgba(255,255,255,0.7)' }}>Cuenta:</span> Ahorros 123-456789-00</div>
                                <div><span style={{ color: 'rgba(255,255,255,0.7)' }}>Titular:</span> Brainware SAS</div>
                                <div><span style={{ color: 'rgba(255,255,255,0.7)' }}>NIT:</span> 900.000.000-0</div>
                            </div>
                        </div>
                        {/* Links de pago */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#fc7ebf',
                                marginBottom: '10px',
                            }}>
                                PAGO EN LÍNEA
                            </div>
                            <div style={{ fontSize: '11px', lineHeight: 1.8, color: 'rgba(255,255,255,0.5)' }}>
                                <div>Link de pago disponible próximamente</div>
                                <div style={{ marginTop: '6px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: 'rgba(252,126,191,0.1)',
                                        border: '1px solid rgba(252,126,191,0.2)',
                                        borderRadius: '6px',
                                        fontSize: '10px',
                                        color: '#fc7ebf',
                                        fontWeight: 600,
                                    }}>
                                        wompi.co / paypal.me
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pie con branding */}
                    <div style={{
                        marginTop: '24px',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(255,255,255,0.04)',
                        textAlign: 'center',
                        fontSize: '9px',
                        color: 'rgba(255,255,255,0.25)',
                        letterSpacing: '0.05em',
                    }}>
                        Generado con Brainware Invoices · brainware.dev
                    </div>
                </div>
            </div>
        </div>
    )
}
