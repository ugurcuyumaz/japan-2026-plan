import { describe, expect, it } from 'vitest';
import type { Booking, Place, TripDay } from '../types/trip';
import { firstPlannedTransfer, openPreparationTasks, travelDeskContext } from './travelDesk';
import { japanDate } from './navigation';

const day = (id: string, places: Place[] = []): TripDay => ({
  id, date: id, weekday: 'Saturday', base: 'Tokyo', title: 'Tokyo day', summary: 'A planned day.', region: 'tokyo', keyDay: false,
  pacing: 'light', tags: [], seasonNote: '', places,
});
const transfer = (id: string, startTime: string, role?: Place['role']): Place => ({
  id, name: id, type: 'transit', description: '', startTime, mapsQuery: id, verification: 'research', role,
});
const booking = (id: string, dayId: string, deadline = 'Book ahead'): Booking => ({
  id, item: id, date: dayId, dayId, priority: 'required', status: 'unbooked', deadline, destination: 'Tokyo', notes: '',
});

describe('travel desk date and transfer context', () => {
  it('uses the Japan calendar date across the UTC date boundary and distinguishes before/during/after', () => {
    const days = [day('2026-10-24'), day('2026-10-25')];
    const japanToday = japanDate(new Date('2026-10-23T15:01:00.000Z'));
    expect(japanToday).toBe('2026-10-24');
    expect(travelDeskContext(days, japanToday)?.selectedDay.id).toBe('2026-10-24');
    expect(travelDeskContext(days, japanToday)?.shortcutLabel).toBe('Today');
    expect(travelDeskContext(days, '2026-10-23')?.shortcutLabel).toBe('First day');
    expect(travelDeskContext(days, '2026-10-26')?.shortcutLabel).toBe('Final day');
  });

  it('keeps a selected preview separate from today and chooses the earliest planned transfer only', () => {
    const today = day('2026-10-24');
    const tomorrow = day('2026-10-25', [
      transfer('late-planned', '10:30'),
      transfer('early-backup', '06:00', 'backup'),
      transfer('early-planned', '08:10'),
      { ...transfer('earlier-sight', '07:00'), type: 'sight' },
    ]);
    const context = travelDeskContext([today, tomorrow], today.id, tomorrow.id);
    expect(context?.actualTripDay?.id).toBe(today.id);
    expect(context?.selectedDay.id).toBe(tomorrow.id);
    expect(context?.shortcutLabel).toBe('Today');
    expect(firstPlannedTransfer(tomorrow)?.id).toBe('early-planned');
  });

  it('keeps the rail-pass decision before same-day train-seat tasks', () => {
    const { items } = openPreparationTasks([booking('hokuto-seats', '2026-10-27'), booking('booking-jr-east-south-hokkaido-pass', '2026-10-27', 'Confirm purchase status now')], '2026-10-23');
    expect(items[0].id).toBe('booking-jr-east-south-hokkaido-pass');
  });

  it('puts exact-date actions first and excludes earlier open actions from later previews', () => {
    const { items, exactCount } = openPreparationTasks([
      booking('late', '2026-11-05'),
      booking('past', '2026-10-27'),
      booking('exact-2', '2026-11-03', 'Earlier deadline'),
      booking('exact-1', '2026-11-03', 'Later deadline'),
    ], '2026-11-03');
    expect(items.map((item) => item.id)).toEqual(['exact-2', 'exact-1', 'late']);
    expect(exactCount).toBe(2);
    expect(items.some((item) => item.id === 'past')).toBe(false);
  });
});
