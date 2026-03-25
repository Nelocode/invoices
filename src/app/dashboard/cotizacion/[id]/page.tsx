import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
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
        .select('nombre_completo, empresa_id, info_bancaria, link_pago')
        .eq('id', user.id)
        .single()

    // Obtener datos corporativos si el usuario pertenece a una empresa
    let empresaData = null
    if (profile?.empresa_id) {
        const { data: eData } = await supabase
            .from('empresas')
            .select('nombre, logo_url')
            .eq('id', profile.empresa_id)
            .single()
        empresaData = eData
    }

    // Obtener la cotización
    const { data: cotizacion, error } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !cotizacion) notFound()

    // Validar acceso:
    // El usuario debe ser el creador original, O deben compartir el mismo empresa_id
    const isOwner = cotizacion.usuario_id === user.id
    const isSameCompany = cotizacion.empresa_id && profile?.empresa_id && (cotizacion.empresa_id === profile.empresa_id)

    if (!isOwner && !isSameCompany) {
        return <div>No tienes permiso para ver este documento.</div>
    }

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
        usuario_empresa: empresaData?.nombre || null,
        usuario_email: user.email || '',
        usuario_logo_url: empresaData?.logo_url || null,
        info_bancaria: profile?.info_bancaria || null,
        link_pago: profile?.link_pago || null,
        tipo_documento: cotizacion.tipo_documento || 'cotizacion',
        texto_anexos: cotizacion.texto_anexos || null,
        mostrar_anexos: cotizacion.mostrar_anexos || false,
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
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">Cotización #{id.slice(0, 8).toUpperCase()}</h1>
                    <p className="text-white/50 mt-1">Vista previa del documento</p>
                </div>
                <Link
                    href={`/dashboard/editar-cotizacion/${id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl border border-slate-700 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Editar
                </Link>
            </div>
            <div className="overflow-x-auto">
                <DocumentoRender data={documentData} />
            </div>
        </div>
    )
}
