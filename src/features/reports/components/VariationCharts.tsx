import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceArea,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { TemperatureReading } from '@/shared/types/supabase';
import { buildDailyBand, buildEquipmentSeries, type EquipmentRangeRef } from '../lib/reportCharts';

export interface VariationChartsProps {
  readings: TemperatureReading[];
  equipmentList: EquipmentRangeRef[];
  /** Equipo seleccionado para resaltar (opcional). */
  selectedEquipmentId?: string | null;
}

const COLORS = ['#2E7D6B', '#E07A5F', '#3D5A80', '#8A9BA8', '#C9A227', '#6B4F8E'];

function formatValue(value: number | undefined): string {
  return value === undefined ? '' : `${value}°C`;
}

/**
 * Gráficos de variación de temperatura del período.
 *
 * - "Evolución por equipo": líneas de temperatura por equipo (comparación).
 * - "Banda diaria": promedio/mín/máx por día (tendencia general).
 *
 * Cuando hay un equipo seleccionado, la evolución muestra solo ese equipo y la
 * banda diaria usa sus lecturas (el rango de referencia se marca como área).
 */
export function VariationCharts({
  readings,
  equipmentList,
  selectedEquipmentId,
}: VariationChartsProps) {
  const series = useMemo(
    () => buildEquipmentSeries(readings, equipmentList, selectedEquipmentId),
    [readings, equipmentList, selectedEquipmentId]
  );

  const filteredForDaily = useMemo(
    () =>
      selectedEquipmentId
        ? readings.filter((r) => r.equipment_id === selectedEquipmentId)
        : readings,
    [readings, selectedEquipmentId]
  );
  const dailyBand = useMemo(() => buildDailyBand(filteredForDaily), [filteredForDaily]);

  const selectedEquipment = selectedEquipmentId
    ? (equipmentList.find((e) => e.id === selectedEquipmentId) ?? null)
    : null;

  // Datos para el chart multi-línea: combinamos por timestamp (simplificación:
  // cada punto es una lectura con su equipo, Recharts agrupa por `label`).
  const multiLineData = useMemo(() => {
    const rows: Record<string, number | string>[] = [];
    const indexByLabel = new Map<string, number>();
    for (const s of series) {
      for (const p of s.points) {
        const existing = indexByLabel.get(p.label);
        let row = existing !== undefined ? rows[existing] : undefined;
        if (!row) {
          row = { label: p.label };
          indexByLabel.set(p.label, rows.length);
          rows.push(row);
        }
        row[s.equipmentId] = p.value;
      }
    }
    return rows;
  }, [series]);

  if (readings.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card data-testid="variation-equipment-chart">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {selectedEquipment ? selectedEquipment.name : 'Evolución por equipo'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {series.length === 0 || multiLineData.length === 0 ? (
            <p className="py-6 text-center text-sm text-[--color-text-muted]">
              Sin lecturas para mostrar.
            </p>
          ) : (
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={multiLineData}
                  margin={{ top: 5, right: 10, bottom: 0, left: -18 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip
                    formatter={(value) => formatValue(value as number)}
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  />
                  {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
                  {selectedEquipment && (
                    <ReferenceArea
                      y1={selectedEquipment.min_temp}
                      y2={selectedEquipment.max_temp}
                      fill="#E8F5F2"
                      fillOpacity={0.4}
                    />
                  )}
                  {series.map((s, i) => (
                    <Line
                      key={s.equipmentId}
                      type="monotone"
                      dataKey={s.equipmentId}
                      name={s.name}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="variation-daily-chart">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {selectedEquipment ? 'Temperatura diaria' : 'Promedio diario por día'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyBand.length === 0 ? (
            <p className="py-6 text-center text-sm text-[--color-text-muted]">
              Sin lecturas para mostrar.
            </p>
          ) : (
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyBand} margin={{ top: 5, right: 10, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip
                    formatter={(value) => formatValue(value as number)}
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="min" name="Mín" fill="#8A9BA8" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="avg" name="Promedio" fill="#2E7D6B" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="max" name="Máx" fill="#E07A5F" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
