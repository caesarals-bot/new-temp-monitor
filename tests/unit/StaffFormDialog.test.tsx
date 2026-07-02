import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StaffFormDialog } from '@/features/staff/components/StaffFormDialog';
import type { Staff } from '@/shared/types/supabase';

const sampleStaff: Staff = {
  id: 'staff-1',
  location_id: 'loc-1',
  name: 'María López',
  role: 'Cocinera',
  active: true,
  created_at: '2026-06-30T00:00:00Z',
  updated_at: '2026-06-30T00:00:00Z',
};

describe('StaffFormDialog - create mode', () => {
  const onOpenChange = vi.fn();
  const onSubmitCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create title and description when open', () => {
    render(
      <StaffFormDialog
        open
        mode="create"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    expect(screen.getByText('Nueva persona')).toBeInTheDocument();
    expect(screen.getByText(/agrega una nueva persona al personal de esta sede/i)).toBeInTheDocument();
  });

  it('submits name and role', async () => {
    onSubmitCreate.mockResolvedValue(undefined);

    render(
      <StaffFormDialog
        open
        mode="create"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Pedro Ramírez');
    await userEvent.type(screen.getByLabelText(/puesto/i), 'Auxiliar de cocina');
    await userEvent.click(screen.getByRole('button', { name: /agregar persona/i }));

    await waitFor(() => {
      expect(onSubmitCreate).toHaveBeenCalledWith({
        name: 'Pedro Ramírez',
        role: 'Auxiliar de cocina',
      });
    });
  });

  it('shows validation error when name is too short', async () => {
    render(
      <StaffFormDialog
        open
        mode="create"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText(/nombre/i), 'M');
    await userEvent.type(screen.getByLabelText(/puesto/i), 'Cocinera');
    await userEvent.click(screen.getByRole('button', { name: /agregar persona/i }));

    expect(await screen.findByText(/al menos 2 caracteres/i)).toBeInTheDocument();
    expect(onSubmitCreate).not.toHaveBeenCalled();
  });

  it('shows validation error when role is too short', async () => {
    render(
      <StaffFormDialog
        open
        mode="create"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText(/nombre/i), 'María');
    await userEvent.type(screen.getByLabelText(/puesto/i), 'A');
    await userEvent.click(screen.getByRole('button', { name: /agregar persona/i }));

    expect(await screen.findByText(/puesto debe tener al menos 2 caracteres/i)).toBeInTheDocument();
    expect(onSubmitCreate).not.toHaveBeenCalled();
  });

  it('shows serverError in destructive alert', () => {
    render(
      <StaffFormDialog
        open
        mode="create"
        serverError="No se pudo crear la persona"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    expect(screen.getByText('No se pudo crear la persona')).toBeInTheDocument();
  });

  it('disables submit button while isLoading', () => {
    render(
      <StaffFormDialog
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

describe('StaffFormDialog - edit mode', () => {
  const onOpenChange = vi.fn();
  const onSubmitEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders edit title and description when open', () => {
    render(
      <StaffFormDialog
        open
        mode="edit"
        staff={sampleStaff}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    expect(screen.getByText('Editar persona')).toBeInTheDocument();
    expect(screen.getByText(/modifica el nombre o el puesto/i)).toBeInTheDocument();
  });

  it('preloads fields with staff values', () => {
    render(
      <StaffFormDialog
        open
        mode="edit"
        staff={sampleStaff}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    expect(screen.getByLabelText(/nombre/i)).toHaveValue('María López');
    expect(screen.getByLabelText(/puesto/i)).toHaveValue('Cocinera');
  });

  it('submits updated values', async () => {
    onSubmitEdit.mockResolvedValue(undefined);

    render(
      <StaffFormDialog
        open
        mode="edit"
        staff={sampleStaff}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    const nameInput = screen.getByLabelText(/nombre/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'María L.');
    await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(onSubmitEdit).toHaveBeenCalledWith('staff-1', {
        name: 'María L.',
        role: 'Cocinera',
      });
    });
  });

  it('shows validation error when both fields are empty in edit', async () => {
    render(
      <StaffFormDialog
        open
        mode="edit"
        staff={sampleStaff}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    await userEvent.clear(screen.getByLabelText(/nombre/i));
    await userEvent.clear(screen.getByLabelText(/puesto/i));
    await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    const errors = await screen.findAllByText(/al menos 2 caracteres/i);
    expect(errors).toHaveLength(2);
    expect(onSubmitEdit).not.toHaveBeenCalled();
  });

  it('disables submit button with isLoading label in edit mode', () => {
    render(
      <StaffFormDialog
        open
        mode="edit"
        staff={sampleStaff}
        isLoading
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
  });
});
