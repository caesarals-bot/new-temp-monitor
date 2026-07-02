# TempMonitor V1 — Historial de Tareas

> Solo se trabaja una tarea a la vez. No se inicia la siguiente hasta que la anterior esté COMPLETADA.
> Estados: `PROPUESTA` → `APROBADA` → `EN PROGRESO` → `EN REVISIÓN` → `COMPLETADA`

---

## Completadas

| ID | Tarea | Completada | Nota |
|----|-------|------------|------|
| TASK-001 | Setup del proyecto: Vite + TS + Tailwind v4 + shadcn + ESLint + Husky | 2026-06-30 | Stack completo configurado, 19 componentes UI, estructura de carpetas |
| TASK-001b | Schema BD: crear tablas + `equipment.physical_location` | 2026-06-30 | Scripts SQL en `supabase/migrations/`, RLS habilitado |
| TASK-002 | Integración Supabase: cliente, tipos, env validation | 2026-06-30 | Cliente singleton, tipos generados, validación Zod |
| TASK-003 | AuthStore (Zustand) + login/logout + React Router v7 | 2026-06-30 | Store con signIn/signOut/signUp, ProtectedRoute, LoginPage |
| TASK-004 | Onboarding guiado: org + sede + staff + equipment | 2026-06-30 | Wizard 5 pasos, Zod por paso, RPC transaccional, bootstrap org/locations, 39 tests pasando |
| TASK-005 | AppShell: layout con RBAC + responsive + code splitting | 2026-06-30 | Sidebar fixed (desktop) + drawer (mobile), TopBar, NavItems con badge, LocationSelector, useIncidentStore, Platform Admin layout con flag, 110 tests pasando |
| TASK-006 | CRUD de sedes con límite por plan | 2026-07-01 | locations.service (7 fn), schemas Zod, LocationCard/Header/FormDialog/DeleteDialog, LocationsPage con useLocationsManagement hook, RBAC owner/admin, dev-bypass max_locations=2 para test visual, 199 tests pasando |
| TASK-006b | CRUD de personal (staff) — soft delete + scoped por sede activa | 2026-07-01 | staff.service (6 fn: list/get/create/update/setActive/countReadings), schemas Zod, StaffCard/Header/FormDialog/ToggleDialog, StaffsPage con useStaffManagement hook, RBAC owner/admin/manager, soft delete via staff.active preservando lecturas, dev-bypass con 2 staff por sede, NavItem Personal agregado, 281 tests pasando |
| TASK-007 | CRUD de equipos con rangos térmicos + scoped por sede activa | 2026-07-01 | equipment.service (6 fn: list/get/create/update/delete/countReadings), schemas Zod con refine min<max, EquipmentCard/Header/FormDialog/DeleteDialog, EquipmentsPage con useEquipmentManagement hook, RBAC owner/admin/manager, dev-bypass con 2-3 equipos por sede (refrigerador, congelador, vitrina), 364 tests pasando |
| TASK-008 | Formulario de registro de lectura manual | 2026-07-01 | readings.service (4 fn: list/get/create/count), reading.schema Zod con refine rango físico, lib isOutOfRange pura + outOfRangeDirection, EquipmentSelector/TemperatureInput/StaffSelector presentacionales puros, ReadingForm RHF + Zod con feedback visual de out-of-range, useReadingForm hook con state machine idle/submitting/success/error, ReadingsPage composición con success card + link /readings/history, RBAC abierto a todos los roles, dev-bypass con 8 lecturas distribuidas, jsdom shims agregados (hasPointerCapture, scrollIntoView, ResizeObserver), 452 tests pasando |
| DOC-001 | `files/ARCHITECTURE.md` — documentación técnica viva | 2026-07-01 | Principios, capas, estructura template de feature, stores, patrón CRUD, soft delete, manejo de errores, testing, dev-bypass, anti-patrones, commits convention |
| P0-001 | Git + .gitignore + ramas | 2026-06-30 | main (base estable), develop (HEAD trabajo) |

---

## En Progreso

(nada)

---

## Notas técnicas pendientes (housekeeping)

