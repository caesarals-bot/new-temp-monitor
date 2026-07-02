import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EquipmentStatusCard } from '@/features/readings/components/EquipmentStatusCard';
import type { Equipment, TemperatureReading } from '@/shared/types/supabase';

const NOW = new Date('2026-07-01T12:00:00Z');

const equipment: Equipment = {
  id: 'eq-1',
  location_id: 'loc-1',
  name: 'Refrigerador Lácteos',
  physical_location: 'Cocina - pared norte',
  code: 'EQ-CC-001',
  min_temp: 0,
  max_temp: 6,
  is_iot_enabled: false,
  iot_device_id: null,
  created_at: '2026-06-30T00:00:00Z',
};

function makeReading(value: number, recordedAt: string): TemperatureReading {
  return {
    id: 'r-1',
    equipment_id: 'eq-1',
    value,
    reading_type: 'manual',
    sensor_battery: null,
    sensor_signal: null,
    snapshot_min_temp: null,
    snapshot_max_temp: null,
    recorded_by_profile: null,
    recorded_by_staff: null,
    taken_by: null,
    recorded_at: recordedAt,
  };
}

describe('EquipmentStatusCard · status derivation', () => {
  it('renders "ok" status when reading is within range', () => {
    const reading = makeReading(3.5, new Date(NOW.getTime() - 5 * 60_000).toISOString());

    render(
      <EquipmentStatusCard equipment={equipment} latestReading={reading} now={NOW} />
    );

    const card = screen.getByTestId('equipment-status-card');
    expect(card.dataset.status).toBe('ok');
    expect(screen.getByTestId('latest-reading-value')).toHaveTextContent('3.5°C');
  });

  it('renders "alert" status when reading is above max_temp', () => {
    const reading = makeReading(8.2, new Date(NOW.getTime() - 5 * 60_000).toISOString());

    render(
      <EquipmentStatusCard equipment={equipment} latestReading={reading} now={NOW} />
    );

    const card = screen.getByTestId('equipment-status-card');
    expect(card.dataset.status).toBe('alert');
    const value = screen.getByTestId('latest-reading-value');
    expect(value).toHaveTextContent('8.2°C');
    expect(value.className).toContain('text-[--color-danger]');
  });

  it('renders "alert" status when reading is below min_temp', () => {
    const cold = { ...equipment, min_temp: -22, max_temp: -15 };
    const reading = makeReading(-25, new Date(NOW.getTime() - 5 * 60_000).toISOString());

    render(
      <EquipmentStatusCard equipment={cold} latestReading={reading} now={NOW} />
    );

    expect(screen.getByTestId('equipment-status-card').dataset.status).toBe('alert');
  });

  it('renders "no-reading" status when latestReading is null', () => {
    render(<EquipmentStatusCard equipment={equipment} latestReading={null} now={NOW} />);

    const card = screen.getByTestId('equipment-status-card');
    expect(card.dataset.status).toBe('no-reading');
    expect(screen.getByTestId('latest-reading-value')).toHaveTextContent('—');
    expect(screen.getByTestId('last-reading-badge')).toHaveTextContent('Sin lecturas');
  });

  it('treats equal-to-min as ok (boundary inclusive)', () => {
    const reading = makeReading(0, new Date(NOW.getTime() - 5 * 60_000).toISOString());

    render(
      <EquipmentStatusCard equipment={equipment} latestReading={reading} now={NOW} />
    );

    expect(screen.getByTestId('equipment-status-card').dataset.status).toBe('ok');
  });

  it('treats equal-to-max as ok (boundary inclusive)', () => {
    const reading = makeReading(6, new Date(NOW.getTime() - 5 * 60_000).toISOString());

    render(
      <EquipmentStatusCard equipment={equipment} latestReading={reading} now={NOW} />
    );

    expect(screen.getByTestId('equipment-status-card').dataset.status).toBe('ok');
  });
});

describe('EquipmentStatusCard · display', () => {
  it('shows equipment name and physical location', () => {
    const reading = makeReading(3.5, new Date(NOW.getTime() - 5 * 60_000).toISOString());

    render(
      <EquipmentStatusCard equipment={equipment} latestReading={reading} now={NOW} />
    );

    expect(screen.getByText('Refrigerador Lácteos')).toBeInTheDocument();
    expect(screen.getByText('Cocina - pared norte')).toBeInTheDocument();
  });

  it('shows the configured min/max range', () => {
    const reading = makeReading(3.5, new Date(NOW.getTime() - 5 * 60_000).toISOString());

    render(
      <EquipmentStatusCard equipment={equipment} latestReading={reading} now={NOW} />
    );

    expect(screen.getByText('0°C / 6°C')).toBeInTheDocument();
  });

  it('passes through now prop to LastReadingBadge for stale detection', () => {
    const stale = makeReading(3.5, new Date(NOW.getTime() - 5 * 3_600_000).toISOString());

    render(
      <EquipmentStatusCard equipment={equipment} latestReading={stale} now={NOW} />
    );

    const badge = screen.getByTestId('last-reading-badge');
    expect(badge.dataset.state).toBe('stale');
  });
});