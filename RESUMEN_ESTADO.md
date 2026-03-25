# Estado del Proyecto Cotiware V2
**Fecha**: 25 de febrero, 2026

## ✅ Features completadas (código listo)
1. **Migraciones Supabase** — Tablas y columnas nuevas
2. **Tipos de documento** — Cotización / Cuenta de cobro / Factura
3. **Enviar por correo** — Modal con Resend (`/api/send-email`)
4. **Módulo de Clientes** — CRUD completo (`/dashboard/clientes`)
5. **Info bancaria y link de pago** — En perfil del usuario
6. **Empresas y colaboradores** — Crear empresa, unirse con clave
7. **Anexos** — Sección opcional en cotizaciones
8. **Edición de cotizaciones** — Ruta `/dashboard/editar-cotizacion/[id]`
9. **Cotizar desde documento con IA** — Upload de PDF/Imagen + OpenAI

## 🔧 Último fix aplicado
- **`pdf-parse` → `pdf2json`** en `src/app/api/ai-cotizar/route.ts` — La librería `pdf-parse` causaba crash (`DOMMatrix is not defined`). Se reemplazó por `pdf2json`.
- **Try/catch mejorado** en `src/app/dashboard/perfil/components/ProfileForm.tsx` — `handleCreateWorkspace` y `handleJoinWorkspace` ahora capturan excepciones.

## ⚠️ Bugs pendientes
1. **Botón "Crear Empresa"** — No dispara la acción desde browser headless. Posible causa: RLS de Supabase bloqueando INSERT en `empresas`. Probar manualmente con cuenta real.
2. **Botón "Generar Cotización" (IA)** — Igual. Requiere ítems en catálogo. Probar con cuenta que tenga catálogo poblado.

## 📦 Git — Estado parcial
- **1 commit hecho**: `feat: add supabase migrations and database typings`
- **Archivos sin commitear**:
  - `package.json`, `package-lock.json`
  - `src/app/api/ai-cotizar/route.ts`, `src/app/api/send-email/`
  - `src/app/dashboard/clientes/`, `src/app/dashboard/editar-cotizacion/`
  - `src/app/dashboard/cotizacion/[id]/` (Editar btn + EnviarPDFModal)
  - `src/app/dashboard/cotizaciones/` (Kanban)
  - `src/app/dashboard/crear-cotizacion/` (AI + form changes)
  - `src/app/dashboard/items/`, `src/app/dashboard/perfil/`

## 🎯 Próximos pasos
1. Probar manualmente con cuenta `nelsondcarvajal@gmail.com`: Crear Empresa, Editar Cotización, IA
2. Crear commits progresivos restantes:
   - `feat: add clients module (CRUD)`
   - `feat: add email sending with Resend`
   - `feat: add quotation editing (UPDATE mode)`
   - `feat: add AI-powered document parsing with pdf2json`
   - `feat: add company workspace management`
   - `feat: improve kanban board and sidebar`
   - `chore: update dependencies`
3. `git push` a GitHub
