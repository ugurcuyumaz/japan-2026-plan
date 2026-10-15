import { describe, expect, it } from 'vitest';
import { japanDate, relevantTripDay } from './navigation';
import { tripDays } from './trip';

describe('trip entry point', () => {
  it('uses Japan time at the date boundary', () => {
    expect(japanDate(new Date('2026-10-23T15:30:00Z'))).toBe('2026-10-24');
  });

  it('opens the first day before travel, today during travel, and the final day after travel', () => {
    expect(relevantTripDay(tripDays, '2026-10-15')).toMatchObject({ day: { id: '2026-10-23' }, label: 'Open first day' });
    expect(relevantTripDay(tripDays, '2026-10-29')).toMatchObject({ day: { id: '2026-10-29' }, label: "Open today's plan" });
    expect(relevantTripDay(tripDays, '2026-11-20')).toMatchObject({ day: { id: '2026-11-11' }, label: 'Review final day' });
  });
});
