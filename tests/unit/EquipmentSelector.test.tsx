import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentSelector } from '@/features/readings/components/EquipmentSelector';
import type { Equipment } from '@/shared/types/supabase';

const equipmentList: Equipment[] = [
  {
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
  },
  {
    id: 'eq-2',
    location_id: 'loc-1',
    name: 'Congelador Carnes',
    physical_location: 'Bodega',
    code: 'EQ-002',
    min_temp: -22,
    max_temp: -15,
    is_iot_enabled: false,
    iot_device_id: null,
    created_at: '2026-06-30T00:00:00Z',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EquipmentSelector', () => {
  it('renders trigger with placeholder when no value', () => {
    render(
      <EquipmentSelector
        equipmentList={equipmentList}
        value=""
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('Selecciona un equipo')).toBeInTheDocument();
  });

  it('renders equipment label and range in trigger when selected', () => {
    render(
      <EquipmentSelector
        equipmentList={equipmentList}
        value="eq-1"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Refrigerador Lácteos/)).toBeInTheDocument();
  });

  it('opens dropdown and shows both equipment with their ranges', async () => {
    render(
      <EquipmentSelector
        equipmentList={equipmentList}
        value=""
        onChange={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('combobox'));

    expect(await screen.findByRole('option', { name: /Refrigerador Lácteos.*0°C a 6°C/ })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: /Congelador Carnes.*-22°C a -15°C/ })).toBeInTheDocument();
  });

  it('calls onChange when an option is selected', async () => {
    const onChange = vi.fn();
    render(
      <EquipmentSelector
        equipmentList={equipmentList}
        value=""
        onChange={onChange}
      />
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: /Congelador Carnes/ }));

    expect(onChange).toHaveBeenCalledWith('eq-2');
  });

  it('disables trigger when disabled prop is true', () => {
    render(
      <EquipmentSelector
        equipmentList={equipmentList}
        value=""
        onChange={vi.fn()}
        disabled
      />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('disables trigger when equipmentList is empty', () => {
    render(
      <EquipmentSelector
        equipmentList={[]}
        value=""
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('shows error message when error prop is provided', () => {
    render(
      <EquipmentSelector
        equipmentList={equipmentList}
        value=""
        onChange={vi.fn()}
        error="Equipo requerido"
      />
    );
    expect(screen.getByText('Equipo requerido')).toBeInTheDocument();
  });

  it('sets aria-invalid on trigger when error', () => {
    render(
      <EquipmentSelector
        equipmentList={equipmentList}
        value=""
        onChange={vi.fn()}
        error="Selecciona un equipo"
      />
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });
});