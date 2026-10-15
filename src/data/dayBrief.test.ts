import { describe, expect, it } from 'vitest';
import { baseVisitArrival, dayBrief } from './dayBrief';
import { bookings, stays, tripDays } from './trip';

describe('day essentials', () => {
  it('distinguishes tonight from the hotel being left on a move day', () => {
    const brief = dayBrief(tripDays.find((day) => day.id === '2026-11-03')!, stays, bookings);
    expect(brief.tonight?.id).toBe('stay-tokyo-long');
    expect(brief.leaving?.id).toBe('stay-nikko');
    expect(brief.advance.map((item) => item.id)).toContain('booking-tobu');
    expect(brief.onSite.map((item) => item.id)).toContain('booking-toshogu-admission');
    expect(brief.advance.every((item) => item.status !== 'booked' && item.status !== 'on-site')).toBe(true);
  });
  it('shows checkout, but no hotel tonight, on the flight home', () => {
    const brief = dayBrief(tripDays.find((day) => day.id === '2026-11-11')!, stays, bookings);
    expect(brief.tonight).toBeUndefined();
    expect(brief.leaving?.id).toBe('stay-tokyo-long');
  });
  it('opens each base visit on arrival, including a hotel swap and the return to Tokyo', () => {
    expect(baseVisitArrival('Sapporo', 0, stays, tripDays)?.id).toBe('2026-10-24');
    expect(baseVisitArrival('Tokyo', 0, stays, tripDays)?.id).toBe('2026-10-31');
    expect(baseVisitArrival('Tokyo', 1, stays, tripDays)?.id).toBe('2026-11-03');
  });
});
