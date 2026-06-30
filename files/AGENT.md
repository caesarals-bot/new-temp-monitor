# TempMonitor V1 — Agente de Proyecto

> Este documento es la fuente de verdad del proyecto. Toda decisión de arquitectura, estilo, flujo de trabajo y alcance está aquí. Se actualiza al cierre de cada tarea aprobada.

---

## Identidad del Proyecto

**Nombre:** TempMonitor
**Versión actual:** V1
**Tipo:** SaaS B2B Multi-Tenant — PWA
**Dominio:** Monitoreo de cadena de frío para industrias alimentaria y sanitaria (Chile, 2026)
**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router v7 (SPA) + Supabase

---

## Propietario del Proyecto

**Rol:** César (Product Owner + Developer Lead)
**Flujo de aprobación:** Claude propone tareas → César las aprueba → Claude las implementa → César las revisa

---

## Identidad Visual — "Operational Calm"

### Paleta de colores

```
--color-slate-900:  #1C2B35   /* Sidebar, nav primaria                */
--color-slate-700:  #2D4455   /* Hover states, bordes fuertes          */
--color-slate-500:  #4A6070   /* Texto secundario sobre oscuro         */
--color-eucalyptus: #2E7D6B   /* Acento primario — acción, éxito       */
--color-eucalyptus-light: #5BBFA8  /* Hover del acento, iconos activos */
--color-eucalyptus-bg: #E8F5F2     /* Fondo de estados de éxito        */
--color-surface:    #F0F4F3   /* Fondo general de la app              */
--color-white:      #FFFFFF   /* Cards, modales                       */
--color-border:     #D8E6E2   /* Bordes de cards y divisores          */
--color-border-strong: #B8D4CE /* Bordes en hover                    */

/* Semánticos — NUNCA para decoración */
--color-danger:     #E8533A   /* Alertas de temperatura fuera de rango */
--color-danger-bg:  #FDF0ED   /* Fondo de estado de error              */
--color-warning:    #D97706   /* Advertencias (batería baja, señal)    */
--color-warning-bg: #FEF9EC   /* Fondo de estado de advertencia        */
```

### Tipografía

```
Font display:  Inter (Google Fonts) — headings, valores numéricos de temperatura
Font body:     Inter — body copy, labels, formularios
Font mono:     JetBrains Mono — valores de temperatura en dashboard, códigos de equipo

Escala tipográfica (rem base 16px):
  text-xs:   0.75rem  / 12px  — labels, metadata
  text-sm:   0.875rem / 14px  — body secundario
  text-base: 1rem     / 16px  — body primario
  text-lg:   1.125rem / 18px  — subtítulos de sección
  text-xl:   1.25rem  / 20px  — títulos de tarjeta
  text-2xl:  1.5rem   / 24px  — headings de página
  text-3xl:  1.875rem / 30px  — valores de temperatura en dashboard (mono)
  text-4xl:  2.25rem  / 36px  — KPIs prominentes
```

### Elemento firma

Los valores de temperatura en el dashboard se muestran en `JetBrains Mono`, tamaño `text-3xl` o `text-4xl`, con un badge de estado (verde/rojo) a la derecha del número. Este tratamiento es el elemento más reconocible de la interfaz — un número grande con un estado claro, sin adornos.

### Uso de color semántico (regla estricta)

