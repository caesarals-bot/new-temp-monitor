import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemperatureInput } from '@/features/readings/components/TemperatureInput';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TemperatureInput', () => {
  it('renders input with placeholder', () => {
    render(<TemperatureInput value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText(/temperatura/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temperatura/i)).toHaveAttribute('placeholder', '3.5');
  });

  it('displays numeric value', () => {
    render(<TemperatureInput value={3.5} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/temperatura/i)).toHaveValue(3.5);
  });

  it('calls onChange with number when typing valid number', async () => {
    const onChange = vi.fn();
    render(<TemperatureInput value="" onChange={onChange} />);
    const input = screen.getByLabelText(/temperatura/i);
    await userEvent.type(input, '4.2');
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
    expect(typeof lastCall).toBe('number');
  });

  it('calls onChange with empty string when input is cleared', async () => {
    const onChange = vi.fn();
    render(<TemperatureInput value={3.5} onChange={onChange} />);
    const input = screen.getByLabelText(/temperatura/i);
    await userEvent.clear(input);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('shows warning when value below minTemp', () => {
    render(
      <TemperatureInput
        value={-5}
        onChange={vi.fn()}
        minTemp={0}
        maxTemp={6}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/bajo el mínimo.*0°C/);
  });

  it('shows warning when value above maxTemp', () => {
    render(
      <TemperatureInput
        value={10}
        onChange={vi.fn()}
        minTemp={0}
        maxTemp={6}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/sobre el máximo.*6°C/);
  });

  it('does not show warning when in range', () => {
    render(
      <TemperatureInput
        value={3.5}
        onChange={vi.fn()}
        minTemp={0}
        maxTemp={6}
      />
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not show warning when no range provided', () => {
    render(<TemperatureInput value={100} onChange={vi.fn()} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows error message when error prop provided', () => {
    render(<TemperatureInput value="" onChange={vi.fn()} error="Requerido" />);
    expect(screen.getByText('Requerido')).toBeInTheDocument();
  });

  it('error takes precedence over warning', () => {
    render(
      <TemperatureInput
        value={-5}
        onChange={vi.fn()}
        minTemp={0}
        maxTemp={6}
        error="Error de validación"
      />
    );
    expect(screen.getByText('Error de validación')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<TemperatureInput value="" onChange={vi.fn()} disabled />);
    expect(screen.getByLabelText(/temperatura/i)).toBeDisabled();
  });
});