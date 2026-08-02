import { isOutOfRange } from '@/features/readings/lib/isOutOfRange';
import { Badge } from '@/shared/components/ui/badge';
import type { TemperatureReading } from '@/shared/types/supabase';

export interface ReadingsTableProps {
  readings: TemperatureReading[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

/**
 * Tabla de lecturas del período, compacta: padding reducido, tipografía
 * pequeña y ancho máximo (con scroll horizontal) para no ocupar todo el
 * viewport en pantallas grandes.
 */
export function ReadingsTable({
  readings,
  totalPages,
  currentPage,
  onPageChange,
}: ReadingsTableProps) {
  if (readings.length === 0) {
    return (
      <div className="rounded-md border border-[--color-border] bg-white p-8 text-center text-sm text-[--color-text-muted]">
        Sin lecturas en el período seleccionado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[--color-border] bg-white">
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full text-xs" data-testid="readings-table">
          <thead className="sticky top-0 bg-[--color-surface] text-left text-[10px] font-medium uppercase tracking-wide text-[--color-text-secondary]">
            <tr>
              <th className="px-3 py-2">Fecha y hora</th>
              <th className="px-3 py-2">Equipo</th>
              <th className="px-3 py-2">Temp.</th>
              <th className="px-3 py-2">Rango</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Operario</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((r) => {
              const min = r.snapshot_min_temp;
              const max = r.snapshot_max_temp;
              const outOfRange =
                min !== null && max !== null ? isOutOfRange(r.value, min, max) : false;
              return (
                <tr key={r.id} className="border-t border-[--color-border] align-middle">
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[11px]">
                    {new Date(r.recorded_at).toLocaleString('es-CL')}
                  </td>
                  <td className="max-w-[140px] truncate px-3 py-1.5 font-mono text-[11px]">
                    {r.equipment_id.slice(0, 8)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono">
                    <span
                      className={outOfRange ? 'text-[--color-danger]' : 'text-[--color-eucalyptus]'}
                    >
                      {r.value}°C
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-1.5 text-[11px]">
                    {min !== null && max !== null ? `${min}°C a ${max}°C` : '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-1.5">
                    {outOfRange ? (
                      <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                        Fuera de rango
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-[--color-eucalyptus-bg] px-1.5 py-0 text-[10px] text-[--color-eucalyptus]"
                      >
                        OK
                      </Badge>
                    )}
                  </td>
                  <td className="max-w-[120px] truncate px-3 py-1.5 text-[11px] text-[--color-text-secondary]">
                    {r.taken_by ?? r.recorded_by_profile?.slice(0, 8) ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-[--color-border] bg-[--color-surface] px-4 py-2 text-xs text-[--color-text-secondary]">
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded border border-[--color-border] px-2 py-1 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded border border-[--color-border] px-2 py-1 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
