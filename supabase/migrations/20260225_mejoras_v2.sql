-- ============================================================
-- MIGRACIÓN COTIWARE: Mejoras 8 puntos
-- (1) Empresas y Colaboradores, (2) Clientes, (3) Mejoras Cotizaciones, (4) Perfil
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. TABLA: empresas (Agrupación de colaboradores)
-- ============================================================
CREATE TABLE public.empresas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          TEXT NOT NULL,
    nit             TEXT,
    clave_acceso    TEXT UNIQUE NOT NULL, -- El super admin la provee para unirse
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.empresas IS 'Empresas para agrupar usuarios colaboradores';

-- Trigger updated_at
CREATE TRIGGER tr_empresas_updated_at
    BEFORE UPDATE ON public.empresas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 2. ALTERAR: usuarios (Colaboradores y Bancos)
-- ============================================================
-- Renombramos "empresa" texto a "cargo" y usamos empresa_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name='empresa_id') THEN
        ALTER TABLE public.usuarios ADD COLUMN empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name='rol') THEN
        ALTER TABLE public.usuarios ADD COLUMN rol TEXT NOT NULL DEFAULT 'colaborador' CHECK (rol IN ('admin', 'colaborador'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name='info_bancaria') THEN
        ALTER TABLE public.usuarios ADD COLUMN info_bancaria TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name='link_pago') THEN
        ALTER TABLE public.usuarios ADD COLUMN link_pago TEXT;
    END IF;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_id ON public.usuarios(empresa_id);

-- Actualizar handle_new_user para capturar empresa_id y rol opcional
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.usuarios (id, nombre_completo, empresa, telefono)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
        NEW.raw_user_meta_data->>'empresa',
        NEW.raw_user_meta_data->>'telefono'
    );
    RETURN NEW;
END;
$$;

-- ============================================================
-- 3. TABLA: clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clientes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id          UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre_razon_social TEXT NOT NULL,
    nit                 TEXT,
    direccion           TEXT,
    ciudad              TEXT,
    telefono            TEXT,
    email_contacto      TEXT,
    contacto_principal  TEXT,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.clientes IS 'Catálogo de clientes por empresa';

CREATE INDEX IF NOT EXISTS idx_clientes_empresa_id ON public.clientes(empresa_id);

-- Omitimos tr_clientes_updated_at si ya existe, creamos o reemplazamos
DROP TRIGGER IF EXISTS tr_clientes_updated_at ON public.clientes;
CREATE TRIGGER tr_clientes_updated_at
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 4. ALTERAR: cotizaciones (Tipos, Anexos, Cliente ID)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='cotizaciones' AND column_name='empresa_id') THEN
        ALTER TABLE public.cotizaciones ADD COLUMN empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='cotizaciones' AND column_name='cliente_id') THEN
        ALTER TABLE public.cotizaciones ADD COLUMN cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='cotizaciones' AND column_name='tipo_documento') THEN
        ALTER TABLE public.cotizaciones ADD COLUMN tipo_documento TEXT NOT NULL DEFAULT 'cotizacion' CHECK (tipo_documento IN ('cotizacion', 'factura_proforma', 'cuenta_cobro'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='cotizaciones' AND column_name='texto_anexos') THEN
        ALTER TABLE public.cotizaciones ADD COLUMN texto_anexos TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='cotizaciones' AND column_name='mostrar_anexos') THEN
        ALTER TABLE public.cotizaciones ADD COLUMN mostrar_anexos BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Permitimos que cliente_nombre siga existiendo temporalmente, o lo usamos de cache
-- Index
CREATE INDEX IF NOT EXISTS idx_cotizaciones_empresa_id ON public.cotizaciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente_id ON public.cotizaciones(cliente_id);

-- ============================================================
-- 5. ALTERAR: items (Compartir por empresa)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='items' AND column_name='empresa_id') THEN
        ALTER TABLE public.items ADD COLUMN empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_items_empresa_id ON public.items(empresa_id);


-- ============================================================
-- 6. RLS Y POLÍTICAS NUEVAS (Para Empresas)
-- ============================================================
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- OJO: Las políticas existentes asumían "usuario_id = auth.uid()".
-- Si ahora trabajamos por empresa, todos los de la misma empresa deberían ver.
-- Eliminar políticas viejas si es necesario, o actualizarlas. En este script las actualizaremos:

-- FUNCION DE AYUDA: saber la empresa del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_empresa_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT empresa_id FROM public.usuarios WHERE id = auth.uid();
$$;

-- ----- EMPRESAS -----
CREATE POLICY "Usuarios ven su propia empresa" ON public.empresas
    FOR SELECT USING (id = public.get_user_empresa_id());

CREATE POLICY "Solo admins actualizan empresa" ON public.empresas
    FOR UPDATE USING (
        id = public.get_user_empresa_id() AND 
        (SELECT rol FROM public.usuarios WHERE id = auth.uid()) = 'admin'
    );

-- ----- CLIENTES -----
CREATE POLICY "Empresa ve sus clientes" ON public.clientes
    FOR SELECT USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Empresa crea clientes" ON public.clientes
    FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Empresa actualiza clientes" ON public.clientes
    FOR UPDATE USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Empresa elimina clientes" ON public.clientes
    FOR DELETE USING (empresa_id = public.get_user_empresa_id());

-- ----- ACTUALIZACIÓN DE POLÍTICAS EXISTENTES (Opcional pero recomendado para el nuevo enfoque) -----
-- Para una migración completa donde los items/cotizaciones son por empresa:
/*
DROP POLICY IF EXISTS "Los usuarios ven solo sus propios items" ON public.items;
CREATE POLICY "Empresa ve sus items" ON public.items FOR SELECT USING (empresa_id = public.get_user_empresa_id() OR usuario_id = auth.uid());
-- etc...
*/
