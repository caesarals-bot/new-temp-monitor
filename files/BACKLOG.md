# TempMonitor V1 — Backlog de Tareas

> Estado: **PROPUESTA** — pendiente de aprobación de César antes de ejecutar cualquier tarea.
> Solo se trabaja una tarea a la vez en estado APROBADA.
>
> **Tareas cerradas:** ver `files/TASKS_HISTORY.md` (TASK-001 a TASK-009).
> **Bitácora de ejecución:** ver `files/CHANGELOG.md` (sesiones, decisiones, housekeeping).

---

## TASK-010 — Motor de incidentes y flujo HACCP

**Módulo:** incidents  
**Prioridad:** Alta  
**Depende de:** TASK-009 ✅  
**Estimación:** L (5–6h)

### Descripción

Los incidentes son el corazón regulatorio del sistema. Cuando una lectura está fuera de rango, se crea un incidente que debe ser resuelto con acción correctiva documentada (requisito HACCP/ISP). Un incidente no puede cerrarse sin `action_taken`, `resolved_by` y `resolved_at`.

### Criterios de aceptación

- [ ] Lista de incidentes (abiertos primero, luego resueltos)
- [ ] Cada incidente muestra: equipo, lectura que lo gatilló, temperatura registrada, rango esperado, tiempo transcurrido
- [ ] Modal de resolución: campo `action_taken` (obligatorio, mínimo 20 caracteres), botón "Cerrar incidente"
- [ ] Al resolver: UPDATE en `incidents` con `status: 'resolved'`, `resolved_by`, `resolved_at`
- [ ] Solo `owner`, `admin` o `manager` pueden resolver incidentes
- [ ] `staff` ve los incidentes pero no puede resolverlos (UI deshabilitada con explicación)
- [ ] `useIncidentStore` expone `openIncidents` y `hasOpenIncidents` para el badge en sidebar
- [ ] Filtros: todos / abiertos / resueltos, por sede, por equipo, por rango de fecha
- [ ] `openIncidents` en el store se actualiza en tiempo real (Supabase Realtime, suscripción inicializada una sola vez)
- [ ] **Cablear `snapshot_min_temp`/`snapshot_max_temp`** al insertar readings out-of-range (pendiente heredado de TASK-008)
- [ ] **Cablear `outIncidentCount` real en `LocationCard`** (placeholder 0 pendiente desde TASK-006)
- [ ] Reemplazar mock data de `useIncidentsBootstrap` por channel real de `incidents`

### Pendientes heredados que se cierran

- Reemplazar `getDevMockOpenIncidentCount` por datos reales del store
- Crear feature `incidents` aislado (no se importa de `readings` directamente, comunicación via store o service)
- Reusar `isOutOfRange` de `features/readings/lib/` (ADR compartido)

### Archivos producidos

```
src/features/incidents/
├── components/
│   ├── IncidentList.tsx
│   ├── IncidentCard.tsx
│   ├── IncidentResolutionModal.tsx
│   └── IncidentFilters.tsx
├── store/
│   └── incident.store.ts
├── hooks/
│   ├── useIncidents.ts
│   └── useRealtimeIncidents.ts
├── services/
│   └── incidents.service.ts
├── schemas/
│   └── incident.schema.ts
└── types.ts
```

### Tests requeridos

- Schema: `action_taken` requiere mínimo 20 caracteres
- `incidents.service.ts`: resolveIncident setea los tres campos requeridos
- `useIncidents`: filtering correcto por estado
- `incident.store`: selectores granulares no re-renderizan ante cambios no observados
- `useRealtimeIncidents`: cleanup de channel (mismo patrón que `useRealtimeReadings`, ADR-010)

---

## TASK-011 — Panel de reportes y exportación PDF

**Módulo:** reports  
**Prioridad:** Media  
**Depende de:** TASK-010 ✅  
**Estimación:** L (6–8h)

### Descripción

Los reportes son el entregable que los clientes muestran a los inspectores sanitarios. Deben ser claros, filtrables y exportables en PDF.

### Criterios de aceptación

- [ ] Filtros: rango de fechas, sede, equipo, tipo de lectura (manual/IoT preparado), solo con incidentes
- [ ] Tabla de lecturas con columnas: fecha/hora, equipo, temperatura, rango configurado, estado, quién registró
- [ ] Gráfico de línea de temperatura por equipo en el período seleccionado (Recharts)
- [ ] Indicador de cumplimiento: % de lecturas dentro del rango en el período
- [ ] Exportación PDF: genera un reporte con logo, nombre de organización, período, tabla y gráfico
- [ ] PDF incluye snapshot de rangos térmicos (desde `snapshot_min_temp/max_temp`) — no los actuales
- [ ] Paginación en la tabla (50 registros por página)
- [ ] Resumen de incidentes del período: cuántos, cuáles fueron resueltos, cuáles siguen abiertos

### Pendientes heredados que se cierran

- Reusar `STALE_THRESHOLD_MS` de `features/readings/lib/timeSince.ts` (ADR-008)
- Reusar `isOutOfRange` de `features/readings/lib/isOutOfRange.ts` para cálculo de cumplimiento

### Archivos producidos

```
src/features/reports/
├── components/
│   ├── ReportsDashboard.tsx
│   ├── ReportFilters.tsx
│   ├── ReadingsTable.tsx
│   ├── TemperatureChart.tsx
│   ├── ComplianceSummary.tsx
│   └── PdfExportButton.tsx
├── hooks/
│   └── useReport.ts
└── services/
    └── reports.service.ts
```

### Tests requeridos

- `reports.service.ts`: filtros producen la query correcta
- `useReport`: paginación y cálculo de cumplimiento

---

## TASK-012 — Panel de platform admin

**Módulo:** platform-admin  
**Prioridad:** Baja  
**Depende de:** TASK-005 ✅  
**Estimación:** M (3–4h)

### Descripción

Vista exclusiva para usuarios con `is_platform_admin: true`. Permite ver todas las organizaciones del SaaS, su estado y métricas básicas.

### Criterios de aceptación

- [ ] Acceso protegido: solo `is_platform_admin === true` puede ver estas rutas
- [ ] Lista de organizaciones: nombre, tipo, plan, estado (active/paused/suspended), fecha de registro
- [ ] Cambiar estado de organización: active ↔ paused ↔ suspended
- [ ] Ver detalles de una organización: sedes, usuarios, volumen de lecturas
- [ ] Métricas globales: total organizaciones activas, total lecturas en los últimos 7 días, total incidentes abiertos
- [ ] El platform admin NO puede ver los datos de temperatura de ninguna organización (solo metadatos)

### Archivos producidos

```
src/features/platform-admin/
├── components/
│   ├── PlatformDashboard.tsx
│   ├── OrganizationList.tsx
│   ├── OrganizationDetail.tsx
│   └── GlobalMetrics.tsx
├── hooks/
│   └── usePlatformAdmin.ts
└── services/
    └── platform-admin.service.ts
```

### Tests requeridos

- Ruta protegida redirige si `is_platform_admin === false`
- `platform-admin.service.ts`: getOrganizations con filtros

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