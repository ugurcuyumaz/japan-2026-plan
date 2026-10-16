import { describe, expect, it } from 'vitest';
import { baseCities, baseVisits, bookingPartyEstimateJPY, bookings, budgetCategories, budgetTotals, confirmedHotelTotalEUR, googleDirectionsUrl, googleMapsUrl, openItems, stays, totalNights, tripDays } from './trip';
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
    expect(googleDirectionsUrl('Shinjuku Gyoen')).toContain('travelmode=walking');
  });

  it('derives action and budget summaries from structured data', () => {
    expect(openItems).toHaveLength(0);
    expect(bookings.filter((booking) => booking.status !== 'booked')).toHaveLength(21);
    expect(bookings.filter((booking) => booking.status === 'booked').map((booking) => booking.id)).toEqual(['booking-international-flights', 'booking-flights']);
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

  it('shows party prices without understating rail and pass costs', () => {
    expect(bookings.filter((booking) => booking.estimatedCostJPY !== undefined).every((booking) => booking.priceBasis)).toBe(true);
    expect(bookingPartyEstimateJPY(bookings.find((booking) => booking.id === 'booking-jr-east-south-hokkaido-pass')!)).toBe(80_000);
    expect(bookingPartyEstimateJPY(bookings.find((booking) => booking.id === 'booking-hayabusa-tokyo')!)).toBe(22_820);
    expect(bookingPartyEstimateJPY(bookings.find((booking) => booking.id === 'booking-flights')!)).toBe(30_220);
    expect(budgetCategories.find((category) => category.id === 'transport')?.low).toBeGreaterThan(127_680);
  });

  it('keeps the return airport terminal and arrival transfer constraints visible', () => {
    expect(bookings.find((booking) => booking.id === 'booking-narita-transfer')?.destination).toContain('Terminal 2');
    expect(tripDays.find((day) => day.id === '2026-10-24')?.summary).toContain('13:10');
    expect(tripDays.find((day) => day.id === '2026-11-11')?.summary).toContain('158 cm');
  });

  it('tracks researched admission tickets as on-site actions with official information links', () => {
    for (const id of ['booking-mt-moiwa-ticket', 'booking-goryokaku-admission', 'booking-matsushima-cruise', 'booking-zuiganji-admission', 'booking-toshogu-admission', 'booking-kotokuin-admission', 'booking-hasedera-admission', 'booking-rapid-airport']) {
      const item = bookings.find((booking) => booking.id === id);
      expect(item?.status).toBe('on-site');
      expect(item?.purchaseUrl).toMatch(/^https:\/\//);
      expect(item?.estimatedCostJPY).toBeGreaterThan(0);
      expect(item?.dayId).toMatch(/^2026-/);
    }
    expect(bookings.find((item) => item.id === 'booking-narita-transfer')?.extraLinks?.map((link) => link.url)).toContain('https://tyo-nrt.com/en/notes');
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

  it('keeps every booked hotel and overnight pin tied to its confirmed property coordinates', () => {
    for (const day of tripDays) {
      const expectedStays = stays.filter((stay) => stay.checkIn <= day.date && day.date <= stay.checkOut);
      const mappedStays = day.places.filter((place) => place.type === 'stay');
      expect(mappedStays.map((place) => place.id).sort(), day.date).toEqual(expectedStays.map((stay) => stay.id).sort());
      for (const stay of expectedStays) {
        const pin = mappedStays.find((place) => place.id === stay.id)!;
        expect(pin.bookingState, `${day.date}/${stay.id} must remain confirmed`).toBe('booked');
        expect(pin.coordinates, `${day.date}/${stay.id} must use the stored property pin`).toEqual(stay.coordinates);
      }
    }
  });

  it('keeps the Noboribetsu food and rail stopover feasible and avoids overloading the Sapporo hotel-change evening', () => {
    const byId = (date: string, id: string) => tripDays.find((day) => day.id === date)?.places.find((place) => place.id === id);
    const hokutoIn = byId('2026-10-27', 'hokuto-noboribetsu')!;
    const busOut = byId('2026-10-27', 'noboribetsu-bus-out')!;
    const lunch = byId('2026-10-27', 'noboribetsu-lunch')!;
    const luggage = byId('2026-10-27', 'noboribetsu-luggage-return')!;
    const busBack = byId('2026-10-27', 'noboribetsu-bus-return')!;
    const hokutoOut = byId('2026-10-27', 'hokuto-hakodate')!;
    expect(hokutoIn.endTime).toBe('08:03');
    expect(busOut.startTime).toBe('08:23');
    expect(lunch.name).toContain('Onsen Ichiba');
    expect(lunch.startTime).toBe('12:00');
    expect(lunch.sourceUrl).toBe('https://noboribetsu-spa.jp/en/spot/spot0169/');
    expect(byId('2026-10-27', 'noboribetsu-lunch-backup-rikka')?.role).toBe('backup');
    expect(byId('2026-10-27', 'noboribetsu-lunch-backup-rikka')?.sourceUrl).toBe('https://noboribetsu-spa.jp/en/spot/spot0233/');
    expect(byId('2026-10-27', 'noboribetsu-town-walk')?.startTime).toBe('13:00');
    expect(luggage.startTime).toBe('13:30');
    expect(busBack.startTime).toBe('14:15');
    expect(hokutoOut.startTime).toBe('15:59');
    expect(Number(busBack.endTime!.slice(0, 2)) * 60 + Number(busBack.endTime!.slice(3)) + 90).toBeLessThanOrEqual(Number(hokutoOut.startTime!.slice(0, 2)) * 60 + Number(hokutoOut.startTime!.slice(3)));

    const sapporo = tripDays.find((day) => day.id === '2026-10-25')!;
    for (const id of ['sapporo-beer', 'mt-moiwa']) {
      expect(sapporo.places.find((place) => place.id === id)?.type).toBe('optional');
      expect(sapporo.places.find((place) => place.id === id)?.startTime).toBeUndefined();
    }
    expect(sapporo.places.find((place) => place.id === 'garaku-beer-transfer')).toBeUndefined();
    expect(sapporo.places.find((place) => place.id === 'beer-central-return')).toBeUndefined();
  });

  it('keeps the Nikko overnight arrival gentle and the Toshogu visit inside its Nov 3 morning plan', () => {
    const byId = (date: string, id: string) => tripDays.find((day) => day.id === date)?.places.find((place) => place.id === id);
    const arrivalLunch = byId('2026-11-02', 'nikko-arrival-lunch')!;
    expect(arrivalLunch.name).toContain('Asahiya');
    expect(arrivalLunch.sourceUrl).toBe('https://www.nikko-kankou.org/product/369');
    expect(arrivalLunch.startTime).toBe('12:05');
    expect(byId('2026-11-02', 'nikko-hotel-taxi')?.startTime).toBe('14:45');
    expect(byId('2026-11-03', 'toshogu')?.startTime).toBe('09:00');
    expect(byId('2026-11-03', 'toshogu')?.durationMinutes).toBe(120);
    expect(byId('2026-11-03', 'tobu-return')?.startTime).toBe('15:00');
  });

  it('makes the Kamakura day a returnable central-Kamakura route with named lunch choices', () => {
    const day = tripDays.find((item) => item.id === '2026-11-05')!;
    const byId = (id: string) => day.places.find((place) => place.id === id);
    expect(byId('shirasu')?.name).toContain('Harumi');
    expect(byId('shirasu')?.sourceUrl).toContain('city.kamakura.kanagawa.jp');
    expect(byId('hasedera-kaikoan-lunch-backup')?.role).toBe('backup');
    expect(byId('hase-shokudo-lunch-backup')?.role).toBe('backup');
    expect(byId('hase-arrival-transfer')?.mapsQuery).toBe('Hase Station Kamakura');
    expect(byId('hase-arrival-transfer')?.originQuery).toBe('Kamakura Station');
    expect(byId('hase-kamakura-transfer')?.startTime).toBe('13:30');
    expect(byId('enoden-coast')?.name).toContain('Tsurugaoka');
    expect(byId('kamakura-return')?.startTime).toBe('16:00');
    expect(byId('kamakura-return')?.originQuery).toBe('Kamakura Station');
    expect(day.places.some((place) => /enoshima/i.test(`${place.id} ${place.name}`))).toBe(false);
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
    expect(placeById('2026-11-09', 'wanariya-azabudai-transfer')).toBeUndefined();
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
    expect(byId('2026-11-06', 'kiriko-transfer')).toBeUndefined();
    expect(byId('2026-11-07', 'harajuku-shibuya-transfer')).toBeUndefined();
    expect(byId('2026-11-08', 'akabane-transfer')).toBeUndefined();
    expect(byId('2026-11-10', 'tsukiji-nihombashi-transfer')).toBeUndefined();
    expect(byId('2026-10-27', 'sapporo-hotel-station-transfer')?.durationMinutes).toBe(30);
    expect(byId('2026-10-27', 'hokuto-noboribetsu')?.startTime).toBe('06:52');
    expect(byId('2026-10-27', 'sapporo-hotel-station-transfer')?.startTime).toBe('06:00');
    expect(byId('2026-10-30', 'sendai-hotel-station-transfer')?.startTime).toBe('07:45');
    expect(byId('2026-11-02', 'gableview-dinner')?.startTime).toBe('19:00');
    expect(byId('2026-11-02', 'nikko-hotel-taxi')?.startTime).toBe('14:45');
    expect(byId('2026-11-02', 'nikko-shokudo-suziki-lunch-backup')?.role).toBe('backup');
    expect(byId('2026-11-02', 'nikko-shokudo-suziki-lunch-backup')?.sourceUrl).toContain('nikko-kankou.org');
    expect(byId('2026-11-02', 'nikko-dinner-takeaway-backup')?.role).toBe('backup');
    expect(byId('2026-11-03', 'yuba-lunch')?.durationMinutes).toBe(45);
    expect(byId('2026-11-03', 'toshogu-taxi')?.startTime).toBe('08:00');
    expect(byId('2026-11-03', 'nikko-tokyo-hotel-transfer')?.durationMinutes).toBe(45);
    expect(byId('2026-11-05', 'jr-kamakura')?.startTime).toBe('07:45');
    expect(byId('2026-11-05', 'hase-arrival-transfer')?.startTime).toBe('09:15');
    expect(byId('2026-11-05', 'kamakura-buddha')?.startTime).toBe('10:00');
    expect(byId('2026-11-05', 'hase-arrival-transfer')?.durationMinutes).toBe(25);
    expect(byId('2026-10-31', 'sendai-station-walk')).toBeUndefined();
    expect(byId('2026-11-09', 'hotel-wanariya-transfer')).toBeUndefined();
    expect(byId('2026-11-09', 'azabudai-lunch')).toBeUndefined();
  });

  it('keeps all full Tokyo days open except Kamakura and retains essential arrival logistics', () => {
    const openDates = ['2026-11-01', '2026-11-04', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10'];
    for (const date of openDates) {
      const day = tripDays.find((item) => item.id === date)!;
      expect(day.title).toContain('open day');
      expect(day.base).toBe('Tokyo · open choice');
      expect(day.dailyEstimateJPY).toBeUndefined();
      expect(day.places.map((place) => place.id), `${date} should have only its correct booked hotel marker`).toEqual([
        date === '2026-11-01' ? 'stay-tokyo-halloween' : 'stay-tokyo-long',
      ]);
    }
    const arrival = tripDays.find((day) => day.id === '2026-10-31')!;
    expect(arrival.title).toContain('travel day');
    expect(arrival.places.map((place) => place.id)).toEqual(expect.arrayContaining(['hayabusa-sendai-tokyo', 'tokyo-station-arrival', 'stay-tokyo-halloween']));
    expect(arrival.places.some((place) => ['sight', 'food', 'optional'].includes(place.type))).toBe(false);
    const kamakura = tripDays.find((day) => day.id === '2026-11-05')!;
    expect(kamakura.places.some((place) => place.id === 'kamakura-buddha')).toBe(true);
    expect(tokyoFlexibleDays.map((day) => day.id)).toEqual(['2026-11-01', '2026-11-04', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10']);
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
    expect(get(sapporo, 'beer-central-return')).toBeUndefined();
    expect(get(sapporo, 'sapporo-moiwa-transfer')).toBeUndefined();
    expect(get(sapporo, 'sapporo-moiwa-return')).toBeUndefined();
    expect(get(sapporo, 'mt-moiwa')?.travelNote).toContain('Only if you choose');
    expect(get(sapporo, 'mt-moiwa')?.startTime).toBeUndefined();
    expect(sendai.places.find((place) => place.id === 'jozenji-dori')).toBeTruthy();
    expect(sendai.places.find((place) => place.id === 'date-no-gyutan-backup')?.role).toBe('backup');
    expect(sendai.places.find((place) => place.id === 'hotel-jozenji-transfer')?.originQuery).toContain('KOKO HOTEL');
  });
});
