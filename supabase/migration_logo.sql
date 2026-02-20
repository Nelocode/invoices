-- ============================================================
-- MIGRACIÓN: Agregar logo_url a la tabla usuarios
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- 1. Agregar columna logo_url
ALTER TABLE public.usuarios
ADD COLUMN logo_url TEXT;

COMMENT ON COLUMN public.usuarios.logo_url IS 'URL del logo personalizado del usuario/empresa';

-- 2. Crear bucket de storage para logos (ejecutar si no existe)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
-- ON CONFLICT (id) DO NOTHING;

-- 3. Política para que los usuarios puedan subir sus logos
-- CREATE POLICY "Los usuarios suben sus logos"
--     ON storage.objects FOR INSERT
--     TO authenticated
--     WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- CREATE POLICY "Los logos son públicos para lectura"
--     ON storage.objects FOR SELECT
--     TO public
--     USING (bucket_id = 'logos');
