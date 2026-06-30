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
| TASK-005 | AppShell: Sidebar, TopBar, layout base con RBAC | Alta | shared | TASK-003 |
| TASK-006 | CRUD de sedes con límite por plan | Media | locations | TASK-005 |
| TASK-006b | CRUD de personal (staff) — encargados de toma de temperatura por sede | Media | staff | TASK-005 |
| TASK-007 | CRUD de equipos con rangos térmicos, nombre y ubicación | Media | equipment | TASK-006 |
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
