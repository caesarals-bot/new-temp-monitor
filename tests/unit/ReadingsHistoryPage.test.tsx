import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

let mockActiveLocationId: string | null = 'loc-1';
const mockLocations: Array<{ id: string; name: string }> = [
  { id: 'loc-1', name: 'Casa Central' },
  { id: 'loc-2', name: 'Sucursal Norte' },
];

vi.mock('@/features/organizations/store/organization.store', () => ({
  useOrganizationStore: Object.assign(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        organization: { id: 'org-1' },
        locations: mockLocations,
        activeLocationId: mockActiveLocationId,
        setActiveLocation: vi.fn(),
        fetchLocations: vi.fn().mockResolvedValue(undefined),
      }),
    { getState: () => ({}) }
  ),
}));

let mockDevBypass = true;

vi.mock('@/shared/lib/dev-bypass', () => ({
  isDevBypassEnabled: () => mockDevBypass,
}));

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/features/equipment/services/equipment.service', () => ({
  listEquipmentByLocation: vi.fn(),
}));

vi.mock('@/features/readings/services/readings.service', () => ({
  listReadingsByLocation: vi.fn(),
}));

import { listEquipmentByLocation } from '@/features/equipment/services/equipment.service';
import { listReadingsByLocation } from '@/features/readings/services/readings.service';
import { ReadingsHistoryPage } from '@/features/readings/pages/ReadingsHistoryPage';
import type { Equipment, TemperatureReading } from '@/shared/types/supabase';

const sampleEquipment: Equipment = {
  id: 'eq-1',
  location_id: 'loc-1',
  name: 'Refrigerador Lácteos',
  physical_location: 'Cocina',
  code: 'EQ-001',
  min_temp: 0,
  max_temp: 6,
  is_iot_enabled: false,
  iot_device_id: null,
  created_at: '2026-06-30T00:00:00Z',
};

const sampleReading: TemperatureReading = {
  id: 'r-1',
  equipment_id: 'eq-1',
  value: 3.5,
  reading_type: 'manual',
  sensor_battery: null,
  sensor_signal: null,
  snapshot_min_temp: null,
  snapshot_max_temp: null,
  recorded_by_profile: null,
  recorded_by_staff: null,
  taken_by: null,
  recorded_at: '2026-07-01T11:55:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockActiveLocationId = 'loc-1';
  mockDevBypass = true;
  (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: [sampleEquipment],
    error: null,
  });
  (listReadingsByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: [sampleReading],
    error: null,
  });
});

describe('ReadingsHistoryPage · composition', () => {
  it('renders header with active location name', () => {
    render(<ReadingsHistoryPage />);
    expect(screen.getByText('Estado de equipos')).toBeInTheDocument();
    expect(screen.getByText('Casa Central')).toBeInTheDocument();
  });

  it('renders the equipment status grid with the latest reading per equipment', async () => {
    render(<ReadingsHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('equipment-status-grid')).toBeInTheDocument();
    });

    const card = screen.getByTestId('equipment-status-card');
    expect(card.dataset.status).toBe('ok');
    expect(screen.getByTestId('latest-reading-value')).toHaveTextContent('3.5°C');
  });

  it('shows empty state when there are no equipment', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    render(<ReadingsHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('equipment-status-grid-empty')).toBeInTheDocument();
    });
  });

  it('shows the empty-state card without active location', () => {
    mockActiveLocationId = null;

    render(<ReadingsHistoryPage />);

    expect(screen.getByText('Sin sede seleccionada')).toBeInTheDocument();
    expect(screen.queryByTestId('equipment-status-grid')).not.toBeInTheDocument();
  });

  it('renders alert status when reading is out of range', async () => {
    (listReadingsByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [{ ...sampleReading, value: 8.2 }],
      error: null,
    });

    render(<ReadingsHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('equipment-status-card').dataset.status).toBe('alert');
    });
  });

  it('shows error banner when equipment fetch fails', async () => {
    (listEquipmentByLocation as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: 'eq boom' },
    });

    render(<ReadingsHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('readings-error')).toHaveTextContent('eq boom');
    });
  });

  it('does not show realtime badge in dev-bypass mode', async () => {
    render(<ReadingsHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('equipment-status-grid')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('realtime-badge')).not.toBeInTheDocument();
  });
});