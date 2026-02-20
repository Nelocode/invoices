'use client'

import { useState, type RefObject } from 'react'

interface DescargarPDFButtonProps {
    targetRef: RefObject<HTMLDivElement | null>
    cotizacionId: string
}

export function DescargarPDFButton({ targetRef, cotizacionId }: DescargarPDFButtonProps) {
    const [generating, setGenerating] = useState(false)

    async function handleDownload() {
        if (!targetRef.current) return

        setGenerating(true)
        try {
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

            // A4 dimensions in mm
            const pdfWidth = 210
            const pdfHeight = 297

            const imgWidth = pdfWidth
            const imgHeight = (canvas.height * pdfWidth) / canvas.width

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            })

            // If image is taller than one page, split into pages
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

            pdf.save(`Cotizacion-${cotizacionId}.pdf`)
        } catch (err) {
            console.error('Error al generar PDF:', err)
            alert('Error al generar el PDF. Intenta de nuevo.')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
                background: 'linear-gradient(135deg, #fc7ebf 0%, #a855f7 100%)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(252,126,191,0.25)',
            }}
        >
            {generating ? (
                <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generando...
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Descargar PDF
                </>
            )}
        </button>
    )
}
