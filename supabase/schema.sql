-- ============================================================
-- BRAINWARE INVOICES: Script de inicialización de base de datos
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- 1. TABLA: usuarios (perfil vinculado a auth.users)
CREATE TABLE public.usuarios (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT NOT NULL,
    empresa         TEXT,
    telefono        TEXT,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.usuarios IS 'Perfil de usuario vinculado a auth.users de Supabase';

-- 2. TABLA: items (catálogo de productos/servicios)
CREATE TABLE public.items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nombre          TEXT NOT NULL,
    codigo_sku      TEXT,
    descripcion     TEXT,
    precio_base     NUMERIC(12,2) NOT NULL DEFAULT 0,
    notas_internas  TEXT,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.items IS 'Catálogo de ítems (servicios, productos, diseños, etc.) por usuario';

CREATE INDEX idx_items_usuario_id ON public.items(usuario_id);
CREATE INDEX idx_items_codigo_sku ON public.items(codigo_sku);

-- 3. TABLA: cotizaciones
CREATE TABLE public.cotizaciones (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id              UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    cliente_nombre          TEXT NOT NULL,
    cliente_email           TEXT,
    subtotal                NUMERIC(12,2) NOT NULL DEFAULT 0,
    impuestos               NUMERIC(12,2) NOT NULL DEFAULT 0,
    total                   NUMERIC(12,2) NOT NULL DEFAULT 0,
    notas_visibles          TEXT,
    temas_legales_visibles  TEXT,
    exclusiones_visibles    TEXT,
    estado                  TEXT NOT NULL DEFAULT 'En proceso'
                            CHECK (estado IN ('Enviado', 'En proceso', 'Pagado', 'Ganado', 'Perdido')),
    firma_url               TEXT,
    creado_en               TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cotizaciones IS 'Cotizaciones generadas por cada usuario para sus clientes';

CREATE INDEX idx_cotizaciones_usuario_id ON public.cotizaciones(usuario_id);
CREATE INDEX idx_cotizaciones_estado ON public.cotizaciones(estado);

-- 4. TABLA: cotizacion_items (tabla pivote)
CREATE TABLE public.cotizacion_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cotizacion_id   UUID NOT NULL REFERENCES public.cotizaciones(id) ON DELETE CASCADE,
    item_id         UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    cantidad        INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
    precio_total    NUMERIC(12,2) NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.cotizacion_items IS 'Líneas de detalle de cada cotización (snapshot del precio al momento)';

CREATE INDEX idx_cotizacion_items_cotizacion ON public.cotizacion_items(cotizacion_id);
CREATE INDEX idx_cotizacion_items_item ON public.cotizacion_items(item_id);

-- ============================================================
-- 5. FUNCIÓN: Crear perfil automáticamente al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.usuarios (id, nombre_completo, empresa)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
        NEW.raw_user_meta_data->>'empresa'
    );
    RETURN NEW;
END;
$$;

-- Trigger que se dispara cuando un usuario se registra en auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 6. FUNCIÓN: Actualizar timestamp automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.actualizado_en = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER tr_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_cotizaciones_updated_at
    BEFORE UPDATE ON public.cotizaciones
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizacion_items ENABLE ROW LEVEL SECURITY;

-- ---------- POLÍTICAS: usuarios ----------
CREATE POLICY "Los usuarios ven solo su propio perfil"
    ON public.usuarios FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Los usuarios editan solo su propio perfil"
    ON public.usuarios FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ---------- POLÍTICAS: items ----------
CREATE POLICY "Los usuarios ven solo sus propios items"
    ON public.items FOR SELECT
    USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios crean sus propios items"
    ON public.items FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios editan solo sus propios items"
    ON public.items FOR UPDATE
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios eliminan solo sus propios items"
    ON public.items FOR DELETE
    USING (auth.uid() = usuario_id);

-- ---------- POLÍTICAS: cotizaciones ----------
CREATE POLICY "Los usuarios ven solo sus propias cotizaciones"
    ON public.cotizaciones FOR SELECT
    USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios crean sus propias cotizaciones"
    ON public.cotizaciones FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios editan solo sus propias cotizaciones"
    ON public.cotizaciones FOR UPDATE
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios eliminan solo sus propias cotizaciones"
    ON public.cotizaciones FOR DELETE
    USING (auth.uid() = usuario_id);

-- ---------- POLÍTICAS: cotizacion_items ----------
CREATE POLICY "Los usuarios ven solo items de sus cotizaciones"
    ON public.cotizacion_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cotizaciones c
            WHERE c.id = cotizacion_id AND c.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios crean items en sus cotizaciones"
    ON public.cotizacion_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cotizaciones c
            WHERE c.id = cotizacion_id AND c.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios editan items de sus cotizaciones"
    ON public.cotizacion_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.cotizaciones c
            WHERE c.id = cotizacion_id AND c.usuario_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cotizaciones c
            WHERE c.id = cotizacion_id AND c.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios eliminan items de sus cotizaciones"
    ON public.cotizacion_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.cotizaciones c
            WHERE c.id = cotizacion_id AND c.usuario_id = auth.uid()
        )
    );
