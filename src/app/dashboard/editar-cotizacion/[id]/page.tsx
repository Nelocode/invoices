import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CotizacionForm } from '../components/CotizacionForm'

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditarCotizacionPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const { data: items } = await supabase
        .from('items')
        .select('id, nombre, codigo_sku, precio_base, categoria, recurrencia')
        .order('nombre', { ascending: true })

    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user?.id)
        .single()

    const empresaId = profile?.empresa_id

    // Obtener los clientes vinculados a la empresa o al usuario
    let clientes = []
    if (empresaId) {
        const { data } = await supabase
            .from('clientes')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('nombre', { ascending: true })
        clientes = data || []
    } else {
        const { data } = await supabase
            .from('clientes')
            .select('*')
            .eq('user_id', user?.id)
            .order('nombre', { ascending: true })
        clientes = data || []
    }

    // Obtener la cotización actual
    const { data: cotizacion, error } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !cotizacion) notFound()

    // Validar acceso:
    // El usuario debe ser el creador original, O deben compartir el mismo empresa_id
    const isOwner = cotizacion.usuario_id === user?.id
    const isSameCompany = cotizacion.empresa_id && empresaId && (cotizacion.empresa_id === empresaId)

    if (!isOwner && !isSameCompany) {
        return <div>No tienes permiso para editar este documento.</div>
    }

    // Obtener los ítems de la cotización actual
    const { data: cotizacionItems } = await supabase
        .from('cotizacion_items')
        .select(`
            item_id,
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

    const mappedItems = (cotizacionItems || []).map((ci: any) => ({
        item_id: ci.item_id,
        nombre: ci.items?.nombre || 'Ítem eliminado',
        codigo_sku: ci.items?.codigo_sku || null,
        cantidad: ci.cantidad,
        precio_unitario: ci.precio_unitario,
        precio_total: ci.precio_total,
        categoria: ci.categoria,
        recurrencia: ci.recurrencia,
    }))

    const initialData = {
        id: cotizacion.id,
        cliente_nombre: cotizacion.cliente_nombre,
        cliente_email: cotizacion.cliente_email,
        tipo_documento: cotizacion.tipo_documento,
        notas_visibles: cotizacion.notas_visibles,
        temas_legales_visibles: cotizacion.temas_legales_visibles,
        exclusiones_visibles: cotizacion.exclusiones_visibles,
        texto_anexos: cotizacion.texto_anexos,
        mostrar_anexos: cotizacion.mostrar_anexos,
        firma_url: cotizacion.firma_url,
        items: mappedItems,
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600">Editar Cotización #{id.slice(0, 8).toUpperCase()}</h1>
                <p className="text-slate-400 mt-1">Modifica los detalles de tu documento</p>
            </div>

            <CotizacionForm catalogItems={items || []} clientes={clientes || []} empresaId={empresaId} initialData={initialData} />
        </div>
    )
}
