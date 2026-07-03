# TempMonitor V1 — Backlog de Tareas

> Estado: **PROPUESTA** — pendiente de aprobación de César antes de ejecutar cualquier tarea.
> Solo se trabaja una tarea a la vez en estado APROBADA.
>
> **Tareas cerradas:** ver `files/TASKS_HISTORY.md` (TASK-001 a TASK-015).
> **Bitácora de ejecución:** ver `files/CHANGELOG.md` (sesiones, decisiones, housekeeping).

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
