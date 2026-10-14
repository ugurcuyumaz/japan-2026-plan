import { describe, expect, it } from 'vitest';
import { tokyoFlexibleDays, tokyoPoolActivities } from './tokyoPool';
import { googleDirectionsUrl, googleMapsUrl } from './trip';

describe('Tokyo choose-your-own pool', () => {
  it('keeps Kamakura/booked anchor days separate from the three flexible days', () => {
    expect(tokyoFlexibleDays.map((day) => day.id)).toEqual(['2026-11-04', '2026-11-07', '2026-11-08']);
    expect(tokyoFlexibleDays.some((day) => day.id === '2026-11-05' || day.id === '2026-11-06' || day.id === '2026-11-09')).toBe(false);
    expect(tokyoPoolActivities.filter((activity) => activity.kind === 'outing')).toHaveLength(6);
    expect(tokyoPoolActivities.filter((activity) => activity.kind === 'evening')).toHaveLength(1);
  });

  it('gives each outing a timed, non-overlapping route with usable Google Maps links', () => {
    for (const activity of tokyoPoolActivities) {
      const scheduled = activity.places.filter((place) => place.startTime && place.durationMinutes && place.type !== 'optional')
        .map((place) => ({ place, start: Number(place.startTime!.slice(0, 2)) * 60 + Number(place.startTime!.slice(3, 5)) }))
        .sort((a, b) => a.start - b.start);
      for (let index = 1; index < scheduled.length; index += 1) {
        const previous = scheduled[index - 1];
        expect(previous.start + previous.place.durationMinutes!, `${activity.id}: ${previous.place.id} overlaps ${scheduled[index].place.id}`)
          .toBeLessThanOrEqual(scheduled[index].start);
      }
      expect(activity.places.every((place) => place.mapsQuery.length > 3 && place.coordinates?.length === 2)).toBe(true);
      expect(activity.places.every((place) => googleMapsUrl(place.mapsQuery).startsWith('https://www.google.com/maps/search/'))).toBe(true);
      expect(activity.places.filter((place) => place.type === 'transit').every((place) => place.originQuery && googleDirectionsUrl(place.mapsQuery, place.originQuery, place.travelMode).includes('/maps/dir/'))).toBe(true);
    }
  });

  it('covers requested activity types and two nearby day trips', () => {
    const ids = tokyoPoolActivities.map((activity) => activity.id);
    expect(ids).toEqual(expect.arrayContaining(['deep-fukagawa', 'costco-kawasaki', 'akihabara', 'izakaya-evening', 'shibuya-shopping', 'yokohama', 'kawagoe']));
    expect(tokyoPoolActivities.find((activity) => activity.id === 'costco-kawasaki')?.summary.toLowerCase()).toContain('membership');
  });
});
