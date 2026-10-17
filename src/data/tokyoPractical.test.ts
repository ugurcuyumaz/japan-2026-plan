import { describe, expect, it } from 'vitest';
import { tokyoResources, getTokyoResource, resourceMeals } from './tokyoPractical';
import { tripDays } from './trip';

describe('Tokyo practical resources', () => {
  it('has unique identifiers and supports lookup', () => {
    const ids = tokyoResources.map((resource) => resource.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const resource of tokyoResources) expect(getTokyoResource(resource.id)).toBe(resource);
  });

  it('includes only the seven workshop options with direct English-instruction evidence', () => {
    const workshops = tokyoResources.filter((resource) => resource.kind === 'workshop');
    expect(workshops).toHaveLength(7);
    expect(workshops.every((resource) => resource.languageEvidenceUrl && resource.sources.some((source) => source.url === resource.languageEvidenceUrl))).toBe(true);
    expect(workshops.every((resource) => /English/i.test(resource.languageLabel))).toBe(true);
  });

  it('limits Ozu Washi to its published in-trip session days', () => {
    expect(getTokyoResource('ozu-washi-making')?.candidateDayIds).toEqual(['2026-11-04', '2026-11-06', '2026-11-07', '2026-11-10']);
  });

  it('includes the seven researched food options with meal and hotel details', () => {
    const food = tokyoResources.filter((resource) => resource.kind === 'food');
    expect(food).toHaveLength(7);
    expect(food.every((resource) => resource.hotelId && resource.mealTags?.length && resource.sources.length > 0)).toBe(true);
  });

  it('retains exact weekly and dated meal restrictions', () => {
    expect(getTokyoResource('hotel-food-ichibanboshi')?.scheduleNote).toMatch(/Monday and Tuesday/);
    expect(getTokyoResource('hotel-food-iki-espresso')?.notes.join(' ')).toMatch(/Not a dinner fallback/);
    expect(getTokyoResource('hotel-food-clann')?.scheduleNote).toMatch(/9 Nov 2026 is breakfast only.*no lunch or dinner/i);
    expect(getTokyoResource('hotel-food-jidorinyo')?.scheduleNote).toMatch(/Do not suggest 1 Nov dinner/);
  });

  it('returns the right meal tags for dates with special service', () => {
    const clann = getTokyoResource('hotel-food-clann')!;
    expect(resourceMeals(clann, '2026-11-09')).toEqual(['breakfast']);
    expect(resourceMeals(clann, '2026-11-09')).not.toContain('dinner');
    const kamasho = getTokyoResource('hotel-food-fukagawa-kamasho')!;
    for (const date of ['2026-11-05', '2026-11-10']) {
      expect(resourceMeals(kamasho, date)).toEqual(['lunch']);
      expect(resourceMeals(kamasho, date)).not.toContain('dinner');
    }
    expect(resourceMeals(kamasho, '2026-11-09')).toEqual([]);
  });

  it('labels group pricing and quotes with a clear basis', () => {
    expect(getTokyoResource('ozu-washi-making')?.priceLabel).toMatch(/group.*up to 4/i);
    expect(getTokyoResource('taiko-lab-private')?.priceLabel).toMatch(/two-person quote/i);
  });

  it('uses real trip dates for all candidate dates', () => {
    const knownDates = new Set(tripDays.map((day) => day.id));
    for (const resource of tokyoResources) {
      expect(resource.candidateDayIds.length).toBeGreaterThan(0);
      expect(resource.candidateDayIds.every((date) => knownDates.has(date))).toBe(true);
    }
  });
});
