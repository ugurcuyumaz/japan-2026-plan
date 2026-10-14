import { describe, expect, it } from 'vitest';
import { baseCities, baseVisits, bookings, budgetTotals, confirmedHotelTotalEUR, googleDirectionsUrl, googleMapsUrl, openItems, stays, totalNights, tripDays } from './trip';
import { tokyoFlexibleDays, tokyoPoolActivities } from './tokyoPool';

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
    expect(googleDirectionsUrl('Gableview Forest Inn', 'Tobu-Nikko Station', 'taxi')).toContain('travelmode=driving');
    expect(googleDirectionsUrl('Sapporo Station', 'Sapporo View Hotel', 'walk')).toContain('travelmode=walking');
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

  it('keeps booking locations directly searchable on Google Maps', () => {
    const mappedBookings = bookings.filter((booking) => booking.mapsQuery);
    expect(mappedBookings.length).toBeGreaterThan(0);
    expect(mappedBookings.every((booking) => googleMapsUrl(booking.mapsQuery!).startsWith('https://www.google.com/maps/search/?api=1&query='))).toBe(true);
  });

  it('keeps the traveler-confirmed Peach booking and includes the intercity rail legs', () => {
    const flightBooking = bookings.find((booking) => booking.id === 'booking-flights');
    expect(flightBooking?.status).toBe('booked');
    expect(flightBooking?.estimatedCostJPY).toBe(30220);
    const flight = tripDays.find((day) => day.id === '2026-10-24')?.places.find((place) => place.id === 'peach-cts');
    expect(flight?.verification).toBe('confirmed');
    expect(flight?.bookingState).toBe('booked');
    expect(tripDays.find((day) => day.id === '2026-10-29')?.places.some((place) => place.id === 'hakodate-liner')).toBe(true);
    expect(tripDays.find((day) => day.id === '2026-10-31')?.places.some((place) => place.id === 'hayabusa-sendai-tokyo')).toBe(true);
    expect(tripDays.find((day) => day.id === '2026-11-02')?.places.some((place) => place.id === 'nikko-hotel-taxi')).toBe(true);
    expect(tripDays.find((day) => day.id === '2026-10-27')?.places.map((place) => place.id)).toContain('jigokudani');
    expect(tripDays.find((day) => day.id === '2026-10-27')?.places.some((place) => place.id === 'stay-hakodate')).toBe(true);
    expect(tripDays.find((day) => day.id === '2026-10-30')?.places.some((place) => place.id === 'godaido')).toBe(true);
  });

  it('keeps each day in chronological order and exposes cross-area transfer estimates', () => {
    for (const day of tripDays) {
      const scheduled = day.places.flatMap((place) => place.startTime ? [place.startTime] : []);
      expect(scheduled, day.id).toEqual([...scheduled].sort());
    }

    const placeById = (date: string, id: string) => tripDays.find((day) => day.id === date)?.places.find((place) => place.id === id);
    expect(placeById('2026-10-28', 'goryokaku')?.startTime).toBe('09:30');
    expect(placeById('2026-10-28', 'lucky-pierrot')?.startTime).toBe('11:30');
    expect(placeById('2026-10-30', 'senseki-return')?.durationMinutes).toBe(45);
    expect(placeById('2026-11-03', 'nikko-station-taxi')?.travelMode).toBe('taxi');
    expect(placeById('2026-11-05', 'kamakura-return')?.durationMinutes).toBeGreaterThanOrEqual(60);
    expect(placeById('2026-11-05', 'hasedera')?.durationMinutes).toBe(70);
    expect(placeById('2026-11-05', 'enoden-coast')?.name).toContain('Tsurugaoka');
    expect(placeById('2026-11-09', 'wanariya-azabudai-transfer')?.durationMinutes).toBeGreaterThanOrEqual(35);
    expect(placeById('2026-11-11', 'hotel-tokyo-station')?.startTime).toBe('08:00');
  });

  it('keeps the Hakodate summit alternative independent of the Kanemori visit', () => {
    const day = tripDays.find((item) => item.id === '2026-10-28')!;
    const get = (id: string) => day.places.find((place) => place.id === id);
    expect(get('hakodate-summit-outbound')).toBeUndefined();
    expect(get('hakodate-summit-bus')).toBeUndefined();
    expect(get('hakodate-summit')?.startTime).toBeUndefined();
    expect(get('hakodate-summit')?.description).toContain('ropeway is closed');
    expect(get('hakodate-summit-return')).toBeUndefined();
    expect(get('kanemori')?.role).toBe('backup');
  });

  it('does not overlap scheduled core stops once estimated travel is counted', () => {
    for (const day of tripDays) {
      const coreStops = day.places
        .filter((place) => place.type !== 'optional' && place.type !== 'stay' && place.startTime && (place.durationMinutes || place.endTime))
        .map((place) => {
          const start = Number(place.startTime!.slice(0, 2)) * 60 + Number(place.startTime!.slice(3, 5));
          const explicitEnd = place.endTime ? Number(place.endTime.slice(0, 2)) * 60 + Number(place.endTime.slice(3, 5)) : undefined;
          return { place, start, end: start + (place.durationMinutes ?? (explicitEnd! - start)) };
        })
        .sort((a, b) => a.start - b.start);

      for (let index = 1; index < coreStops.length; index += 1) {
        const previous = coreStops[index - 1];
        const current = coreStops[index];
        expect(previous.end, `${day.date}: ${previous.place.id} overlaps ${current.place.id}`).toBeLessThanOrEqual(current.start);
      }
    }
  });

  it('gives every scheduled visit or meal an explicit time budget and unique map pin', () => {
    for (const day of tripDays) {
      const ids = day.places.map((place) => place.id);
      expect(new Set(ids).size, `${day.date}: duplicate place IDs`).toBe(ids.length);
      const missingDuration = day.places
        .filter((place) => place.startTime && ['sight', 'food', 'booking'].includes(place.type) && !place.durationMinutes)
        .map((place) => place.id);
      expect(missingDuration, `${day.date}: scheduled visit/meal needs a realistic duration`).toEqual([]);
      const missingRouteOrigins = day.places
        .filter((place) => place.type === 'transit' && place.travelMode !== 'flight' && place.startTime && !place.originQuery)
        .map((place) => place.id);
      expect(missingRouteOrigins, `${day.date}: transit direction needs a real origin`).toEqual([]);
    }
  });

  it('budgets the critical intercity and neighbourhood transfers explicitly', () => {
    const byId = (date: string, id: string) => tripDays.find((day) => day.id === date)?.places.find((place) => place.id === id);
    expect(byId('2026-10-27', 'noboribetsu-bus-out')?.durationMinutes).toBe(19);
    expect(byId('2026-10-29', 'hakodate-hotel-station-walk')?.durationMinutes).toBe(25);
    expect(byId('2026-10-30', 'matsushima-cruise')?.startTime).toBe('10:00');
    expect(byId('2026-10-30', 'senseki-return')?.startTime).toBe('16:00');
    expect(byId('2026-10-30', 'entsuin')?.role).toBe('backup');
    expect(byId('2026-11-06', 'kiriko-transfer')?.durationMinutes).toBe(35);
    expect(byId('2026-11-07', 'harajuku-shibuya-transfer')).toBeUndefined();
    expect(byId('2026-11-08', 'akabane-transfer')).toBeUndefined();
    expect(byId('2026-11-10', 'tsukiji-nihombashi-transfer')?.originQuery).toBe('Tsukiji Outer Market');
    expect(byId('2026-10-27', 'sapporo-hotel-station-transfer')?.durationMinutes).toBe(30);
    expect(byId('2026-10-27', 'hokuto-noboribetsu')?.startTime).toBe('06:52');
    expect(byId('2026-10-27', 'sapporo-hotel-station-transfer')?.startTime).toBe('06:00');
    expect(byId('2026-10-30', 'sendai-hotel-station-transfer')?.startTime).toBe('07:45');
    expect(byId('2026-11-02', 'gableview-dinner')?.startTime).toBe('19:00');
    expect(byId('2026-11-03', 'toshogu-taxi')?.startTime).toBe('08:00');
    expect(byId('2026-11-03', 'nikko-tokyo-hotel-transfer')?.durationMinutes).toBe(45);
    expect(byId('2026-11-05', 'jr-kamakura')?.startTime).toBe('07:45');
    expect(byId('2026-11-05', 'hase-arrival-transfer')?.startTime).toBe('09:15');
    expect(byId('2026-11-05', 'kamakura-buddha')?.startTime).toBe('10:00');
    expect(byId('2026-11-05', 'hase-arrival-transfer')?.durationMinutes).toBe(25);
    expect(byId('2026-10-31', 'sendai-station-walk')?.durationMinutes).toBe(60);
    expect(byId('2026-11-09', 'hotel-wanariya-transfer')?.startTime).toBe('09:00');
    expect(byId('2026-11-09', 'azabudai-lunch')?.startTime).toBe('13:00');
  });

  it('covers Tokyo first-visit highlights with linked, realistic neighborhood routes', () => {
    const asakusa = tripDays.find((day) => day.id === '2026-11-06')!;
    const asakusaIds = new Set(asakusa.places.map((place) => place.id));
    expect(asakusaIds.has('asakusa-sensoji')).toBe(true);
    expect(asakusaIds.has('asakusa-kappabashi-walk')).toBe(true);
    expect(asakusa.places.find((place) => place.id === 'kuramae-lunch')?.mapsQuery).toBe('Tempura Nakasei Asakusa');
    expect(asakusa.places.find((place) => place.id === 'tempura-nakasei-backup')?.role).toBe('backup');
    expect(asakusa.places.find((place) => place.id === 'hotel-asakusa-transfer')?.originQuery).toContain('Comfort Hotel');
    expect(asakusa.places.find((place) => place.id === 'kiriko-transfer')?.verification).toBe('verify-before-trip');
    expect(tokyoFlexibleDays.map((day) => day.id)).toEqual(['2026-11-04', '2026-11-07', '2026-11-08']);
    const westOption = tokyoPoolActivities.find((activity) => activity.id === 'shibuya-shopping')!;
    expect(westOption.places.some((place) => place.name.includes('Shibuya Scramble'))).toBe(true);
    expect(westOption.places.some((place) => place.name.includes('Shoes'))).toBe(true);
    expect(westOption.places.filter((place) => place.type === 'transit').every((place) => place.originQuery && googleDirectionsUrl(place.mapsQuery, place.originQuery, place.travelMode).includes('/maps/dir/'))).toBe(true);
  });

  it('handles the Sapporo hotel-change day and a low-friction Sendai arrival evening', () => {
    const sapporo = tripDays.find((day) => day.id === '2026-10-25')!;
    const sendai = tripDays.find((day) => day.id === '2026-10-29')!;
    const get = (day: typeof sapporo, id: string) => day.places.find((place) => place.id === id);
    expect(get(sapporo, 'hotel-nijo-transfer')?.originQuery).toBe('Hotel Route-Inn Sapporo Chuo');
    expect(get(sapporo, 'sapporo-clock-tower')?.startTime).toBe('09:00');
    expect(get(sapporo, 'routeinn-luggage-pickup')?.startTime).toBe('14:40');
    expect(get(sapporo, 'routeinn-view-transfer')?.originQuery).toBe('Hotel Route-Inn Sapporo Chuo');
    expect(get(sapporo, 'sapporo-view-checkin')?.startTime).toBe('15:10');
    expect(get(sapporo, 'garaku-backup')?.role).toBe('backup');
    expect(get(sapporo, 'beer-central-return')?.startTime).toBe('17:15');
    expect(sendai.places.find((place) => place.id === 'jozenji-dori')).toBeTruthy();
    expect(sendai.places.find((place) => place.id === 'date-no-gyutan-backup')?.role).toBe('backup');
    expect(sendai.places.find((place) => place.id === 'hotel-jozenji-transfer')?.originQuery).toContain('KOKO HOTEL');
  });
});
