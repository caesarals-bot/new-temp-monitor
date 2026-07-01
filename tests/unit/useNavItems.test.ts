import { describe, it, expect } from 'vitest';
import { getNavItems } from '@/shared/hooks/useNavItems';

describe('getNavItems', () => {
  describe('platform admin', () => {
    it('returns admin items when isPlatformAdmin is true (overrides role)', () => {
      const items = getNavItems({ role: 'owner', isPlatformAdmin: true });
      expect(items).toHaveLength(2);
      expect(items.map((i) => i.to)).toEqual([
        '/admin/organizations',
        '/admin/metrics',
      ]);
    });

    it('returns admin items even when role is null', () => {
      const items = getNavItems({ role: null, isPlatformAdmin: true });
      expect(items).toHaveLength(2);
    });
  });

  describe('owner', () => {
    it('returns full nav with 8 items including incidents badge', () => {
      const items = getNavItems({ role: 'owner', isPlatformAdmin: false });
      expect(items).toHaveLength(8);

      const toList = items.map((i) => i.to);
      expect(toList).toEqual([
        '/',
        '/locations',
        '/staff',
        '/equipment',
        '/readings',
        '/incidents',
        '/reports',
        '/settings',
      ]);

      const incidentsItem = items.find((i) => i.to === '/incidents');
      expect(incidentsItem?.badge).toBe('incidents');
    });
  });

  describe('admin', () => {
    it('returns the same items as owner', () => {
      const owner = getNavItems({ role: 'owner', isPlatformAdmin: false });
      const admin = getNavItems({ role: 'admin', isPlatformAdmin: false });
      expect(admin.map((i) => i.to)).toEqual(owner.map((i) => i.to));
    });
  });

  describe('manager', () => {
    it('returns 6 items including staff but excluding locations and settings', () => {
      const items = getNavItems({ role: 'manager', isPlatformAdmin: false });
      expect(items).toHaveLength(6);

      const toList = items.map((i) => i.to);
      expect(toList).not.toContain('/locations');
      expect(toList).not.toContain('/settings');
      expect(toList).toContain('/staff');
      expect(toList).toContain('/incidents');
      expect(toList).toContain('/reports');
    });

    it('includes incidents badge', () => {
      const items = getNavItems({ role: 'manager', isPlatformAdmin: false });
      const incidentsItem = items.find((i) => i.to === '/incidents');
      expect(incidentsItem?.badge).toBe('incidents');
    });
  });

  describe('staff', () => {
    it('returns only readings item', () => {
      const items = getNavItems({ role: 'staff', isPlatformAdmin: false });
      expect(items).toHaveLength(1);
      expect(items[0]?.to).toBe('/readings');
      expect(items[0]?.label).toBe('Lecturas');
      expect(items[0]?.badge).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('returns empty array when role is null and not platform admin', () => {
      const items = getNavItems({ role: null, isPlatformAdmin: false });
      expect(items).toEqual([]);
    });
  });
});
