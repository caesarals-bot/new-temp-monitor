import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentFormDialog } from '@/features/equipment/components/EquipmentFormDialog';
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

describe('EquipmentFormDialog - create mode', () => {
  const onOpenChange = vi.fn();
  const onSubmitCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create title and description', () => {
    render(
      <EquipmentFormDialog
        open
        mode="create"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    expect(screen.getByText('Nuevo equipo')).toBeInTheDocument();
    expect(screen.getByText(/crea un nuevo equipo de frío en esta sede/i)).toBeInTheDocument();
  });

  it('submits with all fields', async () => {
    onSubmitCreate.mockResolvedValue(undefined);

    render(
      <EquipmentFormDialog
        open
        mode="create"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    await userEvent.clear(screen.getByLabelText(/nombre del equipo/i));
    await userEvent.type(screen.getByLabelText(/nombre del equipo/i), 'Refrigerador Lácteos');
    await userEvent.type(screen.getByLabelText(/ubicación física/i), 'Cocina');
    await userEvent.click(screen.getByRole('button', { name: /crear equipo/i }));

    await waitFor(() => {
      expect(onSubmitCreate).toHaveBeenCalled();
      const call = onSubmitCreate.mock.calls[0]?.[0];
      expect(call.name).toBe('Refrigerador Lácteos');
      expect(call.physicalLocation).toBe('Cocina');
      expect(typeof call.minTemp).toBe('number');
      expect(typeof call.maxTemp).toBe('number');
    });
  });

  it('shows validation error when name is too short', async () => {
    render(
      <EquipmentFormDialog
        open
        mode="create"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    await userEvent.clear(screen.getByLabelText(/nombre del equipo/i));
    await userEvent.type(screen.getByLabelText(/nombre del equipo/i), 'R');
    await userEvent.click(screen.getByRole('button', { name: /crear equipo/i }));

    expect(await screen.findByText(/al menos 2 caracteres/i)).toBeInTheDocument();
    expect(onSubmitCreate).not.toHaveBeenCalled();
  });

  it('shows validation error when minTemp is greater than maxTemp', async () => {
    render(
      <EquipmentFormDialog
        open
        mode="create"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    await userEvent.clear(screen.getByLabelText(/nombre del equipo/i));
    await userEvent.type(screen.getByLabelText(/nombre del equipo/i), 'Equipo Test');
    const minInput = screen.getByLabelText(/temp\. mínima/i);
    const maxInput = screen.getByLabelText(/temp\. máxima/i);
    await userEvent.clear(minInput);
    await userEvent.type(minInput, '10');
    await userEvent.clear(maxInput);
    await userEvent.type(maxInput, '0');
    await userEvent.click(screen.getByRole('button', { name: /crear equipo/i }));

    expect(await screen.findByText(/temperatura mínima debe ser menor que la máxima/i)).toBeInTheDocument();
    expect(onSubmitCreate).not.toHaveBeenCalled();
  });

  it('shows serverError in destructive alert', () => {
    render(
      <EquipmentFormDialog
        open
        mode="create"
        serverError="duplicate key value violates unique constraint"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    expect(screen.getByText('duplicate key value violates unique constraint')).toBeInTheDocument();
  });

  it('disables submit while isLoading', () => {
    render(
      <EquipmentFormDialog
        open
        mode="create"
        isLoading
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /creando/i })).toBeDisabled();
  });
});

describe('EquipmentFormDialog - edit mode', () => {
  const onOpenChange = vi.fn();
  const onSubmitEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders edit title and description', () => {
    render(
      <EquipmentFormDialog
        open
        mode="edit"
        equipment={sample}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    expect(screen.getByText('Editar equipo')).toBeInTheDocument();
  });

  it('preloads fields with equipment values', () => {
    render(
      <EquipmentFormDialog
        open
        mode="edit"
        equipment={sample}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    expect(screen.getByLabelText(/nombre del equipo/i)).toHaveValue('Refrigerador Lácteos');
    expect(screen.getByLabelText(/ubicación física/i)).toHaveValue('Cocina');
    expect(screen.getByLabelText(/código/i)).toHaveValue('EQ-001');
    expect(screen.getByLabelText(/temp\. mínima/i)).toHaveValue(0);
    expect(screen.getByLabelText(/temp\. máxima/i)).toHaveValue(6);
  });

  it('submits with explicit null when physicalLocation is cleared', async () => {
    onSubmitEdit.mockResolvedValue(undefined);

    render(
      <EquipmentFormDialog
        open
        mode="edit"
        equipment={sample}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    await userEvent.clear(screen.getByLabelText(/ubicación física/i));
    await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(onSubmitEdit).toHaveBeenCalledWith('eq-1', expect.objectContaining({
        physicalLocation: null,
        code: 'EQ-001',
        name: 'Refrigerador Lácteos',
      }));
    });
  });

  it('submits with explicit null when code is cleared', async () => {
    onSubmitEdit.mockResolvedValue(undefined);

    render(
      <EquipmentFormDialog
        open
        mode="edit"
        equipment={sample}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    await userEvent.clear(screen.getByLabelText(/código/i));
    await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(onSubmitEdit).toHaveBeenCalledWith('eq-1', expect.objectContaining({
        code: null,
      }));
    });
  });

  it('disables submit while isLoading in edit mode', () => {
    render(
      <EquipmentFormDialog
        open
        mode="edit"
        equipment={sample}
        isLoading
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
  });
});
