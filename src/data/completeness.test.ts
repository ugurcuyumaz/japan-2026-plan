import { describe, expect, it } from 'vitest';
import type { Place } from '../types/trip';
import { bookings, googleDirectionsUrl, googleMapsUrl, openItems, tripDays } from './trip';
import { tokyoPoolActivities } from './tokyoPool';

const allPlaces: { scope: string; place: Place }[] = [
  ...tripDays.flatMap((day) => day.places.map((place) => ({ scope: day.date, place }))),
  ...tokyoPoolActivities.flatMap((activity) => activity.places.map((place) => ({ scope: `pool:${activity.id}`, place }))),
];

const dateFromId = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};
const openTokyoDates = new Set(['2026-11-01', '2026-11-04', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10']);
const unplannedMealDates = new Set([...openTokyoDates, '2026-10-31']);

describe('canonical itinerary completeness', () => {
  it('covers the complete 20-date trip window', () => {
    expect(tripDays).toHaveLength(20);
    expect(tripDays[0].date).toBe('2026-10-23');
    expect(tripDays[tripDays.length - 1]?.date).toBe('2026-11-11');
  });

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

  it('provides at least one primary food option and a same-meal alternative on every trip date', () => {
    for (const day of tripDays) {
      if (unplannedMealDates.has(day.date)) continue;
      const primaries = day.places.filter((place) => place.type === 'food' && place.role === 'primary' && place.mealContext);
      expect(primaries.length, `${day.date} needs a primary food option`).toBeGreaterThan(0);
      for (const primary of primaries) {
        expect(day.places.some((place) => place.type === 'food' && place.role === 'backup' && place.mealContext === primary.mealContext), `${day.date}/${primary.id} needs a ${primary.mealContext} alternative`).toBe(true);
      }
    }
  });

  it('builds directly usable Google Maps directions for every scheduled transit leg', () => {
    for (const day of tripDays) {
      for (const place of day.places.filter((item) => item.type === 'transit' && item.startTime && item.travelMode !== 'flight')) {
        const url = new URL(googleDirectionsUrl(place.mapsQuery, place.originQuery, place.travelMode));
        expect(url.protocol, `${day.date}/${place.id} directions must use HTTPS`).toBe('https:');
        expect(url.hostname, `${day.date}/${place.id} directions must open Google Maps`).toBe('www.google.com');
        expect(url.pathname).toBe('/maps/dir/');
        expect(url.searchParams.get('api')).toBe('1');
        expect(url.searchParams.get('origin')).toBe(place.originQuery);
        expect(url.searchParams.get('destination')).toBe(place.mapsQuery);
        const expectedMode = place.travelMode === 'walk' ? 'walking' : place.travelMode === 'taxi' ? 'driving' : 'transit';
        expect(url.searchParams.get('travelmode')).toBe(expectedMode);
      }
    }
  });

  it('keeps restaurant source links as valid secure URLs without using them as opening guarantees', () => {
    for (const { scope, place } of allPlaces.filter(({ place }) => place.type === 'food' && place.sourceUrl)) {
      const source = new URL(place.sourceUrl!);
      expect(source.protocol, `${scope}/${place.id} source should be HTTPS`).toBe('https:');
      expect(place.verification, `${scope}/${place.id} meal needs same-day verification`).not.toBe('confirmed');
    }
  });

  it('gives every primary meal on a dated plan a clearly-labelled alternative', () => {
    for (const day of tripDays) {
      const primaries = day.places.filter((place) => place.type === 'food' && place.role === 'primary' && place.mealContext);
      for (const primary of primaries) {
        expect(day.places.some((place) => place.type === 'food' && place.role === 'backup' && place.mealContext === primary.mealContext), `${day.date}/${primary.id} needs a ${primary.mealContext} backup`).toBe(true);
      }
    }
  });

  it('anchors the corrected Noboribetsu, Nikko and Kamakura meal choices in official sources', () => {
    const pairs = [
      { date: '2026-10-27', primaryId: 'noboribetsu-lunch', backupId: 'noboribetsu-lunch-backup-rikka' },
      { date: '2026-11-02', primaryId: 'nikko-arrival-lunch', backupId: 'nikko-shokudo-suziki-lunch-backup' },
      { date: '2026-11-05', primaryId: 'shirasu', backupId: 'hasedera-kaikoan-lunch-backup' },
    ];
    for (const pair of pairs) {
      const day = tripDays.find((item) => item.date === pair.date)!;
      const primary = day.places.find((place) => place.id === pair.primaryId)!;
      const backup = day.places.find((place) => place.id === pair.backupId)!;
      expect(primary.role, `${pair.date}/${pair.primaryId} should be the selected option`).toBe('primary');
      expect(backup.role, `${pair.date}/${pair.backupId} should be an alternative`).toBe('backup');
      expect(backup.mealContext).toBe(primary.mealContext);
      for (const option of [primary, backup]) {
        const source = new URL(option.sourceUrl!);
        expect(source.protocol).toBe('https:');
        expect(option.verification).not.toBe('confirmed');
        expect(option.mapsQuery.trim().length).toBeGreaterThan(3);
        expect(option.coordinates).toHaveLength(2);
      }
    }
  });

  it('audits breakfast, lunch and dinner for every trip date, including intentional flexible-meal fallbacks', () => {
    const mealContexts = ['breakfast', 'lunch', 'dinner'] as const;
    for (const day of tripDays) {
      if (unplannedMealDates.has(day.date)) continue;
      for (const meal of mealContexts) {
        const primaries = day.places.filter((place) =>
          place.mealContext === meal && place.role !== 'backup' && (place.type === 'food' || place.type === 'sight'),
        );
        expect(primaries.length, `${day.date} ${meal} needs a planned meal or explicit flexible fallback`).toBeGreaterThan(0);
        const backups = day.places.filter((place) => place.type === 'food' && place.role === 'backup' && place.mealContext === meal);
        expect(backups.length, `${day.date} ${meal} needs a named or explicitly disclosed map-search alternative`).toBeGreaterThan(0);

        for (const mealPlace of primaries) {
          expect(mealPlace.type, `${day.date}/${mealPlace.id} must be categorized as food`).toBe('food');
          expect(mealPlace.coordinates, `${day.date}/${mealPlace.id} needs a map pin`).toHaveLength(2);
          expect(mealPlace.mapsQuery.trim(), `${day.date}/${mealPlace.id} needs a useful map query`).not.toBe('');
          expect(mealPlace.cuisine?.trim(), `${day.date}/${mealPlace.id} needs a cuisine or dining style`).toBeTruthy();
          expect(
            Boolean(mealPlace.signature?.trim()) || /signature (dish|not verified)|no signature/i.test(mealPlace.description),
            `${day.date}/${mealPlace.id} must state a signature dish or disclose that it is unverified`,
          ).toBeTruthy();
          expect(
            Boolean(mealPlace.priceBand) || /price (band|is) not verified|price.*not verified|no specific.*price band is verified/i.test(mealPlace.description),
            `${day.date}/${mealPlace.id} must show a price band or explicitly disclose that it is unverified`,
        ).toBeTruthy();
          expect(['confirmed', 'verify-before-trip', 'research']).toContain(mealPlace.verification);
          if (mealPlace.fallback) {
            expect(mealPlace.description, `${day.date}/${mealPlace.id} must disclose that this is a flexible/search fallback`).toMatch(/intentional flexible meal|area-level plan|not a named venue/i);
          }
        }

        const hasNamedBackup = backups.some((backup) => !backup.fallback);
        if (primaries.some((primary) => !primary.fallback)) {
          expect(hasNamedBackup, `${day.date} ${meal} has a selected primary and needs a named backup`).toBe(true);
        }
        if (!hasNamedBackup) {
          expect(
            backups.some((backup) => backup.fallback && /generic Google Maps search area/i.test(backup.description)),
            `${day.date} ${meal} must not present an unverified area search as a named restaurant`,
          ).toBe(true);
        }
      }
    }
  });

  it('keeps deliberately open Tokyo days free of scheduled stops while preserving booked hotel map pins', () => {
    for (const date of openTokyoDates) {
      const day = tripDays.find((item) => item.date === date)!;
      expect(day.places).toHaveLength(1);
      expect(day.places[0].type).toBe('stay');
      expect(day.places[0].bookingState).toBe('booked');
    }
  });

  it('keeps meal records categorized, mapped and honest about unverified menu details', () => {
    for (const day of tripDays) {
      for (const place of day.places.filter((item) => item.type === 'food' && item.mealContext)) {
        const scope = day.date;
        expect(place.coordinates, `${scope}/${place.id} needs coordinates`).toHaveLength(2);
        expect(place.mapsQuery.trim(), `${scope}/${place.id} needs a map query`).not.toBe('');
        expect(place.cuisine?.trim(), `${scope}/${place.id} needs cuisine or dining style`).toBeTruthy();
        expect(place.verification, `${scope}/${place.id} needs a verification status`).toBeTruthy();
        expect(
          Boolean(place.signature?.trim()) || /signature (dish|not verified)|no signature|signature.*not verified/i.test(place.description),
          `${scope}/${place.id} must give a signature or say it is unverified`,
        ).toBe(true);
        expect(
          Boolean(place.priceBand) || /price (band|is) not verified|price.*not verified|no specific.*price band is verified/i.test(place.description),
          `${scope}/${place.id} must give a price band or say it is unverified`,
        ).toBe(true);
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

