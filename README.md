# TempMonitor V1

SaaS B2B multi-tenant para monitoreo de cadena de frío. PWA construida con React 19, TypeScript, Vite, Tailwind v4, React Router v7 y Supabase.

> Fuente de verdad del proyecto: [`files/AGENT.md`](./files/AGENT.md)  
> Historial de tareas: [`files/CHANGELOG.md`](./files/CHANGELOG.md)  
> Backlog detallado: [`files/BACKLOG.md`](./files/BACKLOG.md)  
> Identidad visual: [`files/DESIGN.md`](./files/DESIGN.md)  
> Decisiones de arquitectura: [`files/ARCHITECTURE.md`](./files/ARCHITECTURE.md)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 |
| Lenguaje | TypeScript 5.x (strict mode) |
| Build | Vite 8.x |
| Estilos | Tailwind CSS v4 (CSS-first) |
| Routing | React Router v7 (SPA mode) |
| Estado global | Zustand 5.x |
| Backend | Supabase (Auth + DB + RLS) |
| UI | shadcn/ui (tema Operational Calm) |
| Formularios | React Hook Form + Zod |
| Testing | Vitest + Testing Library |
| Linting | ESLint + Prettier + Husky (pre-commit) |
| Package manager | pnpm |

---

## Estructura

```
src/
├── app/                  # router, providers, LazyPages
├── features/             # feature-first: un directorio por dominio
│   ├── auth/
│   ├── locations/
│   ├── staff/
│   ├── equipment/
│   ├── readings/
│   ├── incidents/
│   ├── reports/
│   └── platform-admin/
├── shared/
│   ├── components/
│   │   ├── ui/           # shadcn/ui (no modificar)
│   │   └── layout/       # AppShell, Sidebar, TopBar
│   ├── hooks/
│   ├── lib/              # supabase.ts, env.ts, utils.ts, dev-bypass.ts
│   └── types/
├── styles/globals.css    # tokens del design system (Tailwind v4)
└── main.tsx
tests/unit/               # tests unitarios (Vitest)
supabase/                 # migraciones SQL
files/                    # documentación de proyecto (AGENT, CHANGELOG, BACKLOG, etc.)
```

Regla: **feature-first**. Los componentes de `readings` no importan de `incidents` directamente; la comunicación entre features ocurre vía services o stores compartidos.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia el servidor de desarrollo |
| `pnpm build` | Compila TypeScript (`tsc -b`) y construye con Vite |
| `pnpm preview` | Previsualiza la build de producción |
| `pnpm test` | Ejecuta los tests en modo watch |
| `pnpm test:run` | Ejecuta los tests una sola vez |
| `pnpm lint` | Corre ESLint sobre todo el repo |
| `pnpm lint:fix` | Corrige errores de ESLint automáticamente |
| `pnpm format` | Formatea con Prettier |

---

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Opcional: bypass de autenticación para desarrollo local
VITE_DEV_BYPASS_AUTH=true
VITE_DEV_BYPASS_PLATFORM_ADMIN=false
```

**Importante:** `VITE_DEV_BYPASS_AUTH` solo debe estar activo en desarrollo. Si está en `true`, el cliente omite Supabase Auth y carga datos mock desde `src/shared/lib/dev-bypass.ts`.

---

## Setup local

```bash
pnpm install
cp .env.example .env.local  # completar credenciales de Supabase
pnpm dev
```

Las migraciones SQL están en `supabase/migrations/`. Aplica la última versión en tu proyecto Supabase (SQL Editor o CLI) antes de empezar a registrar datos reales.

---

## Convenciones

- **Componentes:** PascalCase, máximo ~100 líneas, responsabilidad única.
- **Hooks:** `useXxx`, selectores granulares de Zustand (nunca desestructurar el store completo).
- **Servicios:** funciones puras que retornan `{ data, error }`. Componentes nunca llaman Supabase directamente.
- **Stores Zustand:** selectores granulares con `(s) => s.campo`.
- **Tipos:** PascalCase sin prefijo `I`. Tipos Supabase desde `src/shared/types/supabase.ts`.
- **Tests:** siempre para lógica de negocio pura, hooks, schemas Zod y stores. Componentes visuales se testean cuando tienen lógica condicional significativa.

Detalles completos en [`files/AGENT.md`](./files/AGENT.md).

---

## Estado del proyecto

**Última tarea cerrada:** TASK-008 — Formulario de registro de lectura manual  
**Tests:** 452 pasando  
**Próxima tarea:** TASK-009 — Dashboard de lecturas con estado en tiempo real

Ver [`files/CHANGELOG.md`](./files/CHANGELOG.md) para el historial completo y [`files/BACKLOG.md`](./files/BACKLOG.md) para el backlog detallado.

---

## Licencia

Privado. Todos los derechos reservados.