| ID | Origen | Nota |
|----|--------|------|
| H-001 | TASK-004 | Regenerar `src/shared/types/supabase.ts` desde Supabase para que la RPC `create_organization_with_owner` quede tipada. Hoy `auth.service.ts:21` usa `as string` para el retorno |
| H-002 | TASK-005 | Anon key de Supabase fue referida textualmente en chat del agente. Rotar la key en Project Settings → API es opcional pero recomendable |

---

## Sesión 2026-07-01: cierre TASK-008

### Alcance
Cierra **TASK-008** (formulario de registro de lectura manual). Inicia dominio `readings`. Se replica la metodología granular de TASK-007 con 9 commits (B-prep, B1..B8). 88 tests nuevos, total 452 pasando.

### Bloques ejecutados
- **B-prep** mocks: `chore(dev-bypass): add 8 temperature_readings mock`
- **B1** service: `feat(readings): service con create + list + get + count + tests`
- **B2** schema + lib: `feat(readings): schema Zod + lib isOutOfRange + tests`
- **B3** selectores: `feat(readings): EquipmentSelector + TemperatureInput + StaffSelector + tests`
- **B4** form: `feat(readings): ReadingForm RHF + Zod + tests + jsdom shims`
- **B5** hook: `feat(readings): useReadingForm hook con fetch equipment+staff + submit + tests`
- **B6** page: `feat(readings): ReadingsPage composicion pura con header + form + success state`
- **B7** router: `feat(readings): integrar en router + LazyPages + placeholder /readings/history`

### Decisiones de diseno aplicadas (vivas)
- **Dominio `readings` aislado:** feature-first mantenido. `useReadingForm` consume services de `equipment` y `staff` vía service (no acceso a store directo desde components). Selectores granulares (`useOrganizationStore((s) => s.activeLocationId)`).
- **`isOutOfRange` como utility pura testeable:** única lógica compartida entre la advertencia visual del form (TASK-008) y el motor de incidentes HACCP (TASK-010). Vive en `features/readings/lib/` con 15 tests.
- **`outOfRangeDirection` complementa `isOutOfRange`:** devuelve `'low' | 'high' | null` para que la UI pueda mostrar mensajes específicos ("bajo el mínimo" vs "sobre el máximo") sin recalcular rangos.
- **`staff` filtrado por `active=true` en el hook:** el selector del form solo muestra personas activas de la sede. Si llegan inactivos desde el service, se descartan en el hook. Mantiene la consistencia con el patrón `staff.active` de TASK-006b.
- **Form persistente (no Dialog):** ReadingsPage tiene un solo form (no un CRUD con grid+Dialogs como equipment). El header es presentacional y la composición es lineal. El éxito muestra un card verde con dos acciones: "Ver lecturas" (link a `/readings/history` placeholder para TASK-009) y "Registrar otra" (reset status).
- **RBAC abierto a todos los roles:** todos los usuarios logueados pueden registrar lecturas (operario en piso). No hay `canCreate` derivado de `profile.role`. Decisión confirmada con César en plan mode.
- **Out-of-range solo warning visual:** si la temperatura está fuera de rango, se muestra un Alert ("se registrará igualmente") pero **NO** se crea un incident. TASK-010 (motor HACCP) creará el incident. La separación es intencional para mantener TASK-008 con scope acotado.
- **`snapshot_min_temp`/`snapshot_max_temp` NO enviados en TASK-008:** el form lee el rango actual del `equipment` seleccionado para el warning visual, pero no persiste snapshot en la lectura. Decisión documentada como pendiente explícito para TASK-010 (donde el rango puede cambiar post-registro y el snapshot protege la trazabilidad HACCP).
- **Test setup ampliado con jsdom shims:** `hasPointerCapture`, `releasePointerCapture`, `scrollIntoView` y `ResizeObserver` agregados a `tests/setup.ts`. Necesarios para componentes Radix UI (Select) que usan APIs del DOM no implementadas en jsdom. **Pendiente archivar**: si el proyecto migra a `vitest-browser`, estos shims pueden dejar de ser necesarios.
- **`@hookform/resolvers/zod` instalado:** dep ya presente, pero se confirma su uso con `zodResolver(createReadingSchema)`. Pattern consistente con TASK-006/006b/007.
- **`feat(readings)` en el nav:** sin cambio. `useNavItems` ya tenía `/readings` registrado para los 4 roles (owner/admin/manager/staff). Solo se reemplazó el `RoutePlaceholder` por `lazyElement(LazyReadingsPage)`.

