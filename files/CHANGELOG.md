# TempMonitor V1 — Historial de Tareas

> Solo se trabaja una tarea a la vez. No se inicia la siguiente hasta que la anterior esté COMPLETADA.
> Estados: `PROPUESTA` → `APROBADA` → `EN PROGRESO` → `EN REVISIÓN` → `COMPLETADA`

---

## Completadas

| ID        | Tarea                                                                 | Completada | Nota                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------- | --------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-001  | Setup del proyecto: Vite + TS + Tailwind v4 + shadcn + ESLint + Husky | 2026-06-30 | Stack completo configurado, 19 componentes UI, estructura de carpetas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| TASK-001b | Schema BD: crear tablas + `equipment.physical_location`               | 2026-06-30 | Scripts SQL en `supabase/migrations/`, RLS habilitado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| TASK-002  | Integración Supabase: cliente, tipos, env validation                  | 2026-06-30 | Cliente singleton, tipos generados, validación Zod                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| TASK-003  | AuthStore (Zustand) + login/logout + React Router v7                  | 2026-06-30 | Store con signIn/signOut/signUp, ProtectedRoute, LoginPage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| TASK-004  | Onboarding guiado: org + sede + staff + equipment                     | 2026-06-30 | Wizard 5 pasos, Zod por paso, RPC transaccional, bootstrap org/locations, 39 tests pasando                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| TASK-005  | AppShell: layout con RBAC + responsive + code splitting               | 2026-06-30 | Sidebar fixed (desktop) + drawer (mobile), TopBar, NavItems con badge, LocationSelector, useIncidentStore, Platform Admin layout con flag, 110 tests pasando                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| TASK-006  | CRUD de sedes con límite por plan                                     | 2026-07-01 | locations.service (7 fn), schemas Zod, LocationCard/Header/FormDialog/DeleteDialog, LocationsPage con useLocationsManagement hook, RBAC owner/admin, dev-bypass max_locations=2 para test visual, 199 tests pasando                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| TASK-006b | CRUD de personal (staff) — soft delete + scoped por sede activa       | 2026-07-01 | staff.service (6 fn: list/get/create/update/setActive/countReadings), schemas Zod, StaffCard/Header/FormDialog/ToggleDialog, StaffsPage con useStaffManagement hook, RBAC owner/admin/manager, soft delete via staff.active preservando lecturas, dev-bypass con 2 staff por sede, NavItem Personal agregado, 281 tests pasando                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| TASK-007  | CRUD de equipos con rangos térmicos + scoped por sede activa          | 2026-07-01 | equipment.service (6 fn: list/get/create/update/delete/countReadings), schemas Zod con refine min<max, EquipmentCard/Header/FormDialog/DeleteDialog, EquipmentsPage con useEquipmentManagement hook, RBAC owner/admin/manager, dev-bypass con 2-3 equipos por sede (refrigerador, congelador, vitrina), 364 tests pasando                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| TASK-008  | Formulario de registro de lectura manual                              | 2026-07-01 | readings.service (4 fn: list/get/create/count), reading.schema Zod con refine rango físico, lib isOutOfRange pura + outOfRangeDirection, EquipmentSelector/TemperatureInput/StaffSelector presentacionales puros, ReadingForm RHF + Zod con feedback visual de out-of-range, useReadingForm hook con state machine idle/submitting/success/error, ReadingsPage composición con success card + link /readings/history, RBAC abierto a todos los roles, dev-bypass con 8 lecturas distribuidas, jsdom shims agregados (hasPointerCapture, scrollIntoView, ResizeObserver), 452 tests pasando                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| TASK-009  | Dashboard de lecturas con estado en tiempo real                       | 2026-07-02 | readings.service (+3 fn: listByLocation/latest/countByLocation via 2 queries), lib timeSince pura + isStaleReading con STALE_THRESHOLD_MS=2h, useRealtimeReadings hook con supabase.channel + cleanup crítico de memory leak, LastReadingBadge/EquipmentStatusCard/EquipmentStatusGrid components con estados semánticos ok/alert/no-reading, ReadingsHistoryPage composición con header + grid + error banner, router /readings/history → dashboard (reemplaza placeholder), contadores reales cableados en LocationCard/StaffCard/EquipmentCard, README reemplazado del template Vite, dev-bypass con lectura 2-días-old para stale demo, 515 tests pasando                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| TASK-010  | Motor de incidentes y flujo HACCP                                     | 2026-07-02 | incidents.service (listIncidents con filtros + 2 queries por location ADR-007, resolveIncident con action_taken/resolved_by/resolved_at, createIncidentFromReading, buildIncidentDescription helper), schemas Zod (resolveIncidentSchema con actionTaken min 20 chars), incident.store con openIncidents + openIncidentsByLocation + subscribeRealtime único por org (idempotente) + upsertIncident/removeIncident + 4 selectores granulares, useIncidentsBootstrap ahora monta channel real con cleanup (skip en dev-bypass ADR-010), useIncidents hook con state machine de filtros + modal resolving + RBAC owner/admin/manager + errores separados (listError/resolveError), IncidentCard con tooltip "solo owner/admin/manager" para staff, IncidentList con sort abiertos-primero, IncidentFiltersBar con select status/location + clear, IncidentResolutionModal con RHF+Zod (textarea actionTaken), IncidentsPage composición + LazyPages + router, cierre TASK-008 con snapshot_min/max_temp en createReading, cierre TASK-006 con openIncidentCount real en LocationCard (ADR-011), eliminación getDevMockOpenIncidentCount (dead code), 41 tests nuevos (schema:7 + service:10 + store:19 + useIncidents:13), 556 tests pasando                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| TASK-011  | Panel de reportes y exportación PDF                                   | 2026-07-02 | +4 deps (recharts, jspdf, jspdf-autotable, html-to-image ~215kB gzip), reports.service (listReadingsReport con filtros dateRange/locationId/equipmentId/readingType + 2 queries ADR-007, listIncidentsForReport reusando listIncidents de TASK-010), schema Zod con refine from<=to + max 1 año, useReport hook con state machine + paginación 50/pág + computed compliance (reusa isOutOfRange + snapshot_min/max) + filtro onlyWithIncidents cliente + reportData shape + errores separados (loadError/exportError), 5 componentes (ReportFiltersBar con date pickers + selects + checkbox, ReadingsTable paginada con badge OK/Fuera de rango via isOutOfRange, TemperatureChart Recharts LineChart con ReferenceArea de rango seguro + forwardRef, ComplianceSummaryCard + IncidentSummaryCard con desglose por equipo, PdfExportButton con html-to-image + jsPDF), ReportsDashboard composición + ReportsPage + LazyPages + router (reemplaza placeholder), lib/pdfExport.generatePdf con header eucalyptus + tabla autotable + chart embebido + footer con snapshot de rangos, 45 tests nuevos (schema:9 + service:9 + useReport:16 + pdfExport:11), 601 tests pasando                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| TASK-012  | Panel de platform admin (cross-tenant)                                | 2026-07-02 | ProtectedRoute extendido con prop `requirePlatformAdmin` (redirige a `/` si profile no es platform_admin), platform-admin.service (listOrganizations con filtros status/businessType/planType + JOIN counts via `!inner` anidado, getOrganizationDetail con 4 queries paralelas cross-tenant, updateOrganizationStatus UPDATE simple, getGlobalMetrics con 3 queries paralelas via Promise.all), usePlatformAdmin hook con state machine (organizations + metrics cargados en paralelo, dialog de cambio de estado con confirmación literal "confirmar", paginación cliente 50/pág, errores separados listError/metricsError/statusError), 7 componentes (OrganizationStatusBadge con variants semantic por status, GlobalMetricsCards con 4 KPI + iconos Lucide, OrganizationFiltersBar con 3 selects + clear, OrganizationList con cards linkeables + botón cambiar estado, OrganizationStatusDialog con RHF+Zod + campo confirmación, OrganizationDetailView con stat cards + lista de sedes/usuarios, PlatformDashboard composición + PlatformEmptyState), 3 pages (PlatformAdminPage, PlatformMetricsPage, OrganizationDetailPage con useParams + helper async extraído para evitar cascading-renders lint), router con 3 rutas gated por `<ProtectedRoute requirePlatformAdmin>` (/admin/organizations, /admin/organizations/:id, /admin/metrics), 3 mocks dev-bypass para organizaciones cross-tenant (Restaurante Demo Norte pro/active, Farmacia Vital enterprise/active, Carnicería Don Pedro basic/paused) con locations/profiles/counts metadata, dev-bypass-platform-admin.ts separado del dev-bypass.ts principal, 6 commits granulares (1 por bloque), 18 tests nuevos (service:8 + usePlatformAdmin:10), 619 tests pasando |
| DOC-001   | `files/ARCHITECTURE.md` — documentación técnica viva                  | 2026-07-01 | Principios, capas, estructura template de feature, stores, patrón CRUD, soft delete, manejo de errores, testing, dev-bypass, anti-patrones, commits convention                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| P0-001    | Git + .gitignore + ramas                                              | 2026-06-30 | main (base estable), develop (HEAD trabajo)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

