# TempMonitor V1 — Histórico de Tareas Cerradas

> Estas tareas ya están **completadas** y archivadas. Se conservan aquí solo por trazabilidad de las decisiones originales de producto.
>
> Para el detalle de **cómo se ejecutaron** (bloques, commits, decisiones, riesgos), ver `files/CHANGELOG.md` en la sesión correspondiente.
>
> Para el **backlog activo** de tareas por hacer, ver `files/BACKLOG.md`.

---

## TASK-001 — Setup del proyecto

**Módulo:** shared  
**Prioridad:** Alta  
**Depende de:** ninguna  
**Estimación:** M (3–4h)  
**Estado:** ✅ Completada 2026-06-30

### Descripción

Inicializar el repositorio con el stack definitivo. Esta tarea no produce funcionalidad de negocio — produce la base sobre la que todo lo demás se construye. Si se hace mal aquí, hay deuda técnica desde el día 1.

### Criterios de aceptación

- [x] `pnpm create vite@latest` con template `react-ts`
- [x] TypeScript configurado en strict mode (`tsconfig.json` con `strict: true`, `noUncheckedIndexedAccess: true`)
- [x] Tailwind CSS v4 instalado y configurado (CSS-first, sin `tailwind.config.ts` si v4 lo permite nativamente)
- [x] shadcn/ui inicializado con tema base personalizado (colores de Operational Calm)
- [x] Variables CSS del sistema de diseño en `globals.css` (todos los tokens de color, tipografía, spacing)
- [x] Google Fonts (Inter + JetBrains Mono) integradas
- [x] ESLint configurado: `@typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-import`
- [x] Prettier configurado con las reglas definidas en AGENT.md
- [x] Husky + lint-staged configurados (pre-commit corre lint + format)
- [x] Vitest + @testing-library/react configurados con `tests/setup.ts`
- [x] Path alias `@/` apuntando a `src/`
- [x] Estructura de carpetas base creada (vacía pero con `.gitkeep` donde aplica)
- [x] `.env.example` con las variables requeridas de Supabase
- [x] `pnpm dev` levanta sin errores
- [x] `pnpm lint` pasa sin errores
- [x] `pnpm test` corre sin errores (aunque no haya tests aún)
- [x] `pnpm build` compila sin errores

### Archivos producidos

