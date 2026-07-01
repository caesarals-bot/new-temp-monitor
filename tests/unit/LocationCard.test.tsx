import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationCard } from '@/features/locations/components/LocationCard';
import type { Location } from '@/shared/types/supabase';

const sampleLocation: Location = {
  id: 'loc-1',
  organization_id: 'org-1',
  name: 'Casa Central',
  address: 'Av. Demo 123, Santiago',
  created_at: '2026-06-30T00:00:00Z',
};

describe('LocationCard', () => {
  it('renders name, address and equipment count', () => {
    render(
      <LocationCard
        location={sampleLocation}
        equipmentCount={3}
        openIncidentCount={0}
        canEdit
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Casa Central')).toBeInTheDocument();
    expect(screen.getByText('Av. Demo 123, Santiago')).toBeInTheDocument();
    expect(screen.getByText('3 equipos')).toBeInTheDocument();
  });

  it('uses singular form when equipmentCount is 1', () => {
    render(
      <LocationCard
        location={sampleLocation}
        equipmentCount={1}
        openIncidentCount={0}
        canEdit
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('1 equipo')).toBeInTheDocument();
  });

  it('hides the address block when address is null', () => {
    const loc: Location = { ...sampleLocation, address: null };
    render(
      <LocationCard
        location={loc}
        equipmentCount={0}
        openIncidentCount={0}
        canEdit
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByText('Av. Demo 123, Santiago')).toBeNull();
  });

  it('does not show incidents badge when openIncidentCount is 0', () => {
    render(
      <LocationCard
        location={sampleLocation}
        equipmentCount={2}
        openIncidentCount={0}
        canEdit
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByText(/incidente/i)).toBeNull();
  });

  it('shows incidents badge with singular form when count is 1', () => {
    render(
      <LocationCard
        location={sampleLocation}
        equipmentCount={2}
        openIncidentCount={1}
        canEdit
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('1 incidente')).toBeInTheDocument();
  });

  it('shows incidents badge with plural form when count > 1', () => {
    render(
      <LocationCard
        location={sampleLocation}
        equipmentCount={2}
        openIncidentCount={5}
        canEdit
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('5 incidentes')).toBeInTheDocument();
  });

  it('hides action buttons when canEdit is false', () => {
    render(
      <LocationCard
        location={sampleLocation}
        equipmentCount={2}
        openIncidentCount={0}
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
      <LocationCard
        location={sampleLocation}
        equipmentCount={2}
        openIncidentCount={0}
        canEdit
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /editar casa central/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /eliminar casa central/i })).toBeInTheDocument();
  });

  it('calls onEdit with the location when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(
      <LocationCard
        location={sampleLocation}
        equipmentCount={2}
        openIncidentCount={0}
        canEdit
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /editar/i }));
    expect(onEdit).toHaveBeenCalledWith(sampleLocation);
  });

  it('calls onDelete with the location when delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(
      <LocationCard
        location={sampleLocation}
        equipmentCount={2}
        openIncidentCount={0}
        canEdit
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }));
    expect(onDelete).toHaveBeenCalledWith(sampleLocation);
  });
});
