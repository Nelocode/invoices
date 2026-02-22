import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    try {
        const { texto, contexto } = await req.json()

        if (!texto) {
            return NextResponse.json({ error: 'Falta texto original' }, { status: 400 })
        }

        const prompt = `Actúa como un asistente profesional experto en redacción B2B.

El usuario está en una plataforma de cotizaciones y quiere mejorar o redactar el texto para el siguiente contexto:
[CONTEXTO DEL DOCUMENTO]: ${contexto || 'Sección de la cotización'}

Original: "${texto}"

Instrucciones:
1. Mejora la redacción haciéndola más profesional, clara y persuasiva.
2. Corrige ortografía y gramática.
3. Si el texto original es muy corto (ej: "diseño web"), expandelo a algo comercial e impactante (ej: "Diseño y desarrollo de sitio web optimizado para alta conversión").
4. Devuelve SOLO el texto mejorado, sin introducciones ni comentarios adicionales. No uses comillas envolventes si no hacen parte natural de la redacción.
`

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
        })

        const content = completion.choices[0]?.message?.content || ''

        return NextResponse.json({ result: content })

    } catch (error) {
        console.error('Error in ai-writer:', error)
        return NextResponse.json({ error: 'Error del servidor al procesar con IA' }, { status: 500 })
    }
}