```
tempmonitor/
├── src/
│   ├── styles/globals.css       # Tokens completos del design system
│   ├── shared/lib/utils.ts      # cn() helper
│   └── main.tsx
├── tests/setup.ts
├── .env.example
├── .eslintrc.json / eslint.config.js
├── .prettierrc
├── .husky/pre-commit
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Tests requeridos

Ninguno en esta tarea (es scaffolding). La validación es que todos los scripts de pnpm pasen.

---

## TASK-001b — Migración de schema: `equipment.physical_location`

**Módulo:** shared (BD)  
**Prioridad:** Alta  
**Depende de:** TASK-001  
**Estimación:** S (30–45min)  
**Estado:** ✅ Completada 2026-06-30

### Descripción

Agregar la columna `physical_location` a la tabla `equipment` en Supabase, antes de generar los tipos TypeScript en TASK-002. Representa el área física dentro de la sede donde está instalado el equipo — distinto del `name` del equipo y de `location_id` (que es la sede completa).

### Criterios de aceptación

- [x] Migración SQL: `ALTER TABLE equipment ADD COLUMN physical_location TEXT;` (nullable, sin default)
- [x] Migración aplicada en el proyecto Supabase (vía SQL editor o CLI de migraciones, según lo que use el proyecto)
- [x] `DATABASE_STRUCTURE.md` actualizado con la nueva columna documentada
- [x] Verificación: `SELECT physical_location FROM equipment LIMIT 1;` no falla

### Archivos afectados

- Migración en Supabase (SQL)
- `DATABASE_STRUCTURE.md` (actualización de documentación)

### Tests requeridos

Ninguno — es una migración de schema, se valida con la query de verificación.

---

## TASK-002 — Integración Supabase: cliente, tipos y variables

**Módulo:** shared  
**Prioridad:** Alta  
**Depende de:** TASK-001  
**Estimación:** S (1–2h)  
**Estado:** ✅ Completada 2026-06-30

### Descripción

Conectar el proyecto con Supabase. Configurar el cliente singleton, generar los tipos TypeScript desde el schema de la BD, y establecer la convención de importación para todo el proyecto.

### Criterios de aceptación

- [x] `@supabase/supabase-js` instalado
- [x] `src/shared/lib/supabase.ts` con cliente singleton (nunca se instancia en otro lugar)
- [x] Tipos generados con `supabase gen types typescript` en `src/shared/types/supabase.ts`
- [x] Re-exports convenientes: `Tables<'organizations'>`, `Enums<'plan_type'>`, etc.
- [x] Variables de entorno tipadas en `src/shared/lib/env.ts` (con validación Zod)
- [x] El cliente no se exporta directamente desde `supabase.ts` — se usa a través de una función `getSupabaseClient()` o como `supabase` named export estable
- [x] Documentación de cómo regenerar tipos cuando el schema cambie (comentario en el archivo)

### Archivos producidos

```
src/
├── shared/
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── env.ts
│   └── types/
│       └── supabase.ts          # Tipos generados (no editar manualmente)
```

### Tests requeridos

Test de que `env.ts` lanza error descriptivo si falta una variable requerida.

---

## TASK-003 — AuthStore (Zustand) + flujo de sesión

**Módulo:** auth  
**Prioridad:** Alta  
**Depende de:** TASK-002  
**Estimación:** M (3–4h)  
**Estado:** ✅ Completada 2026-06-30

### Descripción

Implementar el store de autenticación con Zustand. Maneja la sesión de Supabase Auth, carga el perfil del usuario (tabla `profiles`), expone el rol RBAC y el flag de platform admin. Reemplaza el enfoque original de Context API — ver ADR-002 en AGENT.md.

### Criterios de aceptación

- [x] `useAuthStore` (Zustand) con los campos: `session`, `profile`, `isLoading`, `signIn`, `signOut`, `signUp`
- [x] Suscripción a `supabase.auth.onAuthStateChange` inicializada una sola vez (fuera de componentes, en el store o en un hook de bootstrap)
- [x] Al recibir sesión válida, se carga automáticamente `profiles` del usuario
- [x] Loading state correcto durante la hidratación inicial (evitar flash de login)
- [x] `signIn(email, password)` — manejo de error tipado
- [x] `signOut()` — limpia estado y redirige a `/login`
- [x] Protected route component que lee `useAuthStore((s) => s.session)` y redirige a `/login` si no hay sesión
- [x] Rutas base: `/login`, `/` (protegida)
- [x] Todos los consumidores usan selectores granulares (`useAuthStore((s) => s.profile)`), nunca desestructuran el store completo

### Archivos producidos

```
src/features/auth/
├── store/
│   └── auth.store.ts
├── hooks/
│   └── useAuthBootstrap.ts      # inicializa la suscripción de auth state
├── components/
│   └── ProtectedRoute.tsx
└── types.ts
```

### Tests requeridos

- `auth.store`: signIn exitoso setea session y profile
- `auth.store`: signOut limpia el estado completo
- Estado de loading durante hidratación inicial
- Selectores no causan re-render cuando cambia una porción no observada del store

---

## TASK-004 — Onboarding guiado: organización → sede → staff → equipos

**Módulo:** auth  
**Prioridad:** Alta  
**Depende de:** TASK-003  
**Estimación:** L (7–8h)  
**Estado:** ✅ Completada 2026-06-30

### Descripción

Flujo de registro completo para nuevos clientes B2B. A diferencia del enfoque original (solo cuenta + organización), este onboarding guía al usuario a través de la configuración inicial completa de su primera sede, porque sin al menos una sede la plataforma no tiene sentido operativo.

**Decisión de producto confirmada:** los pasos de staff y equipos son **opcionales** dentro del wizard — el usuario puede omitirlos ("Saltar por ahora") y completarlos después desde los módulos de Personal y Equipos. Solo la cuenta, la organización y la sede 1 son obligatorias.

### Flujo de pasos

```
Paso 1 — Cuenta personal
  email, password, nombre completo

Paso 2 — Datos de organización
  nombre, tipo de negocio (business_type), plan inicial (default: basic)

