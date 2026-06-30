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
| P0-001 | Git + .gitignore + ramas | 2026-06-30 | main (base estable), develop (HEAD trabajo) |

---

## En Progreso

(nada)

---

## Notas técnicas pendientes (housekeeping)

| ID | Origen | Nota |
|----|--------|------|
| H-001 | TASK-004 | Regenerar `src/shared/types/supabase.ts` desde Supabase para que la RPC `create_organization_with_owner` quede tipada. Hoy `auth.service.ts:21` usa `as string` para el retorno |

---

## Pendientes

| ID | Tarea | Prioridad | Módulo | Depende de |
|----|-------|-----------|--------|------------|
| ~~TASK-004~~ | ~~Onboarding guiado~~ ✅ ver Completadas | — | auth | TASK-003 |
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
