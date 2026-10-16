import { describe, expect, it } from 'vitest';
import { buildPlannerBookings } from './bookingActions';
import { emptyTokyoChoices } from './tokyoChoices';
import { tripDays } from './trip';
import { buildTripSearchIndex, searchTripIndex } from './tripSearch';
import type { TripDay } from '../types/trip';

const index = buildTripSearchIndex(tripDays, buildPlannerBookings({ ...emptyTokyoChoices(), outings: { '2026-11-04': 'kawaguchiko' } }));

describe('trip-wide finder index', () => {
  it('finds planned food by cuisine and signature with accent-insensitive matching', () => {
    const gyutan = searchTripIndex(index, 'GYUTAN');
    expect(gyutan.results.some((result) => result.id === 'place-2026-10-29-aji-tasuke')).toBe(true);
    const hoto = searchTripIndex(index, 'hoto');
    expect(hoto.results.some((result) => result.kind === 'idea' && result.title.includes('Kawaguchiko'))).toBe(true);
  });

  it('ranks exact day titles ahead of broader matches', () => {
    const matches = searchTripIndex(index, 'Matsushima Bay day trip');
    expect(matches.results[0]).toMatchObject({ kind: 'day', title: 'Matsushima Bay day trip', target: { kind: 'day', dayId: '2026-10-30' } });
  });

  it('indexes current bookings, static stays, Tokyo ideas, and section shortcuts with actionable targets', () => {
    expect(searchTripIndex(index, 'Fuji Excursion').results.some((item) => item.target.kind === 'booking' && item.target.bookingId.includes('fuji-excursion'))).toBe(true);
    expect(searchTripIndex(index, 'Gableview').results.some((item) => item.target.kind === 'stay')).toBe(true);
    expect(searchTripIndex(index, 'Hakone Open-Air').results[0]).toMatchObject({ target: { kind: 'idea', ideaId: 'hakone-gora' } });
    expect(searchTripIndex(index, 'budget').results[0]).toMatchObject({ target: { kind: 'section', sectionId: 'budget' } });
  });
  it('labels handled bookings in the finder subtitle', () => {
    const booking = buildPlannerBookings(emptyTokyoChoices()).find((item) => item.status === 'unbooked')!;
    const handledIndex = buildTripSearchIndex(tripDays, [{ ...booking, handledAt: '2026-10-15T10:00:00.000Z' }], []);
    expect(handledIndex.find((item) => item.kind === 'booking')?.subtitle).toContain('Handled by you');
  });

  it('reports the full match count while capping the visible list', () => {
    const matches = searchTripIndex(index, 'Tokyo', 16);
    expect(matches.totalMatches).toBeGreaterThan(16);
    expect(matches.results).toHaveLength(16);
  });

  it('returns no arbitrary result for a blank query', () => {
    expect(searchTripIndex(index, '   ')).toEqual({ results: [], totalMatches: 0 });
  });

  it('searches stops by ISO and short dates while excluding untimed hotel markers', () => {
    const day: TripDay = {
      ...tripDays[0],
      id: '2026-11-04',
      date: '2026-11-04',
      weekday: 'Wed',
      base: 'Tokyo',
      title: 'Open Tokyo day',
      places: [
        { id: 'untimed-hotel-marker', name: 'Comfort Hotel marker', type: 'stay', description: 'At a glance hotel marker.', mapsQuery: 'Comfort Hotel', verification: 'confirmed' },
        { id: 'timed-check-in', name: 'Comfort Hotel check-in', type: 'stay', description: 'Check in after arrival.', startTime: '15:00', mapsQuery: 'Comfort Hotel', verification: 'confirmed' },
        { id: 'toyoko-stop', name: 'Toyosu waterfront', type: 'sight', description: 'A planned stop.', mapsQuery: 'Toyosu', verification: 'research' },
      ],
    };
    const testIndex = buildTripSearchIndex([day], [], []);
    expect(testIndex.some((result) => result.id === 'place-2026-11-04-untimed-hotel-marker')).toBe(false);
    expect(testIndex.some((result) => result.id === 'place-2026-11-04-timed-check-in')).toBe(true);
    expect(searchTripIndex(testIndex, '2026-11-04').results.some((result) => result.id === 'place-2026-11-04-toyoko-stop')).toBe(true);
    expect(searchTripIndex(testIndex, '4 Nov').results.some((result) => result.id === 'place-2026-11-04-toyoko-stop')).toBe(true);
  });
});
