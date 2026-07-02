import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StaffSelector } from '@/features/readings/components/StaffSelector';
import type { Staff } from '@/shared/types/supabase';

const staffList: Staff[] = [
  {
    id: 's-1',
    location_id: 'loc-1',
    name: 'María López',
    role: 'Cocinera',
    active: true,
    created_at: '2026-06-30T00:00:00Z',
    updated_at: '2026-06-30T00:00:00Z',
  },
  {
    id: 's-2',
    location_id: 'loc-1',
    name: 'Pedro Ramírez',
    role: 'Auxiliar',
    active: true,
    created_at: '2026-06-30T00:00:00Z',
    updated_at: '2026-06-30T00:00:00Z',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StaffSelector', () => {
  it('renders the three radio options', () => {
    render(
      <StaffSelector
        mode="profile"
        onModeChange={vi.fn()}
        staffList={staffList}
        selectedStaffId={null}
        onStaffChange={vi.fn()}
        externalName=""
        onExternalNameChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/mi usuario logueado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/persona de la lista/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/persona externa/i)).toBeInTheDocument();
  });

  it('checks the active mode radio', () => {
    render(
      <StaffSelector
        mode="staff"
        onModeChange={vi.fn()}
        staffList={staffList}
        selectedStaffId={null}
        onStaffChange={vi.fn()}
        externalName=""
        onExternalNameChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/persona de la lista/i)).toBeChecked();
  });

  it('calls onModeChange when a different mode is selected', async () => {
    const onModeChange = vi.fn();
    render(
      <StaffSelector
        mode="profile"
        onModeChange={onModeChange}
        staffList={staffList}
        selectedStaffId={null}
        onStaffChange={vi.fn()}
        externalName=""
        onExternalNameChange={vi.fn()}
      />
    );

    await userEvent.click(screen.getByLabelText(/persona externa/i));

    expect(onModeChange).toHaveBeenCalledWith('external');
  });

  it('does not show staff list or external input when mode is profile', () => {
    render(
      <StaffSelector
        mode="profile"
        onModeChange={vi.fn()}
        staffList={staffList}
        selectedStaffId={null}
        onStaffChange={vi.fn()}
        externalName=""
        onExternalNameChange={vi.fn()}
      />
    );
    expect(screen.queryByPlaceholderText(/escribe o selecciona/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/nombre de quien tomó la lectura/i)).not.toBeInTheDocument();
  });

  it('shows staff input when mode is staff', () => {
    render(
      <StaffSelector
        mode="staff"
        onModeChange={vi.fn()}
        staffList={staffList}
        selectedStaffId={null}
        onStaffChange={vi.fn()}
        externalName=""
        onExternalNameChange={vi.fn()}
      />
    );
    expect(screen.getByPlaceholderText(/escribe o selecciona/i)).toBeInTheDocument();
  });

  it('shows staff count when mode is staff', () => {
    render(
      <StaffSelector
        mode="staff"
        onModeChange={vi.fn()}
        staffList={staffList}
        selectedStaffId={null}
        onStaffChange={vi.fn()}
        externalName=""
        onExternalNameChange={vi.fn()}
      />
    );
    expect(screen.getByText(/2 persona\(s\) en esta sede/i)).toBeInTheDocument();
  });

  it('calls onStaffChange when staff input changes', async () => {
    const onStaffChange = vi.fn();
    render(
      <StaffSelector
        mode="staff"
        onModeChange={vi.fn()}
        staffList={staffList}
        selectedStaffId={null}
        onStaffChange={onStaffChange}
        externalName=""
        onExternalNameChange={vi.fn()}
      />
    );
    await userEvent.type(screen.getByPlaceholderText(/escribe o selecciona/i), 's-1');
    expect(onStaffChange).toHaveBeenCalled();
  });

  it('shows external input when mode is external', () => {
    render(
      <StaffSelector
        mode="external"
        onModeChange={vi.fn()}
        staffList={staffList}
        selectedStaffId={null}
        onStaffChange={vi.fn()}
        externalName=""
        onExternalNameChange={vi.fn()}
      />
    );
    expect(screen.getByPlaceholderText(/nombre de quien tomó la lectura/i)).toBeInTheDocument();
  });

  it('calls onExternalNameChange when external input changes', async () => {
    const onExternalNameChange = vi.fn();
    render(
      <StaffSelector
        mode="external"
        onModeChange={vi.fn()}
        staffList={staffList}
        selectedStaffId={null}
        onStaffChange={vi.fn()}
        externalName=""
        onExternalNameChange={onExternalNameChange}
      />
    );
    await userEvent.type(screen.getByPlaceholderText(/nombre de quien tomó la lectura/i), 'a');
    expect(onExternalNameChange).toHaveBeenCalledWith('a');
  });
});