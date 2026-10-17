import { describe, expect, it } from 'vitest';
import { emptyPersonalState } from './plannerBackup';
import { hasPersonalPlanLink, maxPersonalShareLength, parsePersonalPlanLink, personalPlanShareUrl, sharedDayId, withoutPersonalPlanLink } from './personalSharing';

describe('reviewed personal snapshot links', () => {
  it('carries choices, progress and saves with a requested day, without old query parameters', () => {
    const state = emptyPersonalState();
    state.choices.outings['2026-11-04'] = 'nezu-museum';
    state.savedKeys = ['idea:yanesen'];
    state.bookingProgress['booking-tobu'] = '2026-10-16T10:00:00.000Z';
    const href = personalPlanShareUrl('https://example.com/japan/?picks=old#budget', state, '2026-11-04')!;
    expect(parsePersonalPlanLink(href)?.state).toEqual(state);
    expect(new URL(href).searchParams.has('picks')).toBe(false);
    expect(sharedDayId(href)).toBe('2026-11-04');
    expect(hasPersonalPlanLink(withoutPersonalPlanLink(href))).toBe(false);
    expect(sharedDayId(withoutPersonalPlanLink(href))).toBe('2026-11-04');
  });
  it('rejects unknown days, malformed payloads and excessive links', () => {
    expect(personalPlanShareUrl('https://example.com/', emptyPersonalState(), '2026-12-01')).toBeUndefined();
    expect(parsePersonalPlanLink('https://example.com/#plan=bad')).toBeUndefined();
    expect(parsePersonalPlanLink(`https://example.com/#plan=${'x'.repeat(maxPersonalShareLength)}`)).toBeUndefined();
    const state = emptyPersonalState();
    state.savedKeys = Array(300).fill('place:2026-10-26:city-alt-sapporo-factory');
    expect(personalPlanShareUrl('https://example.com/', state)).toBeUndefined();
  });
});