Paso 3 — Sede 1 (obligatorio)
  nombre de la sede, dirección
  → Esta sede queda creada y se setea como activeLocation en el store

Paso 4 — Personal de la sede (opcional, con botón "Saltar por ahora")
  formulario repetible: nombre, puesto (role) del encargado de toma de temperatura
  → INSERT en tabla staff asociado a la sede del Paso 3
  → el usuario puede agregar 0, 1 o varios antes de continuar

Paso 5 — Equipos de la sede (opcional, con botón "Saltar por ahora")
  formulario repetible: nombre del equipo, ubicación dentro de la sede, min_temp, max_temp
  → INSERT en tabla equipment asociado a la sede del Paso 3
  → el usuario puede agregar 0, 1 o varios antes de continuar

Paso 6 — Confirmación
  resumen de lo creado (organización, sede, N encargados, N equipos)
  → botón "Ir al dashboard"
```

### Criterios de aceptación

- [x] Wizard de 6 pasos con indicador de progreso
- [x] Pasos 1, 2 y 3 son obligatorios — no se puede avanzar sin completarlos
- [x] Pasos 4 y 5 muestran claramente la opción "Saltar por ahora" junto al botón de continuar
- [x] Validación Zod por paso
- [x] Al completar Paso 1+2: `signUp` en Supabase Auth + INSERT en `organizations` + INSERT en `profiles` con `role: 'owner'` (vía función RPC, transaccional)
- [x] Al completar Paso 3: INSERT en `locations`, la sede creada se guarda en estado local del wizard para usarse en pasos 4 y 5
- [x] Paso 4: cada encargado agregado hace INSERT en `staff` con `location_id` de la sede creada — campo `role` es texto libre (ej. "Cocinero", "Auxiliar")
- [x] Paso 5: cada equipo agregado hace INSERT en `equipment` con `location_id` de la sede creada, incluye `name` (nombre del equipo) y un campo de **ubicación dentro de la sede** — ver nota de schema abajo
- [x] Validación: en equipos, `min_temp` debe ser menor que `max_temp`
- [x] Si el usuario completa Paso 1-3 pero cierra el navegador antes de terminar, al volver a iniciar sesión debe aterrizar en el dashboard (no se le vuelve a pedir el wizard) — la organización y sede ya existen, los pasos 4-5 simplemente quedan vacíos y se completan luego desde sus módulos
- [x] Redirección al dashboard al completar el Paso 6, con `activeLocation` ya seteada en `useOrganizationStore`

### Nota de schema — campo de ubicación en equipment

**[RESUELTO]** Se confirma agregar la columna `physical_location` (`TEXT`, nullable) a la tabla `equipment` — representa el área física dentro de la sede donde está instalado el equipo (ej. "Cocina principal", "Bodega fría", "Área de farmacia"), distinto del `name` del equipo (ej. "Nevera Lácteos 1"). Esta migración se ejecuta como TASK-001b, **antes** de TASK-002, porque TASK-002 genera los tipos TypeScript desde el schema vigente — generar tipos antes de esta migración obligaría a regenerarlos y reabrir una tarea ya cerrada.

### Archivos producidos

```
src/features/auth/
├── components/
│   ├── OnboardingWizard.tsx
│   ├── steps/
│   │   ├── AccountStep.tsx
│   │   ├── OrganizationStep.tsx
│   │   ├── FirstLocationStep.tsx
│   │   ├── StaffStep.tsx           # repetible, con "Saltar por ahora"
│   │   ├── EquipmentStep.tsx       # repetible, con "Saltar por ahora"
│   │   └── ConfirmationStep.tsx
│   └── WizardProgress.tsx
├── hooks/
│   └── useOnboarding.ts
├── services/
│   └── auth.service.ts             # signUp + createOrganization (RPC)
└── schemas/
    └── onboarding.schema.ts        # Zod schemas para cada paso
