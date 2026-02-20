import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const { mensaje, catalogo } = await request.json()

        if (!mensaje || !catalogo || !Array.isArray(catalogo)) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
        }

        // Construir la lista del catálogo para el prompt
        const catalogoText = catalogo.map((item: { id: string; nombre: string; codigo_sku: string | null; precio_base: number }) =>
            `- ID: "${item.id}" | Nombre: "${item.nombre}" | SKU: "${item.codigo_sku || 'N/A'}" | Precio: $${item.precio_base.toLocaleString()}`
        ).join('\n')

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.1,
            messages: [
                {
                    role: 'system',
                    content: `Eres un asistente de cotizaciones. Tu trabajo es interpretar solicitudes informales de usuarios y mapearlas a ítems de un catálogo de productos/servicios.

CATÁLOGO DISPONIBLE:
${catalogoText}

REGLAS ESTRICTAS:
1. SOLO puedes usar ítems que existan en el catálogo de arriba.
2. Si un ítem mencionado por el usuario NO coincide con ninguno del catálogo, intenta buscar el más parecido.
3. Si definitivamente no hay coincidencia, ignóralo y agrégalo como "no_encontrados".
4. Las cantidades deben ser números enteros positivos.
5. Si no se especifica cantidad, asume 1.
6. Si el usuario menciona un nombre de cliente, extráelo.

DEBES responder ÚNICAMENTE con un JSON válido, sin markdown, sin texto adicional, con esta estructura exacta:
{
    "cliente_nombre": "nombre del cliente si se menciona, o cadena vacía",
    "cliente_email": "email si se menciona, o cadena vacía",
    "items": [
        {
            "item_id": "UUID del ítem del catálogo",
            "nombre": "nombre del ítem",
            "cantidad": 1,
            "precio_unitario": 50000
        }
    ],
    "no_encontrados": ["descripción de ítems que no coincidieron"],
    "notas_sugeridas": "notas o contexto adicional extraído del mensaje, o cadena vacía"
}`
                },
                {
                    role: 'user',
                    content: mensaje
                }
            ]
        })

        const responseText = completion.choices[0]?.message?.content?.trim() || '{}'

        // Intentar parsear el JSON
        let parsed
        try {
            // Limpiar posible markdown ```json ... ```
            const cleaned = responseText.replace(/^```json?\s*/, '').replace(/\s*```$/, '')
            parsed = JSON.parse(cleaned)
        } catch {
            return NextResponse.json({
                error: 'La IA no pudo procesar tu solicitud correctamente. Intenta ser más específico.',
                raw: responseText
            }, { status: 422 })
        }

        return NextResponse.json(parsed)

    } catch (error) {
        console.error('Error en AI cotizar:', error)
        return NextResponse.json(
            { error: 'Error al procesar la solicitud con IA' },
            { status: 500 }
        )
    }
}