---

## En Progreso

(nada)

---

## Notas técnicas pendientes (housekeeping)

| ID    | Origen   | Nota                                                                                                                                                                                                                                                                                                                     |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| H-001 | TASK-004 | Regenerar `src/shared/types/supabase.ts` desde Supabase para que la RPC `create_organization_with_owner` quede tipada. Hoy `auth.service.ts:21` usa `as string` para el retorno                                                                                                                                          |
| H-002 | TASK-005 | Anon key de Supabase fue referida textualmente en chat del agente. Rotar la key en Project Settings → API es opcional pero recomendable                                                                                                                                                                                  |
| H-004 | TASK-012 | Crear migration SQL con RLS policies que permitan SELECT de metadata cross-tenant a `is_platform_admin`. Hoy el frontend asume que las policies ya lo permiten; en producción sin la migration, las queries devolverán error de RLS. Tablas: organizations, locations, profiles, equipment (counts), incidents (counts). |

---

## Sesión 2026-07-02: cierre TASK-009

### Alcance

Cierra **TASK-009** (dashboard de lecturas con estado en tiempo real). 11 commits (B-prep-README, B-prep-mocks, B1..B9, B10-doc). 63 tests nuevos, total 515 pasando.

### Bloques ejecutados

- **B-prep-README** docs: `docs: replace Vite template README with TempMonitor project README`
- **B-prep-mocks** mocks: `chore(dev-bypass): adjust readings mock for dashboard diversity` (Vitrina ahora con lectura 2-días-old)
- **B1** service: `feat(readings): service extensions listByLocation + latest + countByLocation + tests`
- **B2** lib: `feat(readings): timeSince helper + isStaleReading + tests`
- **B3** hook: `feat(readings): useRealtimeReadings hook with cleanup + tests`
- **B4** component: `feat(readings): LastReadingBadge component + tests`
- **B5** component: `feat(readings): EquipmentStatusCard with semantic states + tests`
- **B6** component: `feat(readings): EquipmentStatusGrid + empty state + tests`
- **B7** page: `feat(readings): ReadingsHistoryPage composicion + tests`
- **B8** router: `feat(readings): router /readings/history → ReadingsHistoryPage (lazy)`
- **B9** contadores: `feat(domains): cablear contadores reales en cards` (Location/Staff/Equipment)

