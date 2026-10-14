import { describe, expect, it } from 'vitest';
import { tokyoFlexibleDays, tokyoPoolActivities } from './tokyoPool';

describe('Tokyo choose-your-own pool', () => {
  it('offers every full Tokyo free day while excluding Kamakura and intercity transfer days', () => {
    expect(tokyoFlexibleDays.map((day) => day.id)).toEqual([
      '2026-11-01', '2026-11-04', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10',
    ]);
    expect(tokyoFlexibleDays.some((day) => ['2026-10-31', '2026-11-02', '2026-11-03', '2026-11-05', '2026-11-11'].includes(day.id))).toBe(false);
    expect(tokyoFlexibleDays.every((day) => day.label.includes('open Tokyo day'))).toBe(true);
    expect(tokyoFlexibleDays.every((day) => day.outing === null && day.evening === null)).toBe(true);
    expect(tokyoPoolActivities.filter((activity) => activity.kind === 'outing')).toHaveLength(10);
    expect(tokyoPoolActivities.filter((activity) => activity.kind === 'evening')).toHaveLength(1);
  });

  it('gives each outing a timed, non-overlapping route with usable Google Maps links', () => {
    for (const activity of tokyoPoolActivities) {
      const scheduled = activity.places.filter((place) => place.startTime && place.durationMinutes && place.type !== 'optional')
        .map((place) => ({ place, start: Number(place.startTime!.slice(0, 2)) * 60 + Number(place.startTime!.slice(3, 5)) }))
        .sort((a, b) => a.start - b.start);
      for (let index = 1; index < scheduled.length; index += 1) {
        const previous = scheduled[index - 1];
        expect(previous.start + previous.place.durationMinutes!, `${activity.id}: ${previous.place.id} overlaps ${scheduled[index].place.id}`)
          .toBeLessThanOrEqual(scheduled[index].start);
      }
      expect(activity.places.every((place) => place.mapsQuery.length > 3 && place.coordinates?.length === 2 && place.coordinates.every(Number.isFinite))).toBe(true);
      expect(new Set(activity.places.map((place) => place.id)).size, `${activity.id} place ids should be unique`).toBe(activity.places.length);
      expect(activity.places.filter((place) => place.type === 'transit').every((place) => place.originQuery && place.travelMode)).toBe(true);
      expect(activity.sources.every((source) => new URL(source.url).protocol === 'https:')).toBe(true);
    }
  });

  it('covers the stated choice interests with distinct, manageable outing types', () => {
    const ids = tokyoPoolActivities.map((activity) => activity.id);
    expect(ids).toEqual(expect.arrayContaining(['deep-fukagawa', 'costco-kawasaki', 'akihabara', 'izakaya-evening', 'shibuya-shopping', 'yokohama', 'kawagoe', 'kawaguchiko', 'asakusa-ueno', 'shinjuku-green', 'odaiba-bay']));
    expect(tokyoPoolActivities.find((activity) => activity.id === 'costco-kawasaki')?.summary.toLowerCase()).toContain('membership');
    expect(tokyoPoolActivities.find((activity) => activity.id === 'akihabara')?.title).toMatch(/games.*electronics/i);
    expect(tokyoPoolActivities.find((activity) => activity.id === 'shibuya-shopping')?.title).toMatch(/shoes.*clothing/i);
    expect(tokyoPoolActivities.find((activity) => activity.id === 'izakaya-evening')?.kind).toBe('evening');
    expect(tokyoPoolActivities.filter((activity) => activity.area.startsWith('Full day trip'))).toHaveLength(3);
  });

  it('keeps Kawaguchiko a realistic, weather-aware rail-and-bus day with named meal fallback', () => {
    const fuji = tokyoPoolActivities.find((activity) => activity.id === 'kawaguchiko')!;
    expect(fuji.durationLabel).toContain('12 hours');
    expect(fuji.routeNote).toMatch(/not a promised November 2026 timetable/i);
    expect(fuji.routeNote).toMatch(/reserve the limited express/i);
    expect(fuji.places.find((place) => place.id === 'pool-kawaguchiko-train-out')?.travelMode).toBe('train');
    expect(fuji.places.find((place) => place.id === 'pool-kawaguchiko-bus-oishi')?.travelMode).toBe('bus');
    expect(fuji.places.find((place) => place.id === 'pool-kawaguchiko-cruise')?.type).toBe('optional');
    expect(fuji.places.find((place) => place.id === 'pool-kawaguchiko-lunch')?.role).toBe('primary');
    expect(fuji.places.find((place) => place.id === 'pool-kawaguchiko-lunch-backup')?.name).toContain('Hoto Fudo');
    expect(fuji.places.find((place) => place.id === 'pool-kawaguchiko-lunch-backup')?.role).toBe('backup');
  });

  it('makes the pool scannable by effort and travel commitment', () => {
    const areas = tokyoPoolActivities.map((activity) => activity.area);
    expect(areas.filter((area) => area.startsWith('Easy local day'))).toHaveLength(1);
    expect(areas.filter((area) => area.startsWith('Tokyo neighborhood'))).toHaveLength(3);
    expect(areas.filter((area) => area.startsWith('Tokyo culture day'))).toHaveLength(1);
    expect(areas.filter((area) => area.startsWith('Tokyo bay day'))).toHaveLength(1);
    expect(areas.filter((area) => area.startsWith('Full day trip'))).toHaveLength(3);
    expect(areas.filter((area) => area.startsWith('Special-purpose outing'))).toHaveLength(1);
    expect(areas.filter((area) => area.startsWith('Optional evening'))).toHaveLength(1);

    const duration = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
    for (const activity of tokyoPoolActivities.filter((item) => item.kind === 'outing')) {
      const timed = activity.places.filter((place) => place.startTime && place.durationMinutes);
      const span = Math.max(...timed.map((place) => duration(place.startTime!) + place.durationMinutes!)) - Math.min(...timed.map((place) => duration(place.startTime!)));
      const expectedHours = ({ akihabara: 7.5, 'shibuya-shopping': 8.25, 'costco-kawasaki': 8, yokohama: 10.75, kawagoe: 8, kawaguchiko: 12, 'deep-fukagawa': 6.5, 'asakusa-ueno': 8, 'shinjuku-green': 7.25, 'odaiba-bay': 7 } as Record<string, number>)[activity.id];
      expect(Math.abs(span - expectedHours * 60), `${activity.id} duration label should match its timed door-to-door plan`).toBeLessThanOrEqual(30);
    }
  });

  it('offers a named, sourced backup alongside every pool meal choice', () => {
    for (const activity of tokyoPoolActivities) {
      const meals = activity.places.filter((place) => place.mealContext);
      const mealTypes = [...new Set(meals.map((place) => place.mealContext))];
      for (const mealType of mealTypes) {
        const options = meals.filter((place) => place.mealContext === mealType);
        expect(options.some((place) => place.role === 'primary'), `${activity.id} ${mealType} needs a first choice`).toBe(true);
        const backup = options.find((place) => place.role === 'backup');
        expect(backup, `${activity.id} ${mealType} needs a backup choice`).toBeDefined();
        expect(backup!.name).not.toMatch(/another .* option|restaurant-floor cluster/i);
        expect(backup!.sourceUrl).toMatch(/^https:\/\//);
        expect(backup!.sourceLabel).toBeTruthy();
      }
    }
  });

  it('provides named, practical backups for the audited flexible-day meal stops', () => {
    const place = (id: string) => tokyoPoolActivities.flatMap((activity) => activity.places).find((stop) => stop.id === id);

    const akihabaraPrimary = place('pool-akihabara-lunch');
    const akihabaraBackup = place('pool-akihabara-lunch-backup');
    expect(akihabaraPrimary?.role).toBe('primary');
    expect(akihabaraBackup?.role).toBe('backup');
    expect(akihabaraBackup?.name).toContain('Tonkatsu Wako');
    expect(akihabaraBackup?.sourceUrl).toBe('https://wako-group.co.jp/shop/detai/shop_1176/');

    const yokohamaPrimary = place('pool-yokohama-lunch');
    const yokohamaBackup = place('pool-yokohama-lunch-backup');
    expect(yokohamaPrimary?.role).toBe('primary');
    expect(yokohamaBackup?.role).toBe('backup');
    expect(yokohamaBackup?.name).toContain('Kiyoken');
    expect(yokohamaBackup?.coordinates).toEqual(yokohamaPrimary?.coordinates);
    expect(yokohamaBackup?.sourceUrl).toBe('https://www.yokohama-akarenga.jp/cafe/shop02-16/');

    const costcoPrimary = place('pool-costco-lunch');
    const costcoBackup = place('pool-costco-food-backup');
    expect(costcoPrimary?.description).toContain('only use it if the warehouse food court is operating');
    expect(costcoBackup?.name).toContain('Tonchin');
    expect(costcoBackup?.role).toBe('backup');
    expect(costcoBackup?.mapsQuery).toContain('Kawasaki More');
    expect(costcoBackup?.coordinates).not.toEqual(costcoPrimary?.coordinates);
    expect(costcoBackup?.sourceUrl).toBe('https://kawasaki-mores.jp/floor/detail/?cd=000295');
    expect(place('pool-costco-return')?.mapsQuery).toContain('Kawasaki Station');
  });

  it('makes the Costco trip a clear train-and-bus option with official access and membership references', () => {
    const costco = tokyoPoolActivities.find((activity) => activity.id === 'costco-kawasaki')!;
    const train = costco.places.find((stop) => stop.id === 'pool-costco-train-out');
    const busOut = costco.places.find((stop) => stop.id === 'pool-costco-bus-out');
    const busBack = costco.places.find((stop) => stop.id === 'pool-costco-return');
    expect(train?.travelMode).toBe('train');
    expect(train?.mapsQuery).toBe('Kawasaki Station');
    expect(busOut?.travelMode).toBe('bus');
    expect(busOut?.originQuery).toBe('Kawasaki Station');
    expect(busOut?.verification).toBe('verify-before-trip');
    expect(busBack?.travelMode).toBe('bus');
    expect(busBack?.originQuery).toBe('Costco Kawasaki Warehouse');
    expect(costco.sources.some((source) => source.url.includes('city.kawasaki.jp/840/'))).toBe(true);
    expect(costco.sources.some((source) => source.url === 'https://www.costco.co.jp/c/GOLDSTAR-PRIMARY-CARD/p/83')).toBe(true);
    expect(costco.routeNote).toMatch(/planning estimates, not a November 2026 timetable/i);
    expect(costco.summary).toContain('confirm your exact active card');
  });

  it('keeps the local izakaya choice sourced while treating date-specific opening details as uncertain', () => {
    const dinner = tokyoPoolActivities.find((activity) => activity.id === 'izakaya-evening')?.places.find((stop) => stop.id === 'pool-izakaya-dinner');
    expect(dinner?.role).toBe('primary');
    expect(dinner?.name).toContain('Kimuraya Honten');
    expect(dinner?.description).toMatch(/check the official site for hours/i);
    expect(dinner?.description).toMatch(/may change/i);
    expect(dinner?.verification).toBe('verify-before-trip');
    expect(dinner?.sourceUrl).toBe('https://kimurayahonten-monzennakacho.com/');
    expect(dinner?.mapsQuery).toBe('Kimuraya Honten Monzen Nakacho Tokyo');
  });
});

