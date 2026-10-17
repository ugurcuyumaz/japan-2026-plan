import { describe, expect, it } from 'vitest';
import { applyTokyoMutation, cloneTokyoChoices, isTokyoAssignmentAllowed } from './tokyoMutations';
import type { TokyoChoices } from './tokyoChoices';

describe('Tokyo choice mutations', () => {
  it('moves an idea, replacing the target day and retaining unrelated choices', () => {
    const before: TokyoChoices = { outings: { '2026-11-01': 'asakusa-ueno', '2026-11-04': 'hakone-gora', '2026-11-06': 'akihabara' }, evenings: { '2026-11-04': 'izakaya-evening' } };
    const after = applyTokyoMutation(before, { type: 'assign', dayId: '2026-11-04', activityId: 'asakusa-ueno', kind: 'outing' });
    expect(after).toEqual({ outings: { '2026-11-04': 'asakusa-ueno', '2026-11-06': 'akihabara' }, evenings: { '2026-11-04': 'izakaya-evening' } });
    expect(before.outings['2026-11-01']).toBe('asakusa-ueno');
    expect(cloneTokyoChoices(after)).toEqual(after);
  });

  it('removes an idea while preserving a complete snapshot for undo', () => {
    const before: TokyoChoices = { outings: { '2026-11-01': 'asakusa-ueno' }, evenings: { '2026-11-01': 'izakaya-evening', '2026-11-04': 'kagurazaka-evening' } };
    const snapshot = cloneTokyoChoices(before);
    const after = applyTokyoMutation(before, { type: 'remove', dayId: '2026-11-01', kind: 'outing' });
    expect(after).toEqual({ outings: {}, evenings: before.evenings });
    expect(snapshot).toEqual(before);
  });

  it('rejects invalid dates, wrong activity kinds, and known closure dates without changing the snapshot', () => {
    const before: TokyoChoices = { outings: { '2026-11-01': 'asakusa-ueno' }, evenings: {} };
    expect(isTokyoAssignmentAllowed('2026-11-03', 'asakusa-ueno', 'outing')).toBe(false);
    expect(isTokyoAssignmentAllowed('2026-11-01', 'izakaya-evening', 'outing')).toBe(false);
    expect(isTokyoAssignmentAllowed('2026-11-09', 'ryogoku-history', 'outing')).toBe(false);
    expect(applyTokyoMutation(before, { type: 'assign', dayId: '2026-11-09', activityId: 'ryogoku-history', kind: 'outing' })).toBe(before);
    expect(applyTokyoMutation(before, { type: 'remove', dayId: '2026-11-03', kind: 'outing' })).toBe(before);
  });
});
