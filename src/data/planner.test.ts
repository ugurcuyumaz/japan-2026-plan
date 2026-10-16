import { describe, expect, it } from 'vitest';
import { buildPlannedDays, plannedSpanMinutes, tokyoDateWarnings, tokyoPace } from './planner';
import { tokyoPoolActivities } from './tokyoPool';
import { tripDays } from './trip';
import { emptyTokyoChoices } from './tokyoChoices';
import { cityAlternatives } from './cityAlternatives';
import { isAlternative } from './map';

const activity = (id: string) => tokyoPoolActivities.find((item) => item.id === id)!;
describe('Tokyo time commitment', () => {
  it('includes travel time and distinguishes a short outing from a full day trip', () => {
    expect(plannedSpanMinutes([activity('hakone-gora')])).toBe(705);
    expect(tokyoPace([activity('hakone-gora')])).toBe('full');
    expect(tokyoPace([activity('teamlab-toyosu')])).toBe('light');
  });
  it('counts the whole day when an evening is added and leaves free days light', () => {
    expect(tokyoPace([activity('teamlab-toyosu'), activity('izakaya-evening')])).toBe('full');
    expect(tokyoPace([])).toBe('light');
  });
  it('builds a truthful selected day without changing fixed days or the source template', () => {
    const choices = { ...emptyTokyoChoices(), outings: { '2026-11-04': 'hakone-gora' } };
    const days = buildPlannedDays(tripDays, choices);
    expect(days.find((day) => day.id === '2026-11-04')?.pacing).toBe('full');
    expect(days.find((day) => day.id === '2026-11-05')?.places.filter((place) => !isAlternative(place))).toEqual(tripDays.find((day) => day.id === '2026-11-05')?.places.filter((place) => !isAlternative(place)));
    expect(tripDays.find((day) => day.id === '2026-11-04')?.places.some((place) => place.id === 'pool-hakone-museum')).toBe(false);
  });
  it('adds researched alternatives only to suitable dates and leaves fixed commitments unchanged', () => {
    const planned = buildPlannedDays(tripDays, emptyTokyoChoices());
    for (const option of cityAlternatives) {
      const attached = planned.filter((day) => day.places.some((place) => place.id === option.id));
      expect(attached.map((day) => day.id).sort()).toEqual([...option.suitableDayIds].sort());
      expect(option.place.startTime).toBeUndefined();
      expect(isAlternative(option.place)).toBe(true);
    }
    for (const day of planned) {
      const source = tripDays.find((item) => item.id === day.id)!;
      expect(day.places.filter((place) => !isAlternative(place))).toEqual(source.places.filter((place) => !isAlternative(place)));
    }
    expect(tripDays.flatMap((day) => day.places).some((place) => place.id.startsWith('city-alt-'))).toBe(false);
  });
  it('warns about a known closure in an older saved choice without silently replacing it', () => {
    const choices = { outings: { '2026-11-09': 'nezu-museum' }, evenings: {} };
    expect(tokyoDateWarnings(choices, '2026-11-09').join(' ')).toContain('closed Mondays');
    expect(tokyoDateWarnings(choices, '2026-11-08')).toEqual([]);
    const day = buildPlannedDays(tripDays, choices).find((item) => item.id === '2026-11-09')!;
    expect(day.title).toContain('Nezu Museum');
    expect(day.seasonNote).toContain('closed Mondays');
  });
});
