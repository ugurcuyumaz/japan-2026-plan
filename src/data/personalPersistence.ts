import { bookingProgressStorageKey, parseBookingProgress } from './bookingProgress';
import { buildPlannerBackup, emptyPersonalState, parsePlannerBackup, plannerStateStorageKey, type PlannerPersonalState } from './plannerBackup';
import { parseShortlist, shortlistStorageKey } from './shortlist';
import { parseTokyoChoices, tokyoStorageKey } from './tokyoChoices';

export interface PersonalStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type PersonalStatus = 'saved' | 'session' | 'recovery' | 'conflict';
export const plannerRecoveryStorageKey = `${plannerStateStorageKey}-recovery-v1`;

export interface PersonalPersistenceSnapshot {
  state: PlannerPersonalState;
  storageUnavailable: boolean;
  status: PersonalStatus;
  recoveryRaw?: string;
  externalChange?: { state?: PlannerPersonalState; raw: string | null };
  revision: number;
}

const copy = (state: PlannerPersonalState): PlannerPersonalState => ({
  choices: { ...state.choices, outings: { ...state.choices.outings }, evenings: { ...state.choices.evenings } },
  bookingProgress: { ...state.bookingProgress },
  savedKeys: [...state.savedKeys],
});

const parseState = (raw: string | null): PlannerPersonalState | undefined => {
  if (raw === null) return undefined;
  return parsePlannerBackup(raw)?.state;
};

/** Storage state machine kept separate from React so its safety rules are testable. */
export class PersonalPersistenceController {
  private snapshotValue: PersonalPersistenceSnapshot;
  private acceptedRaw: string | null = null;
  private dirty = false;

  constructor(private readonly storage: PersonalStorage) {
    let raw: string | null = null;
    let archivedRecoveryRaw: string | null = null;
    let storageUnavailable = false;
    try { raw = storage.getItem(plannerStateStorageKey); } catch { storageUnavailable = true; }
    try { archivedRecoveryRaw = storage.getItem(plannerRecoveryStorageKey); } catch { storageUnavailable = true; }

    if (raw !== null) {
      const parsed = parseState(raw);
      this.acceptedRaw = raw;
      this.snapshotValue = parsed
        ? { state: copy(parsed), storageUnavailable, status: storageUnavailable ? 'session' : 'saved', recoveryRaw: archivedRecoveryRaw ?? undefined, revision: 0 }
        : { state: emptyPersonalState(), storageUnavailable, status: 'recovery', recoveryRaw: raw, revision: 0 };
      return;
    }

    const legacy = this.readLegacy();
    this.snapshotValue = { state: legacy, storageUnavailable, status: storageUnavailable ? 'session' : 'saved', recoveryRaw: archivedRecoveryRaw ?? undefined, revision: 0 };
  }

  get snapshot(): PersonalPersistenceSnapshot { return this.snapshotValue; }

  update(next: PlannerPersonalState): PersonalPersistenceSnapshot {
    this.snapshotValue = { ...this.snapshotValue, state: copy(next), revision: this.snapshotValue.revision + 1 };
    this.dirty = true;
    this.saveIfUnchanged();
    return this.snapshotValue;
  }

  replace(reviewedState: PlannerPersonalState): PersonalPersistenceSnapshot {
    this.snapshotValue = { ...this.snapshotValue, state: copy(reviewedState), revision: this.snapshotValue.revision + 1 };
    if (this.snapshotValue.externalChange) {
      this.snapshotValue = { ...this.snapshotValue, status: 'conflict' };
      this.dirty = true;
      return this.snapshotValue;
    }
    this.dirty = true;
    this.snapshotValue = { ...this.snapshotValue, status: 'session' };
    this.saveIfUnchanged(true);
    return this.snapshotValue;
  }

  noteExternal(raw: string | null): PersonalPersistenceSnapshot {
    if (raw === this.acceptedRaw) {
      if (this.snapshotValue.externalChange) {
        // Another tab may restore the last accepted value. Resolve the stale
        // conflict without writing or discarding this tab's pending edits.
        this.snapshotValue = {
          ...this.snapshotValue,
          externalChange: undefined,
          status: raw !== null && !parseState(raw) ? 'recovery' : this.dirty || this.snapshotValue.storageUnavailable ? 'session' : 'saved',
          revision: this.snapshotValue.revision + 1,
        };
      }
      return this.snapshotValue;
    }
    const incoming = parseState(raw);
    this.snapshotValue = {
      ...this.snapshotValue,
      externalChange: { raw, ...(incoming ? { state: copy(incoming) } : {}) },
      status: this.dirty ? 'conflict' : (raw !== null && !incoming ? 'recovery' : 'conflict'),
      recoveryRaw: raw !== null && !incoming ? raw : this.snapshotValue.recoveryRaw,
      revision: this.snapshotValue.revision + 1,
    };
    return this.snapshotValue;
  }

