# TempMonitor V1 — Identidad Visual "Operational Calm"

---

## Paleta de colores

```
Slate:
--color-slate-900:  #1C2B35   /* Sidebar, nav primaria */
--color-slate-700:  #2D4455   /* Hover states, bordes fuertes */
--color-slate-500:  #4A6070   /* Texto secundario */
--color-slate-300:  #8BA3B0   /* Texto muted */

Eucalyptus (acento primario):
--color-eucalyptus:        #2E7D6B
--color-eucalyptus-hover:  #266B5A
--color-eucalyptus-light:  #5BBFA8
--color-eucalyptus-subtle: #A8DDD4
--color-eucalyptus-bg:     #E8F5F2

Superficies:
--color-surface:      #F0F4F3   /* Fondo general */
--color-surface-card: #FFFFFF   /* Cards, modales */

Bordes:
--color-border:        #D8E6E2
--color-border-strong: #B8D4CE
--color-border-focus:  #2E7D6B

Texto:
--color-text-primary:   #1C2B35
--color-text-secondary: #4A6070
--color-text-muted:     #8BA3B0
--color-text-inverse:   #FFFFFF

Semánticos (SOLO estados funcionales):
--color-danger:        #E8533A
--color-danger-hover:  #D4442C
--color-danger-light:  #F4957F
--color-danger-bg:     #FDF0ED
--color-danger-border: #F4C4B9

--color-warning:        #D97706
--color-warning-light:  #F5B84C
--color-warning-bg:     #FEF9EC
--color-warning-border: #FAD98C

--color-success:        #2E7D6B   /* alias eucalyptus */
--color-success-bg:     #E8F5F2
```

---

## Tipografía

```
Font display:  Inter — headings, valores numéricos
Font body:     Inter — body copy, labels, formularios
Font mono:     JetBrains Mono — temperatura dashboard, códigos equipo

Escala (rem base 16px):
  text-xs:   0.75rem   — labels, metadata
  text-sm:   0.875rem  — body secundario
  text-base: 1rem      — body primario
  text-lg:   1.125rem  — subtítulos
  text-xl:   1.25rem   — títulos tarjeta
  text-2xl:  1.5rem    — headings página
  text-3xl:  1.875rem  — temperatura dashboard (mono)
  text-4xl:  2.25rem   — KPIs
```

---

## Elemento firma

Temperatura en dashboard: `JetBrains Mono`, `text-3xl` o `text-4xl`, badge de estado (verde/rojo) a la derecha.

---

## Regla de color semántico

| Color | Uso |
|-------|-----|
| `--color-danger` | Solo lecturas fuera de rango + botones destructivos |
| `--color-warning` | Solo advertencias (batería baja, señal débil) |
| `--color-eucalyptus` | Acciones primarias, estados activos, navegación |

**Nunca usar colores semánticos como decoración.**

---

## Clases CSS disponibles

### Temperatura
```css
.temp-display           /* mono, 2.25rem, font-weight 500 */
.temp-display--ok        /* color eucalyptus */
.temp-display--danger    /* color danger */
```

### Status badge
```css
.status-badge--ok      /* bg eucalyptus-bg, text eucalyptus */
.status-badge--danger   /* bg danger-bg, text danger */
.status-badge--warning  /* bg warning-bg, text warning */
```

### Navegación
```css
.nav-item              /* slate-300, hover bg rgba blanco */
.nav-item--active      /* bg rgba euc, text eucalyptus-light */
```

### Utilidades
```css
.font-mono
.text-danger
.text-eucalyptus
.bg-surface
.bg-card
```