### Decisiones de diseno aplicadas (vivas)

- **`listByLocation` con 2 queries en vez de `!inner` join:** PostgREST nested filter con `equipment:equipment_id!inner(location_id)` cambia la forma del row. Preferimos 2 queries (equipment IDs → readings) para mantener el tipo `TemperatureReading` puro y tests deterministas.
- **`latestByEquipment` con `maybeSingle()`:** distinto de `single()`, retorna `data: null` cuando no hay filas, sin error. Crítico para equipos sin lecturas.
- **`timeSince` como utility pura con `now` inyectado:** permite tests deterministas sin depender del reloj del sistema. 13 tests cubriendo bordes (59s/60s/24h/7d/30d).
- **`STALE_THRESHOLD_MS = 2h` (HACCP):** exportado desde `timeSince.ts` para que TASK-011 (reportes) lo reuse sin divergencia.
- **`isStaleReading` separada de `formatTimeSince`:** dos funciones puras con un mismo `now`, evitando mezclar presentación y estado. `LastReadingBadge` consume ambas.
- **`useRealtimeReadings` cleanup crítico:** test explícito verifica `removeChannel` en unmount y en cambio de `locationId`. En dev-bypass retorna empty map (sin channel), no se mockea.
- **`EquipmentStatusCard` con 3 estados:** `ok` (dentro de rango, fresh) / `alert` (fuera de rango) / `no-reading` (sin lecturas). El "stale" (>2h) es un detalle visual del badge, no un estado de la card — un equipo con lectura fresca pero vieja sigue siendo `ok` operativamente.
- **`ReadingsHistoryPage` composición pura:** combina `useRealtimeReadings` + `listReadingsByLocation` vía `useMemo` que mergea el map inicial con updates realtime, sin lógica de negocio nueva. Pattern reusable para TASK-010.
- **Realtime en dev-bypass = skip:** confirmado en plan mode. El channel real de Supabase requiere realtime habilitado en el proyecto; con mocks se valida solo el cleanup.
- **Contadores reales cableados en cards:** `LocationCard` ahora cuenta equipment por location (Promise.all sobre `listEquipmentByLocation`). `StaffCard` cuenta readings por staff. `EquipmentCard` cuenta readings por equipo. Cierra el placeholder `0` pendiente desde TASK-007/008.
- **`outIncidentCount` sigue en 0 en `LocationCard`:** se mantiene placeholder hasta TASK-010 cuando `useIncidentStore` traiga datos por location. Hoy la lógica vive en el store global.
- **`useReadingForm` no se tocó:** el form de TASK-008 sigue su flujo; `ReadingsHistoryPage` es nueva página paralela.

