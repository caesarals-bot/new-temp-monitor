# TempMonitor V1 — Agente de Proyecto

> Fuente de verdad. Decisiones de arquitectura, flujo de trabajo y alcance. Se actualiza SOLO cuando César aprueba. El historial vive en `files/CHANGELOG.md`.

---

## Identidad

**Nombre:** TempMonitor V1
**Tipo:** SaaS B2B Multi-Tenant — PWA
**Dominio:** Monitoreo de cadena de frío (Chile, 2026)
**Stack:** React 19 + TypeScript + Vite + Tailwind v4 + React Router v7 + Supabase

**Owner:** César (Product Owner + Developer Lead)
**Flujo:** Claude propone → César aprueba → Claude implementa → César revisa

**Identidad visual:** `files/DESIGN.md`
**Decisiones técnicas de arquitectura:** `files/ARCHITECTURE.md`

---

## Stack

| Capa          | Tecnología                | Nota                  |
| ------------- | ------------------------- | --------------------- |
| Framework     | React 19                  |                       |
| Lenguaje      | TypeScript 5.x            | Strict mode           |
| Build         | Vite 8.x                  |                       |
| Estilos       | Tailwind CSS v4           | CSS-first             |
| Routing       | React Router v8           | SPA mode              |
| Estado global | Zustand 5.x               | Selectores granulares |
| Backend       | Supabase                  | Auth + DB + RLS       |
| UI            | shadcn/ui                 | Tema custom           |
| Formularios   | React Hook Form           | + Zod                 |
| Testing       | Vitest + Testing Library  |                       |
| Linting       | ESLint + Prettier + Husky | pre-commit hook       |
| Package       | pnpm                      |                       |

---

## Estructura de Carpetas

```
src/
├── app/
│   ├── router.tsx          # React Router v7
│   └── providers.tsx
├── features/              # Un directorio por dominio
│   ├── auth/
│   ├── locations/
│   ├── equipment/
│   ├── readings/
│   ├── incidents/
│   ├── reports/
│   └── platform-admin/
├── shared/
│   ├── components/
│   │   ├── ui/           # shadcn/ui (no modificar)
│   │   ├── layout/       # AppShell, Sidebar, TopBar
│   │   ├── feedback/     # Toast, Alert
│   │   └── data-display/ # TemperatureCard, IncidentBadge
│   ├── hooks/
│   ├── lib/               # supabase.ts, utils.ts
│   └── types/
├── styles/globals.css     # Tokens Tailwind v4
└── main.tsx
tests/unit/
```

**Regla:** feature-first. Componentes de `readings` no importan de `incidents` directamente.

---

## Principios

**SOLID:** Componentes responsabilidad única. Interfaces pequeñas. Dependencias via props/hooks.

**Clean Code:** Funciones < 20 líneas. Nombres descriptivos. Comentarios "por qué" no "qué". DRY, KISS, YAGNI.

**Componentes:** Máximo ~100 líneas. Si crece más, dividir.

---

## Clasificación de Componentes

| Nivel | Ubicación                | Regla                                                  |
| ----- | ------------------------ | ------------------------------------------------------ |
| 1     | `shared/components/ui/`  | shadcn/ui, no modificar, sin lógica de negocio         |
| 2     | `shared/components/`     | Composiciones Nivel 1 con estilos TempMonitor          |
| 3     | `features/*/components/` | Consumen stores Zustand, nunca llaman Supabase directo |
| 4     | Route components         | Composición, gestionan loading/error de página         |

---

## Stores Zustand (3 dominios)

```typescript
// auth.store.ts
useAuthStore: (session, profile, isLoading, signIn, signOut, signUp);

// organization.store.ts
useOrganizationStore: (organization, locations, activeLocation, setActiveLocation, plan);

// incident.store.ts
useIncidentStore: (openIncidents, hasOpenIncidents, refreshIncidents);
```

**Patrón de consumo:**

```typescript
// ✅ Selectores granulares
const activeLocation = useOrganizationStore((s) => s.activeLocation);

// ❌ Nunca desestructurar store completo
const { activeLocation, locations } = useOrganizationStore();
```

---

## Convenciones de Código

### TypeScript

```typescript
// Tipos explícitos en props
interface Props {
  reading: TemperatureReading;
  equipment: Equipment;
}

// Tipos Supabase de los generados
import type { Tables } from '@/shared/types/supabase';

// ❌ Nunca any — usar unknown + narrowing
```

### Servicios (Supabase)

```typescript
// Siempre función pura retornando { data, error }
export async function getReadings(
  locationId: string,
  options: { limit?: number } = {}
): Promise<{ data: TemperatureReading[] | null; error: PostgrestError | null }> {
  return supabase.from('temperature_readings').select(...);
}

// ❌ Nunca supabase directo en componentes
```

### Hooks

```typescript
// Encapsulan lógica de servicio, usan useEffect con cleanup
export function useReadings(locationId: string) {
  const [readings, setReadings] = useState<TemperatureReading[]>([]);
  useEffect(() => {
    let cancelled = false;
    getReadings(locationId).then(({ data }) => {
      if (!cancelled) setReadings(data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [locationId]);
  return { readings };
}
```

### Formularios

```typescript
// Siempre React Hook Form + Zod, nunca useState para valores de formulario
```

### Nombrado

