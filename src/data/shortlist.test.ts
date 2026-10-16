import { describe, expect, it } from 'vitest';
import { ideaKey, parseShortlist, placeKey, shortlistEntries } from './shortlist';

describe('shortlist catalog and persistence validation', () => {
  it('resolves known ideas and exact dated alternatives', () => {
    const keys = [ideaKey('akihabara'), placeKey('2026-10-25', 'city-alt-sapporo-aji-sanpei')];
    const entries = shortlistEntries(keys);
    expect(entries).toHaveLength(2);
    expect(entries[0].target).toEqual({ kind: 'idea', ideaId: 'akihabara' });
    expect(entries[1].target).toEqual({ kind: 'day', dayId: '2026-10-25', placeId: 'city-alt-sapporo-aji-sanpei' });
    expect(parseShortlist(JSON.stringify(keys))).toEqual(keys);
  });

  it('rejects malformed, duplicate, unknown and oversized values', () => {
    expect(parseShortlist('{')).toBeUndefined();
    expect(parseShortlist(JSON.stringify(['idea:missing']))).toBeUndefined();
    expect(parseShortlist(JSON.stringify([ideaKey('akihabara'), ideaKey('akihabara')]))).toBeUndefined();
    expect(parseShortlist(' '.repeat(24001))).toBeUndefined();
    expect(parseShortlist(JSON.stringify({ keys: [] }))).toBeUndefined();
  });
});
