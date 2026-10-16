import { describe, expect, it } from 'vitest';
import { groupMapEntries, isAlternative, localMapPoints, mapEntries } from './map';
import { tripDays, stays } from './trip';

describe('map discovery', () => {
  it('gives every route pin a name, description and booked date range', () => {
    const entries = mapEntries(tripDays, 'all');
    expect(entries).toHaveLength(5);
    for (const entry of entries) { expect(entry.title).toBeTruthy(); expect(entry.description.length).toBeGreaterThan(30); expect(entry.subtitle).toMatch(/nights?/); expect(entry.subtitle).toMatch(/Oct|Nov/); }
  });
  it('keeps all seven stays discoverable', () => { expect(mapEntries(tripDays, 'stay').map((entry) => entry.stay?.id)).toEqual(stays.map((stay) => stay.id)); });
  it('keeps primary flexible meals in the main plan and separates actual backups', () => {
    const flexibleMeal = tripDays.flatMap((day) => day.places).find((place) => place.fallback && place.role === 'primary')!;
    expect(flexibleMeal).toBeDefined(); expect(isAlternative(flexibleMeal)).toBe(false);
    expect(tripDays.flatMap((day) => day.places).filter((place) => place.role === 'backup').every(isAlternative)).toBe(true);
  });
  it('shows backup meals in both Food and Alternatives with matching entry counts', () => {
    const backupMeals = tripDays.flatMap((day) => day.places).filter((place) => place.type === 'food' && place.role === 'backup' && place.coordinates);
    expect(backupMeals.length).toBeGreaterThan(0);
    const food = mapEntries(tripDays, 'food');
    const alternatives = mapEntries(tripDays, 'optional');
    for (const place of backupMeals) {
      const id = tripDays.find((day) => day.places.includes(place))!.id + ':' + place.id;
      expect(food.some((entry) => entry.id === id)).toBe(true);
      expect(alternatives.some((entry) => entry.id === id)).toBe(true);
    }
    expect(alternatives.length).toBe(tripDays.flatMap((day) => day.places).filter((place) => place.coordinates && isAlternative(place)).length);
  });
  it('retains every co-located stop in a group', () => {
    const entries = mapEntries(tripDays, 'all', tripDays.find((day) => day.id === '2026-10-27'));
    const groups = groupMapEntries(entries, ([lat, lon]) => ({ x: lon * 1000, y: lat * 1000 }));
    expect(groups.flat().map((entry) => entry.id)).toEqual(expect.arrayContaining(entries.map((entry) => entry.id)));
    expect(groups.flat()).toHaveLength(entries.length);
    expect(groups.some((group) => group.length > 1)).toBe(true);
  });
  it('fits the local Nikko visit without hiding the Tokyo transfer from discovery', () => {
    const day = tripDays.find((day) => day.id === '2026-11-03')!;
    const entries = mapEntries(tripDays, 'all', day);
    expect(entries.some((entry) => entry.coordinates[0] < 36)).toBe(true);
    expect(localMapPoints(entries, day).every(([lat]) => lat > 36)).toBe(true);
  });
});
