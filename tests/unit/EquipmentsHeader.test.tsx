import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquipmentsHeader } from '@/features/equipment/components/EquipmentsHeader';

describe('EquipmentsHeader', () => {
  it('renders title and singular when one equipment', () => {
    render(
      <EquipmentsHeader
        totalEquipment={1}
        activeLocationName="Casa Central"
        canCreate
        onCreate={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Equipos' })).toBeInTheDocument();
    expect(screen.getByText(/1 equipo en/i)).toBeInTheDocument();
    expect(screen.getByText('Casa Central')).toBeInTheDocument();
  });

  it('renders plural when more than one', () => {
    render(
      <EquipmentsHeader
        totalEquipment={5}
        activeLocationName="Casa Central"
        canCreate
        onCreate={vi.fn()}
      />
    );

    expect(screen.getByText(/5 equipos en/i)).toBeInTheDocument();
  });

  it('shows the no-location message when activeLocationName is null', () => {
    render(
      <EquipmentsHeader
        totalEquipment={0}
        activeLocationName={null}
        canCreate
        onCreate={vi.fn()}
      />
    );

    expect(screen.getByText(/selecciona una sede para ver sus equipos/i)).toBeInTheDocument();
  });

  it('disables the create button when there is no active location', () => {
    render(
      <EquipmentsHeader
        totalEquipment={0}
        activeLocationName={null}
        canCreate
        onCreate={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /sin sede activa/i })).toBeDisabled();
  });

  it('disables the create button when canCreate is false', () => {
    render(
      <EquipmentsHeader
        totalEquipment={0}
        activeLocationName="Casa Central"
        canCreate={false}
        onCreate={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /agregar nuevo equipo/i })).toBeDisabled();
  });

  it('shows enabled create button when location active and canCreate', () => {
    render(
      <EquipmentsHeader
        totalEquipment={2}
        activeLocationName="Casa Central"
        canCreate
        onCreate={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /agregar nuevo equipo/i })).toBeEnabled();
  });

  it('calls onCreate when the button is clicked', async () => {
    const onCreate = vi.fn();
    render(
      <EquipmentsHeader
        totalEquipment={2}
        activeLocationName="Casa Central"
        canCreate
        onCreate={onCreate}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /agregar nuevo equipo/i }));
    expect(onCreate).toHaveBeenCalledOnce();
  });
});