```

### Tests requeridos

- Schema Zod: validación correcta e incorrecta de cada paso (incluyendo min_temp < max_temp en equipos)
- `useOnboarding`: progresión de pasos, omisión de pasos opcionales, estado de loading
- `auth.service.ts`: mock de supabase, verificar llamada RPC correcta para organización + sede
- Reentrada: usuario con organización y sede ya creadas aterriza directo en dashboard

---

## TASK-005 — AppShell: layout base con RBAC

**Módulo:** shared  
**Prioridad:** Alta  
**Depende de:** TASK-003  
**Estimación:** M (4h)  
**Estado:** ✅ Completada 2026-06-30

### Descripción

El layout principal de la aplicación: sidebar, topbar, área de contenido. La navegación se adapta según el rol del usuario (`owner`, `admin`, `manager`, `staff`, `platform_admin`). Esta tarea no implementa las páginas — solo el shell.

### Criterios de aceptación

- [x] `AppShell` compone Sidebar + TopBar + `<Outlet />` de React Router
- [x] Sidebar con colores de Operational Calm (fondo `--color-slate-900`)
- [x] Items de navegación filtrados por rol (hook `useNavItems(role)`)
- [x] Logo/nombre de la organización activa en el sidebar
- [x] Selector de sede activa en el topbar (si el usuario tiene asignación multi-sede)
- [x] Badge de incidentes activos en la navegación (número de incidentes abiertos)
- [x] Responsive: sidebar colapsable en mobile (hamburger menu)
- [x] TopBar: nombre del usuario, botón de logout
- [x] `platform_admin` ve un layout diferente (sin selector de sede, con acceso a panel global)

### Items de navegación por rol

```
owner/admin:   Dashboard, Sedes, Equipos, Lecturas, Incidentes, Reportes, Configuración
manager:       Dashboard, Equipos, Lecturas, Incidentes, Reportes
staff:         Lecturas (solo registro)
platform_admin: Organizaciones, Métricas globales
```

### Archivos producidos

```
src/shared/components/layout/
├── AppShell.tsx
├── Sidebar.tsx
├── TopBar.tsx
├── LocationSelector.tsx
└── NavItems.tsx
src/shared/hooks/
└── useNavItems.ts
```

### Tests requeridos

- `useNavItems`: retorna items correctos para cada rol
- `Sidebar`: renderiza solo items permitidos según rol mockeado

---

## TASK-006 — CRUD de sedes

**Módulo:** locations  
**Prioridad:** Media  
**Depende de:** TASK-005  
**Estimación:** M (3–4h)  
**Estado:** ✅ Completada 2026-07-01

### Descripción

Gestión completa de sedes (locations) para el owner/admin de la organización. Incluye validación del límite de sedes según el plan contratado.

### Criterios de aceptación

- [x] Lista de sedes de la organización activa
- [x] Crear sede: nombre, dirección — formulario con validación Zod
- [x] Editar sede: nombre, dirección
- [x] Eliminar sede: solo si no tiene equipos asociados (error descriptivo si tiene)
- [x] Indicador de límite de sedes: "2 de 3 sedes utilizadas" según `max_locations`
- [x] Si se alcanza el límite, el botón "Agregar sede" muestra un modal de upgrade (sin implementar pagos — solo UI informativa)
- [x] RLS de Supabase garantiza aislamiento — solo se ven sedes de la organización propia
- [x] `useOrganizationStore` se actualiza (vía acción del store) tras crear/eliminar sedes

### Archivos producidos

```
src/features/locations/
├── components/
│   ├── LocationList.tsx
│   ├── LocationCard.tsx
│   ├── LocationForm.tsx
│   └── LocationLimitBanner.tsx
├── hooks/
│   └── useLocations.ts
├── services/
│   └── locations.service.ts
├── schemas/
│   └── location.schema.ts
└── types.ts
```

### Tests requeridos

- `locations.service.ts`: getLocations, createLocation, deleteLocation (mock supabase)
- `useLocations`: estados de loading, error, éxito
- Schema Zod: validación de nombre requerido

---

## TASK-006b — CRUD de personal (staff)

**Módulo:** staff  
**Prioridad:** Media  
**Depende de:** TASK-005  
**Estimación:** M (3–4h)  
**Estado:** ✅ Completada 2026-07-01  
**Nota:** Esta tarea no estaba en el backlog original. Se creó y ejecutó por necesidad de producto al implementar el dominio `staff`.

### Descripción

Gestión del personal de cada sede (no usuarios de plataforma, sino gente que toma lecturas: cocineros, auxiliares, encargados). Soft delete preservando historial de lecturas.

### Criterios de aceptación

- [x] Lista de staff filtrada por sede activa
- [x] Crear staff: nombre, role (texto libre, ej. "Cocinero", "Auxiliar")
- [x] Editar staff: nombre, role
- [x] Soft delete: `setStaffActive(id, false)` — preserva el registro y las lecturas asociadas
- [x] RBAC: owner, admin, manager pueden crear/editar/desactivar
- [x] `useStaffManagement` hook con state machine para los dialogs
- [x] Toggle dialog con confirmación si el staff tiene lecturas registradas

### Archivos producidos

```
src/features/staff/
├── components/
│   ├── StaffCard.tsx
│   ├── StaffHeader.tsx
│   ├── StaffFormDialog.tsx
│   └── ToggleStaffDialog.tsx
├── hooks/
│   └── useStaffManagement.ts
├── services/
│   └── staff.service.ts
└── schemas/
    └── staff.schema.ts