### Risgos / pendientes tecnicos

- **H-001:** persiste — `as string` en `auth.service.ts:21`. No introducido por TASK-009.
- **H-002:** persiste — anon key sin rotar.
- **H-003:** persiste — errores preexistentes de `tsc`. TASK-009 no agregó nuevos.
- **Realtime de incidents:** sigue siendo noop. TASK-010 lo implementa (no TASK-009, decisión de scope confirmada en plan mode).
- **Snapshot min/max al insertar:** sigue pendiente para TASK-010. TASK-009 solo lee.
- **Panel de incidentes:** no está en `ReadingsHistoryPage`. Decisión de scope confirmada: queda para TASK-010 que crea el feature `incidents`.
- **`useIncidentsBootstrap` mock data:** el badge de incidentes en sidebar sigue mostrando 3 hardcodeados (dev-bypass). TASK-010 lo reemplaza.
- **`2 queries` para `listByLocation`:** en V1 con 1-50 equipos/sede es aceptable. Si crece, se puede cambiar a vista SQL o RPC agregado.

### Pendientes (siguiente tarea logica)

**TASK-010** (motor de detección de incidentes + flujo HACCP, prioridad Alta) tiene dependencias satisfechas: TASK-009 ✅, TASK-008 ✅. Aquí se cablea `snapshot_min/max_temp` al insertar readings out-of-range y se implementa `useIncidentStore.subscribeRealtime`.

### Siguiente tarea logica

**TASK-010** ✅ cerrada en la sesión siguiente. **TASK-011** (panel de reportes, prioridad Media) es la próxima — reusar `isOutOfRange` y `STALE_THRESHOLD_MS` de features/readings/lib/ para cálculo de cumplimiento y estado stale.

---

## Sesión 2026-07-02: cierre TASK-010

### Alcance

Cierra **TASK-010** (motor de incidentes + flujo HACCP). **1 commit único** consolidado (decisión de scope acordada en plan mode con César). 41 tests nuevos, total 556 pasando.

### Bloques ejecutados

- **feat(incidents)** consolidado: TASK-010 motor de incidentes + flujo HACCP — incluye service + schemas + store con realtime + bootstrap + hook + componentes + page + router + cableado de snapshots en readings + cableado de openIncidentCount en LocationCard + eliminación de getDevMockOpenIncidentCount + 4 archivos de tests

### Decisiones de diseño aplicadas (vivas)

