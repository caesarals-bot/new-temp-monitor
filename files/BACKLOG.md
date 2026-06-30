# TempMonitor V1 — Backlog de Tareas

> Estado: **PROPUESTA** — pendiente de aprobación de César antes de ejecutar cualquier tarea.
> Solo se trabaja una tarea a la vez en estado APROBADA.

---

## TASK-001 — Setup del proyecto

**Módulo:** shared  
**Prioridad:** Alta  
**Depende de:** ninguna  
**Estimación:** M (3–4h)

### Descripción

Inicializar el repositorio con el stack definitivo. Esta tarea no produce funcionalidad de negocio — produce la base sobre la que todo lo demás se construye. Si se hace mal aquí, hay deuda técnica desde el día 1.

### Criterios de aceptación

- [ ] `pnpm create vite@latest` con template `react-ts`
- [ ] TypeScript configurado en strict mode (`tsconfig.json` con `strict: true`, `noUncheckedIndexedAccess: true`)
- [ ] Tailwind CSS v4 instalado y configurado (CSS-first, sin `tailwind.config.ts` si v4 lo permite nativamente)
- [ ] shadcn/ui inicializado con tema base personalizado (colores de Operational Calm)
- [ ] Variables CSS del sistema de diseño en `globals.css` (todos los tokens de color, tipografía, spacing)
- [ ] Google Fonts (Inter + JetBrains Mono) integradas
- [ ] ESLint configurado: `@typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-import`
- [ ] Prettier configurado con las reglas definidas en AGENT.md
- [ ] Husky + lint-staged configurados (pre-commit corre lint + format)
- [ ] Vitest + @testing-library/react configurados con `tests/setup.ts`
- [ ] Path alias `@/` apuntando a `src/`
- [ ] Estructura de carpetas base creada (vacía pero con `.gitkeep` donde aplica)
- [ ] `.env.example` con las variables requeridas de Supabase
- [ ] `pnpm dev` levanta sin errores
- [ ] `pnpm lint` pasa sin errores
- [ ] `pnpm test` corre sin errores (aunque no haya tests aún)
- [ ] `pnpm build` compila sin errores

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

### Descripción

Agregar la columna `physical_location` a la tabla `equipment` en Supabase, antes de generar los tipos TypeScript en TASK-002. Representa el área física dentro de la sede donde está instalado el equipo — distinto del `name` del equipo y de `location_id` (que es la sede completa).

### Criterios de aceptación

- [ ] Migración SQL: `ALTER TABLE equipment ADD COLUMN physical_location TEXT;` (nullable, sin default)
- [ ] Migración aplicada en el proyecto Supabase (vía SQL editor o CLI de migraciones, según lo que use el proyecto)
- [ ] `DATABASE_STRUCTURE.md` actualizado con la nueva columna documentada
- [ ] Verificación: `SELECT physical_location FROM equipment LIMIT 1;` no falla

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

### Descripción

Conectar el proyecto con Supabase. Configurar el cliente singleton, generar los tipos TypeScript desde el schema de la BD, y establecer la convención de importación para todo el proyecto.

### Criterios de aceptación

- [ ] `@supabase/supabase-js` instalado
- [ ] `src/shared/lib/supabase.ts` con cliente singleton (nunca se instancia en otro lugar)
- [ ] Tipos generados con `supabase gen types typescript` en `src/shared/types/supabase.ts`
- [ ] Re-exports convenientes: `Tables<'organizations'>`, `Enums<'plan_type'>`, etc.
- [ ] Variables de entorno tipadas en `src/shared/lib/env.ts` (con validación Zod)
- [ ] El cliente no se exporta directamente desde `supabase.ts` — se usa a través de una función `getSupabaseClient()` o como `supabase` named export estable
- [ ] Documentación de cómo regenerar tipos cuando el schema cambie (comentario en el archivo)

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

### Descripción

Implementar el store de autenticación con Zustand. Maneja la sesión de Supabase Auth, carga el perfil del usuario (tabla `profiles`), expone el rol RBAC y el flag de platform admin. Reemplaza el enfoque original de Context API — ver ADR-002 en AGENT.md.

### Criterios de aceptación

