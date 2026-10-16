import type { TokyoChoices } from './tokyoChoices';

export type TokyoMutation =
  | { type: 'assign'; dayId: string; activityId: string; kind: 'outing' | 'evening' }
  | { type: 'remove'; dayId: string; kind: 'outing' | 'evening' };

export function applyTokyoMutation(choices: TokyoChoices, mutation: TokyoMutation): TokyoChoices {
  const key = mutation.kind === 'outing' ? 'outings' : 'evenings';
  const next = { outings: { ...choices.outings }, evenings: { ...choices.evenings } };
  if (mutation.type === 'remove') {
    delete next[key][mutation.dayId];
    return next;
  }
  for (const [dayId, id] of Object.entries(next[key])) {
    if (id === mutation.activityId) delete next[key][dayId];
  }
  next[key][mutation.dayId] = mutation.activityId;
  return next;
}

export function cloneTokyoChoices(choices: TokyoChoices): TokyoChoices {
  return { outings: { ...choices.outings }, evenings: { ...choices.evenings } };
}