- **`openIncidentsByLocation: Map<locationId, number>` como índice derivado en el store:** alternativa a una query adicional por cada LocationCard. Se actualiza en `fetchOpenIncidents`, `upsertIncident`, `removeIncident`. Selectores granulares (`selectOpenIncidentsByLocation`) permiten que un card no se re-renderice cuando cambia otra sede.
- **`subscribeRealtime` único por org + idempotente:** el channel `incidents:org:<orgId>` se monta UNA sola vez por sesión desde `useIncidentsBootstrap`. Si se vuelve a llamar con el mismo `orgId`, retorna cleanup vacío. En dev-bypass, retorna noop (ADR-010). En cualquier INSERT/UPDATE/DELETE de la tabla `incidents`, refetchea la lista (más simple que patch incremental, garantiza consistencia con la BD).
- **Creación del incidente desde `useReadingForm` con detección `isOutOfRange`:** opción B del plan (sin trigger SQL). Tras INSERT exitoso de la reading, si está out-of-range se llama `createIncidentFromReading` con descripción auto-generada por `buildIncidentDescription` (usa `outOfRangeDirection` para "supera" vs "bajo"). Luego refetch del store para que el badge de sidebar y el LocationCard reflejen el nuevo incidente.
- **Snapshots `snapshot_min/max_temp` cableados al insert:** cierre del pendiente heredado de TASK-008. El caller (`useReadingForm`) provee `snapshotMin`/`snapshotMax` desde el `equipment` ya cargado en memoria. Service puro recibe como parámetros (decisión B del plan). Garante de trazabilidad HACCP cuando el rango del equipo cambie post-registro.
- **RBAC por props (`canResolve`) en `IncidentCard`:** el hook deriva `canResolve` desde `profile?.role` (owner/admin/manager). El componente recibe el flag. Para `staff`, el botón "Resolver" se renderiza deshabilitado dentro de un `<Tooltip>` con la explicación. Patrón consistente con `LocationCard`/`canEdit`.
- **Errores separados `listError` vs `resolveError`:** el modal tiene su propio estado de error y no contamina la lista. Cierra el anti-patrón #5 de ARCHITECTURE.md.
- **`action_taken` mínimo 20 caracteres (Zod refine):** garantiza acción correctiva con suficiente detalle para auditoría HACCP/ISP. Mensaje custom: "La acción correctiva debe tener al menos 20 caracteres". Test cubre: vacío, <20, exactamente 20, trim, >1000, missing.
- **`buildIncidentDescription` con `outOfRangeDirection`:** mensajes específicos ("supera el rango" vs "está bajo el rango") en lugar de genérico "fuera de rango". Reusa `outOfRangeDirection` de TASK-008 (sin duplicación).
- **`useRealtimeIncidents.ts` NO se creó como archivo separado:** confirmado en plan mode. La subscripción vive en `incident.store.subscribeRealtime(orgId)` y se monta desde `useIncidentsBootstrap`. La query en sí la hace `useIncidents` con `listIncidents` + filtros vigentes (no hay un canal separado para la página).
- **Test visual checkpoint (sub-paso 11) confirmado por César:** badge sidebar, lista, filtros, resolución como owner/admin/manager, resolución como staff (tooltip), creación de incidente real desde `ReadingForm` con temperatura out-of-range.

### Tests añadidos

- `tests/unit/incident.schema.test.ts` — 7 tests: actionTaken ≥20, exactamente 20, vacío, <20, trim, >1000, missing
- `tests/unit/incidents.service.test.ts` — 10 tests: buildIncidentDescription (3), resolveIncident (2: success+error), createIncidentFromReading (1), listIncidents (4: empty location, filtros, error, sin filtros)
- `tests/unit/incident.store.test.ts` — 19 tests: fetchOpenIncidents (4), subscribeRealtime (4: empty/noop/dev-bypass/cleanup/idempotente), upsertIncident (4), removeIncident (2), reset (1), selectores (4)
- `tests/unit/useIncidents.test.ts` — 13 tests: RBAC (4), fetching (5), resolution (4)

### Riesgos / pendientes técnicos

- **H-001, H-002, H-003:** persisten sin cambios. TASK-010 no los empeora: el service de incidents usa `PostgrestError` como tipo local inline para no sumar al problema de H-003 (import roto del repo). Cerrar H-003 queda fuera del scope TASK-010.
- **`pnpm build` con errores preexistentes:** `tsc -b` falla por errores que existían antes de TASK-010 (PostgrestError no exportado en supabase.ts, RHF generics en LocationFormDialog/ReadingForm/StaffFormDialog, Location no exportado en locations.service). **TASK-010 no introduce errores nuevos**. Decisión acordada en plan mode: cerrar TASK-010 con housekeeping pendiente.
- **`description` del incidente auto-generada (no editable):** decisión del plan mode. Si un cliente quiere editar la descripción en V2, se agrega un campo opcional al modal.
- **Pendiente para TASK-011 (reportes):** reusar `selectOpenIncidentsByLocation` para métricas de cumplimiento; `buildIncidentDescription` para mostrar la razón del desvío en el PDF; el listado histórico de incidentes ya viene de `listIncidents` con filtros `status`/`locationId`/`equipmentId`/`from`/`to`.

### Pendientes (siguiente tarea lógica)

**TASK-011** (panel de reportes y exportación PDF, prioridad Media) tiene dependencias satisfechas: TASK-010 ✅, TASK-008 ✅, TASK-009 ✅. Reusará `STALE_THRESHOLD_MS`, `isOutOfRange` y `listIncidents`.

