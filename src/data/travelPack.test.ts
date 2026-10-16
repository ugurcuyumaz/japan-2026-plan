import { describe, expect, it } from 'vitest';
import { buildTravelPack, escapeHtml } from './travelPack';
import { emptyTokyoChoices } from './tokyoChoices';
import { cityAlternatives } from './cityAlternatives';

const savedAt = new Date('2026-10-15T18:00:00Z');
describe('offline travel pack', () => {
  it('carries the city alternatives and their official references on suitable dates', () => {
    const option = cityAlternatives.find((item) => item.place.type === 'food')!;
    const html = buildTravelPack(emptyTokyoChoices(), option.suitableDayIds[0], savedAt);
    expect(html).toContain(escapeHtml(option.place.name));
    expect(html).toContain(escapeHtml(option.place.sourceUrl!));
    expect(html).toContain('food backups & optional stops');
  });
  it('contains the complete trip, all confirmed hotels and reservation instructions with no required network assets', () => {
    const html = buildTravelPack(emptyTokyoChoices(), undefined, savedAt);
    expect(html.match(/<section id="day-/g)).toHaveLength(20);
    expect(html).toContain('Saved 2026-10-15 18:00 UTC');
    expect(html).toContain('Hotel Route-Inn Sapporo Chuo');
    expect(html).toContain('Comfort Hotel Tokyo Kiyosumi Shirakawa');
    expect(html).toContain('booking-hokuto');
    expect(html).toContain('Not booked');
    expect(html).not.toMatch(/<script|<link|<img|<iframe|@import|url\(/i);
  });
  it('exports the current picks and their conflicts, rather than blank source days', () => {
    const html = buildTravelPack({ outings: { '2026-11-04': 'hakone-gora' }, evenings: { '2026-11-04': 'izakaya-evening' } }, '2026-11-04', savedAt);
    expect(html.match(/<section id="day-/g)).toHaveLength(1);
    expect(html).toContain('Hakone Open-Air Museum day trip');
    expect(html).toContain('less than 30 minutes');
    expect(html).toContain('full pace');
    expect(html).not.toContain('id="day-2026-11-05"');
  });
  it('exports the assigned advance task, Tokyo food context and cautious price references', () => {
    const html = buildTravelPack({ outings: { '2026-11-04': 'teamlab-toyosu' }, evenings: {} }, '2026-11-04', savedAt);
    expect(html).toContain('booking-tokyo-teamlab-ticket-2026-11-04');
    expect(html).toContain('Japan local time');
    const foodHtml = buildTravelPack({ outings: { '2026-11-04': 'akihabara' }, evenings: {} }, '2026-11-04', savedAt);
    expect(foodHtml).toContain('Food:</strong> Gyukatsu (beef cutlet) · lunch');
    expect(foodHtml).toContain('Price-level reference: €€; person/group basis not recorded.');
  });
  it('includes supporting links and the two seat reservations for selected day trips', () => {
    const html = buildTravelPack({ outings: { '2026-11-04': 'kawaguchiko' }, evenings: {} }, undefined, savedAt);
    expect(html).toContain('booking-tokyo-fuji-excursion-outbound-2026-11-04');
    expect(html).toContain('booking-tokyo-fuji-excursion-return-2026-11-04');
    expect(html).toContain('JR Hokkaido · train and reserved-seat guide');
    expect(html).not.toMatch(/Fuji Excursion[^<]*¥[\d,]+/);
    expect(html).not.toMatch(/¥[\d,]+[^<]*Fuji Excursion/);
  });
  it('keeps the right hotel and dependent reservation references on a move day', () => {
    const html = buildTravelPack(emptyTokyoChoices(), '2026-11-03', savedAt);
    expect(html).toContain('Tonight · confirmed:</strong> Comfort Hotel');
    expect(html).toContain('Check out:</strong> Gableview');
    expect(html).toContain('id="booking-tobu"');
    expect(html).toContain('id="booking-jr-east-south-hokkaido-pass"');
  });
  it('uses traveler-facing booking labels and prints numeric cost references with recorded basis', () => {
    const day = buildTravelPack(emptyTokyoChoices(), '2026-10-25', savedAt);
    expect(day).toContain('Not confirmed · Reservation suggested');
    const placeCost = buildTravelPack(emptyTokyoChoices(), '2026-11-11', savedAt);
    expect(placeCost).toContain('Cost reference: ¥1,500; person/group basis not recorded.');
    const bookings = buildTravelPack(emptyTokyoChoices(), '2026-11-02', savedAt);
    expect(bookings).toContain('Cost reference: ¥6,000 · for two.');
    const pass = buildTravelPack(emptyTokyoChoices(), '2026-10-27', savedAt);
    expect(pass).toContain('Cost reference: ¥40,000 · per adult.');
  });
  it('exports traveler handling progress while preserving source reservation status', () => {
    const html = buildTravelPack(emptyTokyoChoices(), '2026-11-03', savedAt, { 'booking-tobu': '2026-10-15T10:00:00.000Z' });
    expect(html).toContain('<strong>Not booked</strong> · 3 Nov');
    expect(html).toContain('<strong>Handled by traveler</strong>');
    expect(html).toContain('handling progress is separate and does not confirm a reservation');
    expect(html).not.toMatch(/booking-tobu[^]*?confirmation number/i);
  });
  it('escapes all HTML delimiters and refuses an unknown day', () => {
    expect(escapeHtml('<script a="x">&\'</script>')).toBe('&lt;script a=&quot;x&quot;&gt;&amp;&#39;&lt;/script&gt;');
    expect(() => buildTravelPack(emptyTokyoChoices(), '2026-12-01', savedAt)).toThrow();
  });
});


describe('saved options in readable exports', () => {
  it('keeps map and source links for a saved Tokyo backup after removing its outing', () => {
    const html = buildTravelPack(emptyTokyoChoices(), undefined, new Date('2026-10-16T10:00:00.000Z'), {}, ['place:2026-11-04:pool-ikebukuro-lunch-backup']);
    expect(html).toContain('Saved from an earlier Tokyo choice');
    const saved = html.split('<section id="saved-ideas">')[1]?.split('<section id="reservations">')[0];
    expect(saved).toContain('maps/search/');
    expect(saved).toContain('OCEAN Casita');
  });
  it('includes an unassigned shortlist reference without adding it to the dated main plan', () => {
    const html = buildTravelPack(emptyTokyoChoices(), undefined, new Date('2026-10-16T10:00:00.000Z'), {}, ['idea:nezu-museum']);
    const savedSection = html.split('<section id="saved-ideas">')[1]?.split('<section id="reservations">')[0];
    expect(savedSection).toContain('Nezu Museum + Aoyama garden');
    expect(savedSection).toContain('not extra commitments');
    expect(savedSection).toContain('closed Mondays');
    const datedDay = html.split('<section id="day-2026-11-04">')[1]?.split('<section id="day-')[0];
    expect(datedDay).toContain('Keep this day free');
    expect(datedDay).not.toContain('Nezu Museum galleries');
  });
});
