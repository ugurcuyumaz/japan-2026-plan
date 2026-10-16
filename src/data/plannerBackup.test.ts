import { describe, expect, it } from 'vitest';
import { buildPlannerBackup, emptyPersonalState, maxPlannerBackupBytes, parsePlannerBackup } from './plannerBackup';

describe('personal planner backup', () => {
  it('round trips all decision domains without sharing mutable references', () => {
    const state = emptyPersonalState();
    state.choices.outings['2026-11-04'] = 'nezu-museum';
    state.bookingProgress['booking-gableview-dinner'] = '2026-10-16T10:00:00.000Z';
    state.savedKeys = ['idea:yanesen', 'place:2026-10-26:city-alt-sapporo-factory'];
    const raw = buildPlannerBackup(state, new Date('2026-10-16T11:00:00.000Z'));
    const parsed = parsePlannerBackup(raw)!;
    expect(parsed.state).toEqual(state);
    parsed.state.choices.outings['2026-11-06'] = 'yanesen';
    expect(state.choices.outings['2026-11-06']).toBeUndefined();
  });

  it('rejects the entire restore if any domain or metadata is invalid', () => {
    const base = JSON.parse(buildPlannerBackup(emptyPersonalState()));
    for (const mutate of [
      (value: typeof base) => { value.state.choices.outings['2026-10-25'] = 'yanesen'; },
      (value: typeof base) => { value.state.bookingProgress['invented-task'] = '2026-10-16T10:00:00.000Z'; },
      (value: typeof base) => { value.state.savedKeys = ['idea:invented-idea']; },
      (value: typeof base) => { value.version = 2; },
      (value: typeof base) => { value.exportedAt = 'not-a-date'; },
      (value: typeof base) => { value.state.extra = true; },
    ]) {
      const candidate = JSON.parse(JSON.stringify(base)); mutate(candidate);
      expect(parsePlannerBackup(JSON.stringify(candidate))).toBeUndefined();
    }
    expect(parsePlannerBackup(' '.repeat(maxPlannerBackupBytes + 1))).toBeUndefined();
    expect(parsePlannerBackup('{')).toBeUndefined();
  });
});