### Siguiente tarea lógica

**TASK-011** ✅ cerrada en la sesión siguiente. **TASK-012** ✅ cerrada también. **No quedan tareas del scope V1.** Decidir si continuar con housekeeping (H-001/H-002/H-003/H-004), features V2 (logo por organización, pagos, notificaciones, IoT real, E2E), o cierre formal del proyecto.

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
- B0 Router restructure
- B1 useNavItems (hook puro)
- B2 LocationSelector
- B3 useIncidentStore (placeholder, no realtime)
- B4 NavItems (renderiza items + badge)
- B5 Sidebar (fixed)
- B5.1 Bug fix: Sidebar visible en mobile + drawer mode preparado
- B6 TopBar (hamburger + LocationSelector + user menu)
- B7 AppShell (composicion Sidebar + TopBar + Outlet)
- B8 Integrar AppShell en router (reemplaza AuthenticatedLayout)
- B9 Drawer refinements (auto-close, ESC, body lock, focus)
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

> No quedan tareas activas en el backlog V1. Las 3 tareas del scope V1 (TASK-010/011/012) están cerradas. El "siguiente tarea lógica" se documenta al final de la última sesión.

---

## P0 Pendientes

| ID     | Tarea                           | Estado        | Nota                                 |
| ------ | ------------------------------- | ------------- | ------------------------------------ |
| P0-001 | Git + .gitignore + ramas        | ✅ Completada |                                      |
| P0-002 | CI/CD (GitHub Actions)          | Pendiente     | Requiere cuenta Git                  |
| P0-003 | .env.local (variables Supabase) | ✅ Completada | `.env.local` creado con credenciales |
| P0-004 | Deploy staging                  | Pendiente     | Decidir provider post-proyecto       |

---

## Sesión 2026-07-02: cierre TASK-011

### Alcance

Cierra **TASK-011** (panel de reportes + exportación PDF). **1 commit único** consolidado. 45 tests nuevos, total 601 pasando. Nuevas deps: `recharts`, `jspdf`, `jspdf-autotable`, `html-to-image` (~215kB gzip).

### Bloques ejecutados

- **feat(reports)** consolidado: TASK-011 panel de reportes + exportación PDF — service con listReadingsReport (ADR-007: 2 queries por location) + listIncidentsForReport reusando listIncidents, schema Zod con refine from<=to + max 1 año, useReport hook con state machine + paginación 50/pág + computed compliance con isOutOfRange + snapshot ranges, 5 componentes (filtros/tabla/chart Recharts/summary/PdfExport), ReportsDashboard + ReportsPage + router, lib/pdfExport con jsPDF + autotable + html-to-image para embed de chart

### Decisiones de diseño aplicadas (vivas)

- **Recharts + jsPDF + jspdf-autotable + html-to-image:** stack confirmado en plan mode. jsPDF imperativo da control sobre header/footer/tabla; Recharts provee LineChart declarativo; `html-to-image` captura el chart del DOM como PNG para embeber. ~215kB gzip total (Trade-off documentado en CHANGELOG, aceptable para V1).
- **Logo TempMonitor placeholder en PDF:** decisión del plan mode. Hoy `organizations` no tiene `logo_url`. V1 usa header genérico con texto "TempMonitor — Reporte" + nombre org. Logo por organización = feature V2 (requiere migration + Storage + upload UI).
- **Compliance % global + desglose por equipo:** `computeCompliance` calcula % global con `snapshot_min/max` de cada reading (NO el rango actual del equipo — coherente con HACCP). Por equipo se omite en V1 porque requiere map equipment_id → equipment por cada reading; se agrega como follow-up.
- **Paginación cliente 50/pág:** decisión del plan mode. Escala suficiente para el caso típico (semana/mes). Service retorna array completo; `useReport` divide con `slice`. Migración a paginación servidor es refactor del service sin tocar UI.
- **`onlyWithIncidents` como filtro cliente:** decisión arquitectónica. No dispara refetch (es derivado de incidents ya cargados). Más performante.
- **Snapshot de rangos en PDF:** el PDF usa `snapshot_min_temp`/`snapshot_max_temp` de cada reading (no los actuales). Garante de auditoría HACCP. Tests verifican que `r-1` con snapshot [2, 8] muestra "2°C a 8°C" en la tabla.
- **PDF generado vía `URL.createObjectURL` + anchor download:** evita librerías extra (file-saver). Trigger imperativo de descarga. Cleanup con `URL.revokeObjectURL`.
- **`html-to-image` con error handling graceful:** si la captura del chart falla (ej: chart no renderizó), `exportReportPdf` continúa sin chart en lugar de abortar la exportación. UX defensiva.
- **`TemperatureChart` con `forwardRef`:** necesario para que el componente padre (`ReportsDashboard`) capture el nodo DOM y lo pase a `html-to-image`. Patrón estándar React para refs en componentes con displayName.
- **`useReportReturn` type exportado:** `ReportsDashboard` recibe el hook completo y desestructura internamente. Mejor que pasar 20 props individuales (composition sobre prop drilling).

