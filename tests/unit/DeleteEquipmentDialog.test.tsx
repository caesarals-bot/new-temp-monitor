import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteEquipmentDialog } from '@/features/equipment/components/DeleteEquipmentDialog';
import type { Equipment } from '@/shared/types/supabase';

const sample: Equipment = {
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

describe('DeleteEquipmentDialog', () => {
  const onOpenChange = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing visible when equipment is null', () => {
    const { container } = render(
      <DeleteEquipmentDialog
        open
        equipment={null}
        readingsCount={0}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('shows simple confirmation when there are no readings', () => {
    render(
      <DeleteEquipmentDialog
        open
        equipment={sample}
        readingsCount={0}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/¿estás seguro de que quieres eliminar el equipo/i)).toBeInTheDocument();
    expect(screen.queryByText(/tiene lecturas registradas/i)).toBeNull();
  });

  it('shows destructive warning with readings count when > 0', () => {
    render(
      <DeleteEquipmentDialog
        open
        equipment={sample}
        readingsCount={42}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText('Este equipo tiene lecturas registradas')).toBeInTheDocument();
    expect(screen.getByText(/42 lecturas/i)).toBeInTheDocument();
  });

  it('uses singular "lectura" when count is 1', () => {
    render(
      <DeleteEquipmentDialog
        open
        equipment={sample}
        readingsCount={1}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/1 lectura\b/i)).toBeInTheDocument();
  });

  it('shows loading state when readingsCount is null', () => {
    render(
      <DeleteEquipmentDialog
        open
        equipment={sample}
        readingsCount={null}
        isLoadingCount
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/calculando dependencias/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eliminar equipo/i })).toBeDisabled();
  });

  it('disables confirm button while deleting', () => {
    render(
      <DeleteEquipmentDialog
        open
        equipment={sample}
        readingsCount={0}
        isDeleting
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByRole('button', { name: /eliminando/i })).toBeDisabled();
  });

  it('shows serverError in destructive alert', () => {
    render(
      <DeleteEquipmentDialog
        open
        equipment={sample}
        readingsCount={0}
        serverError="No se puede eliminar: foreign key violation"
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText('No se puede eliminar: foreign key violation')).toBeInTheDocument();
  });

  it('calls onConfirm with equipment when confirm is clicked', async () => {
    onConfirm.mockResolvedValue(undefined);

    render(
      <DeleteEquipmentDialog
        open
        equipment={sample}
        readingsCount={0}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /eliminar equipo/i }));
    expect(onConfirm).toHaveBeenCalledWith(sample);
  });

  it('calls onOpenChange(false) when cancel is clicked', async () => {
    render(
      <DeleteEquipmentDialog
        open
        equipment={sample}
        readingsCount={0}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('triggers onConfirm when Enter is pressed and count is loaded', async () => {
    onConfirm.mockResolvedValue(undefined);

    render(
      <DeleteEquipmentDialog
        open
        equipment={sample}
        readingsCount={0}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(sample);
    });
  });
});