- [ ] `useAuthStore` (Zustand) con los campos: `session`, `profile`, `isLoading`, `signIn`, `signOut`, `signUp`
- [ ] Suscripción a `supabase.auth.onAuthStateChange` inicializada una sola vez (fuera de componentes, en el store o en un hook de bootstrap)
- [ ] Al recibir sesión válida, se carga automáticamente `profiles` del usuario
- [ ] Loading state correcto durante la hidratación inicial (evitar flash de login)
- [ ] `signIn(email, password)` — manejo de error tipado
- [ ] `signOut()` — limpia estado y redirige a `/login`
- [ ] Protected route component que lee `useAuthStore((s) => s.session)` y redirige a `/login` si no hay sesión
- [ ] Rutas base: `/login`, `/` (protegida)
- [ ] Todos los consumidores usan selectores granulares (`useAuthStore((s) => s.profile)`), nunca desestructuran el store completo

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

- [ ] Wizard de 6 pasos con indicador de progreso
- [ ] Pasos 1, 2 y 3 son obligatorios — no se puede avanzar sin completarlos
- [ ] Pasos 4 y 5 muestran claramente la opción "Saltar por ahora" junto al botón de continuar
- [ ] Validación Zod por paso
- [ ] Al completar Paso 1+2: `signUp` en Supabase Auth + INSERT en `organizations` + INSERT en `profiles` con `role: 'owner'` (vía función RPC, transaccional)
- [ ] Al completar Paso 3: INSERT en `locations`, la sede creada se guarda en estado local del wizard para usarse en pasos 4 y 5
- [ ] Paso 4: cada encargado agregado hace INSERT en `staff` con `location_id` de la sede creada — campo `role` es texto libre (ej. "Cocinero", "Auxiliar")
- [ ] Paso 5: cada equipo agregado hace INSERT en `equipment` con `location_id` de la sede creada, incluye `name` (nombre del equipo) y un campo de **ubicación dentro de la sede** — ver nota de schema abajo
- [ ] Validación: en equipos, `min_temp` debe ser menor que `max_temp`
- [ ] Si el usuario completa Paso 1-3 pero cierra el navegador antes de terminar, al volver a iniciar sesión debe aterrizar en el dashboard (no se le vuelve a pedir el wizard) — la organización y sede ya existen, los pasos 4-5 simplemente quedan vacíos y se completan luego desde sus módulos
- [ ] Redirección al dashboard al completar el Paso 6, con `activeLocation` ya seteada en `useOrganizationStore`

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

### Descripción

El layout principal de la aplicación: sidebar, topbar, área de contenido. La navegación se adapta según el rol del usuario (`owner`, `admin`, `manager`, `staff`, `platform_admin`). Esta tarea no implementa las páginas — solo el shell.

### Criterios de aceptación

- [ ] `AppShell` compone Sidebar + TopBar + `<Outlet />` de React Router
- [ ] Sidebar con colores de Operational Calm (fondo `--color-slate-900`)
- [ ] Items de navegación filtrados por rol (hook `useNavItems(role)`)
- [ ] Logo/nombre de la organización activa en el sidebar
- [ ] Selector de sede activa en el topbar (si el usuario tiene asignación multi-sede)
- [ ] Badge de incidentes activos en la navegación (número de incidentes abiertos)
- [ ] Responsive: sidebar colapsable en mobile (hamburger menu)
- [ ] TopBar: nombre del usuario, botón de logout
- [ ] `platform_admin` ve un layout diferente (sin selector de sede, con acceso a panel global)

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

### Descripción

Gestión completa de sedes (locations) para el owner/admin de la organización. Incluye validación del límite de sedes según el plan contratado.

### Criterios de aceptación

- [ ] Lista de sedes de la organización activa
- [ ] Crear sede: nombre, dirección — formulario con validación Zod
- [ ] Editar sede: nombre, dirección
- [ ] Eliminar sede: solo si no tiene equipos asociados (error descriptivo si tiene)
- [ ] Indicador de límite de sedes: "2 de 3 sedes utilizadas" según `max_locations`
- [ ] Si se alcanza el límite, el botón "Agregar sede" muestra un modal de upgrade (sin implementar pagos — solo UI informativa)
- [ ] RLS de Supabase garantiza aislamiento — solo se ven sedes de la organización propia
- [ ] `useOrganizationStore` se actualiza (vía acción del store) tras crear/eliminar sedes

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

## TASK-007 — CRUD de equipos de frío

**Módulo:** equipment  
**Prioridad:** Media  
**Depende de:** TASK-006  
**Estimación:** M (3–4h)

### Descripción

Gestión de equipos por sede. Incluye configuración de rangos térmicos (min/max) y el flag de preparación IoT.

### Criterios de aceptación

