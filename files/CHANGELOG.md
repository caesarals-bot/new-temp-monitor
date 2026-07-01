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

## Sesión 2026-07-01: cierre (continuación)

### Alcance
Continuación desde TASK-006. Se cierran **TASK-006b** (CRUD personal) y **TASK-007** (CRUD equipos) con metodología granular por bloques. Tambien se documenta la arquitectura del proyecto.

### Bloques ejecutados
- **TASK-006 · 1 commit unico de consolidacion** (cierre)
- **TASK-006b · 10 commits granulares** (B-prep, B1..B9, B11)
- **TASK-007 · 10 commits granulares** (B-prep, B1..B10)
- **docs · 1 commit** para `files/ARCHITECTURE.md`

### Patrón de feature establecido (template)
Cada CRUD nuevo replica: `service` + `schema` + 4 componentes (`Card`, `Header`, `FormDialog`, `Delete/ToggleDialog`) + `hook` con state machine + `page` de composición pura + integracion en router/nav. Documentado en `files/ARCHITECTURE.md`.

### Decisiones de diseno aplicadas (vivas)
- **Feature-first mantenido:** `createLocation`, `createStaff` y `createEquipment` migrados de `auth.service` a sus features (`locations`, `staff`, `equipment`). `auth.service` queda solo con `createOrganization` (RPC transaccional).
- **Hook por dominio:** `useLocationsManagement`, `useStaffManagement`, `useEquipmentManagement`. State machine `closed | create | edit | delete` aislado del JSX.
- **Errors separados por dialog:** `formError` y `deleteError` (o `toggleError`) son estados independientes. Fix de bug latente donde un error de create se mostraba en el dialog de delete.
- **Soft delete en `staff` via `staff.active`:** preserva trazabilidad HACCP. El FK de `temperature_readings.recorded_by_staff` sigue apuntando al staff inactivo.
- **Hard delete en `equipment` y `locations`:** cascade a readings/incidents es aceptable para V1.
- **Fetch reactivo por `activeLocationId`:** cambiar de sede en el TopBar recarga la lista automáticamente (staff y equipment).
- **Linter estricto de React 19:** `setState` en `useEffect` requiere `eslint-disable-next-line` con justificacion en codigo. Documentado en cada hook.

### Risgos / pendientes tecnicos
- **H-001:** regenerar `src/shared/types/supabase.ts` para tipar la RPC `create_organization_with_owner` (sigue con `as string` en `auth.service.ts:21`).
- **H-002:** rotar anon key de Supabase (opcional, recomendado).
- **Realtime de incidents:** `useIncidentStore.subscribeRealtime(orgId)` sigue siendo noop. Se implementa en TASK-010 con `supabase.channel().on('postgres_changes')`.
- **Contadores placeholder 0:** `LocationCard`, `StaffCard`, `EquipmentCard` muestran `0 equipos` / `0 lecturas` como placeholder consciente. Se cablean en TASK-008/009 cuando existan los services de readings.

### Pendientes (siguiente tarea logica)
**TASK-008** (formulario de registro de lectura manual, prioridad Alta) ya tiene dependencias satisfechas: depende de TASK-007 (equipment) que está commiteada.

### Siguiente tarea logica
**TASK-008** — Inicia el dominio `readings`. Crear `readings.service`, `readings.schema`, formulario de registro manual con selección de equipo + staff + temperatura + timestamp.

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
| TASK-008 | Formulario de registro de lectura manual | Alta | readings | TASK-007 |
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
