import { forwardRef, useMemo } from 'react';
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
import type { IncidentWithReading } from '@/features/incidents/types';
import type { TemperatureReading } from '@/shared/types/supabase';
import {
  buildDailyBand,
  buildEquipmentSeries,
  buildIncidentDailySeries,
  type EquipmentRangeRef,
} from '../lib/reportCharts';

export interface VariationChartsProps {
  readings: TemperatureReading[];
  equipmentList: EquipmentRangeRef[];
  incidents: IncidentWithReading[];
  /** Equipo seleccionado para resaltar (opcional). */
  selectedEquipmentId?: string | null;
}

const COLORS = ['#2E7D6B', '#E07A5F', '#3D5A80', '#8A9BA8', '#C9A227', '#6B4F8E'];

function formatValue(value: number | undefined): string {
  return value === undefined ? '' : `${value}°C`;
}

function chartTooltipStyle() {
  return {
    background: '#FFFFFF',
    border: '1px solid var(--color-border)',
    borderRadius: 4,
    fontSize: 12,
    padding: '4px 8px',
  };
}

/**
 * Gráficos de variación del período, compactos:
 *
 * - "Evolución por equipo": líneas de temperatura por equipo (comparación).
 * - "Temperatura diaria": promedio/mín/máx por día (tendencia general).
 * - "Incidentes por día": abiertos vs resueltos.
 *
 * El primer card (evolución) expone un ref para que el PDF pueda capturarlo.
 */
export const VariationCharts = forwardRef<HTMLDivElement, VariationChartsProps>(
  function VariationCharts({ readings, equipmentList, incidents, selectedEquipmentId }, ref) {
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
    const incidentDaily = useMemo(() => buildIncidentDailySeries(incidents), [incidents]);

    const selectedEquipment = selectedEquipmentId
      ? (equipmentList.find((e) => e.id === selectedEquipmentId) ?? null)
      : null;

    // Cada serie usa el NOMBRE del equipo como columna (no el id) para que la
    // leyenda y el tooltip muestren el nombre legible.
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
          row[s.name] = p.value;
        }
      }
      return rows;
    }, [series]);

    if (readings.length === 0) {
      return null;
    }

    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="variation-equipment-chart">
          <div ref={ref}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {selectedEquipment ? selectedEquipment.name : 'Evolución por equipo'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {series.length === 0 || multiLineData.length === 0 ? (
                <p className="py-4 text-center text-sm text-[--color-text-muted]">
                  Sin lecturas para mostrar.
                </p>
              ) : (
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={multiLineData}
                      margin={{ top: 5, right: 8, bottom: 0, left: -18 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
                      <Tooltip
                        formatter={(value) => formatValue(value as number)}
                        contentStyle={chartTooltipStyle()}
                      />
                      {series.length > 1 && <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />}
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
                          dataKey={s.name}
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
          </div>
        </Card>

        <Card data-testid="variation-daily-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {selectedEquipment ? 'Temperatura diaria' : 'Promedio diario por día'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyBand.length === 0 ? (
              <p className="py-4 text-center text-sm text-[--color-text-muted]">
                Sin lecturas para mostrar.
              </p>
            ) : (
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyBand} margin={{ top: 5, right: 8, bottom: 0, left: -18 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
                    <Tooltip
                      formatter={(value) => formatValue(value as number)}
                      contentStyle={chartTooltipStyle()}
                    />
                    <Bar dataKey="min" name="Mín" fill="#8A9BA8" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="avg" name="Promedio" fill="#2E7D6B" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="max" name="Máx" fill="#E07A5F" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="incident-daily-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Incidentes por día</CardTitle>
          </CardHeader>
          <CardContent>
            {incidentDaily.length === 0 ? (
              <p className="py-4 text-center text-sm text-[--color-text-muted]">
                Sin incidentes en el período.
              </p>
            ) : (
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={incidentDaily}
                    margin={{ top: 5, right: 8, bottom: 0, left: -18 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                    <Tooltip contentStyle={chartTooltipStyle()} />
                    <Bar dataKey="open" name="Abiertos" fill="#E07A5F" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="resolved" name="Resueltos" fill="#2E7D6B" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
);
