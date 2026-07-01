import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentCard } from '@/features/equipment/components/EquipmentCard';
import type { Equipment } from '@/shared/types/supabase';

const sample: Equipment = {
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

const minimal: Equipment = {
  ...sample,
  id: 'eq-2',
  name: 'Equipo Sin Detalles',
  physical_location: null,
  code: null,
};

describe('EquipmentCard', () => {
  it('renders name, physical location, temp range, code and readings count', () => {
    render(
      <EquipmentCard
        equipment={sample}
        readingsCount={24}
        canEdit
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Refrigerador Lácteos')).toBeInTheDocument();
    expect(screen.getByText('Cocina - pared norte')).toBeInTheDocument();
    expect(screen.getByText('0°C a 6°C')).toBeInTheDocument();
    expect(screen.getByText('EQ-CC-001')).toBeInTheDocument();
    expect(screen.getByText('24 lecturas')).toBeInTheDocument();
  });

  it('uses singular "lectura" when count is 1', () => {
    render(
      <EquipmentCard
        equipment={sample}
        readingsCount={1}
        canEdit
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('1 lectura')).toBeInTheDocument();
  });

  it('hides physical location when null', () => {
    render(
      <EquipmentCard
        equipment={minimal}
        readingsCount={0}
        canEdit
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByText('Cocina - pared norte')).toBeNull();
  });

  it('hides code when null', () => {
    render(
      <EquipmentCard
        equipment={minimal}
        readingsCount={0}
        canEdit
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByText('EQ-CC-001')).toBeNull();
  });

  it('hides action buttons when canEdit is false', () => {
    render(
      <EquipmentCard
        equipment={sample}
        readingsCount={0}
        canEdit={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /editar/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /eliminar/i })).toBeNull();
  });

  it('shows action buttons when canEdit is true', () => {
    render(
      <EquipmentCard
        equipment={sample}
        readingsCount={0}
        canEdit
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /editar refrigerador/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eliminar refrigerador/i })).toBeInTheDocument();
  });

  it('calls onEdit with equipment when edit is clicked', async () => {
    const onEdit = vi.fn();
    render(
      <EquipmentCard
        equipment={sample}
        readingsCount={0}
        canEdit
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /editar/i }));
    expect(onEdit).toHaveBeenCalledWith(sample);
  });

  it('calls onDelete with equipment when delete is clicked', async () => {
    const onDelete = vi.fn();
    render(
      <EquipmentCard
        equipment={sample}
        readingsCount={0}
        canEdit
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }));
    expect(onDelete).toHaveBeenCalledWith(sample);
  });
});
