import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { DocumentoRender, type CotizacionData } from './components/DocumentoRender'

interface Props {
    params: Promise<{ id: string }>
}

export default async function CotizacionViewPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) notFound()

    // Obtener perfil del usuario
    const { data: profile } = await supabase
        .from('usuarios')
        .select('nombre_completo, empresa, logo_url')
        .eq('id', user.id)
        .single()

    // Obtener la cotización
    const { data: cotizacion, error } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !cotizacion) notFound()

    // Obtener los ítems de la cotización con el nombre del ítem
    const { data: cotizacionItems } = await supabase
        .from('cotizacion_items')
        .select(`
            cantidad,
            precio_unitario,
            precio_total,
            categoria,
            recurrencia,
            items (
                nombre,
                codigo_sku
            )
        `)
        .eq('cotizacion_id', id)

    const documentData: CotizacionData = {
        id: cotizacion.id,
        cliente_nombre: cotizacion.cliente_nombre,
        cliente_email: cotizacion.cliente_email,
        subtotal: cotizacion.subtotal,
        impuestos: cotizacion.impuestos,
        total: cotizacion.total,
        notas_visibles: cotizacion.notas_visibles,
        temas_legales_visibles: cotizacion.temas_legales_visibles,
        exclusiones_visibles: cotizacion.exclusiones_visibles,
        firma_url: cotizacion.firma_url,
        estado: cotizacion.estado,
        creado_en: cotizacion.creado_en,
        usuario_nombre: profile?.nombre_completo || user.email || 'Usuario',
        usuario_empresa: profile?.empresa || null,
        usuario_email: user.email || '',
        usuario_logo_url: profile?.logo_url || null,
        tipo_documento: cotizacion.tipo_documento || 'cotizacion',
        items: (cotizacionItems || []).map((ci: Record<string, unknown>) => {
            const items = ci.items as { nombre: string; codigo_sku: string | null } | null
            return {
                nombre: items?.nombre || 'Ítem eliminado',
                codigo_sku: items?.codigo_sku || null,
                cantidad: ci.cantidad as number,
                precio_unitario: ci.precio_unitario as number,
                precio_total: ci.precio_total as number,
                categoria: ci.categoria as string | undefined,
                recurrencia: ci.recurrencia as string | null | undefined,
            }
        }),
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Cotización #{id.slice(0, 8).toUpperCase()}</h1>
                <p className="text-white/50 mt-1">Vista previa del documento</p>
            </div>
            <div className="overflow-x-auto">
                <DocumentoRender data={documentData} />
            </div>
        </div>
    )
}