  acceptExternal(): PersonalPersistenceSnapshot {
    let raw: string | null;
    try { raw = this.storage.getItem(plannerStateStorageKey); }
    catch { return this.markUnavailable(); }
    const reviewed = this.snapshotValue.externalChange;
    if (reviewed && raw !== reviewed.raw) return this.noteExternal(raw);
    const incoming = parseState(raw);
    if (raw !== null && !incoming) {
      return this.noteExternal(raw);
    }
    this.acceptedRaw = raw;
    this.dirty = false;
    if (raw === null) {
      try {
        const cleared = buildPlannerBackup(emptyPersonalState());
        this.storage.setItem(plannerStateStorageKey, cleared);
        this.acceptedRaw = cleared;
      } catch {
        this.snapshotValue = { ...this.snapshotValue, state: emptyPersonalState(), storageUnavailable: true, status: 'session', revision: this.snapshotValue.revision + 1 };
        return this.snapshotValue;
      }
    }
    this.snapshotValue = {
      state: incoming ? copy(incoming) : emptyPersonalState(),
      storageUnavailable: false,
      status: 'saved',
      revision: this.snapshotValue.revision + 1,
    };
    return this.snapshotValue;
  }

  keepCurrent(): PersonalPersistenceSnapshot {
    const reviewed = this.snapshotValue.externalChange;
    if (!reviewed) return this.snapshotValue;
    let raw: string | null;
    try { raw = this.storage.getItem(plannerStateStorageKey); }
    catch { return this.markUnavailable(); }
    if (raw !== reviewed.raw) {
      this.noteExternal(raw);
      // Keeping this tab is an explicit save action. If the other copy has
      // returned to the accepted value, this pending local copy is safe to save.
      if (raw === this.acceptedRaw && this.dirty) this.saveIfUnchanged();
      return this.snapshotValue;
    }
    this.acceptedRaw = raw;
    this.snapshotValue = { ...this.snapshotValue, externalChange: undefined, recoveryRaw: reviewed.raw ?? this.snapshotValue.recoveryRaw, status: 'session' };
    this.dirty = true;
    this.saveIfUnchanged();
    return this.snapshotValue;
  }

  /** Explicitly leave recovery mode while keeping the original raw value available to the UI. */
  resetRecovery(): PersonalPersistenceSnapshot {
    if (this.snapshotValue.status !== 'recovery') return this.snapshotValue;
    this.snapshotValue = { ...this.snapshotValue, state: emptyPersonalState(), revision: this.snapshotValue.revision + 1 };
    this.dirty = true;
    this.snapshotValue = { ...this.snapshotValue, status: 'session' };
    this.saveIfUnchanged(true);
    return this.snapshotValue;
  }

  private readLegacy(): PlannerPersonalState {
    let choices = emptyPersonalState().choices;
    let bookingProgress = {};
    let savedKeys: PlannerPersonalState['savedKeys'] = [];
    try { choices = parseTokyoChoices(this.storage.getItem(tokyoStorageKey) || '{}') ?? choices; } catch { /* session fallback */ }
    try { bookingProgress = parseBookingProgress(this.storage.getItem(bookingProgressStorageKey) || '{}') ?? {}; } catch { /* session fallback */ }
    try { savedKeys = parseShortlist(this.storage.getItem(shortlistStorageKey) || '[]') ?? []; } catch { /* session fallback */ }
    return { choices, bookingProgress, savedKeys };
  }

  private saveIfUnchanged(force = false): void {
    if (this.snapshotValue.status === 'recovery' && !force) return;
    if (this.snapshotValue.externalChange && !force) {
      this.snapshotValue = { ...this.snapshotValue, status: 'conflict' };
      return;
    }
    let current: string | null;
    try { current = this.storage.getItem(plannerStateStorageKey); }
    catch { this.markUnavailable(); return; }
    if (current !== this.acceptedRaw) {
      this.noteExternal(current);
      this.snapshotValue = { ...this.snapshotValue, status: 'conflict' };
      return;
    }
    if (current !== null && !parseState(current)) {
      try {
        // replace/reset/keepCurrent are explicit recovery decisions. Save the raw
        // value durably before replacing the only copy in the primary slot.
        this.storage.setItem(plannerRecoveryStorageKey, current);
        this.snapshotValue = { ...this.snapshotValue, recoveryRaw: current };
      } catch {
        this.snapshotValue = { ...this.snapshotValue, storageUnavailable: true, status: 'recovery', recoveryRaw: current };
        return;
      }
    }
    try {
      const nextRaw = buildPlannerBackup(this.snapshotValue.state);
      this.storage.setItem(plannerStateStorageKey, nextRaw);
      this.acceptedRaw = nextRaw;
      this.dirty = false;
      this.snapshotValue = { ...this.snapshotValue, storageUnavailable: false, status: 'saved' };
    } catch { this.markUnavailable(); }
  }

  private markUnavailable(): PersonalPersistenceSnapshot {
    this.snapshotValue = { ...this.snapshotValue, storageUnavailable: true, status: 'session' };
    return this.snapshotValue;
  }
}

export function createPersonalPersistence(storage: PersonalStorage): PersonalPersistenceController {
  return new PersonalPersistenceController(storage);
}