### Tests añadidos

- `tests/unit/report.schema.test.ts` — 9 tests: válidos (2), fechas inválidas (2), from>to, single-day, >1 año, readingType inválido, missing fields
- `tests/unit/reports.service.test.ts` — 9 tests: listReadingsReport (empty location, filtros aplicados, equipmentId, readingType=manual, readingType=all, error supabase, error equipment query), listIncidentsForReport (delega + filtros mapeados)
- `tests/unit/useReport.test.ts` — 16 tests: fetching (6), paginación (3), compliance (3), onlyWithIncidents (1), selected equipment (3)
- `tests/unit/pdfExport.test.ts` — 11 tests: header, compliance, chart insert, sin chart, snapshot ranges, limit 200 rows, incidents table, blob export, error handling, null chartNode

### Riesgos / pendientes técnicos

- **H-001, H-002, H-003:** persisten sin cambios. TASK-011 no los empeora: `reports.service.ts` usa `PostgrestError` como tipo local inline (mismo workaround que TASK-010). Cerrar H-003 queda fuera de scope.
- **`pnpm build` con errores preexistentes:** TASK-011 no introduce errores nuevos (verificado con `tsc -b --force | grep reports` → vacío). Errores preexistentes del repo siguen ahí: PostgrestError no exportado, RHF generics, Location no exportado. Documentado en CHANGELOG de TASK-010.
- **Logo TempMonitor placeholder:** pendiente V2 (organizations.logo_url + Storage bucket). V1 todos los tenants comparten el mismo header genérico.
- **Desglose por equipo en compliance:** `ComplianceByEquipment[]` está tipado pero el cálculo quedó como follow-up (requiere mapeo equipment_id → name consistente cuando las readings vienen sin JOIN de equipment). Hoy el % global es el dato útil para inspector.
- **Bundle size:** Recharts (~100kB gzip) es el componente más pesado. Solo se carga cuando el usuario entra a `/reports` (lazy). No afecta el bundle inicial.
- **Vite plugin warning:** "vite-tsconfig-paths" detectado pero ya hay soporte nativo en Vite. Pendiente archivar el plugin (warning no bloqueante, sale en consola).

### Pendientes (siguiente tarea lógica)

**TASK-012** (panel de platform admin, prioridad Baja) tiene dependencias satisfechas: TASK-005 ✅. No requiere nada de reports/incidents.

### Siguiente tarea lógica

**TASK-012** — Vista exclusiva para `is_platform_admin: true`. Lista de organizaciones (nombre, tipo, plan, estado, fecha), cambiar estado active/paused/suspended, ver detalles (sedes/usuarios/volumen lecturas), métricas globales (orgs activas, lecturas 7d, incidentes abiertos). Platform admin NO puede ver datos de temperatura.

---

## Sesión 2026-07-02: cierre TASK-012

### Alcance

Cierra **TASK-012** (panel de platform admin). **6 commits granulares** (1 por bloque) según nueva política de commits del proyecto. 18 tests nuevos, total 619 pasando. **V1 completo.**

### Bloques ejecutados (6 commits)

- **B1** auth: `feat(auth): requirePlatformAdmin prop en ProtectedRoute` — extiende el guard con prop opcional que redirige a `/` si profile.is_platform_admin !== true
- **B2** service: `feat(platform-admin): service + tests` — platform-admin.service con 4 funciones puras + stub de dev-bypass-mocks + 8 tests
- **B3** types + mocks: `feat(platform-admin): types + dev-bypass mocks` — barrel types + 3 orgs mock con metadata cross-tenant
- **B4** hook: `feat(platform-admin): hook usePlatformAdmin + tests` — hook con state machine + 10 tests
- **B5** componentes: `feat(platform-admin): components` — 7 componentes presentacionales
- **B6** pages + router: `feat(platform-admin): pages + router` — 3 pages + 3 rutas gated por ProtectedRoute

