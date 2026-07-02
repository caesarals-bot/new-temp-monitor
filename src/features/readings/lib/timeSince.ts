/**
 * Formatea una diferencia entre dos timestamps en un texto humano corto.
 *
 * Es una función pura sin dependencias externas: recibe dos fechas (o un
 * timestamp ISO) y retorna el texto listo para mostrar en la UI del
 * dashboard de lecturas (LastReadingBadge). Se testea 100% para evitar
 * drift en formatos y edge cases.
 *
 * Reglas de formato (basadas en diff en milisegundos):
 * - futuro (diff < 0)         → "ahora"          (caso defensivo, no debería
 *                                                  ocurrir con data correcta)
 * - < 60s                     → "ahora"          (lectura fresca, sin minutos)
 * - 1-59 min                  → "Hace N min"
 * - 1-23 h                    → "Hace N h"
 * - 1-6 días                  → "Hace N días"
 * - 7-29 días                 → "Hace N sem"     (aproximado a semanas)
 * - ≥ 30 días                 → "Hace N meses"   (aproximado a meses)
 */
export function formatTimeSince(
  from: Date | string | null | undefined,
  now: Date = new Date()
): string {
  if (from === null || from === undefined) return '—';

  const fromDate = typeof from === 'string' ? new Date(from) : from;
  const diffMs = now.getTime() - fromDate.getTime();

  if (Number.isNaN(diffMs)) return '—';
  if (diffMs < 0) return 'ahora';
  if (diffMs < 60_000) return 'ahora';

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.floor(diffMs / 86_400_000);
  if (days < 7) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `Hace ${weeks} ${weeks === 1 ? 'sem' : 'sem'}`;
  }

  const months = Math.floor(days / 30);
  return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
}

/**
 * Determina si un timestamp está "stale" según el umbral HACCP.
 *
 * En V1, el umbral es fijo (2 horas) porque las sedes son pequeñas y
 * el ciclo de toma de lectura es sub-diario. En TASK-010 o posterior
 * podría pasar a ser configurable por equipo.
 */
export const STALE_THRESHOLD_MS = 2 * 60 * 60 * 1000;

export function isStaleReading(
  from: Date | string | null | undefined,
  now: Date = new Date()
): boolean {
  if (from === null || from === undefined) return true;
  const fromDate = typeof from === 'string' ? new Date(from) : from;
  if (Number.isNaN(fromDate.getTime())) return true;
  return now.getTime() - fromDate.getTime() >= STALE_THRESHOLD_MS;
}