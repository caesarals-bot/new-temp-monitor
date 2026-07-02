# TempMonitor V1 — Arquitectura

> Documentación técnica viva. Se actualiza cuando cambia un patrón, no en cada task.
> Decisiones de producto en `files/AGENT.md`. Tokens visuales en `files/DESIGN.md`.

---

## Principios rectores

### 1. Feature-first

Cada dominio vive en su propia carpeta. **Una feature no importa de otra feature directamente**. Si necesita lógica compartida, va a `shared/`.

```
src/features/
├── auth/             # autenticación, onboarding, profiles
├── organizations/    # org, locations (tenant management)
├── locations/        # CRUD de sedes
├── staff/            # CRUD de personal operativo
├── equipment/        # CRUD de equipos de frío
├── readings/         # registro y consulta de lecturas
├── incidents/        # detección de incidentes + HACCP
├── reports/          # generación de reportes
└── platform-admin/   # super admin (cross-tenant)
```

**Regla de oro:** si necesito una función de otra feature, **migrala** a su feature de origen. No la reexportes, no la importes.

Ejemplo real: `createLocation` estaba en `auth.service` porque el onboarding la usaba. Cuando TASK-006 construyó el CRUD de sedes fuera del onboarding, se **migró** a `locations.service`. Hoy `auth` no sabe de locations.

### 2. Hook por dominio

Cada feature con estado de UI (dialogs, mutaciones, state machine) tiene **un hook** que encapsula:

- Estado local del feature.
- Llamadas al service.
- Manejo de errores.
- Derived values (RBAC, contadores, límites).

La page (route component) **no tiene lógica de negocio**, solo composición.

### 3. Service puro

Las funciones de acceso a datos son **puras** y retornan `{ data, error }`. No manejan estado, no tocan stores, no hacen logging.

```typescript
// ✅ Bien: función pura, fácil de testear
export async function listLocations(orgId: string) {
  return supabase.from('locations').select('*').eq('organization_id', orgId);
}

// ❌ Mal: service con side effects acoplados
export async function listLocationsAndSetStore() {
  const { data } = await supabase.from('locations').select('*');
  useStore.setState({ locations: data });
}
```

### 4. Composition root en pages

Las pages son el **único lugar** donde se compone: stores + hooks + componentes. Esta restricción permite que la page sea trivial de leer y todo lo testeable esté en el hook.

```typescript
// ✅ Bien: page de ~80 líneas, pura composición
export function LocationsPage() {
  const org = useOrganizationStore((s) => s.organization);
  const { dialog, openCreate, ... } = useLocationsManagement();
  return <div>...JSX...</div>;
}
```

### 5. Errors separados por dominio de UI

Si una feature tiene 2 dialogs independientes (form + delete), los errores son **estados separados**. Nunca se mezclan.

```typescript
// ❌ Mal: un solo serverError compartido
const [serverError, setServerError] = useState<string | null>(null);

// ✅ Bien: errores por superficie
const [formError, setFormError] = useState<string | null>(null);
const [deleteError, setDeleteError] = useState<string | null>(null);
```

**Por qué:** si falla create y después abrís delete, el error de create aparece en el dialog de delete. Mala UX, bug latente clásico.

---

## Capas

```
Nivel 1 · shared/components/ui/        shadcn/ui, no se modifica, sin lógica
Nivel 2 · shared/components/            Composiciones con tokens TempMonitor
Nivel 3 · features/*/components/        Consumen stores/hooks, sin llamar Supabase directo
Nivel 4 · features/*/pages/             Route components, composición pura
```

### Flujo de datos

```
Supabase
  ↓ (service puro)
Hook (state + handlers)
  ↓ (estado + callbacks)
Page (composition)
  ↓ (props)
Componentes Nivel 2/3 (presentational + eventos)
  ↓
Componentes Nivel 1 (shadcn/ui, sin lógica)
```

**Regla:** los datos fluyen hacia abajo (props), los eventos hacia arriba (callbacks). Nunca al revés.

---

## Estructura típica de una feature (template)

