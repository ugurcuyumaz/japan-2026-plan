import type { TokyoChoices } from './tokyoChoices';
import { flexibleDayIdSet } from './tokyoChoices';
import { tokyoPoolActivities } from './tokyoPool';

export type TokyoMutation =
  | { type: 'assign'; dayId: string; activityId: string; kind: 'outing' | 'evening' }
  | { type: 'remove'; dayId: string; kind: 'outing' | 'evening' };

export function isTokyoAssignmentAllowed(dayId: string, activityId: string, kind: 'outing' | 'evening'): boolean {
  if (!flexibleDayIdSet.has(dayId)) return false;
  const activity = tokyoPoolActivities.find((candidate) => candidate.id === activityId && candidate.kind === kind);
  return Boolean(activity && !activity.unavailableDates?.some((unavailable) => unavailable.dayId === dayId));
}

export function applyTokyoMutation(choices: TokyoChoices, mutation: TokyoMutation): TokyoChoices {
  if (mutation.type === 'assign' && !isTokyoAssignmentAllowed(mutation.dayId, mutation.activityId, mutation.kind)) return choices;
  if (mutation.type === 'remove' && !flexibleDayIdSet.has(mutation.dayId)) return choices;
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
