import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Usamos el service role key para poder actualizar sin contexto de usuario
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(req: Request) {
    try {
        const payload = await req.json()

        // Validamos que sea un evento de Resend de tipo email.opened
        if (payload.type === 'email.opened') {
            const data = payload.data

            // Buscamos el tag 'cotizacion_id' que anexamos al enviar
            const tags = data.tags || []
            const cotizacionTag = tags.find((t: any) => t.name === 'cotizacion_id')

            if (cotizacionTag && cotizacionTag.value) {
                const cotizacionId = cotizacionTag.value

                // Obtenemos el estado actual para no sobreescribir si ya está en estados finales
                const { data: cot } = await supabase
                    .from('cotizaciones')
                    .select('estado')
                    .eq('id', cotizacionId)
                    .single()

                if (cot && (cot.estado === 'Enviado' || cot.estado === 'En proceso')) {
                    // Actualizamos a 'En proceso' (o Leído) para indicar que se abrió
                    await supabase
                        .from('cotizaciones')
                        .update({ estado: 'En proceso' })
                        .eq('id', cotizacionId)
                }
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