```
src/features/<feature>/
├── pages/
│   └── <Feature>Page.tsx          # Nivel 4, route component
├── components/                    # Nivel 2/3
│   ├── <Entity>Card.tsx
│   ├── <Entity>sHeader.tsx
│   ├── <Entity>FormDialog.tsx
│   └── Delete<Entity>Dialog.tsx
├── hooks/
│   └── use<Entity>Management.ts   # state machine + handlers
├── services/
│   └── <feature>.service.ts       # funciones puras a Supabase
└── schemas/
    └── <feature>.schema.ts        # Zod
```

Aplicado a `locations`:

```
src/features/locations/
├── pages/LocationsPage.tsx                # 114 líneas
├── components/
│   ├── LocationCard.tsx
│   ├── LocationsHeader.tsx
│   ├── LocationFormDialog.tsx
│   └── DeleteLocationDialog.tsx
├── hooks/useLocationsManagement.ts        # 201 líneas
├── services/locations.service.ts          # 7 funciones puras
└── schemas/location.schema.ts
```

---

## Stores Zustand (3 dominios)

| Store | Estado | Acciones típicas |
|-------|--------|------------------|
| `useAuthStore` | `session`, `user`, `profile`, `isLoading`, `isHydrated` | `signIn`, `signOut`, `signUp`, `setProfile` |
| `useOrganizationStore` | `organization`, `locations`, `activeLocationId`, `isLoading` | `setActiveLocation`, `fetchOrganization`, `fetchLocations` |
| `useIncidentStore` | `openIncidents`, `isLoading`, `error` | `fetchOpenIncidents`, `subscribeRealtime` |

### Consumo con selectores granulares

```typescript
// ✅ Bien: suscripción puntual, re-render solo si cambia activeLocationId
const activeLocationId = useOrganizationStore((s) => s.activeLocationId);

// ❌ Mal: suscripción total, re-render ante cualquier cambio
const { activeLocationId, locations, organization } = useOrganizationStore();
```

---

## Patrón de CRUD (establecido en TASK-006)

Para agregar CRUD de una nueva entidad, seguir este template:

### 1. Service (`<feature>.service.ts`)

Funciones puras. Retornan `{ data, error }`. Una por operación CRUD + helpers de count/dependencies.

```typescript
export async function list<X>(scope: string): Promise<{ data: X[] | null; error: PostgrestError | null }>;
export async function get<X>(id: string): Promise<{ data: X | null; error: PostgrestError | null }>;
export async function create<X>(input: CreateInput): Promise<{ data: X | null; error: PostgrestError | null }>;
export async function update<X>(id: string, input: UpdateInput): Promise<{ data: X | null; error: PostgrestError | null }>;
export async function remove(id: string): Promise<{ data: null; error: PostgrestError | null }>;
```

### 2. Schema (`<feature>.schema.ts`)

- `createSchema` reusa el base de onboarding si existe.
- `updateSchema` con todos los campos opcionales + refine "al menos uno".

### 3. Hook (`use<X>Management.ts`)

State machine para dialogs (closed | create | edit | delete), handlers wrap services, errors separados, derived values (RBAC, límites).

### 4. Componentes (4)

- `<X>Card` — presentacional con props de contadores y callbacks.
- `<X>sHeader` — título, contador, botón "nuevo".
- `<X>FormDialog` — RHF + Zod, modos create/edit.
- `Delete<X>Dialog` o `Toggle<X>Dialog` — confirmación con conteo de dependencias.

### 5. Page (`<X>Page.tsx`)

Composición pura: ~80-120 líneas, sin lógica de negocio.

### 6. Router + Lazy

`Lazy<X>Page` en `app/LazyPages.tsx` + ruta en `app/router.tsx`.

---

## Soft delete convention

Cuando el schema tiene un campo `active` (como `staff.active`), **preferimos soft delete** sobre hard delete para preservar trazabilidad. La acción en UI se llama "Desactivar/Reactivar", no "Eliminar".

Aplicado en: `staff` (TASK-006b). NO aplicado en: `locations` (TASK-006) porque no tiene `active` y romper la FK cascade es aceptable.

---

## Manejo de errores

### Mapeo de PostgrestError

```typescript
function mapLocationError(message: string | null | undefined): string | null {
  if (!message) return null;
  return message; // pasamos el texto del trigger de BD tal cual
}
```

Los triggers de BD (como `check_location_limit`) lanzan mensajes legibles. No los reformateamos en V1, los mostramos tal cual al usuario.

### UX de errores

