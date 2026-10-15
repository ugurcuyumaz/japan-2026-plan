import { describe, expect, it } from 'vitest';
import { buildPlannedDays, plannedSpanMinutes, tokyoPace } from './planner';
import { tokyoPoolActivities } from './tokyoPool';
import { tripDays } from './trip';
import { emptyTokyoChoices } from './tokyoChoices';

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
    expect(days.find((day) => day.id === '2026-11-05')).toBe(tripDays.find((day) => day.id === '2026-11-05'));
    expect(tripDays.find((day) => day.id === '2026-11-04')?.places.some((place) => place.id === 'pool-hakone-museum')).toBe(false);
  });
});
