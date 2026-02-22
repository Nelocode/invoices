-- Migración para Fase 2: Tipos de Documento, Categorías e IA

-- 1. Añadir tipo_documento a las cotizaciones
ALTER TABLE public.cotizaciones 
ADD COLUMN IF NOT EXISTS tipo_documento TEXT DEFAULT 'cotizacion' CHECK (tipo_documento IN ('cotizacion', 'cuenta_cobro', 'factura_proforma'));

-- 2. Añadir campos para categorizar los items del catálogo
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'Pago único' CHECK (categoria IN ('Pago único', 'Pago recurrente', 'Costo adicional')),
ADD COLUMN IF NOT EXISTS recurrencia TEXT DEFAULT NULL;

-- 3. Añadir campos para clonar las categorías en los items de las cotizaciones ya generadas
ALTER TABLE public.cotizacion_items 
ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'Pago único' CHECK (categoria IN ('Pago único', 'Pago recurrente', 'Costo adicional')),
ADD COLUMN IF NOT EXISTS recurrencia TEXT DEFAULT NULL;
