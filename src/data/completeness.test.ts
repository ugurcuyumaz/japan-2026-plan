import { describe, expect, it } from 'vitest';
import type { Place } from '../types/trip';
import { bookings, googleMapsUrl, openItems, tripDays } from './trip';
import { tokyoPoolActivities } from './tokyoPool';

const allPlaces: { scope: string; place: Place }[] = [
  ...tripDays.flatMap((day) => day.places.map((place) => ({ scope: day.date, place }))),
  ...tokyoPoolActivities.flatMap((activity) => activity.places.map((place) => ({ scope: `pool:${activity.id}`, place }))),
];

const dateFromId = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

describe('canonical itinerary completeness', () => {
  it('covers every calendar date in the trip and has unique place IDs within each day', () => {
    expect(tripDays.length).toBeGreaterThan(0);
    for (let index = 0; index < tripDays.length; index += 1) {
      const day = tripDays[index];
      expect(day.id, `day ${index} must use its canonical date as ID`).toBe(day.date);
      if (index > 0) {
        const previous = dateFromId(tripDays[index - 1].date);
        const current = dateFromId(day.date);
        expect(current.getTime() - previous.getTime(), `${day.date} must follow the prior itinerary date`).toBe(24 * 60 * 60 * 1000);
      }
      const ids = day.places.map((place) => place.id);
      expect(new Set(ids).size, `${day.date} contains duplicate place IDs`).toBe(ids.length);
    }
  });

  it('keeps every mapped itinerary and Tokyo-pool place coordinate-valid and searchable', () => {
    for (const { scope, place } of allPlaces) {
      expect(place.mapsQuery.trim().length, `${scope}/${place.id} needs a maps query`).toBeGreaterThan(0);
      expect(place.coordinates, `${scope}/${place.id} needs map coordinates`).toHaveLength(2);
      const [latitude, longitude] = place.coordinates!;
      expect(Number.isFinite(latitude) && latitude >= -90 && latitude <= 90, `${scope}/${place.id} latitude is invalid`).toBe(true);
      expect(Number.isFinite(longitude) && longitude >= -180 && longitude <= 180, `${scope}/${place.id} longitude is invalid`).toBe(true);
      const mapsUrl = new URL(googleMapsUrl(place.mapsQuery));
      expect(mapsUrl.protocol).toBe('https:');
      expect(mapsUrl.hostname).toBe('www.google.com');
      expect(mapsUrl.pathname).toBe('/maps/search/');
      expect(mapsUrl.searchParams.get('query'), `${scope}/${place.id} Google Maps URL must contain a query`).toBe(place.mapsQuery);
    }
  });

  it('gives scheduled non-flight transit a route origin and scheduled visits/food a duration', () => {
    for (const { scope, place } of allPlaces) {
      if (place.type === 'transit' && place.startTime && place.travelMode !== 'flight') {
        expect(place.originQuery?.trim(), `${scope}/${place.id} scheduled transit needs an origin`).toBeTruthy();
      }
      if (place.startTime && ['sight', 'food'].includes(place.type)) {
        expect(place.durationMinutes, `${scope}/${place.id} scheduled ${place.type} needs a duration`).toBeGreaterThan(0);
      }
    }
  });

  it('retains booking-attention records and keeps open-item booking references resolvable', () => {
    const bookingIds = new Set(bookings.map((booking) => booking.id));
    expect(bookings.length).toBeGreaterThan(0);
    expect(bookings.some((booking) => booking.status === 'unbooked' || booking.status === 'verify')).toBe(true);
    for (const booking of bookings) {
      expect(booking.id.trim().length, 'booking records need stable IDs').toBeGreaterThan(0);
      expect(booking.item.trim().length, `${booking.id} needs a visible item`).toBeGreaterThan(0);
      if (booking.status !== 'booked') {
        expect(booking.notes.trim().length, `${booking.id} needs its booking-attention context`).toBeGreaterThan(0);
      }
    }
    for (const item of openItems) {
      if (item.relatedId?.startsWith('booking-')) {
        expect(bookingIds.has(item.relatedId), `${item.id} references a missing booking`).toBe(true);
      }
    }
  });
});
