import { describe, expect, it } from 'vitest';
import { emptyTokyoChoices, parseTokyoChoices, tokyoPlacesForHotel, tokyoShareUrl, tokyoTimingWarning } from './tokyoChoices';
import { tokyoPoolActivities } from './tokyoPool';
import { stays } from './trip';

const outing = tokyoPoolActivities.find((activity) => activity.kind === 'outing')!.id;
const evening = tokyoPoolActivities.find((activity) => activity.kind === 'evening')!.id;
const choices = { outings: { '2026-11-04': outing }, evenings: { '2026-11-06': evening } };

describe('portable Tokyo choices', () => {
  it('round-trips both activity kinds and removes unrelated day/query context from a snapshot', () => {
    const url = new URL(tokyoShareUrl('https://example.com/japan/?day=2026-11-05&picks=old#daily-plan', choices));
    expect(url.searchParams.has('day')).toBe(false);
    expect(url.hash).toBe('#tokyo-pool');
    expect(parseTokyoChoices(url.searchParams.get('picks')!)).toEqual(choices);
  });
  it('reads existing browser choices and intentionally empty snapshots', () => {
    expect(parseTokyoChoices(JSON.stringify(choices))).toEqual(choices);
    expect(parseTokyoChoices(JSON.stringify(emptyTokyoChoices()))).toEqual(emptyTokyoChoices());
  });
  it('rejects broken data, unknown dates, stale IDs and activities of the wrong kind', () => {
    for (const value of ['{', 'null', '[]', JSON.stringify({ outings: [], evenings: {} }), JSON.stringify({ version: 2, ...choices }), JSON.stringify({ outings: { '2026-11-05': outing }, evenings: {} }), JSON.stringify({ outings: { '2026-11-04': 'old-id' }, evenings: {} }), JSON.stringify({ outings: { '2026-11-04': evening }, evenings: {} }), ' '.repeat(6001)]) {
      expect(parseTokyoChoices(value)).toBeUndefined();
    }
  });
  it('rejects a duplicate outing rather than silently placing it on two days', () => {
    expect(parseTokyoChoices(JSON.stringify({ outings: { '2026-11-04': outing, '2026-11-06': outing }, evenings: {} }))).toBeUndefined();
  });
  it('flags a late Hakone return against the evening, but permits an earlier Toyosu return', () => {
    expect(tokyoTimingWarning('hakone-gora', evening)).toBeTruthy();
    expect(tokyoTimingWarning('teamlab-toyosu', evening)).toBeUndefined();
    expect(tokyoTimingWarning('hakone-gora')).toBeUndefined();
  });
  it('uses the booked first Tokyo hotel for route endpoints without keeping invalid transfer estimates', () => {
    const activity = tokyoPoolActivities.find((item) => item.id === 'teamlab-toyosu')!;
    const hotel = stays.find((stay) => stay.id === 'stay-tokyo-halloween')!;
    const places = tokyoPlacesForHotel(activity, hotel);
    expect(places[0].originQuery).toBe(hotel.property);
    expect(places[0].durationMinutes).toBeUndefined();
    expect(places[places.length - 1].mapsQuery).toBe(hotel.property);
    expect(places[places.length - 1].coordinates).toEqual(hotel.coordinates);
    expect(activity.places[0].originQuery).toBe('Comfort Hotel Tokyo Kiyosumi Shirakawa');
  });
});