### Decisiones de diseño aplicadas (vivas)

- **Doble check de seguridad:** ProtectedRoute (route guard) + Empty state en la page (defense in depth). El profile.is_platform_admin se valida en ambos lugares; el hook además noop'ea refreshList/refreshMetrics si es false.
- **Solo metadata cross-tenant:** service filtra explícitamente qué expone. No retorna values de temperature_readings, ni description/action_taken de incidents, ni min/max temp de equipos. Cumplimiento del requisito de BACKLOG.
- **Pending H-004 (RLS policies):** documentado como housekeeping. En V1 con dev-bypass funciona sin policies; en producción requiere migration SQL con `CREATE POLICY platform_admin_select ON organizations FOR SELECT USING (is_platform_admin())` por tabla.
- **Stub de dev-bypass separado:** `dev-bypass-platform-admin.ts` es un módulo independiente del `dev-bypass.ts` principal. Esto evita inflar el bypass principal con mocks cross-tenant y permite lazy-import desde el service solo cuando se necesita.
- **Helper async extraído en OrganizationDetailPage:** para evitar el warning de cascading-renders del linter. El setState después del fetch está dentro de un `.then()`, pero el linter lo detecta como problemático; extraer `loadDetail` a una función async fuera del effect lo resuelve limpiamente.
- **Paginación cliente 50/pág:** decisión heredada de TASK-011. Suficiente para V1 (decenas de orgs). Server-side pagination es V2.
- **UPDATE simple sin invalidación de sesiones:** cuando un platform admin suspende una org, el row se actualiza pero las sesiones activas no se invalidan. Documentado como limit de V1; requiere Edge Function o cleanup en BD para producción.
- **`getDevMockOrganizationDetail` con lookup por id:** permite que OrganizationDetailPage use `useParams` y cargue el detalle mock desde el slug de la URL.
- **`OrganizationStatusDialog` con confirmación literal "confirmar":** previene clicks accidentales. Patrón usado en flujos destructivos de V1.

### Tests añadidos

- `tests/unit/platform-admin.service.test.ts` — 8 tests: listOrganizations (queries, filtros, error), getOrganizationDetail (not found + full), updateOrganizationStatus (success + error), getGlobalMetrics (parallel queries)
- `tests/unit/usePlatformAdmin.test.ts` — 10 tests: RBAC (1), fetching (5), status change (3), pagination (1)

### Riesgos / pendientes técnicos

- **H-001, H-002, H-003, H-004:** persisten sin cambios. TASK-012 no los empeora (usa mismo workaround `PostgrestError` local que TASK-010/011).
- **`pnpm build` con errores preexistentes:** TASK-012 no introduce errores nuevos. Errores preexistentes del repo siguen ahí.
- **Migración RLS platform_admin:** H-004 nuevo, alta prioridad para producción. Sin esta migration, las queries reales devolverán error de RLS en prod.
- **Sin invalidación de sesiones en suspend:** documentado arriba. Mitigación V1: avisar al admin que los usuarios con sesión activa verán un error en su próxima request a Supabase (no son kickeados automáticamente).

### Pendientes (siguiente tarea lógica)

**No quedan tareas del scope V1.** El backlog activo en `files/BACKLOG.md` está vacío. Opciones para continuar:

1. **Housekeeping (H-001..H-004):** cerrar errores preexistentes del build y crear migration RLS platform_admin. Estimación: 4-6h.
2. **Features V2:** logo por organización (Storage bucket + UI upload), pagos (Stripe), notificaciones push, IoT hardware real, E2E con Playwright, i18n (es/en). Cada una estimación 1-3 sprints.
3. **Cierre formal del proyecto:** tag v1.0.0, deploy staging, smoke tests manuales con el cliente piloto.

### Siguiente tarea lógica

Decisión pendiente: housekeeping vs features V2 vs cierre. Recomiendo **housekeeping primero** (H-003 = build limpio, H-004 = RLS platform_admin) antes de tocar features nuevas. Es la base técnica que evita acumular más deuda.

---

## Pendientes

> No quedan tareas activas en el backlog V1. Las 3 tareas del scope V1 (TASK-010/011/012) están cerradas. El "siguiente tarea lógica" se documenta al final de la última sesión.
