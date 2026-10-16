import { emptyTokyoChoices, parseTokyoChoices, type TokyoChoices } from './tokyoChoices';
import { parseBookingProgress, type BookingProgress } from './bookingProgress';
import { parseShortlist, type ShortlistKey } from './shortlist';

export interface PlannerPersonalState {
  choices: TokyoChoices;
  bookingProgress: BookingProgress;
  savedKeys: ShortlistKey[];
}

export interface PlannerBackupSnapshot {
  format: 'japan-2026-personal-plan';
  version: 1;
  exportedAt: string;
  state: PlannerPersonalState;
}

export const plannerStateStorageKey = 'japan-2026-personal-state-v1';
export const maxPlannerBackupBytes = 100_000;
export const emptyPersonalState = (): PlannerPersonalState => ({ choices: emptyTokyoChoices(), bookingProgress: {}, savedKeys: [] });
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const hasKeys = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).length === keys.length && keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));

/** Validate the whole snapshot before any browser state is replaced. */
export function parsePlannerBackup(raw: string): PlannerBackupSnapshot | undefined {
  if (raw.length > maxPlannerBackupBytes) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || !hasKeys(value, ['format', 'version', 'exportedAt', 'state'])) return undefined;
    if (value.format !== 'japan-2026-personal-plan' || value.version !== 1 || typeof value.exportedAt !== 'string') return undefined;
    const date = new Date(value.exportedAt);
    if (!Number.isFinite(date.getTime()) || date.toISOString() !== value.exportedAt) return undefined;
    if (!isRecord(value.state) || !hasKeys(value.state, ['choices', 'bookingProgress', 'savedKeys'])) return undefined;
    const choices = parseTokyoChoices(JSON.stringify(value.state.choices));
    const bookingProgress = parseBookingProgress(JSON.stringify(value.state.bookingProgress));
    const savedKeys = parseShortlist(JSON.stringify(value.state.savedKeys));
    if (!choices || !bookingProgress || !savedKeys) return undefined;
    return { format: 'japan-2026-personal-plan', version: 1, exportedAt: value.exportedAt, state: { choices, bookingProgress, savedKeys } };
  } catch { return undefined; }
}

export function buildPlannerBackup(state: PlannerPersonalState, exportedAt = new Date()): string {
  return JSON.stringify({ format: 'japan-2026-personal-plan', version: 1, exportedAt: exportedAt.toISOString(), state }, null, 2);
}