| Elemento            | Convención           | Ejemplo               |
| ------------------- | -------------------- | --------------------- |
| Componentes         | PascalCase           | `TemperatureCard`     |
| Hooks               | camelCase + use      | `useReadings`         |
| Servicios           | camelCase + .service | `readings.service.ts` |
| Tipos               | PascalCase, sin I    | `TemperatureReading`  |
| Constantes          | UPPER_SNAKE          | `MAX_TEMP_CELSIUS`    |
| Archivos componente | PascalCase           | `TemperatureCard.tsx` |

---

## Testing

**Siempre:** lógica de negocio pura, hooks, schemas Zod, stores Zustand

**Cuando tiene sentido:** componentes con lógica condicional compleja, formularios

**No en V1:** componentes puramente visuales, llamadas Supabase directas (mock), E2E

---

## Estados de Tarea

`PROPUESTA` → `APROBADA` → `EN PROGRESO` → `EN REVISIÓN` → `COMPLETADA`

Una tarea a la vez. No iniciar siguiente hasta que anterior esté `COMPLETADA`.

---

## ADR

| ID      | Decisión                                                       | Estado |
| ------- | -------------------------------------------------------------- | ------ |
| ADR-001 | React Router v7 SPA mode                                       | Activa |
| ADR-002 | Zustand (no Context API)                                       | Activa |
| ADR-003 | Feature-first structure                                        | Activa |
| ADR-004 | Servicios como funciones puras                                 | Activa |
| ADR-005 | Vitest + Testing Library                                       | Activa |
| ADR-006 | shadcn/ui + Operational Calm                                   | Activa |
| ADR-007 | `listByLocation` con 2 queries en vez de join anidado `!inner` | Activa |
| ADR-008 | `STALE_THRESHOLD_MS = 2h` (HACCP)                              | Activa |
| ADR-009 | Utilidades de tiempo con `now` inyectado (tests deterministas) | Activa |
| ADR-010 | dev-bypass skip para Realtime (validar solo cleanup)           | Activa |
| ADR-011 | Contadores reales cableados en cards (cierre de placeholder 0) | Activa |

---

## Alcance V1

**Incluido:** Auth, Onboarding, Sedes, Staff, Equipos, Lecturas, Incidentes, Reportes, Platform Admin, Prepación IoT (UI lista, sin hardware)

**Excluido:** Hardware IoT real, pagos, notificaciones push, app nativa, E2E, i18n

---

## Tareas

### Regla de oro de los archivos `files/*.md`

Cada archivo tiene un único propósito. **Antes de proponer o ejecutar, lee solo lo necesario.**

| Archivo                           | Contiene                                                                                      | NO contiene                         | Cuándo leerlo                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| **`AGENT.md`** (este)             | Reglas, stack, ADRs, principios, alcance, convenciones                                        | Detalle de tareas, sesiones         | **Siempre al inicio** — define cómo trabajar              |
| **`files/BACKLOG.md`**            | Tareas activas (PROPUESTA / APROBADA / EN PROGRESO) con criterios, archivos, tests            | Tareas cerradas, sesiones           | Al elegir próxima tarea o durante ejecución               |
| **`files/TASKS_HISTORY.md`**      | Tareas cerradas (TASK-001..012) con su definición original                                    | Sesiones, decisiones post-ejecución | Solo si necesitas saber qué definió una tarea ya hecha    |
| **`files/CHANGELOG.md`**          | Bitácora de ejecución: sesiones, bloques, decisiones post-ejecución, housekeeping (H-XXX), P0 | Definición de tareas, ADRs          | Al cerrar tarea o consultar decisiones/riesgos históricos |
| **`files/DESIGN.md`**             | Identidad visual (Operational Calm, tokens)                                                   | Lógica, arquitectura                | Si la tarea toca UI/visual                                |
| **`files/ARCHITECTURE.md`**       | Decisiones técnicas de arquitectura, capas, patrones, anti-patrones                           | Tareas, sesiones                    | Si la tarea implementa feature nueva o hook complejo      |
| **`files/DATABASE_STRUCTURE.md`** | Schema Supabase, RLS, FKs, índices                                                            | Lógica de aplicación                | Si la tarea modifica BD o consulta tablas                 |

### Flujo del agente al inicio de sesión

**Mínimo (siempre, para cualquier tarea):**

1. `files/AGENT.md` — reglas, ADRs, alcance
2. `files/BACKLOG.md` — siguiente tarea del backlog activo

**Solo si la tarea lo requiere:**

- UI nueva / cambio visual → `files/DESIGN.md`
- Feature nuevo / hook / service → `files/ARCHITECTURE.md`
- Modifica BD / query nueva → `files/DATABASE_STRUCTURE.md`

**Solo al cierre de tarea o consulta histórica:**

- `files/CHANGELOG.md` — para escribir la sesión, ver decisiones previas
- `files/TASKS_HISTORY.md` — si necesitas referenciar una tarea cerrada

### Anti-patrón: leer todo siempre

NO leer `CHANGELOG.md` ni `TASKS_HISTORY.md` por defecto. Crecen con cada tarea y consumen tokens sin aportar a la decisión actual. Solo abrirlos cuando:

- Estás cerrando la tarea actual (CHANGELOG para la sesión)
- Necesitas el contexto histórico de una decisión puntual (TASKS_HISTORY para definición original, CHANGELOG para la decisión post-ejecución)
