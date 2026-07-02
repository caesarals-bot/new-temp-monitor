import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LastReadingBadge } from '@/features/readings/components/LastReadingBadge';

const NOW = new Date('2026-07-01T12:00:00Z');

describe('LastReadingBadge', () => {
  it('renders "Sin lecturas" warning when recordedAt is null', () => {
    render(<LastReadingBadge recordedAt={null} now={NOW} />);

    const badge = screen.getByTestId('last-reading-badge');
    expect(badge).toHaveTextContent('Sin lecturas');
    expect(badge.dataset.state).toBe('no-reading');
    expect(badge).toHaveAccessibleName('Sin lecturas registradas');
  });

  it('renders "Sin lecturas" when recordedAt is undefined', () => {
    render(<LastReadingBadge recordedAt={undefined} now={NOW} />);

    expect(screen.getByTestId('last-reading-badge')).toHaveTextContent('Sin lecturas');
  });

  it('renders "ahora" as fresh when reading is < 60s old', () => {
    const fresh = new Date(NOW.getTime() - 30_000).toISOString();
    render(<LastReadingBadge recordedAt={fresh} now={NOW} />);

    const badge = screen.getByTestId('last-reading-badge');
    expect(badge).toHaveTextContent('ahora');
    expect(badge.dataset.state).toBe('fresh');
  });

  it('renders "Hace N min" as fresh when reading is < 2h old', () => {
    const minutes = new Date(NOW.getTime() - 30 * 60_000).toISOString();
    render(<LastReadingBadge recordedAt={minutes} now={NOW} />);

    const badge = screen.getByTestId('last-reading-badge');
    expect(badge).toHaveTextContent('Hace 30 min');
    expect(badge.dataset.state).toBe('fresh');
  });

  it('renders warning variant when reading is ≥ 2h old (HACCP threshold)', () => {
    const stale = new Date(NOW.getTime() - 3 * 3_600_000).toISOString();
    render(<LastReadingBadge recordedAt={stale} now={NOW} />);

    const badge = screen.getByTestId('last-reading-badge');
    expect(badge).toHaveTextContent('Hace 3 h');
    expect(badge.dataset.state).toBe('stale');
    expect(badge.className).toContain('bg-[--color-warning]');
  });

  it('renders "—" for invalid date string', () => {
    render(<LastReadingBadge recordedAt="not-a-date" now={NOW} />);

    const badge = screen.getByTestId('last-reading-badge');
    expect(badge).toHaveTextContent('—');
    expect(badge.dataset.state).toBe('stale');
  });
});