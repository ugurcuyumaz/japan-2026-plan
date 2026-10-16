import type { TripSearchTarget } from './tripSearch';
import { tripDays, stays } from './trip';
import { buildPlannedDays } from './planner';
import { emptyTokyoChoices, tokyoPlacesForHotel } from './tokyoChoices';
import { tokyoFlexibleDays, tokyoPoolActivities } from './tokyoPool';
import { shortDate } from './map';

export type ShortlistKey = `idea:${string}` | `place:${string}:${string}`;
export const shortlistStorageKey = 'japan-2026-shortlist-v1';
export const ideaKey = (id: string): ShortlistKey => `idea:${id}`;
export const placeKey = (dayId: string, placeId: string): ShortlistKey => `place:${dayId}:${placeId}`;

export interface ShortlistEntry {
  key: ShortlistKey;
  title: string;
  area: string;
  kind: 'idea' | 'place';
  summary: string;
  target: TripSearchTarget;
}

const catalog = new Map<ShortlistKey, ShortlistEntry>();
const staticDays = buildPlannedDays(tripDays, emptyTokyoChoices());
for (const day of staticDays) for (const place of day.places) {
  catalog.set(placeKey(day.id, place.id), {
    key: placeKey(day.id, place.id), title: place.name, area: `${day.base} · ${day.weekday} ${shortDate(day.id)}`,
    kind: 'place', summary: place.description, target: { kind: 'day', dayId: day.id, placeId: place.id },
  });
}
for (const activity of tokyoPoolActivities) {
  const key = ideaKey(activity.id);
  catalog.set(key, { key, title: activity.title, area: activity.area, kind: 'idea', summary: activity.summary, target: { kind: 'idea', ideaId: activity.id } });
  for (const day of tokyoFlexibleDays) {
    const hotel = stays.find((stay) => stay.checkIn <= day.id && day.id < stay.checkOut);
    for (const place of tokyoPlacesForHotel(activity, hotel)) {
      const datedKey = placeKey(day.id, place.id);
      catalog.set(datedKey, { key: datedKey, title: place.name, area: `Tokyo · ${day.label}`, kind: 'place', summary: place.description, target: { kind: 'day', dayId: day.id, placeId: place.id } });
    }
  }
}

const known = new Set(catalog.keys());
export function parseShortlist(raw: string): ShortlistKey[] | undefined {
  if (raw.length > 24000) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || value.length > 300) return undefined;
    const keys: ShortlistKey[] = [];
    const seen = new Set<string>();
    for (const key of value) {
      if (typeof key !== 'string' || !known.has(key as ShortlistKey) || seen.has(key)) return undefined;
      seen.add(key);
      keys.push(key as ShortlistKey);
    }
    return keys;
  } catch { return undefined; }
}

export function shortlistEntries(keys: ShortlistKey[]): ShortlistEntry[] {
  return keys.flatMap((key) => { const entry = catalog.get(key); return entry ? [entry] : []; });
}

export function isKnownShortlistKey(key: string): key is ShortlistKey { return known.has(key as ShortlistKey); }
