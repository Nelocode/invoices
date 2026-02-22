'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function convertirDocumento(cotizacionId: string, nuevoTipo: 'cuenta_cobro' | 'factura_proforma') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase
        .from('cotizaciones')
        .update({
            tipo_documento: nuevoTipo,
            estado: 'Aprobado', // Al convertir se da por entendido que el cliente aceptó
        })
        .eq('id', cotizacionId)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/cotizaciones')
    revalidatePath(`/dashboard/cotizacion/${cotizacionId}`)
    return { error: null }
}
