import { describe, expect, it } from 'vitest';
import { cityAlternatives, cityAlternativesForDay } from './cityAlternatives';
import { tripDays } from './trip';

const allRoutePlaces = tripDays.flatMap((day) => day.places);
const norm = (value: string) => value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

 describe('city alternatives research data', () => {
  it('satisfies the Place contract and gives every alternative a dated, sourced map destination', () => {
    const validDays = new Set(tripDays.map((day) => day.id));
    const allowedCities = new Set(['Sapporo', 'Hakodate', 'Sendai', 'Matsushima', 'Nikko', 'Kamakura', 'Noboribetsu']);
    expect(cityAlternatives.length).toBeGreaterThanOrEqual(18);
    for (const alternative of cityAlternatives) {
      const { place } = alternative;
      expect(alternative.id).toMatch(/^city-alt-/);
      expect(place.id).toBe(alternative.id);
      expect(allowedCities.has(alternative.city)).toBe(true);
      expect(alternative.suitableDayIds.length).toBeGreaterThan(0);
      expect(alternative.suitableDayIds.every((id) => validDays.has(id))).toBe(true);
      expect(place.role).toBe('backup');
      expect(place.startTime).toBeUndefined();
      expect(place.coordinates?.[0]).toBeGreaterThan(24);
      expect(place.coordinates?.[0]).toBeLessThan(46);
      expect(place.coordinates?.[1]).toBeGreaterThan(122);
      expect(place.coordinates?.[1]).toBeLessThan(154);
      expect(place.mapsQuery.length).toBeGreaterThan(5);
      expect(place.sourceUrl).toMatch(/^https:\/\//);
      expect(place.sourceLabel?.length).toBeGreaterThan(4);
      expect(['research', 'verify-before-trip']).toContain(place.verification);
      expect(place.priceBand).toBeUndefined();
      expect(place.estimatedCostJPY).toBeUndefined();
      if (place.type === 'food') {
        expect(place.mealContext).toBeDefined();
        expect(place.cuisine).toBeDefined();
        expect(place.signature).toBeDefined();
      } else {
        expect(place.type).toBe('optional');
      }
    }
    expect(new Set(cityAlternatives.map(({ id }) => id)).size).toBe(cityAlternatives.length);
  });

  it('offers only distinct venue alternatives and never schedules arrival or travel-only days', () => {
    const routeNames = new Set(allRoutePlaces.map((place) => norm(place.name)));
    const routeQueries = new Set(allRoutePlaces.map((place) => norm(place.mapsQuery)));
    const routeSources = new Set(allRoutePlaces.flatMap((place) => place.sourceUrl ? [place.sourceUrl] : []));
    for (const alternative of cityAlternatives) {
      expect(routeNames.has(norm(alternative.place.name))).toBe(false);
      expect(routeQueries.has(norm(alternative.place.mapsQuery))).toBe(false);
      expect(routeSources.has(alternative.place.sourceUrl!)).toBe(false);
    }
    const forbidden = new Set(['2026-10-24', '2026-10-27', '2026-10-31', '2026-11-02']);
    expect(cityAlternatives.some((item) => item.suitableDayIds.some((dayId) => forbidden.has(dayId)))).toBe(false);
  });

  it('returns only alternatives explicitly assigned to the requested day', () => {
    expect(cityAlternativesForDay('2026-10-25').every((item) => item.suitableDayIds.includes('2026-10-25'))).toBe(true);
    expect(cityAlternativesForDay('2026-10-24')).toEqual([]);
    expect(cityAlternativesForDay('not-a-day')).toEqual([]);
  });
});