- **Formularios:** error inline en Alert dentro del dialog.
- **Operaciones de toggle/delete:** error inline en Alert dentro del dialog de confirmación.
- **Errores separados** por superficie (ver principio #5).
- **Sin toast** en V1. Cierre de dialog = éxito visual.

---

## Testing

### Qué se testea (en orden de prioridad)

1. **Services** — funciones puras, mockeando `supabase.from`. Cubre el contrato con la BD.
2. **Schemas Zod** — válidos, inválidos, refines.
3. **Hooks** — state machine, handlers, RBAC, error isolation. Con `renderHook` + `act`.
4. **Componentes con lógica condicional** — `LocationCard`, `LocationsHeader`, `DeleteLocationDialog`. Render + eventos.
5. **Componentes de formulario** — `LocationFormDialog`. RHF + Zod + serverError inline.

### Qué NO se testea en V1

- Componentes puramente visuales (sin lógica condicional).
- Pages (route components) — son composición pura, el hook las cubre.
- E2E con Supabase real (fuera de alcance V1).
- Llamadas Supabase directas sin mock.

### Patrón de mock de supabase

```typescript
vi.mock('@/shared/lib/supabase', () => {
  const make = () => {
    const c: Record<string, ReturnType<typeof vi.fn>> = {};
    c.select = vi.fn(() => c);
    c.insert = vi.fn(() => c);
    c.update = vi.fn(() => c);
    c.delete = vi.fn(() => c);
    c.eq = vi.fn(() => c);
    c.in = vi.fn(() => c);
    c.order = vi.fn(() => c);
    c.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
    return c;
  };
  return { supabase: { from: vi.fn(() => make()) } };
});
```

### Patrón de mock de stores (para tests de hooks)

```typescript
let mockOrganization = { id: 'org-1', plan_type: 'pro', max_locations: 2 };

vi.mock('@/features/organizations/store/organization.store', () => ({
  useOrganizationStore: Object.assign(
    (selector) => selector({
      organization: mockOrganization,
      locations: [],
      activeLocationId: null,
      // ... actions
    }),
    { getState: () => ({ /* ... */ }) }
  ),
}));

beforeEach(() => {
  mockOrganization = { id: 'org-1', plan_type: 'pro', max_locations: 2 };
});
```

---

## Dev-bypass (mock para desarrollo local)

Activado con `VITE_DEV_BYPASS_AUTH=true` y opcionalmente `VITE_DEV_BYPASS_PLATFORM_ADMIN=true` en `.env.local`. **Nunca en producción.**

Es la **fuente única de mocks**. Cualquier dato falso (user, org, locations, staff, incidents) viene de `src/shared/lib/dev-bypass.ts`.

Cuando se cierre el bypass (V1 → producción), todo el flujo cae a Supabase real. El código de la app no se entera, porque siempre habla con stores y services.

---

## Commit convention

- **Commits granulares por bloque** dentro de cada task.
- Mensajes con prefijo: `feat(<feature>)`, `refactor(<scope>)`, `chore(<scope>)`, `test(<scope>)`, `docs(...)`.
- Cuerpo del commit lista los archivos principales y referencias a criterios de aceptación.
- Una excepción acordada: tareas simples con 1 commit (como TASK-006 cuando se consolidó al final).

---

## Anti-patrones explícitos

- ❌ Importar de `features/<otro>/services/...` desde un componente o hook.
- ❌ Llamar `supabase.from(...)` desde un componente o hook (siempre vía service).
- ❌ Lógica de negocio en pages (siempre en hooks).
- ❌ Un solo `error` state compartido entre múltiples dialogs.
- ❌ Hooks que retornan el store completo (usar selectores granulares).
- ❌ Componentes de más de 100 líneas (dividir).
- ❌ `as any` o `as unknown as X` sin narrowing.
- ❌ Tests de pages (composición pura, las cubre el hook).
- ❌ Toast/snackbar libraries en V1.

---

## Referencias

- `files/AGENT.md` — decisiones de producto, alcance V1, estados de tarea.
- `files/DESIGN.md` — tokens visuales (colores, tipografía, espaciado).
- `files/CHANGELOG.md` — historial de tasks con bloques ejecutados.
- `files/ARCHITECTURE.md` — este documento (decisiones técnicas).
