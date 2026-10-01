import { describe, expect, it } from 'vitest';
import { baseCities, bookings, budgetTotals, confirmedHotelTotalEUR, googleMapsUrl, openItems, stays, totalNights, tripDays } from './trip';

describe('canonical itinerary data', () => {
  it('contains the complete 20-day trip and five unique bases', () => {
    expect(tripDays).toHaveLength(20);
    expect(baseCities).toHaveLength(5);
    expect(totalNights).toBe(18);
    expect(stays.filter((stay) => stay.privateBath)).toHaveLength(0);
  });

  it('keeps every place map-ready and queryable', () => {
    const places = tripDays.flatMap((day) => day.places);
    expect(places.length).toBeGreaterThan(50);
    expect(places.every((place) => place.mapsQuery.length > 3)).toBe(true);
    expect(places.every((place) => googleMapsUrl(place.mapsQuery).startsWith('https://www.google.com/maps/search/?api=1&query='))).toBe(true);
    expect(places.every((place) => place.coordinates?.length === 2)).toBe(true);
  });

  it('derives action and budget summaries from structured data', () => {
    expect(openItems).toHaveLength(8);
    expect(bookings.filter((booking) => booking.status !== 'booked')).toHaveLength(9);
    expect(confirmedHotelTotalEUR).toBe(777);
    expect(budgetTotals.low).toBeGreaterThan(0);
    expect(budgetTotals.high).toBeGreaterThan(budgetTotals.centre);
  });
});
