import { describe, expect, it } from 'vitest';
import { dayHistoryDecision, dayTimeLabel, japanDate, normalizeSearchText, relevantTripDay } from './navigation';
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

describe('day navigation', () => {
  it('pushes the first day, replaces day changes, and closes owned entries back to origin', () => {
    expect(dayHistoryDecision(undefined, '2026-10-23', false)).toBe('push');
    expect(dayHistoryDecision('2026-10-23', '2026-10-24', true)).toBe('replace');
    expect(dayHistoryDecision('2026-10-24', undefined, true)).toBe('back');
    expect(dayHistoryDecision('2026-10-24', undefined, false)).toBe('replace');
    expect(dayHistoryDecision('2026-10-24', '2026-10-24', true)).toBe('none');
  });

  it('labels times by the trip day and normalizes accented search text', () => {
    expect(dayTimeLabel(tripDays[0])).toContain('Madrid');
    expect(dayTimeLabel(tripDays[1])).toBe('Japan local time');
    expect(normalizeSearchText('Gyūtan · Café')).toBe('gyutan · cafe');
  });
});
