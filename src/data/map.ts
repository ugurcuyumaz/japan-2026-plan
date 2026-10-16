import { baseCities, stays } from './trip';
import type { ItemType, Place, Stay, TripDay } from '../types/trip';

export interface MapEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: ItemType;
  coordinates: [number, number];
  label: string;
  day?: TripDay;
  place?: Place;
  stay?: Stay;
  city?: string;
}

export const mapTypeLabel: Record<ItemType, string> = { sight: 'Sight', food: 'Food', optional: 'Optional', transit: 'Transport', stay: 'Stay', booking: 'Book / check', note: 'Note' };
export const shortDate = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
export const isAlternative = (place: Place) => place.role === 'backup' || place.type === 'optional';
export const matchesMapLayer = (place: Place, filter: ItemType | 'all'): boolean => filter === 'all' || (filter === 'optional' ? isAlternative(place) : place.type === filter);
export const cityDescriptions: Record<string, string> = {
  Sapporo: 'Ease into Japan with autumn walks, soup curry and a gentle start after the flight.',
  Hakodate: 'Morning-market seafood, the star-shaped fort and Motomachi’s hillside streets.',
  Sendai: 'A relaxed city base for gyutan dinners and the Matsushima Bay day trip.',
  Tokyo: 'Two stays around the Nikko overnight, with one Kamakura day and room to choose the rest.',
  Nikko: 'Settle into the forest inn, then visit Toshogu early before returning to Tokyo.',
};

export function mapEntries(days: TripDay[], filter: ItemType | 'all', day?: TripDay): MapEntry[] {
  if (!day && filter === 'all') return baseCities.map((city, index) => {
    const hotels = stays.filter((stay) => stay.city === city.name);
    return { id: `base-${city.name}`, title: city.name, subtitle: `${city.nights} night${city.nights === 1 ? '' : 's'} · ${hotels.map((stay) => `${shortDate(stay.checkIn)}–${shortDate(stay.checkOut)}`).join(' / ')}`, description: cityDescriptions[city.name], type: 'stay', coordinates: city.coordinates, label: `${index + 1}`, city: city.name };
  });
  if (!day && filter === 'stay') return stays.map((stay) => ({ id: stay.id, title: stay.property, subtitle: `${stay.city} · ${stay.dates} · ${stay.nights} nights`, description: stay.note, type: 'stay', coordinates: stay.coordinates, label: '⌂', stay }));
  return (day ? [day] : days).flatMap((tripDay) => tripDay.places.filter((place) => place.coordinates && matchesMapLayer(place, filter)).map((place, index) => ({ id: `${tripDay.id}:${place.id}`, title: place.name, subtitle: `${shortDate(tripDay.id)}${place.startTime ? ` · ${place.startTime}${place.endTime ? `–${place.endTime}` : ''}` : ' · Flexible'}${isAlternative(place) ? ' · Alternative' : ''}`, description: place.description, type: place.type, coordinates: place.coordinates!, label: `${index + 1}`, day: tripDay, place })));
}

export function distanceKm(a: [number, number], b: [number, number]) {
  const rad = (n: number) => n * Math.PI / 180;
  const dLat = rad(b[0] - a[0]); const dLon = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function localMapPoints(entries: MapEntry[], day?: TripDay): [number, number][] {
  const points = entries.map((entry) => entry.coordinates);
  const anchor = day?.places.find((place) => place.coordinates && ['sight', 'food', 'optional'].includes(place.type))?.coordinates;
  const local = anchor ? points.filter((point) => distanceKm(point, anchor) <= 30) : points;
  return local.length ? local : points;
}

// Group in screen space: nearby stops remain individually discoverable in the details list,
// including several entries with exactly the same coordinates.
export function groupMapEntries(entries: MapEntry[], project: (coordinates: [number, number]) => { x: number; y: number }, radius = 42): MapEntry[][] {
  const groups: { point: { x: number; y: number }; entries: MapEntry[] }[] = [];
  for (const entry of entries) {
    const point = project(entry.coordinates);
    const nearby = groups.find((group) => Math.hypot(group.point.x - point.x, group.point.y - point.y) < radius);
    if (nearby) nearby.entries.push(entry);
    else groups.push({ point, entries: [entry] });
  }
  return groups.map((group) => group.entries);
}