### Risgos / pendientes tecnicos
- **H-001:** regenerar `src/shared/types/supabase.ts` para tipar la RPC `create_organization_with_owner` (sigue con `as string` en `auth.service.ts:21`).
- **H-002:** rotar anon key de Supabase (opcional, recomendado).
- **H-003:** errors preexistentes de `tsc` (PostgresTerror no exportado, RHF generics) — no introducidos por TASK-008, persisten desde TASK-006b. Tests pasan porque vitest no usa tsc.
- **Realtime de incidents:** `useIncidentStore.subscribeRealtime(orgId)` sigue siendo noop. Se implementa en TASK-010 con `supabase.channel().on('postgres_changes')`.
- **Contadores placeholder 0:** `LocationCard`, `StaffCard`, `EquipmentCard` muestran `0 lecturas` como placeholder consciente. El service `countReadingsByEquipment` ya existe (B1); el cableado en los cards se hace en TASK-009 (dashboard realtime) cuando la lista esté presente.
- **Snapshot min/max pendiente:** el form no envía `snapshot_min_temp`/`snapshot_max_temp` a `temperature_readings`. TASK-010 (motor HACCP) debe poblar estas columnas en el insert cuando detecte out-of-range, leyendo el rango del equipment en el momento.
- **Sin tests de la page (`ReadingsPage`):** la page es composición pura de componentes ya testeados. No se duplican tests de integración para la page en V1 (decisión arquitectónica: tests E2E excluidos, ver `files/AGENT.md`). El cableado se valida visualmente.
- **Router placeholder `/readings/history`:** la ruta existe pero renderiza `RoutePlaceholder`. TASK-009 debe reemplazarla.

### Pendientes (siguiente tarea logica)
**TASK-009** (dashboard de lecturas con estado en tiempo real, prioridad Alta) tiene dependencias satisfechas: depende de TASK-008 (formulario de lectura) y TASK-007 (equipment, ya con `countEquipmentReadings` cableable).

### Siguiente tarea logica
**TASK-009** — Inicia el dashboard real-time del dominio `readings`. Reusar `useReadingForm.ts:fetchEquipment` pattern para `listReadingsByLocation(locationId)` con `supabase.channel('temperature_readings').on('postgres_changes', ...)` para refresco reactivo. Cablear contadores reales (`countReadingsByEquipment`) en `LocationCard`/`StaffCard`/`EquipmentCard`.

---

## Sesión 2026-06-30 (mañana): cierre

### Método aplicado
Metodologia "componente por componente con validacion visual entre bloques" acordada
con Cesar al inicio de la sesion. Resultado: 17 commits granulares, 0 regresiones,
bugs (sidebar mobile) detectados y arreglados en el momento por el usuario, no en QA
posterior.

### Bloques ejecutados
- B-prep Bypass auth dev via env flag
- B0  Router restructure
- B1  useNavItems (hook puro)
- B2  LocationSelector
- B3  useIncidentStore (placeholder, no realtime)
- B4  NavItems (renderiza items + badge)
- B5  Sidebar (fixed)
- B5.1 Bug fix: Sidebar visible en mobile + drawer mode preparado
- B6  TopBar (hamburger + LocationSelector + user menu)
- B7  AppShell (composicion Sidebar + TopBar + Outlet)
- B8  Integrar AppShell en router (reemplaza AuthenticatedLayout)
- B9  Drawer refinements (auto-close, ESC, body lock, focus)
- B10 Badge realtime con mock dev-bypass (3 incidentes)
- B11 Platform admin layout (segundo env flag)
- B12 Code splitting con React.lazy
- B13 CHANGELOG
- B14 Lint fixes finales

