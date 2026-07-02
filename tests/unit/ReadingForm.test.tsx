import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReadingForm } from '@/features/readings/components/ReadingForm';
import type { Equipment, Staff } from '@/shared/types/supabase';

const equipmentList: Equipment[] = [
  {
    id: 'eq-1',
    location_id: 'loc-1',
    name: 'Refrigerador Lácteos',
    physical_location: 'Cocina',
    code: 'EQ-001',
    min_temp: 0,
    max_temp: 6,
    is_iot_enabled: false,
    iot_device_id: null,
    created_at: '2026-06-30T00:00:00Z',
  },
  {
    id: 'eq-2',
    location_id: 'loc-1',
    name: 'Congelador Carnes',
    physical_location: 'Bodega',
    code: 'EQ-002',
    min_temp: -22,
    max_temp: -15,
    is_iot_enabled: false,
    iot_device_id: null,
    created_at: '2026-06-30T00:00:00Z',
  },
];

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
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ReadingForm · rendering', () => {
  it('renders the equipment selector, temperature input and staff selector', () => {
    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting={false}
        serverError={null}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/equipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temperatura/i)).toBeInTheDocument();
    expect(screen.getByText(/persona que registra/i)).toBeInTheDocument();
  });

  it('shows submit and cancel buttons', () => {
    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting={false}
        serverError={null}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /registrar lectura/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('disables submit when isSubmitting', () => {
    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting
        serverError={null}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /registrando/i })).toBeDisabled();
  });

  it('shows serverError in destructive alert', () => {
    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting={false}
        serverError="No se pudo guardar"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('No se pudo guardar')).toBeInTheDocument();
  });
});

describe('ReadingForm · validation', () => {
  it('shows validation errors when fields are empty', async () => {
    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting={false}
        serverError={null}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /registrar lectura/i }));
    expect(await screen.findByText(/ingresa la temperatura/i)).toBeInTheDocument();
    expect(screen.getAllByText(/selecciona un equipo/i).length).toBeGreaterThanOrEqual(2);
  });

  it('shows validation error when temperature is below -100', async () => {
    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting={false}
        serverError={null}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: /Refrigerador Lácteos/ }));
    await userEvent.type(screen.getByLabelText(/temperatura/i), '-150');
    await userEvent.click(screen.getByRole('button', { name: /registrar lectura/i }));

    expect(await screen.findByText(/entre -100 y 100/i)).toBeInTheDocument();
  });
});

describe('ReadingForm · out-of-range warning', () => {
  it('shows warning when value is above max', async () => {
    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting={false}
        serverError={null}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: /Refrigerador Lácteos/ }));
    await userEvent.type(screen.getByLabelText(/temperatura/i), '10');

    expect(
      await screen.findByText(/fuera del rango aceptable.*0°C a 6°C/i)
    ).toBeInTheDocument();
  });

  it('shows warning when value is below min', async () => {
    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting={false}
        serverError={null}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: /Refrigerador Lácteos/ }));
    await userEvent.type(screen.getByLabelText(/temperatura/i), '-5');

    expect(
      await screen.findByText(/fuera del rango aceptable.*0°C a 6°C/i)
    ).toBeInTheDocument();
  });

  it('does not show warning when value is in range', async () => {
    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting={false}
        serverError={null}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: /Refrigerador Lácteos/ }));
    await userEvent.type(screen.getByLabelText(/temperatura/i), '3.5');

    expect(screen.queryByText(/fuera del rango aceptable/i)).not.toBeInTheDocument();
  });
});

describe('ReadingForm · submit', () => {
  it('submits with valid data and profile mode (no staff, no takenBy)', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting={false}
        serverError={null}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: /Refrigerador Lácteos/ }));
    await userEvent.type(screen.getByLabelText(/temperatura/i), '3.5');
    await userEvent.click(screen.getByRole('button', { name: /registrar lectura/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    const call = onSubmit.mock.calls[0]?.[0];
    expect(call.equipmentId).toBe('eq-1');
    expect(call.value).toBe(3.5);
    expect(call.recordedByStaff).toBeNull();
    expect(call.takenBy).toBeNull();
  });

  it('submits with external mode and takenBy filled', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting={false}
        serverError={null}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: /Refrigerador Lácteos/ }));
    await userEvent.type(screen.getByLabelText(/temperatura/i), '3.5');
    await userEvent.click(screen.getByLabelText(/persona externa/i));
    await userEvent.type(screen.getByPlaceholderText(/nombre de quien tomó la lectura/i), 'Inspector');
    await userEvent.click(screen.getByRole('button', { name: /registrar lectura/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    const call = onSubmit.mock.calls[0]?.[0];
    expect(call.takenBy).toBe('Inspector');
    expect(call.recordedByStaff).toBeNull();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();

    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting={false}
        serverError={null}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('resets form after successful submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ReadingForm
        equipmentList={equipmentList}
        staffList={staffList}
        isSubmitting={false}
        serverError={null}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: /Refrigerador Lácteos/ }));
    await userEvent.type(screen.getByLabelText(/temperatura/i), '3.5');
    await userEvent.click(screen.getByRole('button', { name: /registrar lectura/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/temperatura/i)).toHaveValue(null);
    });
  });
});