```

---

## TASK-007 — CRUD de equipos de frío

**Módulo:** equipment  
**Prioridad:** Media  
**Depende de:** TASK-006  
**Estimación:** M (3–4h)  
**Estado:** ✅ Completada 2026-07-01

### Descripción

Gestión de equipos por sede. Incluye configuración de rangos térmicos (min/max) y el flag de preparación IoT.

### Criterios de aceptación

- [x] Lista de equipos filtrada por sede activa
- [x] Crear equipo: nombre, **ubicación física dentro de la sede** (`physical_location`, ej. "Cocina principal"), código inventario, `min_temp`, `max_temp`, sede asignada
- [x] Validación: `min_temp` debe ser menor que `max_temp`
- [x] Editar equipo: todos los campos anteriores
- [x] Eliminar equipo: solo si no tiene lecturas (advertencia si tiene historial)
- [x] Toggle "Preparado para sensor IoT" (`is_iot_enabled`) — visual informativo sin funcionalidad real
- [x] Badge visual de estado IoT (preparado / no preparado)
- [x] Código de equipo único por organización (validación en servicio)

### Archivos producidos

```
src/features/equipment/
├── components/
│   ├── EquipmentList.tsx
│   ├── EquipmentCard.tsx
│   ├── EquipmentForm.tsx
│   └── IotBadge.tsx
├── hooks/
│   └── useEquipment.ts
├── services/
│   └── equipment.service.ts
├── schemas/
│   └── equipment.schema.ts
└── types.ts
```

### Tests requeridos

- Schema Zod: min_temp < max_temp
- `equipment.service.ts`: CRUD mock
- Función `isOutOfRange({ value, min, max })` — lógica de negocio crítica

---

## TASK-008 — Formulario de registro de lectura manual

**Módulo:** readings  
**Prioridad:** Alta  
**Depende de:** TASK-007  
**Estimación:** M (3–4h)  
**Estado:** ✅ Completada 2026-07-01  
**Nota:** El scope ejecutado difiere del plan original. Ver CHANGELOG.md sesión 2026-07-01 para las divergencias (out-of-range solo warning visual, snapshot min/max NO enviado, selector solo staff de lista).

### Descripción (original)

El formulario más usado del sistema — operarios de cocina, farmacia o bodega lo usan múltiples veces al día. Debe ser rápido, claro y funcionar bien en mobile.

### Criterios de aceptación (ejecutado)

- [x] Selección de equipo (filtrado por sede activa)
- [x] Input de temperatura con validación numérica
- [x] Feedback inmediato: el campo muestra si el valor está dentro o fuera del rango seguro del equipo seleccionado
- [x] Selección de quién tomó la lectura: solo staff de la lista (filtrado por `active=true`)
- [x] Al guardar: INSERT en `temperature_readings` (sin snapshot min/max, decisión documentada para TASK-010)
- [x] Si la lectura está fuera de rango: solo warning visual, NO se crea incident (TASK-010 lo hace)
- [x] Feedback visual inmediato del resultado (success card con acciones)
- [x] Optimizado para mobile: botones grandes, inputs claros

### Archivos producidos

```
src/features/readings/
├── components/
│   ├── ReadingForm.tsx
│   ├── EquipmentSelector.tsx
│   ├── TemperatureInput.tsx
│   └── StaffSelector.tsx
├── hooks/
│   └── useReadingForm.ts
├── services/
│   └── readings.service.ts
├── schemas/
│   └── reading.schema.ts
├── lib/
│   └── isOutOfRange.ts
└── pages/
    └── ReadingsPage.tsx