### Decisiones de diseno que quedan vivas
- **AppShell posee el estado del drawer** (isOpen, openDrawer, closeDrawer). TopBar y
  Sidebar reciben handlers via props. Esto facilita testing y reuso.
- **Sidebar modo dual**: `mode='fixed'` (visible desktop) o `mode='drawer'` (mobile).
  Mismo componente, distintos props. Boton X solo se renderiza cuando drawer abierto.
- **NavItems acepta variant: 'light' | 'dark'** para evitar overrides CSS en sidebar oscuro.
- **Platform Admin comparte AppShell** con items filtrados por `is_platform_admin`.
  Mismo shell, distinto nav.
- **dev-bypass es la fuente unica de mocks.** Cualquier dato falso (user, org, location,
  incidents) viene de ahi. Cuando cerremos el bypass, todo cae a Supabase real.

### Riesgos / pendientes tecnicos
- **Realtime real de incidents**: useIncidentStore.subscribeRealtime(orgId) sigue
  siendo noop. En TASK-010 (incidents + HACCP) se implementa con
  `supabase.channel('incidents').on('postgres_changes')`.
- **Codigo postal del Esquema** pendiente regenerar (H-001).
- **Anon key** expuesta en chat de sesion (H-002). Recomendable rotar.
- **CSS via tokens** - los valores `--color-*` son globales pero algunos componentes
  usan clases Tailwind directamente (ej `bg-white`). Pendiente auditar para TASK-006+.

### Siguiente tarea logica
**TASK-006** (CRUD de sedes con limite por plan) ya tiene dependencias satisfechas:
depende de TASK-005 (AppShell) y esta ya commiteada.

---

## Pendientes

| ID | Tarea | Prioridad | Módulo | Depende de |
|----|-------|-----------|--------|------------|
| ~~TASK-004~~ | ~~Onboarding guiado~~ ✅ ver Completadas | — | auth | TASK-003 |
| ~~TASK-005~~ | ~~AppShell con RBAC~~ ✅ ver Completadas | — | shared | TASK-003 |
| ~~TASK-006~~ | ~~CRUD de sedes con límite por plan~~ ✅ ver Completadas | — | locations | TASK-005 |
| ~~TASK-006b~~ | ~~CRUD de personal (staff)~~ ✅ ver Completadas | — | staff | TASK-005 |
| ~~TASK-007~~ | ~~CRUD de equipos con rangos térmicos~~ ✅ ver Completadas | — | equipment | TASK-006 |
| ~~TASK-008~~ | ~~Formulario de registro de lectura manual~~ ✅ ver Completadas | — | readings | TASK-007 |
| TASK-009 | Dashboard de lecturas con estado en tiempo real (Supabase realtime) | Alta | readings | TASK-008 |
| TASK-010 | Motor de detección de incidentes + flujo HACCP | Alta | incidents | TASK-009 |
| TASK-011 | Panel de reportes con filtros y exportación PDF | Media | reports | TASK-010 |
| TASK-012 | Panel de platform admin (super admin) | Baja | platform-admin | TASK-005 |

---

## P0 Pendientes

| ID | Tarea | Estado | Nota |
|----|-------|--------|------|
| P0-001 | Git + .gitignore + ramas | ✅ Completada | |
| P0-002 | CI/CD (GitHub Actions) | Pendiente | Requiere cuenta Git |
| P0-003 | .env.local (variables Supabase) | ✅ Completada | `.env.local` creado con credenciales |
| P0-004 | Deploy staging | Pendiente | Decidir provider post-proyecto |

---

## Registro de Tarea Completa

```markdown
## TASK-XXX — Nombre de la tarea

**Módulo:** [auth | locations | equipment | readings | incidents | reports | platform-admin | shared]
**Prioridad:** Alta / Media / Baja
**Depende de:** TASK-YYY (si aplica)
**Estimación:** S / M / L (Small ≤ 2h, Medium ≤ 4h, Large ≤ 8h)

### Descripción
Qué se construye y por qué.

### Criterios de aceptación
- [ ] Criterio verificable 1
- [ ] Criterio verificable 2

### Archivos afectados
- src/features/xxx/...

### Tests requeridos
- Qué se debe testear en esta tarea
```
