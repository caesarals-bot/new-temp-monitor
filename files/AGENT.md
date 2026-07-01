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

| Capa | Tecnología | Nota |
|------|-----------|------|
| Framework | React 19 | |
| Lenguaje | TypeScript 5.x | Strict mode |
| Build | Vite 8.x | |
| Estilos | Tailwind CSS v4 | CSS-first |
| Routing | React Router v8 | SPA mode |
| Estado global | Zustand 5.x | Selectores granulares |
| Backend | Supabase | Auth + DB + RLS |
| UI | shadcn/ui | Tema custom |
| Formularios | React Hook Form | + Zod |
| Testing | Vitest + Testing Library | |
| Linting | ESLint + Prettier + Husky | pre-commit hook |
| Package | pnpm | |

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

| Nivel | Ubicación | Regla |
|-------|-----------|-------|
| 1 | `shared/components/ui/` | shadcn/ui, no modificar, sin lógica de negocio |
| 2 | `shared/components/` | Composiciones Nivel 1 con estilos TempMonitor |
| 3 | `features/*/components/` | Consumen stores Zustand, nunca llaman Supabase directo |
| 4 | Route components | Composición, gestionan loading/error de página |

---

## Stores Zustand (3 dominios)

```typescript
// auth.store.ts
useAuthStore: session, profile, isLoading, signIn, signOut, signUp

// organization.store.ts
useOrganizationStore: organization, locations, activeLocation, setActiveLocation, plan

// incident.store.ts
useIncidentStore: openIncidents, hasOpenIncidents, refreshIncidents
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
interface Props { reading: TemperatureReading; equipment: Equipment; }

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
    return () => { cancelled = true; };
  }, [locationId]);
  return { readings };
}
```

### Formularios
```typescript
// Siempre React Hook Form + Zod, nunca useState para valores de formulario
```

### Nombrado
| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Componentes | PascalCase | `TemperatureCard` |
| Hooks | camelCase + use | `useReadings` |
| Servicios | camelCase + .service | `readings.service.ts` |
| Tipos | PascalCase, sin I | `TemperatureReading` |
| Constantes | UPPER_SNAKE | `MAX_TEMP_CELSIUS` |
| Archivos componente | PascalCase | `TemperatureCard.tsx` |

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

| ID | Decisión | Estado |
|----|----------|--------|
| ADR-001 | React Router v7 SPA mode | Activa |
| ADR-002 | Zustand (no Context API) | Activa |
| ADR-003 | Feature-first structure | Activa |
| ADR-004 | Servicios como funciones puras | Activa |
| ADR-005 | Vitest + Testing Library | Activa |
| ADR-006 | shadcn/ui + Operational Calm | Activa |

---

## Alcance V1

**Incluido:** Auth, Onboarding, Sedes, Staff, Equipos, Lecturas, Incidentes, Reportes, Platform Admin, Prepación IoT (UI lista, sin hardware)

**Excluido:** Hardware IoT real, pagos, notificaciones push, app nativa, E2E, i18n

---

## Tareas

Ver `files/CHANGELOG.md` para historial y backlog.