```

### Tests requeridos

- `isOutOfRange()`: cobertura completa de casos límite (igual al mínimo, igual al máximo, fuera por encima y por debajo)
- `outOfRangeDirection()`: retorna 'low' | 'high' | null
- `reading.schema.ts`: validación de valor numérico requerido
- `useReadingForm`: lógica de submit, state machine idle/submitting/success/error

---

## TASK-009 — Dashboard de lecturas con Supabase Realtime

**Módulo:** readings  
**Prioridad:** Alta  
**Depende de:** TASK-008  
**Estimación:** L (5–6h)  
**Estado:** ✅ Completada 2026-07-02  
**Nota:** Scope ejecutado con divergencias del plan original — ver CHANGELOG.md sesión 2026-07-02. Panel de incidentes NO incluido (queda para TASK-010). ADRs 007-011 reflejan las decisiones técnicas aplicadas.

### Descripción (original)

Vista principal del dashboard: muestra el estado actual de todos los equipos de la sede activa, con las últimas lecturas y alertas activas. Se actualiza en tiempo real cuando llegan nuevas lecturas.

### Criterios de aceptación (ejecutado)

- [x] Grid de tarjetas de equipo — una por equipo de la sede activa
- [x] Cada tarjeta muestra: nombre del equipo, última temperatura (en mono grande), tiempo desde la última lectura, estado (ok / alerta / no-reading)
- [x] Colores semánticos: eucalyptus para dentro de rango, danger para fuera de rango, warning para sin lecturas
- [x] Suscripción Supabase Realtime a `temperature_readings` (cleanup crítico, ver ADR-010 sobre dev-bypass)
- [x] Estado vacío si no hay equipos registrados (CTA para agregar equipo)
- [x] Estado de última lectura: "Hace 5 min", "Hace 2h" — badge amarillo si han pasado más de 2h (ADR-008)
- [x] Selector de sede en topbar funcional — el dashboard cambia al seleccionar otra sede
- [x] **No incluye** panel de incidentes activos (queda para TASK-010)
- [x] Contadores reales cableados en `LocationCard`/`StaffCard`/`EquipmentCard` (cierra placeholder 0, ADR-011)

### Archivos producidos

```
src/features/readings/
├── components/
│   ├── ReadingsHistoryPage.tsx (era ReadingsDashboard en el plan)
│   ├── EquipmentStatusGrid.tsx
│   ├── EquipmentStatusCard.tsx
│   └── LastReadingBadge.tsx
├── hooks/
│   └── useRealtimeReadings.ts
├── lib/
│   └── timeSince.ts
└── pages/
    └── ReadingsHistoryPage.tsx
