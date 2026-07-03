# TempMonitor V1 — Backlog de Tareas

> Estado: **PROPUESTA** — pendiente de aprobación de César antes de ejecutar cualquier tarea.
> Solo se trabaja una tarea a la vez en estado APROBADA.
>
> **Tareas cerradas:** ver `files/TASKS_HISTORY.md` (TASK-001 a TASK-013).
> **Bitácora de ejecución:** ver `files/CHANGELOG.md` (sesiones, decisiones, housekeeping).

---

## TASK-014 — Estabilización: Políticas RLS para Platform Admin en BD

**Módulo:** shared  
**Prioridad:** Alta  
**Depende de:** TASK-013  
**Estimación:** S (1h)

### Descripción

Crear y aplicar una migración SQL en Supabase que defina las políticas RLS necesarias para que el rol platform admin tenga acceso cross-tenant de forma segura en producción.

### Criterios de aceptación

- [ ] Crear el archivo de migración `supabase/migrations/002_platform_admin_policies.sql`.
- [ ] Crear la función helper `is_platform_admin()` como `SECURITY DEFINER STABLE` para validar el rol del usuario autenticado.
- [ ] Definir políticas RLS de SELECT/UPDATE en la tabla `organizations` y SELECT en `locations`, `profiles` y `equipment` basadas en el rol platform admin.
- [ ] Crear una política restrictiva o vista para `incidents` (counts sin descripción/detalles) y asegurar que no hay política de acceso para `temperature_readings` (el platform admin no debe ver temperaturas).
- [ ] Aplicar localmente la migración y comprobar que no rompe los tests existentes ni el aislamiento de tenants normales.

### Archivos afectados

- `supabase/migrations/002_platform_admin_policies.sql`

---

## TASK-015 — Estabilización: Seed de Base de Datos y Smoke Tests E2E

**Módulo:** shared  
**Prioridad:** Alta  
**Depende de:** TASK-014  
**Estimación:** M (2.5h)

### Descripción

Desarrollar un script de carga de datos iniciales y ejecutar una prueba de humo manual end-to-end con una instancia real de Supabase para taggear la release estable `v1.0.0`.

### Criterios de aceptación

- [ ] Crear `scripts/seed-supabase.mjs` idempotente para poblar la base de datos (2 organizaciones, 2 dueños, 6 equipos, 20 lecturas de temperatura, 4 incidentes de desvío).
- [ ] Aplicar todas las migraciones (000, 001, 002) en un proyecto real de Supabase y correr el script de seed.
- [ ] Probar el inicio de sesión y el flujo completo en la PWA (dashboard en tiempo real, registro de lecturas fuera de rango, resolución de incidentes con justificación HACCP, generación y descarga de reporte PDF, panel global del platform admin).
- [ ] Realizar el bump de versión a `1.0.0` y crear el tag de Git `v1.0.0`.

### Archivos afectados

- [NEW] `scripts/seed-supabase.mjs`
- `package.json`

---

## Plantilla para nuevas tareas

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

---

## Notas generales del backlog

1. Las estimaciones asumen implementación limpia con tests incluidos.
2. Cada tarea cierra con un `pnpm build` y `pnpm test` que deben pasar sin errores.
3. Si durante una tarea se descubre complejidad no anticipada, se pausa y se reporta antes de continuar.
4. El orden del backlog no es negociable sin aprobación — cada tarea construye sobre la anterior.
5. Si una tarea se ejecuta con scope distinto al plan, el resultado va a `TASKS_HISTORY.md` con la nota de divergencia. La decisión de scope se documenta en el CHANGELOG de la sesión.
