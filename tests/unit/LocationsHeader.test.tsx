import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationsHeader } from '@/features/locations/components/LocationsHeader';

describe('LocationsHeader', () => {
  it('renders title, current count and plan', () => {
    render(
      <LocationsHeader
        totalLocations={1}
        maxLocations={2}
        planType="pro"
        canCreate
        onCreate={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Sedes' })).toBeInTheDocument();
    expect(screen.getByText(/1 de 2 sedes del plan/i)).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('uses singular form when maxLocations is 1', () => {
    render(
      <LocationsHeader
        totalLocations={1}
        maxLocations={1}
        planType="basic"
        canCreate={false}
        onCreate={vi.fn()}
      />
    );

    expect(screen.getByText(/1 de 1 sede del plan/i)).toBeInTheDocument();
  });

  it('uses singular form when totalLocations is 1', () => {
    render(
      <LocationsHeader
        totalLocations={1}
        maxLocations={3}
        planType="basic"
        canCreate
        onCreate={vi.fn()}
      />
    );

    expect(screen.getByText(/1 de 3 sedes del plan/i)).toBeInTheDocument();
  });

  it('shows enabled "Nueva sede" button when below limit and canCreate', () => {
    render(
      <LocationsHeader
        totalLocations={1}
        maxLocations={3}
        planType="basic"
        canCreate
        onCreate={vi.fn()}
      />
    );

    const btn = screen.getByRole('button', { name: /crear nueva sede/i });
    expect(btn).toBeEnabled();
  });

  it('calls onCreate when the button is clicked', async () => {
    const onCreate = vi.fn();
    render(
      <LocationsHeader
        totalLocations={1}
        maxLocations={3}
        planType="basic"
        canCreate
        onCreate={onCreate}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /crear nueva sede/i }));
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('disables the button and shows lock icon when at limit', () => {
    render(
      <LocationsHeader
        totalLocations={2}
        maxLocations={2}
        planType="pro"
        canCreate
        onCreate={vi.fn()}
      />
    );

    const btn = screen.getByRole('button', { name: /límite del plan alcanzado/i });
    expect(btn).toBeDisabled();
  });

  it('disables the button when canCreate is false even if below limit', () => {
    render(
      <LocationsHeader
        totalLocations={0}
        maxLocations={3}
        planType="basic"
        canCreate={false}
        onCreate={vi.fn()}
      />
    );

    const btn = screen.getByRole('button', { name: /crear nueva sede/i });
    expect(btn).toBeDisabled();
  });

  it('shows plan label for each plan type', () => {
    const { rerender } = render(
      <LocationsHeader
        totalLocations={0}
        maxLocations={5}
        planType="enterprise"
        canCreate
        onCreate={vi.fn()}
      />
    );
    expect(screen.getByText('Enterprise')).toBeInTheDocument();

    rerender(
      <LocationsHeader
        totalLocations={0}
        maxLocations={1}
        planType="basic"
        canCreate
        onCreate={vi.fn()}
      />
    );
    expect(screen.getByText('Basic')).toBeInTheDocument();
  });
});
