import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StaffCard } from '@/features/staff/components/StaffCard';
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

describe('StaffCard', () => {
  it('renders name, role, readings count and active badge when staff is active', () => {
    render(
      <StaffCard
        staff={activeStaff}
        readingsCount={12}
        canEdit
        onEdit={vi.fn()}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('María López')).toBeInTheDocument();
    expect(screen.getByText('Cocinera')).toBeInTheDocument();
    expect(screen.getByText('12 lecturas')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('uses singular "lectura" when count is 1', () => {
    render(
      <StaffCard
        staff={activeStaff}
        readingsCount={1}
        canEdit
        onEdit={vi.fn()}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('1 lectura')).toBeInTheDocument();
  });

  it('shows Inactivo badge and Desactivar/Reactivar button accordingly', () => {
    render(
      <StaffCard
        staff={inactiveStaff}
        readingsCount={0}
        canEdit
        onEdit={vi.fn()}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reactivar pedro ramírez/i })).toBeInTheDocument();
  });

  it('shows Desactivar button for active staff', () => {
    render(
      <StaffCard
        staff={activeStaff}
        readingsCount={3}
        canEdit
        onEdit={vi.fn()}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /desactivar maría lópez/i })).toBeInTheDocument();
  });

  it('hides action buttons when canEdit is false', () => {
    render(
      <StaffCard
        staff={activeStaff}
        readingsCount={0}
        canEdit={false}
        onEdit={vi.fn()}
        onToggle={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /editar/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /desactivar|reactivar/i })).toBeNull();
  });

  it('shows action buttons when canEdit is true', () => {
    render(
      <StaffCard
        staff={activeStaff}
        readingsCount={0}
        canEdit
        onEdit={vi.fn()}
        onToggle={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /editar maría lópez/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /desactivar maría lópez/i })).toBeInTheDocument();
  });

  it('calls onEdit with the staff when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(
      <StaffCard
        staff={activeStaff}
        readingsCount={0}
        canEdit
        onEdit={onEdit}
        onToggle={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /editar/i }));
    expect(onEdit).toHaveBeenCalledWith(activeStaff);
  });

  it('calls onToggle with the staff when toggle button is clicked', async () => {
    const onToggle = vi.fn();
    render(
      <StaffCard
        staff={activeStaff}
        readingsCount={0}
        canEdit
        onEdit={vi.fn()}
        onToggle={onToggle}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /desactivar/i }));
    expect(onToggle).toHaveBeenCalledWith(activeStaff);
  });
});