- `--color-danger` (#E8533A): **exclusivamente** para lecturas fuera de rango y botones de acción destructiva.
- `--color-warning` (#D97706): **exclusivamente** para advertencias operacionales (batería baja, señal débil).
- `--color-eucalyptus`: para acciones primarias, estados activos, navegación activa.
- Ningún color semántico se usa como decoración.

---

## Arquitectura del Sistema

### Stack definitivo

| Capa            | Tecnología                | Versión       | Decisión                                                   |
| --------------- | ------------------------- | ------------- | ---------------------------------------------------------- |
| Framework       | React                     | 19            | Latest                                                     |
| Lenguaje        | TypeScript                | 5.x           | Strict mode                                                |
| Build           | Vite                      | 6.x           | Latest                                                     |
| Estilos         | Tailwind CSS              | v4            | CSS-first config                                           |
| Routing         | React Router              | v7 (SPA mode) | Sin SSR, SPA pura                                          |
| Estado global   | Zustand                   | 5.x           | Selectores granulares, evita re-render masivo con Realtime |
| Backend         | Supabase                  | Latest        | Auth + DB + RLS                                            |
| Componentes UI  | shadcn/ui                 | Latest        | Tema personalizado                                         |
| Formularios     | React Hook Form           | 7.x           | Con Zod                                                    |
| Validación      | Zod                       | 3.x           | Schemas compartidos                                        |
| Testing         | Vitest + Testing Library  | Latest        | Lógica + hooks                                             |
| Linting         | ESLint + Prettier + Husky | Latest        | Pre-commit hooks                                           |
| Package manager | pnpm                      | Latest        | Workspace ready                                            |

### Decisión: React Router v7 SPA mode (no framework mode)

Razón: el proyecto es un SaaS dashboard — no necesita SSR, ISR ni file-based routing a nivel de framework. React Router v7 en SPA mode da routing declarativo moderno (loaders, actions, nested routes) sin la sobrecarga de un meta-framework. Supabase maneja el backend completo.

### Decisión: Zustand (no Context API)

Razón: el estado global de TempMonitor tiene tres dominios claros (auth/tenant, organización activa, sede activa) pero con un patrón de uso crítico — actualizaciones frecuentes vía Supabase Realtime (lecturas e incidentes llegando constantemente). Con Context API, cualquier cambio en el valor del contexto re-renderiza a *todos* los componentes consumidores, sin importar qué porción del estado usan. En un dashboard con múltiples tarjetas de equipo suscritas a Realtime, eso degrada el rendimiento de forma perceptible.

Zustand resuelve esto con selectores granulares: un componente que solo lee `activeLocation` no se re-renderiza cuando cambia `openIncidents`. Sin el boilerplate de Redux (no hay actions/reducers/dispatch ceremonioso), con DevTools compatibles, y con una curva de adopción mínima viniendo de Context.

Se mantienen tres stores con la misma separación de dominio:

---

## Estructura de Carpetas

```
tempmonitor/
├── public/
│   └── manifest.json              # PWA manifest
├── src/
│   ├── app/
│   │   ├── router.tsx             # Definición de rutas (React Router v7)
│   │   └── providers.tsx          # Composición de todos los providers
│   ├── features/                  # Un directorio por dominio de negocio
│   │   ├── auth/
│   │   │   ├── components/        # LoginForm, OnboardingWizard, etc.
│   │   │   ├── hooks/             # useAuth, useSession
│   │   │   ├── store/             # auth.store.ts (Zustand)
│   │   │   ├── schemas/           # Zod schemas de validación
│   │   │   └── types.ts
│   │   ├── organizations/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── store/             # organization.store.ts (Zustand)
│   │   │   ├── services/          # Llamadas a Supabase (functions puras)
│   │   │   ├── schemas/
│   │   │   └── types.ts
│   │   ├── locations/
│   │   ├── equipment/
│   │   ├── staff/
│   │   ├── readings/
│   │   ├── incidents/
│   │   ├── reports/
│   │   └── platform-admin/
│   ├── shared/
│   │   ├── components/            # Componentes UI reutilizables
│   │   │   ├── ui/                # shadcn/ui (no modificar directamente)
│   │   │   ├── layout/            # AppShell, Sidebar, TopBar
│   │   │   ├── feedback/          # Toast, Alert, Badge de estado térmico
│   │   │   └── data-display/      # TemperatureCard, IncidentBadge, etc.
│   │   ├── hooks/                 # useDebounce, usePagination, etc.
│   │   ├── lib/
│   │   │   ├── supabase.ts        # Cliente Supabase (singleton)
│   │   │   ├── supabase.types.ts  # Tipos generados por supabase gen types
│   │   │   └── utils.ts           # cn(), formatTemp(), etc.
│   │   └── types/
│   │       └── supabase.ts        # Re-export de tipos generados
│   ├── styles/
│   │   └── globals.css            # Tokens Tailwind v4, variables CSS, @font-face
│   └── main.tsx
├── tests/
│   ├── unit/                      # Tests de lógica pura y hooks
│   └── setup.ts                   # Vitest setup
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── .husky/
│   └── pre-commit
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Regla de estructura: feature-first

Cada feature es un módulo autónomo. Un componente de `readings` no importa nada de `incidents` directamente — si necesita datos cruzados, pasa por un hook o un servicio compartido en `shared/`. Esta regla previene el acoplamiento circular que genera deuda técnica en proyectos SaaS con muchos dominios.

---

## Ciclo de Vida de Componentes

### Clasificación de componentes

**Nivel 1 — UI Primitivos** (`shared/components/ui/`)
Vienen de shadcn/ui. No se modifican directamente. Si se necesita extender, se crea un wrapper en Nivel 2. Nunca llevan lógica de negocio.

**Nivel 2 — Componentes compartidos** (`shared/components/`)
Composiciones de Nivel 1 con estilos de TempMonitor. Pueden recibir props de configuración pero no consumen stores de la app. Ejemplos: `TemperatureCard`, `StatusBadge`, `IncidentAlert`.

**Nivel 3 — Componentes de feature** (`features/*/components/`)
Consumen stores de Zustand (vía selectores granulares), llaman hooks de la feature, coordinan lógica local. Nunca hacen llamadas directas a Supabase — eso va en servicios. Ejemplos: `ReadingForm`, `EquipmentList`, `IncidentResolutionModal`.

**Nivel 4 — Pages / Route components** (`features/*/pages/` o directamente en router)
Composición de componentes de feature. Gestionan estado de carga y error de nivel de página. Definen los loaders de React Router si aplica.

### Reglas del ciclo de vida

1. **Un componente = una responsabilidad.** Si un componente necesita comentarios para explicar secciones, se debe dividir.
2. **Props explícitas.** Nunca se pasa el objeto completo cuando solo se necesitan dos campos.
3. **Sin efectos innecesarios.** `useEffect` para sincronización con sistemas externos (Supabase subscriptions). No para derivar estado — usar `useMemo`.
4. **Colocation de lógica.** El hook que solo usa un componente vive junto a ese componente, no en `shared/hooks`.
5. **Componentes de formulario con React Hook Form.** Nunca estado local (`useState`) para valores de formulario.

---

## Gestión de Estado

### Mapa de stores (Zustand)

```typescript
// src/features/auth/store/auth.store.ts
useAuthStore
  └─ session: Session | null
  └─ profile: Profile | null        (incluye role, organization_id, is_platform_admin)
  └─ isLoading: boolean
  └─ signIn / signOut / signUp

// src/features/organizations/store/organization.store.ts
useOrganizationStore
  └─ organization: Organization | null
  └─ locations: Location[]
  └─ activeLocation: Location | null
  └─ setActiveLocation: (id: string) => void
  └─ plan: PlanLimits             (límites calculados del plan)

// src/features/incidents/store/incident.store.ts
useIncidentStore
  └─ openIncidents: Incident[]
  └─ hasOpenIncidents: boolean
  └─ refreshIncidents: () => void
```

### Patrón de consumo — selectores granulares

```typescript
// ✅ El componente solo se re-renderiza si activeLocation cambia
const activeLocation = useOrganizationStore((state) => state.activeLocation);

// ❌ Nunca desestructurar el store completo — anula el beneficio de los selectores
const { activeLocation, locations, organization, plan } = useOrganizationStore();
```

### Patrón de store con Supabase Realtime

```typescript
// src/features/incidents/store/incident.store.ts
import { create } from 'zustand';
import { supabase } from '@/shared/lib/supabase';

interface IncidentState {
  openIncidents: Incident[];
  hasOpenIncidents: boolean;
  subscribeToIncidents: (organizationId: string) => () => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  openIncidents: [],
  hasOpenIncidents: false,

  subscribeToIncidents: (organizationId) => {
    const channel = supabase
      .channel(`incidents:${organizationId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        // refetch y set()
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
}));
```

---

## Convenciones de Código

### TypeScript

```typescript
// ✅ Tipos explícitos para props de componentes
interface TemperatureCardProps {
  reading: TemperatureReading;
  equipment: Equipment;
  onIncidentClick?: (incidentId: string) => void;
}

// ✅ Tipos de Supabase siempre vienen de los generados
import type { Tables } from '@/shared/types/supabase';
type TemperatureReading = Tables<'temperature_readings'>;

// ❌ Nunca 'any'. Si el tipo es desconocido, usar 'unknown' y narrowing
```

### Servicios de Supabase

```typescript
// ✅ Funciones puras, siempre retornan { data, error }
// src/features/readings/services/readings.service.ts
export async function getReadingsByLocation(
  locationId: string,
  options: { limit?: number; from?: Date } = {}
): Promise<{ data: TemperatureReading[] | null; error: PostgrestError | null }> {
  const query = supabase
    .from('temperature_readings')
    .select(`*, equipment!inner(location_id)`)
    .eq('equipment.location_id', locationId)
    .order('recorded_at', { ascending: false })
    .limit(options.limit ?? 50);

  return query;
}

// ❌ Nunca llamadas a supabase directamente dentro de componentes
```

### Hooks personalizados

```typescript
// ✅ Hook que encapsula la lógica de servicio
// src/features/readings/hooks/useReadings.ts
export function useReadings(locationId: string) {
  const [readings, setReadings] = useState<TemperatureReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getReadingsByLocation(locationId).then(({ data, error }) => {
      if (cancelled) return;
      if (error) setError(error.message);
      else setReadings(data ?? []);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [locationId]);

  return { readings, isLoading, error };
}
```

### Nombrado

| Elemento                  | Convención                      | Ejemplo               |
| ------------------------- | ------------------------------- | --------------------- |
| Componentes               | PascalCase                      | `TemperatureCard`     |
| Hooks                     | camelCase con `use`             | `useReadings`         |
| Servicios                 | camelCase con sufijo `.service` | `readings.service.ts` |
| Tipos/Interfaces          | PascalCase, sin prefijo `I`     | `TemperatureReading`  |
| Constantes                | UPPER_SNAKE_CASE                | `MAX_TEMP_CELSIUS`    |
| Variables/funciones       | camelCase                       | `isOutOfRange`        |
| Archivos de componente    | PascalCase                      | `TemperatureCard.tsx` |
| Archivos de hook/servicio | camelCase                       | `useReadings.ts`      |

---

## Testing

### Qué se testea

**Siempre:**

- Lógica de negocio pura (funciones de cálculo de rango, formateo de temperatura, clasificación de incidentes)
- Hooks personalizados (`renderHook` de Testing Library)
- Schemas Zod (validación correcta e incorrecta)
- Stores de Zustand (acciones y selectores)

**Cuando tiene sentido:**

- Componentes con lógica condicional compleja (mostrar/ocultar por rol, estados de carga/error/vacío)
- Formularios con validación (submit correcto, errores de campo)

**No se testea en V1:**

- Componentes puramente visuales/presentacionales sin lógica
- Llamadas a Supabase directas (se mockean en tests de hooks)
- Integración E2E (se agrega en V2 con Playwright)

### Ejemplo de test de lógica de negocio

```typescript
// tests/unit/temperature.utils.test.ts
import { describe, it, expect } from 'vitest';
import { isOutOfRange, classifyReading } from '@/shared/lib/temperature.utils';

describe('isOutOfRange', () => {
  it('returns true when reading exceeds max', () => {
    expect(isOutOfRange({ value: 9, min: 2, max: 8 })).toBe(true);
  });

  it('returns false when reading is within range', () => {
    expect(isOutOfRange({ value: 5, min: 2, max: 8 })).toBe(false);
  });

  it('returns true when reading is below min', () => {
    expect(isOutOfRange({ value: 1, min: 2, max: 8 })).toBe(false); // ajustar según regla HACCP
  });
});
```

---

## Configuración de Linting

### ESLint (`eslint.config.js`)

```javascript
// Reglas clave para TempMonitor:
// - react-hooks/exhaustive-deps: error
// - @typescript-eslint/no-explicit-any: error
// - @typescript-eslint/no-unused-vars: error
// - import/no-circular-imports: error
// Ver archivo completo en TASK-001
```

### Prettier (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

### Husky (pre-commit)

```bash
#!/bin/sh
pnpm lint-staged
# lint-staged corre: eslint + prettier + vitest --run sobre archivos modificados
```

---

## Alcance V1 — Módulos Confirmados

| Módulo                | Descripción                                                                                       | Estado      |
| --------------------- | ------------------------------------------------------------------------------------------------- | ----------- |
| Auth + Onboarding     | Registro organización, perfil owner, wizard inicial guiado (sede → staff opcional → equipos opcional) | Por iniciar |
| Gestión de sedes      | CRUD de locations con límite por plan                                                               | Por iniciar |
| Gestión de personal   | CRUD de encargados de toma de temperatura, sin login propio                                       | Por iniciar |
| Gestión de equipos    | CRUD de equipment con rangos térmicos, nombre y ubicación dentro de la sede                       | Por iniciar |
| Registro de lecturas  | Form manual, historial, estado en tiempo real                                                     | Por iniciar |
| Alertas e incidentes | Detección automática, flujo HACCP de resolución                                                   | Por iniciar |
| Reportes              | Historial filtrable, exportación PDF                                                               | Por iniciar |
| Panel platform admin  | Vista global de organizaciones (super admin)                                                      | Por iniciar |
| Preparación IoT       | Columnas en BD, flags en UI, sin integración real                                                 | Por iniciar |

### Fuera de alcance V1

- Integración de hardware IoT real (sensores físicos, MQTT, webhooks)
- Sistema de pagos / suscripciones (Stripe)
- Notificaciones push o email
- App nativa móvil (iOS/Android)
- Tests E2E (Playwright)
- i18n / multi-idioma

---

## Registro de Decisiones de Arquitectura (ADR)

| ID      | Decisión                                                               | Fecha   | Estado |
| ------- | ---------------------------------------------------------------------- | ------- | ------ |
| ADR-001 | React Router v7 SPA mode (no framework)                                | 2026-06 | Activa |
| ADR-002 | Zustand para estado global (selectores granulares, ideal con Realtime) | 2026-06 | Activa |
| ADR-003 | Feature-first folder structure                                         | 2026-06 | Activa |
| ADR-004 | Servicios de Supabase como funciones puras                             | 2026-06 | Activa |
| ADR-005 | Vitest + Testing Library (no E2E en V1)                                | 2026-06 | Activa |
| ADR-006 | shadcn/ui con tema Operational Calm                                    | 2026-06 | Activa |

---

## Preparación IoT (sin implementación en V1)

La BD ya tiene las columnas necesarias (`is_iot_enabled`, `iot_device_id`, `sensor_battery`, `sensor_signal`, `reading_type`). En V1:

- Los campos existen en los tipos TypeScript generados.
- El servicio de lecturas acepta `reading_type` en su interfaz.
- La UI muestra el badge "IoT" si `reading_type === 'iot'` (preparado para datos reales futuros).
- El flag `is_iot_enabled` en equipment se muestra en la UI como "Preparado para sensor IoT".
- No se implementa `useIotSimulator` en V1 — se documenta como TASK futura.
