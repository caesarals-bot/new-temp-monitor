import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteLocationDialog } from '@/features/locations/components/DeleteLocationDialog';
import type { Location, LocationDependencies } from '@/features/locations/services/locations.service';

const sampleLocation: Location = {
  id: 'loc-1',
  organization_id: 'org-1',
  name: 'Casa Central',
  address: 'Av. Demo 123',
  created_at: '2026-06-30T00:00:00Z',
};

const noDependencies: LocationDependencies = { equipment: 0, staff: 0, readings: 0 };

describe('DeleteLocationDialog', () => {
  const onOpenChange = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing visible when location is null', () => {
    const { container } = render(
      <DeleteLocationDialog
        open
        location={null}
        dependencies={noDependencies}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('shows simple confirmation when there are no dependencies', () => {
    render(
      <DeleteLocationDialog
        open
        location={sampleLocation}
        dependencies={noDependencies}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(
      screen.getByText(/¿estás seguro de que quieres eliminar la sede/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/equipo/i)).toBeNull();
  });

  it('lists equipment, staff and readings with plural forms', () => {
    render(
      <DeleteLocationDialog
        open
        location={sampleLocation}
        dependencies={{ equipment: 3, staff: 5, readings: 234 }}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/3 equipos/)).toBeInTheDocument();
    expect(screen.getByText(/5 personas de staff/)).toBeInTheDocument();
    expect(screen.getByText(/234 lecturas de temperatura/)).toBeInTheDocument();
  });

  it('uses singular form when count is 1', () => {
    render(
      <DeleteLocationDialog
        open
        location={sampleLocation}
        dependencies={{ equipment: 1, staff: 1, readings: 1 }}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/1 equipo/)).toBeInTheDocument();
    expect(screen.getByText(/1 persona de staff/)).toBeInTheDocument();
    expect(screen.getByText(/1 lectura de temperatura/)).toBeInTheDocument();
  });

  it('omits sections with zero count', () => {
    render(
      <DeleteLocationDialog
        open
        location={sampleLocation}
        dependencies={{ equipment: 2, staff: 0, readings: 5 }}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/2 equipos/)).toBeInTheDocument();
    expect(screen.getByText(/5 lecturas de temperatura/)).toBeInTheDocument();
    expect(screen.queryByText(/persona/i)).toBeNull();
  });

  it('shows loading state when dependencies are not loaded yet', () => {
    render(
      <DeleteLocationDialog
        open
        location={sampleLocation}
        dependencies={null}
        isLoadingDependencies
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/calculando dependencias/i)).toBeInTheDocument();
  });

  it('disables confirm button while loading dependencies', () => {
    render(
      <DeleteLocationDialog
        open
        location={sampleLocation}
        dependencies={null}
        isLoadingDependencies
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByRole('button', { name: /eliminar sede/i })).toBeDisabled();
  });

  it('disables confirm button while deleting', () => {
    render(
      <DeleteLocationDialog
        open
        location={sampleLocation}
        dependencies={noDependencies}
        isDeleting
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByRole('button', { name: /eliminando/i })).toBeDisabled();
  });

  it('shows serverError in destructive alert', () => {
    render(
      <DeleteLocationDialog
        open
        location={sampleLocation}
        dependencies={noDependencies}
        serverError="No se puede eliminar: foreign key violation"
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText('No se puede eliminar: foreign key violation')).toBeInTheDocument();
  });

  it('calls onConfirm with location when confirm button is clicked', async () => {
    onConfirm.mockResolvedValue(undefined);

    render(
      <DeleteLocationDialog
        open
        location={sampleLocation}
        dependencies={noDependencies}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /eliminar sede/i }));
    expect(onConfirm).toHaveBeenCalledWith(sampleLocation);
  });

  it('calls onOpenChange(false) when cancel is clicked', async () => {
    render(
      <DeleteLocationDialog
        open
        location={sampleLocation}
        dependencies={noDependencies}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('triggers onConfirm when Enter is pressed and dependencies are loaded', async () => {
    onConfirm.mockResolvedValue(undefined);

    render(
      <DeleteLocationDialog
        open
        location={sampleLocation}
        dependencies={noDependencies}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(sampleLocation);
    });
  });
});