- [ ] Lista de equipos filtrada por sede activa
- [ ] Crear equipo: nombre, **ubicación física dentro de la sede** (`physical_location`, ej. "Cocina principal"), código inventario, `min_temp`, `max_temp`, sede asignada
- [ ] Validación: `min_temp` debe ser menor que `max_temp`
- [ ] Editar equipo: todos los campos anteriores
- [ ] Eliminar equipo: solo si no tiene lecturas (advertencia si tiene historial)
- [ ] Toggle "Preparado para sensor IoT" (`is_iot_enabled`) — visual informativo sin funcionalidad real
- [ ] Badge visual de estado IoT (preparado / no preparado)
- [ ] Código de equipo único por organización (validación en servicio)

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

### Descripción

El formulario más usado del sistema — operarios de cocina, farmacia o bodega lo usan múltiples veces al día. Debe ser rápido, claro y funcionar bien en mobile.

### Criterios de aceptación

- [ ] Selección de equipo (filtrado por sede activa)
- [ ] Input de temperatura con validación numérica
- [ ] Feedback inmediato: el campo muestra si el valor está dentro o fuera del rango seguro del equipo seleccionado
- [ ] Selección de quién tomó la lectura: usuario logueado O staff de la lista (tabla `staff`)
- [ ] Campo `taken_by` (texto libre como respaldo)
- [ ] Al guardar: INSERT en `temperature_readings` con `snapshot_min_temp` y `snapshot_max_temp` copiados del equipo en ese momento
- [ ] Si la lectura está fuera de rango: se crea automáticamente un registro en `incidents` con status `'open'`
- [ ] Feedback visual inmediato del resultado (toast de éxito o alerta de incidente creado)
- [ ] El formulario se resetea tras envío exitoso
- [ ] Optimizado para mobile: botones grandes, inputs claros

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
└── types.ts
```

### Tests requeridos

- `isOutOfRange()`: cobertura completa de casos límite (igual al mínimo, igual al máximo, fuera por encima y por debajo)
- `reading.schema.ts`: validación de valor numérico requerido
- `useReadingForm`: lógica de submit, creación de incidente si fuera de rango

---

## TASK-009 — Dashboard de lecturas con Supabase Realtime

**Módulo:** readings  
**Prioridad:** Alta  
**Depende de:** TASK-008  
**Estimación:** L (5–6h)

### Descripción

Vista principal del dashboard: muestra el estado actual de todos los equipos de la sede activa, con las últimas lecturas y alertas activas. Se actualiza en tiempo real cuando llegan nuevas lecturas.

### Criterios de aceptación

- [ ] Grid de tarjetas de equipo — una por equipo de la sede activa
- [ ] Cada tarjeta muestra: nombre del equipo, última temperatura (en mono grande), tiempo desde la última lectura, estado (ok / alerta)
- [ ] Colores semánticos: eucalyptus para dentro de rango, danger (#E8533A) para fuera de rango
- [ ] Suscripción Supabase Realtime a `temperature_readings` — las tarjetas se actualizan sin recargar
- [ ] Panel de incidentes activos al lado del grid (o sección separada)
- [ ] Estado vacío si no hay equipos registrados (CTA para agregar equipo)
- [ ] Estado de última lectura: "Hace 5 min", "Hace 2h" — badge amarillo si han pasado más de X horas sin lectura
- [ ] Selector de sede en topbar funcional — el dashboard cambia al seleccionar otra sede

### Archivos producidos

```
src/features/readings/
├── components/
│   ├── ReadingsDashboard.tsx
│   ├── EquipmentStatusGrid.tsx
│   ├── EquipmentStatusCard.tsx
│   └── LastReadingBadge.tsx
└── hooks/
    ├── useReadings.ts
    └── useRealtimeReadings.ts
```

### Tests requeridos

- `useRealtimeReadings`: limpieza de suscripción en cleanup (memory leak)
- `EquipmentStatusCard`: renderiza estado correcto según temperatura (dentro/fuera de rango)

---

## TASK-010 — Motor de incidentes y flujo HACCP

**Módulo:** incidents  
**Prioridad:** Alta  
**Depende de:** TASK-009  
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

---

## TASK-011 — Panel de reportes y exportación PDF

**Módulo:** reports  
**Prioridad:** Media  
**Depende de:** TASK-010  
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
**Depende de:** TASK-005  
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

## Notas generales del backlog

1. Las estimaciones asumen implementación limpia con tests incluidos.
2. Cada tarea cierra con un `pnpm build` y `pnpm test` que deben pasar sin errores.
3. Si durante una tarea se descubre complejidad no anticipada, se pausa y se reporta antes de continuar.
4. El orden del backlog no es negociable sin aprobación — cada tarea construye sobre la anterior.
