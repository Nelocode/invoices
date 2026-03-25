import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

// Mantenemos una instancia global si existe la API key, pero no rompemos si no está (aún)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await req.json()
        const { emailTo, subject, message, pdfBase64, pdfName, cotizacionId } = body

        if (!emailTo || !pdfBase64) {
            return NextResponse.json({ error: 'Faltan datos requeridos (emailTo, pdfBase64)' }, { status: 400 })
        }

        if (!resend) {
            return NextResponse.json({ error: 'Resend API Key no configurada en el servidor' }, { status: 500 })
        }

        // Obtener el perfil del usuario para el remitente (opcional, o usar un correo genérico configurado en Resend)
        const { data: profile } = await supabase
            .from('usuarios')
            .select('nombre_completo, empresa')
            .eq('id', user.id)
            .single()

        const senderName = profile?.empresa || profile?.nombre_completo || 'Cotizaciones Cotiware'

        // NOTA: Para usar un correo personalizado en el 'from', debes verificar el dominio en Resend.
        // Si no tienes dominio verificado, usa onboarding@resend.dev (solo permite envíos a ti mismo)
        // Por ahora, asumimos que tienes un dominio genérico configurado o enviaremos desde uno por defecto.
        const fromEmail = process.env.NEXT_PUBLIC_SENDER_EMAIL || 'cotizaciones@cotiware.com'

        const resendData = await resend.emails.send({
            from: `${senderName} <${fromEmail}>`,
            to: [emailTo],
            subject: subject || `Nueva Cotización de ${senderName}`,
            html: `
                <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
                    <h2>Hola,</h2>
                    <p>${message || 'Adjunto encontrarás el documento detallado de nuestra propuesta.'}</p>
                    <p>Si tienes alguna pregunta, no dudes en responder a este correo.</p>
                    <br/>
                    <p>Atentamente,</p>
                    <p><b>${senderName}</b></p>
                </div>
            `,
            attachments: [
                {
                    filename: pdfName || 'documento.pdf',
                    content: pdfBase64.split('base64,')[1] || pdfBase64, // Removemos el data URI header si existe
                }
            ]
        })

        if (resendData.error) {
            console.error('Error de Resend:', resendData.error)
            return NextResponse.json({ error: resendData.error.message }, { status: 500 })
        }

        // Actualizar el estado de la cotización a 'Enviado' usando supabase-admin (o el cliente normal ya que estamos server-side)
        if (cotizacionId) {
            const { error: updateError } = await supabase
                .from('cotizaciones')
                .update({ estado: 'Enviado' })
                .eq('id', cotizacionId)

            if (updateError) {
                console.error("No se pudo actualizar el estado, pero el email se envió", updateError)
            }
        }

        return NextResponse.json({ success: true, data: resendData.data })

    } catch (error: any) {
        console.error('Error en ruta send-email:', error)
        return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
    }
}
