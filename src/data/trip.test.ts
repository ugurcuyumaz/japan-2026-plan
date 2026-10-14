import { describe, expect, it } from 'vitest';
import { baseCities, baseVisits, bookings, budgetTotals, confirmedHotelTotalEUR, googleMapsUrl, openItems, stays, totalNights, tripDays } from './trip';

describe('canonical itinerary data', () => {
  it('contains the complete 20-day trip and five unique bases', () => {
    expect(tripDays).toHaveLength(20);
    expect(baseCities).toHaveLength(5);
    expect(baseVisits.map((visit) => visit.name)).toEqual(['Sapporo', 'Hakodate', 'Sendai', 'Tokyo', 'Nikko', 'Tokyo']);
    expect(totalNights).toBe(18);
    expect(stays.filter((stay) => stay.privateBath)).toHaveLength(0);
  });

  it('keeps every place map-ready and queryable', () => {
    const places = tripDays.flatMap((day) => day.places);
    expect(places.length).toBeGreaterThan(50);
    expect(places.every((place) => place.mapsQuery.length > 3)).toBe(true);
    expect(places.every((place) => googleMapsUrl(place.mapsQuery).startsWith('https://www.google.com/maps/search/?api=1&query='))).toBe(true);
    expect(places.every((place) => place.coordinates?.length === 2)).toBe(true);
    expect(tripDays.filter((day) => day.base !== 'In the air' && day.base !== 'Fly home').every((day) => day.places.some((place) => place.type === 'stay'))).toBe(true);
    expect(tripDays.find((day) => day.id === '2026-10-25')?.places.some((place) => place.id === 'stay-sapporo-view')).toBe(true);
    expect(tripDays.find((day) => day.id === '2026-11-10')?.places.some((place) => place.id === 'stay-tokyo-long')).toBe(true);
  });

  it('derives action and budget summaries from structured data', () => {
    expect(openItems).toHaveLength(10);
    expect(bookings.filter((booking) => booking.status !== 'booked')).toHaveLength(12);
    expect(confirmedHotelTotalEUR).toBe(1738);
    expect(stays).toHaveLength(7);
    expect(stays.every((stay) => stay.status === 'booked')).toBe(true);
    expect(budgetTotals.low).toBeGreaterThan(0);
    expect(budgetTotals.high).toBeGreaterThan(budgetTotals.centre);
  });

  it('keeps the Peach booking explicitly unconfirmed and includes the intercity rail legs', () => {
    const flightBooking = bookings.find((booking) => booking.id === 'booking-flights');
    expect(flightBooking?.status).toBe('verify');
    expect(flightBooking?.estimatedCostJPY).toBe(30220);
    expect(tripDays.find((day) => day.id === '2026-10-29')?.places.some((place) => place.id === 'hakodate-liner')).toBe(true);
    expect(tripDays.find((day) => day.id === '2026-10-31')?.places.some((place) => place.id === 'hayabusa-sendai-tokyo')).toBe(true);
    expect(tripDays.find((day) => day.id === '2026-11-02')?.places.some((place) => place.id === 'nikko-hotel-taxi')).toBe(true);
    expect(tripDays.find((day) => day.id === '2026-10-27')?.places.map((place) => place.id)).toContain('jigokudani');
    expect(tripDays.find((day) => day.id === '2026-10-27')?.places.some((place) => place.id === 'stay-hakodate')).toBe(true);
    expect(tripDays.find((day) => day.id === '2026-10-30')?.places.some((place) => place.id === 'godaido')).toBe(true);
  });
});

