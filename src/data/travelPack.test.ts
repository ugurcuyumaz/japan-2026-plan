import { describe, expect, it } from 'vitest';
import { buildTravelPack, escapeHtml } from './travelPack';
import { emptyTokyoChoices } from './tokyoChoices';

const savedAt = new Date('2026-10-15T18:00:00Z');
describe('offline travel pack', () => {
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
  it('keeps the right hotel and dependent reservation references on a move day', () => {
    const html = buildTravelPack(emptyTokyoChoices(), '2026-11-03', savedAt);
    expect(html).toContain('Tonight · confirmed:</strong> Comfort Hotel');
    expect(html).toContain('Check out:</strong> Gableview');
    expect(html).toContain('id="booking-tobu"');
    expect(html).toContain('id="booking-jr-east-south-hokkaido-pass"');
  });
  it('escapes all HTML delimiters and refuses an unknown day', () => {
    expect(escapeHtml('<script a="x">&\'</script>')).toBe('&lt;script a=&quot;x&quot;&gt;&amp;&#39;&lt;/script&gt;');
    expect(() => buildTravelPack(emptyTokyoChoices(), '2026-12-01', savedAt)).toThrow();
  });
});
