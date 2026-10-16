import { describe, expect, it } from 'vitest';
import { applyTokyoMutation, cloneTokyoChoices } from './tokyoMutations';
import type { TokyoChoices } from './tokyoChoices';

describe('Tokyo choice mutations', () => {
  it('moves an idea, replacing the target day and retaining unrelated choices', () => {
    const before: TokyoChoices = { outings: { '2026-11-03': 'asakusa', '2026-11-04': 'hakone', '2026-11-05': 'nikko' }, evenings: { '2026-11-04': 'izakaya' } };
    const after = applyTokyoMutation(before, { type: 'assign', dayId: '2026-11-04', activityId: 'asakusa', kind: 'outing' });
    expect(after).toEqual({ outings: { '2026-11-04': 'asakusa', '2026-11-05': 'nikko' }, evenings: { '2026-11-04': 'izakaya' } });
    expect(before.outings['2026-11-03']).toBe('asakusa');
    expect(cloneTokyoChoices(after)).toEqual(after);
  });

  it('removes an idea while preserving a complete snapshot for undo', () => {
    const before: TokyoChoices = { outings: { '2026-11-03': 'asakusa' }, evenings: { '2026-11-03': 'izakaya', '2026-11-04': 'sushi' } };
    const snapshot = cloneTokyoChoices(before);
    const after = applyTokyoMutation(before, { type: 'remove', dayId: '2026-11-03', kind: 'outing' });
    expect(after).toEqual({ outings: {}, evenings: before.evenings });
    expect(snapshot).toEqual(before);
  });
});
