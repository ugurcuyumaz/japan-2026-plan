import { tokyoFlexibleDays, tokyoPoolActivities, type TokyoPoolActivity } from './tokyoPool';
import type { Stay } from '../types/trip';

export interface TokyoChoices { outings: Record<string, string>; evenings: Record<string, string> }
export const tokyoStorageKey = 'japan-2026-tokyo-flex-v3';
export const flexibleDayIdSet = new Set(tokyoFlexibleDays.map((day) => day.id));
export const emptyTokyoChoices = (): TokyoChoices => ({ outings: {}, evenings: {} });

// Shared links and saved browser data must refer to known days and the right activity kind.
export function parseTokyoChoices(raw: string): TokyoChoices | undefined {
  if (raw.length > 6000) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    const record = value as Record<string, unknown>;
    if (record.version !== undefined && record.version !== 1) return undefined;
    const result = emptyTokyoChoices();
    for (const key of ['outings', 'evenings'] as const) {
      const items = record[key];
      if (!items || typeof items !== 'object' || Array.isArray(items)) return undefined;
      const used = new Set<string>();
      for (const [dayId, activityId] of Object.entries(items)) {
        if (!flexibleDayIdSet.has(dayId) || typeof activityId !== 'string' || used.has(activityId)) return undefined;
        if (!tokyoPoolActivities.some((activity) => activity.id === activityId && activity.kind === (key === 'outings' ? 'outing' : 'evening'))) return undefined;
        result[key][dayId] = activityId;
        used.add(activityId);
      }
    }
    return result;
  } catch { return undefined; }
}

export function tokyoShareUrl(href: string, choices: TokyoChoices): string {
  const url = new URL(href);
  url.search = '';
  url.searchParams.set('picks', JSON.stringify({ version: 1, ...choices }));
  url.hash = 'tokyo-pool';
  return url.href;
}

export function tokyoTimingWarning(outingId?: string, eveningId?: string): string | undefined {
  const outing = tokyoPoolActivities.find((activity) => activity.id === outingId);
  const evening = tokyoPoolActivities.find((activity) => activity.id === eveningId);
  if (!outing || !evening) return undefined;
  const minutes = (time: string) => Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]);
  const end = Math.max(...outing.places.filter((place) => place.startTime).map((place) => place.endTime ? minutes(place.endTime) : minutes(place.startTime!) + (place.durationMinutes ?? 0)));
  const start = Math.min(...evening.places.filter((place) => place.startTime).map((place) => minutes(place.startTime!)));
  if (end + 30 > start) return 'This outing leaves less than 30 minutes before the evening plan, or overlaps it. Move the evening to another day or revise the timings.';
}

// Pool routes were researched from Comfort Hotel. On the earlier Tokyo stay,
// update the hotel endpoints and remove transfer estimates that no longer apply.
export function tokyoPlacesForHotel(activity: TokyoPoolActivity, hotel?: Stay) {
  const originalHotel = 'Comfort Hotel Tokyo Kiyosumi Shirakawa';
  if (!hotel || hotel.property === originalHotel) return activity.places;
  return activity.places.map((place) => {
    const fromHotel = place.originQuery === originalHotel;
    const toHotel = place.mapsQuery === originalHotel;
    if (!fromHotel && !toHotel) return place;
    return {
      ...place,
      ...(fromHotel ? { originQuery: hotel.property } : {}),
      ...(toHotel ? { mapsQuery: hotel.property, coordinates: hotel.coordinates } : {}),
      description: `Travel ${fromHotel ? 'from' : 'back to'} ${hotel.property}. This route was researched from a different hotel: check a live route and adjust the planned times before going.`,
      durationMinutes: undefined,
      endTime: undefined,
      travelMode: 'train' as const,
      verification: 'verify-before-trip' as const,
    };
  });
}
