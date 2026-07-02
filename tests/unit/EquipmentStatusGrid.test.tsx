import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EquipmentStatusGrid } from '@/features/readings/components/EquipmentStatusGrid';
import type { Equipment, TemperatureReading } from '@/shared/types/supabase';

const NOW = new Date('2026-07-01T12:00:00Z');

function makeEquipment(id: string, overrides: Partial<Equipment> = {}): Equipment {
  return {
    id,
    location_id: 'loc-1',
    name: `Equipo ${id}`,
    physical_location: null,
    code: null,
    min_temp: 0,
    max_temp: 6,
    is_iot_enabled: false,
    iot_device_id: null,
    created_at: '2026-06-30T00:00:00Z',
    ...overrides,
  };
}

function makeReading(equipmentId: string, value: number, minutesAgo: number): TemperatureReading {
  return {
    id: `r-${equipmentId}`,
    equipment_id: equipmentId,
    value,
    reading_type: 'manual',
    sensor_battery: null,
    sensor_signal: null,
    snapshot_min_temp: null,
    snapshot_max_temp: null,
    recorded_by_profile: null,
    recorded_by_staff: null,
    taken_by: null,
    recorded_at: new Date(NOW.getTime() - minutesAgo * 60_000).toISOString(),
  };
}

describe('EquipmentStatusGrid · empty state', () => {
  it('shows empty state card when equipmentList is empty', () => {
    render(
      <EquipmentStatusGrid equipmentList={[]} latestByEquipment={new Map()} now={NOW} />
    );

    expect(screen.getByTestId('equipment-status-grid-empty')).toBeInTheDocument();
    expect(screen.getByText(/Aún no hay equipos en esta sede/)).toBeInTheDocument();
  });

  it('links empty state to /equipment by default', () => {
    render(
      <EquipmentStatusGrid equipmentList={[]} latestByEquipment={new Map()} now={NOW} />
    );

    const link = screen.getByText('Ir a equipos');
    expect(link).toHaveAttribute('href', '/equipment');
  });

  it('accepts custom addEquipmentHref', () => {
    render(
      <EquipmentStatusGrid
        equipmentList={[]}
        latestByEquipment={new Map()}
        now={NOW}
        addEquipmentHref="/custom-path"
      />
    );

    expect(screen.getByText('Ir a equipos')).toHaveAttribute('href', '/custom-path');
  });
});

describe('EquipmentStatusGrid · populated state', () => {
  it('renders one card per equipment', () => {
    const equipment = [makeEquipment('eq-1'), makeEquipment('eq-2'), makeEquipment('eq-3')];

    render(
      <EquipmentStatusGrid
        equipmentList={equipment}
        latestByEquipment={new Map()}
        now={NOW}
      />
    );

    expect(screen.getByTestId('equipment-status-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('equipment-status-card')).toHaveLength(3);
  });

  it('passes the latest reading for each equipment from the map', () => {
    const equipment = [makeEquipment('eq-1'), makeEquipment('eq-2')];
    const latestByEquipment = new Map<string, TemperatureReading>([
      ['eq-1', makeReading('eq-1', 3.5, 5)],
      ['eq-2', makeReading('eq-2', 8.0, 30)],
    ]);

    render(
      <EquipmentStatusGrid
        equipmentList={equipment}
        latestByEquipment={latestByEquipment}
        now={NOW}
      />
    );

    const cards = screen.getAllByTestId('equipment-status-card');
    expect(cards[0].dataset.status).toBe('ok');
    expect(cards[1].dataset.status).toBe('alert');
  });

  it('renders no-reading status when equipment has no entry in the map', () => {
    const equipment = [makeEquipment('eq-1')];

    render(
      <EquipmentStatusGrid
        equipmentList={equipment}
        latestByEquipment={new Map()}
        now={NOW}
      />
    );

    expect(screen.getByTestId('equipment-status-card').dataset.status).toBe('no-reading');
  });
});