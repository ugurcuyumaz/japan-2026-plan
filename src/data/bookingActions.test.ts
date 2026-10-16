import { describe, expect, it } from 'vitest';
import { bookings } from './trip';
import { buildPlannerBookings } from './bookingActions';
import { emptyTokyoChoices } from './tokyoChoices';

describe('planner booking actions', () => {
  it('preserves the fixed booking list when no Tokyo ideas are selected', () => {
    expect(buildPlannerBookings(emptyTokyoChoices())).toEqual(bookings);
  });

  it('adds one unbooked timed ticket task for an assigned teamLab day', () => {
    const result = buildPlannerBookings({ outings: { '2026-11-04': 'teamlab-toyosu' }, evenings: {} });
    const actions = result.filter((booking) => booking.dayId === '2026-11-04');
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      id: 'booking-tokyo-teamlab-ticket-2026-11-04',
      status: 'unbooked',
      item: expect.stringContaining('timed admission ticket'),
      purchaseUrl: 'https://teamlabplanets.dmm.com/en/guide',
    });
    expect(actions[0].estimatedCostJPY).toBeUndefined();
  });

  it('moves action IDs with their assigned date and removes the old date action', () => {
    const moved = buildPlannerBookings({ outings: { '2026-11-06': 'teamlab-toyosu' }, evenings: {} });
    expect(moved.some((booking) => booking.id === 'booking-tokyo-teamlab-ticket-2026-11-04')).toBe(false);
    expect(moved.some((booking) => booking.id === 'booking-tokyo-teamlab-ticket-2026-11-06')).toBe(true);
    expect(buildPlannerBookings(emptyTokyoChoices()).some((booking) => booking.id.includes('teamlab-ticket'))).toBe(false);
  });

  it('includes Fuji and Romancecar seat instructions without adding fare estimates', () => {
    const result = buildPlannerBookings({
      outings: { '2026-11-04': 'kawaguchiko', '2026-11-06': 'hakone-gora' },
      evenings: {},
    }).filter((booking) => booking.id.startsWith('booking-tokyo-'));
    expect(result).toHaveLength(4);
    expect(result.map((booking) => booking.item).join(' ')).toContain('Fuji Excursion');
    expect(result.map((booking) => booking.item).join(' ')).toContain('Romancecar');
    expect(result.every((booking) => booking.estimatedCostJPY === undefined)).toBe(true);
    expect(result.every((booking) => /reserve/i.test(booking.item))).toBe(true);
    expect(new Set(result.map((booking) => booking.id)).size).toBe(4);
  });
});
