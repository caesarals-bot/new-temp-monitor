import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StaffsHeader } from '@/features/staff/components/StaffsHeader';

describe('StaffsHeader', () => {
  it('renders title and singular when one person', () => {
    render(
      <StaffsHeader
        totalStaff={1}
        activeLocationName="Casa Central"
        canCreate
        onCreate={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Personal' })).toBeInTheDocument();
    expect(screen.getByText(/1 persona en/i)).toBeInTheDocument();
    expect(screen.getByText('Casa Central')).toBeInTheDocument();
  });

  it('renders plural when more than one person', () => {
    render(
      <StaffsHeader
        totalStaff={5}
        activeLocationName="Casa Central"
        canCreate
        onCreate={vi.fn()}
      />
    );

    expect(screen.getByText(/5 personas en/i)).toBeInTheDocument();
  });

  it('shows the no-location message when activeLocationName is null', () => {
    render(
      <StaffsHeader
        totalStaff={0}
        activeLocationName={null}
        canCreate
        onCreate={vi.fn()}
      />
    );

    expect(screen.getByText(/selecciona una sede para ver su personal/i)).toBeInTheDocument();
  });

  it('disables the create button when there is no active location', () => {
    render(
      <StaffsHeader
        totalStaff={0}
        activeLocationName={null}
        canCreate
        onCreate={vi.fn()}
      />
    );

    const btn = screen.getByRole('button', { name: /sin sede activa/i });
    expect(btn).toBeDisabled();
  });

  it('disables the create button when canCreate is false', () => {
    render(
      <StaffsHeader
        totalStaff={0}
        activeLocationName="Casa Central"
        canCreate={false}
        onCreate={vi.fn()}
      />
    );

    const btn = screen.getByRole('button', { name: /agregar nueva persona/i });
    expect(btn).toBeDisabled();
  });

  it('shows enabled create button when location active and canCreate', () => {
    render(
      <StaffsHeader
        totalStaff={2}
        activeLocationName="Casa Central"
        canCreate
        onCreate={vi.fn()}
      />
    );

    const btn = screen.getByRole('button', { name: /agregar nueva persona/i });
    expect(btn).toBeEnabled();
  });

  it('calls onCreate when the button is clicked', async () => {
    const onCreate = vi.fn();
    render(
      <StaffsHeader
        totalStaff={2}
        activeLocationName="Casa Central"
        canCreate
        onCreate={onCreate}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /agregar nueva persona/i }));
    expect(onCreate).toHaveBeenCalledOnce();
  });
});
