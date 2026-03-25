'use client'

import { useState, type RefObject } from 'react'
import { useRouter } from 'next/navigation'

interface EnviarPDFModalProps {
    targetRef: RefObject<HTMLDivElement | null>
    cotizacionId: string
    clienteEmail: string | null
    onClose: () => void
}

export function EnviarPDFModal({ targetRef, cotizacionId, clienteEmail, onClose }: EnviarPDFModalProps) {
    const router = useRouter()
    const [sending, setSending] = useState(false)
    const [emailTo, setEmailTo] = useState(clienteEmail || '')
    const [message, setMessage] = useState('Adjunto enviamos el documento correspondiente a nuestra cotización.\n\nQuedamos a su entera disposición para cualquier duda o consulta.\n\nAtentamente.')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSend(e: React.FormEvent) {
        e.preventDefault()
        if (!targetRef.current || !emailTo) return

        setError(null)
        setSending(true)

        try {
            // 1. Generar PDF (misma lógica que descargar)
            const html2canvas = (await import('html2canvas-pro')).default
            const { jsPDF } = await import('jspdf')
            const element = targetRef.current

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#090117',
                logging: false,
            })

            const imgData = canvas.toDataURL('image/png')
            const pdfWidth = 210
            const pdfHeight = 297
            const imgWidth = pdfWidth
            const imgHeight = (canvas.height * pdfWidth) / canvas.width

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            })

            let yOffset = 0
            let remainingHeight = imgHeight

            while (remainingHeight > 0) {
                if (yOffset > 0) {
                    pdf.addPage()
                }
                pdf.addImage(imgData, 'PNG', 0, -yOffset, imgWidth, imgHeight)
                yOffset += pdfHeight
                remainingHeight -= pdfHeight
            }

            // En lugar de pdf.save(), obtenemos el base64 string
            // Retorna un data URI: "data:application/pdf;base64,...""
            const pdfBase64 = pdf.output('datauristring')
            const pdfName = `Cotizacion-${cotizacionId.slice(0, 8).toUpperCase()}.pdf`

            // 2. Enviar a la API route
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailTo,
                    subject: `Nuevo documento - #${cotizacionId.slice(0, 8).toUpperCase()}`,
                    message,
                    pdfBase64,
                    pdfName,
                    cotizacionId
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Error al enviar el correo')
            }

            setSuccess(true)
            router.refresh()

            // Cerrar el modal después de un tiempo
            setTimeout(() => {
                onClose()
            }, 2000)

        } catch (err: any) {
            console.error('Error al enviar:', err)
            setError(err.message || 'Error desconocido al enviar el documento')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f0420] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#fc7ebf]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        Enviar Documento
                    </h3>
                    {!success && (
                        <button onClick={onClose} disabled={sending} className="text-white/50 hover:text-white transition-colors cursor-pointer p-1">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {success ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">¡Enviado con éxito!</h4>
                        <p className="text-white/60 text-sm">El documento ha sido enviado a {emailTo} y el estado ha sido actualizado.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1.5">Destinatario</label>
                            <input
                                type="email"
                                required
                                value={emailTo}
                                onChange={(e) => setEmailTo(e.target.value)}
                                placeholder="cliente@correo.com"
                                className="w-full bg-[#160b2b] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#fc7ebf]/50 focus:ring-1 focus:ring-[#fc7ebf]/50 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1.5">Mensaje</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                className="w-full bg-[#160b2b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#fc7ebf]/50 focus:ring-1 focus:ring-[#fc7ebf]/50 transition-all text-sm"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={sending}
                                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 border border-white/10"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={sending}
                                className="flex-1 px-4 py-2.5 bg-[#fc7ebf] hover:bg-[#fc7ebf]/90 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                        Enviar PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
