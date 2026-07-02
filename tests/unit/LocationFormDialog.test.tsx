import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationFormDialog } from '@/features/locations/components/LocationFormDialog';
import type { Location } from '@/shared/types/supabase';

const sampleLocation: Location = {
  id: 'loc-1',
  organization_id: 'org-1',
  name: 'Casa Central',
  address: 'Av. Demo 123',
  created_at: '2026-06-30T00:00:00Z',
};

describe('LocationFormDialog - create mode', () => {
  const onOpenChange = vi.fn();
  const onSubmitCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create title and description when open', () => {
    render(
      <LocationFormDialog
        open
        mode="create"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    expect(screen.getByText('Nueva sede')).toBeInTheDocument();
    expect(screen.getByText('Crea una nueva sede para tu organización.')).toBeInTheDocument();
  });

  it('submits trimmed payload with name and address', async () => {
    onSubmitCreate.mockResolvedValue(undefined);

    render(
      <LocationFormDialog
        open
        mode="create"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText(/nombre de la sede/i), 'Sucursal Norte');
    await userEvent.type(screen.getByLabelText(/dirección/i), 'Av. Norte 456');
    await userEvent.click(screen.getByRole('button', { name: /crear sede/i }));

    await waitFor(() => {
      expect(onSubmitCreate).toHaveBeenCalledWith({
        name: 'Sucursal Norte',
        address: 'Av. Norte 456',
      });
    });
  });

  it('submits with undefined address when empty', async () => {
    onSubmitCreate.mockResolvedValue(undefined);

    render(
      <LocationFormDialog
        open
        mode="create"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText(/nombre de la sede/i), 'Sucursal');
    await userEvent.click(screen.getByRole('button', { name: /crear sede/i }));

    await waitFor(() => {
      expect(onSubmitCreate).toHaveBeenCalledWith({
        name: 'Sucursal',
        address: undefined,
      });
    });
  });

  it('shows validation error when name is too short', async () => {
    render(
      <LocationFormDialog
        open
        mode="create"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText(/nombre de la sede/i), 'A');
    await userEvent.click(screen.getByRole('button', { name: /crear sede/i }));

    expect(await screen.findByText(/al menos 2 caracteres/i)).toBeInTheDocument();
    expect(onSubmitCreate).not.toHaveBeenCalled();
  });

  it('shows serverError in destructive alert', () => {
    render(
      <LocationFormDialog
        open
        mode="create"
        serverError="Has alcanzado el límite de 2 sede(s) para tu plan pro"
        onOpenChange={onOpenChange}
        onSubmitCreate={onSubmitCreate}
        onSubmitEdit={vi.fn()}
      />
    );

    expect(
      screen.getByText('Has alcanzado el límite de 2 sede(s) para tu plan pro')
    ).toBeInTheDocument();
  });

  it('disables submit button while isLoading', () => {
    render(
      <LocationFormDialog
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

describe('LocationFormDialog - edit mode', () => {
  const onOpenChange = vi.fn();
  const onSubmitEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders edit title and description when open', () => {
    render(
      <LocationFormDialog
        open
        mode="edit"
        location={sampleLocation}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    expect(screen.getByText('Editar sede')).toBeInTheDocument();
    expect(screen.getByText(/modifica el nombre o la dirección/i)).toBeInTheDocument();
  });

  it('preloads fields with location values', () => {
    render(
      <LocationFormDialog
        open
        mode="edit"
        location={sampleLocation}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    expect(screen.getByLabelText(/nombre de la sede/i)).toHaveValue('Casa Central');
    expect(screen.getByLabelText(/dirección/i)).toHaveValue('Av. Demo 123');
  });

  it('submits with explicit null address when user clears the field', async () => {
    onSubmitEdit.mockResolvedValue(undefined);

    render(
      <LocationFormDialog
        open
        mode="edit"
        location={sampleLocation}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    await userEvent.clear(screen.getByLabelText(/dirección/i));
    await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(onSubmitEdit).toHaveBeenCalledWith('loc-1', {
        name: 'Casa Central',
        address: null,
      });
    });
  });

  it('submits with updated name', async () => {
    onSubmitEdit.mockResolvedValue(undefined);

    render(
      <LocationFormDialog
        open
        mode="edit"
        location={sampleLocation}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    const nameInput = screen.getByLabelText(/nombre de la sede/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Casa Matriz');
    await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(onSubmitEdit).toHaveBeenCalledWith('loc-1', {
        name: 'Casa Matriz',
        address: 'Av. Demo 123',
      });
    });
  });

  it('shows validation error when both fields are empty in edit', async () => {
    render(
      <LocationFormDialog
        open
        mode="edit"
        location={sampleLocation}
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    await userEvent.clear(screen.getByLabelText(/nombre de la sede/i));
    await userEvent.clear(screen.getByLabelText(/dirección/i));
    await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(await screen.findByText(/al menos 2 caracteres/i)).toBeInTheDocument();
    expect(onSubmitEdit).not.toHaveBeenCalled();
  });

  it('disables submit button with isLoading label in edit mode', () => {
    render(
      <LocationFormDialog
        open
        mode="edit"
        location={sampleLocation}
        isLoading
        onOpenChange={onOpenChange}
        onSubmitCreate={vi.fn()}
        onSubmitEdit={onSubmitEdit}
      />
    );

    expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
  });
});
