import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Creamos un singleton para Resend (si no hay key fallará en runtime al instanciar si lo usamos enseguida)
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(req: Request) {
    if (!resend) {
        return NextResponse.json({ error: 'Resend API Key no configurada' }, { status: 500 })
    }

    try {
        const { to, subject, cotizacionId, companyName, quotePdfUrl } = await req.json()

        if (!to || !cotizacionId) {
            return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
        }

        const data = await resend.emails.send({
            from: `${companyName || 'Cotizaciones'} <onboarding@resend.dev>`, // Resend default for testing
            to: [to],
            subject: subject || 'Nueva Cotización',
            html: `
                <div style="font-family: sans-serif; p-4">
                    <h2>Hola!</h2>
                    <p>Tienes una nueva cotización de <strong>${companyName || 'nuestra empresa'}</strong>.</p>
                    <p>Puedes revisarla en el siguiente enlace seguro:</p>
                    <a href="${quotePdfUrl}" style="display: inline-block; padding: 10px 20px; background-color: #fc7ebf; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">Ver Cotización</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">ID de Referencia: ${cotizacionId}</p>
                </div>
            `,
            tags: [
                {
                    name: 'cotizacion_id',
                    value: cotizacionId
                }
            ]
        })

        if (data.error) {
            return NextResponse.json({ error: data.error }, { status: 400 })
        }

        return NextResponse.json({ success: true, data })

    } catch (error) {
        return NextResponse.json({ error: 'Error enviando correo' }, { status: 500 })
    }
}
