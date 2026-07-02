import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleStaffDialog } from '@/features/staff/components/ToggleStaffDialog';
import type { Staff } from '@/shared/types/supabase';

const activeStaff: Staff = {
  id: 'staff-1',
  location_id: 'loc-1',
  name: 'María López',
  role: 'Cocinera',
  active: true,
  created_at: '2026-06-30T00:00:00Z',
  updated_at: '2026-06-30T00:00:00Z',
};

const inactiveStaff: Staff = { ...activeStaff, id: 'staff-2', name: 'Pedro Ramírez', active: false };

describe('ToggleStaffDialog', () => {
  const onOpenChange = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing visible when staff is null', () => {
    const { container } = render(
      <ToggleStaffDialog
        open
        staff={null}
        readingsCount={0}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('shows simple confirmation for deactivation without readings', () => {
    render(
      <ToggleStaffDialog
        open
        staff={activeStaff}
        readingsCount={0}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/¿estás seguro de que quieres desactivar/i)).toBeInTheDocument();
    expect(screen.queryByText(/tiene lecturas registradas/i)).toBeNull();
    expect(screen.getByRole('button', { name: /desactivar persona/i })).toBeInTheDocument();
  });

  it('shows warning when deactivating staff with readings', () => {
    render(
      <ToggleStaffDialog
        open
        staff={activeStaff}
        readingsCount={12}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText('Esta persona tiene lecturas registradas')).toBeInTheDocument();
    expect(screen.getByText(/12 lecturas/i)).toBeInTheDocument();
    expect(
      screen.getByText(/al desactivarla, sus lecturas históricas se conservarán/i)
    ).toBeInTheDocument();
  });

  it('uses singular "lectura" when count is 1', () => {
    render(
      <ToggleStaffDialog
        open
        staff={activeStaff}
        readingsCount={1}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/1 lectura\b/i)).toBeInTheDocument();
  });

  it('shows warning with different copy when reactivating staff with readings', () => {
    render(
      <ToggleStaffDialog
        open
        staff={inactiveStaff}
        readingsCount={5}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText('Esta persona tiene lecturas registradas')).toBeInTheDocument();
    expect(
      screen.getByText(/al reactivarla, podrá registrar nuevas lecturas/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reactivar persona/i })).toBeInTheDocument();
  });

  it('shows simple confirmation for reactivation without readings', () => {
    render(
      <ToggleStaffDialog
        open
        staff={inactiveStaff}
        readingsCount={0}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/¿estás seguro de que quieres reactivar/i)).toBeInTheDocument();
  });

  it('shows loading state when readingsCount is null', () => {
    render(
      <ToggleStaffDialog
        open
        staff={activeStaff}
        readingsCount={null}
        isLoadingCount
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/verificando lecturas asociadas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /desactivar persona/i })).toBeDisabled();
  });

  it('disables confirm button while toggling', () => {
    render(
      <ToggleStaffDialog
        open
        staff={activeStaff}
        readingsCount={0}
        isToggling
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByRole('button', { name: /desactivar\.\.\./i })).toBeDisabled();
  });

  it('shows serverError in destructive alert', () => {
    render(
      <ToggleStaffDialog
        open
        staff={activeStaff}
        readingsCount={0}
        serverError="No se pudo desactivar"
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText('No se pudo desactivar')).toBeInTheDocument();
  });

  it('calls onConfirm with staff when confirm button is clicked', async () => {
    onConfirm.mockResolvedValue(undefined);

    render(
      <ToggleStaffDialog
        open
        staff={activeStaff}
        readingsCount={0}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /desactivar persona/i }));
    expect(onConfirm).toHaveBeenCalledWith(activeStaff);
  });

  it('calls onOpenChange(false) when cancel is clicked', async () => {
    render(
      <ToggleStaffDialog
        open
        staff={activeStaff}
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
      <ToggleStaffDialog
        open
        staff={activeStaff}
        readingsCount={0}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(activeStaff);
    });
  });
});
