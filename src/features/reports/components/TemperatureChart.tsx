import { forwardRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceArea,
} from 'recharts';
import type { Equipment, TemperatureReading } from '@/shared/types/supabase';

export interface TemperatureChartProps {
  readings: TemperatureReading[];
  equipment: Pick<Equipment, 'id' | 'name' | 'min_temp' | 'max_temp'> | null;
}

interface ChartPoint {
  ts: number;
  label: string;
  value: number;
}

export const TemperatureChart = forwardRef<HTMLDivElement, TemperatureChartProps>(
  function TemperatureChart({ readings, equipment }, ref) {
    if (!equipment) {
      return (
        <div
          ref={ref}
          className="rounded-md border border-[--color-border] bg-white p-8 text-center text-sm text-[--color-text-muted]"
        >
          Selecciona un equipo para ver el gráfico.
        </div>
      );
    }

    const data: ChartPoint[] = readings
      .filter((r) => r.equipment_id === equipment.id)
      .map((r) => ({
        ts: new Date(r.recorded_at).getTime(),
        label: new Date(r.recorded_at).toLocaleString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        value: r.value,
      }))
      .sort((a, b) => a.ts - b.ts);

    if (data.length === 0) {
      return (
        <div
          ref={ref}
          className="rounded-md border border-[--color-border] bg-white p-8 text-center text-sm text-[--color-text-muted]"
        >
          Sin lecturas para este equipo en el período seleccionado.
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="rounded-md border border-[--color-border] bg-white p-4"
        data-testid="temperature-chart"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[--color-text-primary]">{equipment.name}</h3>
          <span className="font-mono text-xs text-[--color-text-muted]">
            {equipment.min_temp}°C a {equipment.max_temp}°C
          </span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D8E6E2" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#4A6070' }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10, fill: '#4A6070' }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #D8E6E2',
                borderRadius: 4,
                fontSize: 12,
              }}
            />
            <ReferenceArea
              y1={equipment.min_temp}
              y2={equipment.max_temp}
              fill="#E8F5F2"
              fillOpacity={0.4}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2E7D6B"
              strokeWidth={2}
              dot={{ r: 3, fill: '#2E7D6B' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);