```

### Decisiones técnicas (ADRs)

- **ADR-007:** `listByLocation` con 2 queries en vez de join anidado `!inner`
- **ADR-008:** `STALE_THRESHOLD_MS = 2h` (HACCP)
- **ADR-009:** `timeSince` con `now` inyectado (tests deterministas)
- **ADR-010:** dev-bypass skip para Realtime
- **ADR-011:** contadores reales cableados en cards

### Tests requeridos

- `timeSince`: cobertura de bordes (59s/60s/24h/7d/30d)
- `isStaleReading`: < 2h fresh, ≥ 2h stale
- `useRealtimeReadings`: cleanup de channel en unmount y cambio de locationId
- `EquipmentStatusCard`: renderiza estado correcto según temperatura
- `EquipmentStatusGrid`: empty state cuando no hay equipos
- `LastReadingBadge`: estados fresh/stale/no-reading
- `ReadingsHistoryPage`: composición pura

---

## TASK-010 — Motor de incidentes y flujo HACCP

**Módulo:** incidents  
**Prioridad:** Alta  
**Depende de:** TASK-009 ✅  
**Estimación:** L (5–6h)  
**Estado:** ✅ Completada 2026-07-02

### Descripción

Los incidentes son el corazón regulatorio del sistema. Cuando una lectura está fuera de rango, se crea un incidente que debe ser resuelto con acción correctiva documentada (requisito HACCP/ISP). Un incidente no puede cerrarse sin `action_taken`, `resolved_by` y `resolved_at`.

### Criterios de aceptación

- [x] Lista de incidentes (abiertos primero, luego resueltos)
- [x] Cada incidente muestra: equipo, lectura que lo gatilló, temperatura registrada, rango esperado, tiempo transcurrido
- [x] Modal de resolución: campo `action_taken` (obligatorio, mínimo 20 caracteres), botón "Cerrar incidente"
- [x] Al resolver: UPDATE en `incidents` con `status: 'resolved'`, `resolved_by`, `resolved_at`
- [x] Solo `owner`, `admin` o `manager` pueden resolver incidentes
- [x] `staff` ve los incidentes pero no puede resolverlos (UI deshabilitada con explicación)
- [x] `useIncidentStore` expone `openIncidents` y `hasOpenIncidents` para el badge en sidebar
- [x] Filtros: todos / abiertos / resueltos, por sede, por equipo, por rango de fecha
- [x] `openIncidents` en el store se actualiza en tiempo real (Supabase Realtime, suscripción inicializada una sola vez)
- [x] **Cablear `snapshot_min_temp`/`snapshot_max_temp`** al insertar readings out-of-range (pendiente heredado de TASK-008)
- [x] **Cablear `outIncidentCount` real en `LocationCard`** (placeholder 0 pendiente desde TASK-006)
- [x] Reemplazar mock data de `useIncidentsBootstrap` por channel real de `incidents`

### Pendientes heredados que se cierran

- [x] Reemplazar `getDevMockOpenIncidentCount` por datos reales del store
- [x] Crear feature `incidents` aislado (no se importa de `readings` directamente, comunicación via store o service)
- [x] Reusar `isOutOfRange` de `features/readings/lib/` (ADR compartido)

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
**Estado:** ✅ Completada 2026-07-02

### Descripción

Los reportes son el entregable que los clientes muestran a los inspectores sanitarios. Deben ser claros, filtrables y exportables en PDF.

### Criterios de aceptación

- [x] Filtros: rango de fechas, sede, equipo, tipo de lectura (manual/IoT preparado), solo con incidentes
- [x] Tabla de lecturas con columnas: fecha/hora, equipo, temperatura, rango configurado, estado, quién registró
- [x] Gráfico de línea de temperatura por equipo en el período seleccionado (Recharts)
- [x] Indicador de cumplimiento: % de lecturas dentro del rango en el período
- [x] Exportación PDF: genera un reporte con logo, nombre de organización, período, tabla y gráfico
- [x] PDF incluye snapshot de rangos térmicos (desde `snapshot_min_temp/max_temp`) — no los actuales
- [x] Paginación en la tabla (50 registros por página)
- [x] Resumen de incidentes del período: cuántos, cuáles fueron resueltos, cuáles siguen abiertos

### Pendientes heredados que se cierran

- [x] Reusar `STALE_THRESHOLD_MS` de `features/readings/lib/timeSince.ts` (ADR-008)
- [x] Reusar `isOutOfRange` de `features/readings/lib/isOutOfRange.ts` para cálculo de cumplimiento

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
**Estado:** ✅ Completada 2026-07-02

### Descripción

Vista exclusiva para usuarios con `is_platform_admin: true`. Permite ver todas las organizaciones del SaaS, su estado y métricas básicas.

### Criterios de aceptación

- [x] Acceso protegido: solo `is_platform_admin === true` puede ver estas rutas
- [x] Lista de organizaciones: nombre, tipo, plan, estado (active/paused/suspended), fecha de registro
- [x] Cambiar estado de organización: active ↔ paused ↔ suspended
- [x] Ver detalles de una organización: sedes, usuarios, volumen de lecturas
- [x] Métricas globales: total organizaciones activas, total lecturas en los últimos 7 días, total incidentes abiertos
- [x] El platform admin NO puede ver los datos de temperatura de ninguna organización (solo metadatos)

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

## TASK-013 — Estabilización: Limpieza de compilación TypeScript (`tsc`)

**Módulo:** shared  
**Prioridad:** Alta  
**Depende de:** TASK-012 ✅  
**Estimación:** S (1.5h)  
**Estado:** ✅ Completada 2026-07-03

### Descripción

Corregir todos los errores de tipado y compilación preexistentes en el repositorio para lograr un build limpio de producción (`pnpm build`).

### Criterios de aceptación

- [x] Exportar `PostgrestError` desde `supabase.ts` y quitar los stubs de importación locales en los servicios de `incidents`, `reports` y `platform-admin`.
- [x] Tipar correctamente los generics de React Hook Form en los componentes de diálogo (`LocationFormDialog.tsx`, `EquipmentFormDialog.tsx`, `ReadingForm.tsx`, `StaffFormDialog.tsx`).
- [x] Corregir la comparación de tipo `number === string` en `ReadingForm.tsx:137`.
- [x] Exportar la interfaz/tipo `Location` en `locations.service.ts`.
- [x] Asegurar que `pnpm build` compile limpiamente sin warnings ni errores de TypeScript.
- [x] Verificar que los 619 tests sigan pasando sin errores.

### Archivos afectados

- `src/shared/lib/supabase.ts`
- `src/features/incidents/services/incidents.service.ts`
- `src/features/reports/services/reports.service.ts`
- `src/features/platform-admin/services/platform-admin.service.ts`
- `src/features/locations/components/LocationFormDialog.tsx`
- `src/features/equipment/components/EquipmentFormDialog.tsx`
- `src/features/readings/components/ReadingForm.tsx`
- `src/features/staff/components/StaffFormDialog.tsx`

---

## TASK-014 — Estabilización: Políticas RLS para Platform Admin en BD

**Módulo:** shared  
**Prioridad:** Alta  
**Depende de:** TASK-013  
**Estimación:** S (1h)

### Descripción

Crear y aplicar una migración SQL en Supabase que defina las políticas RLS necesarias para que el rol platform admin tenga acceso cross-tenant de forma segura en producción.

### Criterios de aceptación

- [x] Crear el archivo de migración `supabase/migrations/002_platform_admin_policies.sql`.
- [x] Crear la función helper `is_platform_admin()` como `SECURITY DEFINER STABLE` para validar el rol del usuario autenticado.
- [x] Definir políticas RLS de SELECT/UPDATE en la tabla `organizations` y SELECT en `locations`, `profiles` y `equipment` basadas en el rol platform admin.
- [x] Crear una política restrictiva o vista para `incidents` (counts sin descripción/detalles) y asegurar que no hay política de acceso para `temperature_readings` (el platform admin no debe ver temperaturas).
- [x] Aplicar localmente la migración y comprobar que no rompe los tests existentes ni el aislamiento de tenants normales.

### Archivos afectados

- `supabase/migrations/002_platform_admin_policies.sql`
- `src/features/platform-admin/services/platform-admin.service.ts`

---

## TASK-015 — Estabilización: Seed de Base de Datos y Smoke Tests E2E

**Módulo:** shared  
**Prioridad:** Alta  
**Depende de:** TASK-014  
**Estimación:** M (2.5h)

### Descripción

Desarrollar un script de carga de datos iniciales y ejecutar una prueba de humo manual end-to-end con una instancia real de Supabase para taggear la release estable `v1.0.0`.

### Criterios de aceptación

- [x] Crear `scripts/seed-supabase.mjs` idempotente para poblar la base de datos (2 organizaciones, 2 dueños, 6 equipos, 20 lecturas de temperatura, 4 incidentes de desvío).
- [x] Aplicar todas las migraciones (000, 001, 002) en un proyecto real de Supabase y correr el script de seed.
- [x] Probar el inicio de sesión y el flujo completo en la PWA (dashboard en tiempo real, registro de lecturas fuera de rango, resolución de incidentes con justificación HACCP, generación y descarga de reporte PDF, panel global del platform admin).
- [x] Realizar el bump de versión a `1.0.0` y crear el tag de Git `v1.0.0`.

### Archivos afectados

- `scripts/seed-supabase.mjs`
- `package.json`
