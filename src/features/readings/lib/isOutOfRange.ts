/**
 * Determina si un valor de temperatura está fuera del rango aceptable
 * definido por un equipo.
 *
 * Es una función pura sin dependencias externas: recibe el valor y los
 * límites, retorna boolean. Es la única lógica compartida entre la
 * advertencia visual del form (TASK-008) y el motor de incidentes HACCP
 * (TASK-010). Se testea 100% para evitar drift.
 */
export function isOutOfRange(
  value: number | null | undefined,
  minTemp: number,
  maxTemp: number
): boolean {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return false;
  }
  return value < minTemp || value > maxTemp;
}

/**
 * Devuelve el tipo de desvío: 'low' si está bajo el mínimo, 'high' si
 * está sobre el máximo, o null si está en rango. Útil para mostrar
 * mensajes específicos en la UI ("por debajo" vs "por encima").
 */
export function outOfRangeDirection(
  value: number | null | undefined,
  minTemp: number,
  maxTemp: number
): 'low' | 'high' | null {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  if (value < minTemp) return 'low';
  if (value > maxTemp) return 'high';
  return null;
}