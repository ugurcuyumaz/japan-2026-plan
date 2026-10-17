import { describe, expect, it } from 'vitest';
import { bookingProgressStorageKey } from './bookingProgress';
import { buildPlannerBackup, emptyPersonalState, plannerStateStorageKey, type PlannerPersonalState } from './plannerBackup';
import { shortlistStorageKey } from './shortlist';
import { createPersonalPersistence, plannerRecoveryStorageKey, type PersonalStorage } from './personalPersistence';
import { tokyoStorageKey } from './tokyoChoices';

class FakeStorage implements PersonalStorage {
  values = new Map<string, string>();
  writes: Array<[string, string]> = [];
  failReads = false;
  failWrites = false;
  failWriteKey?: string;
  getItem(key: string) { if (this.failReads) throw new Error('read denied'); return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { if (this.failWrites || key === this.failWriteKey) throw new Error('write denied'); this.values.set(key, value); this.writes.push([key, value]); }
}

describe('personal planner persistence', () => {
  it('loads valid snapshots and writes only after an actual edit', () => {
    const storage = new FakeStorage();
    const original = emptyPersonalState();
    original.choices.outings['2026-11-04'] = 'nezu-museum';
    storage.values.set(plannerStateStorageKey, buildPlannerBackup(original));
    const controller = createPersonalPersistence(storage);
    expect(controller.snapshot.state).toEqual(original);
    expect(controller.snapshot.status).toBe('saved');
    expect(storage.writes).toHaveLength(0);
    controller.update({ ...original, savedKeys: ['idea:yanesen'] });
    expect(controller.snapshot.status).toBe('saved');
    expect(storage.writes).toHaveLength(1);
  });

  it('loads legacy keys without writing a migration until the user edits', () => {
    const storage = new FakeStorage();
    storage.values.set(tokyoStorageKey, JSON.stringify({ outings: { '2026-11-04': 'nezu-museum' }, evenings: {} }));
    storage.values.set(bookingProgressStorageKey, JSON.stringify({ 'booking-gableview-dinner': '2026-10-16T10:00:00.000Z' }));
    storage.values.set(shortlistStorageKey, JSON.stringify(['idea:yanesen']));
    const controller = createPersonalPersistence(storage);
    expect(controller.snapshot.state.choices.outings['2026-11-04']).toBe('nezu-museum');
    expect(controller.snapshot.state.bookingProgress['booking-gableview-dinner']).toBe('2026-10-16T10:00:00.000Z');
    expect(controller.snapshot.state.savedKeys).toEqual(['idea:yanesen']);
    expect(storage.writes).toHaveLength(0);
    controller.update(controller.snapshot.state);
    expect(storage.writes).toHaveLength(1);
  });

  it('preserves invalid and future-format data through edits until explicit recovery resolution', () => {
    const storage = new FakeStorage();
    const future = '{"format":"japan-2026-personal-plan","version":2,"future":"keep me"}';
    storage.values.set(plannerStateStorageKey, future);
    const controller = createPersonalPersistence(storage);
    expect(controller.snapshot.status).toBe('recovery');
    expect(controller.snapshot.recoveryRaw).toBe(future);
    controller.update({ ...emptyPersonalState(), savedKeys: ['idea:yanesen'] });
    expect(controller.snapshot.status).toBe('recovery');
    expect(storage.values.get(plannerStateStorageKey)).toBe(future);
    expect(storage.writes).toHaveLength(0);
    controller.replace({ ...emptyPersonalState(), savedKeys: ['idea:yanesen'] });
    expect(controller.snapshot.status).toBe('saved');
    expect(controller.snapshot.recoveryRaw).toBe(future);
    expect(storage.values.get(plannerStateStorageKey)).not.toBe(future);
  });

  it('archives invalid raw data before reset or reviewed replacement and exposes it after reload', () => {
    for (const resolve of ['reset', 'replace'] as const) {
      const storage = new FakeStorage();
      const invalid = '{"format":"japan-2026-personal-plan","version":9,"saved":"keep"}';
      storage.values.set(plannerStateStorageKey, invalid);
      const controller = createPersonalPersistence(storage);
      if (resolve === 'reset') controller.resetRecovery();
      else controller.replace({ ...emptyPersonalState(), savedKeys: ['idea:yanesen'] });
      expect(storage.values.get(plannerRecoveryStorageKey)).toBe(invalid);
      const reloaded = createPersonalPersistence(storage);
      expect(reloaded.snapshot.recoveryRaw).toBe(invalid);
      expect(reloaded.snapshot.status).toBe('saved');
    }
  });

  it('does not overwrite invalid primary data when its durable recovery copy cannot be written', () => {
    const storage = new FakeStorage();
    const invalid = '{"format":"future-plan","version":4}';
    storage.values.set(plannerStateStorageKey, invalid);
    storage.failWriteKey = plannerRecoveryStorageKey;
    const controller = createPersonalPersistence(storage);
    controller.resetRecovery();
    expect(controller.snapshot.status).toBe('recovery');
    expect(controller.snapshot.storageUnavailable).toBe(true);
    expect(storage.values.get(plannerStateStorageKey)).toBe(invalid);
    expect(storage.values.has(plannerRecoveryStorageKey)).toBe(false);
  });

  it('keeps session edits and reports a conflict when storage changed before a save', () => {
    const storage = new FakeStorage();
    storage.values.set(plannerStateStorageKey, buildPlannerBackup(emptyPersonalState()));
    const controller = createPersonalPersistence(storage);
    const externalRaw = buildPlannerBackup({ ...emptyPersonalState(), savedKeys: ['idea:yanesen'] });
    storage.values.set(plannerStateStorageKey, externalRaw);
    const local: PlannerPersonalState = { ...emptyPersonalState(), savedKeys: ['idea:yanesen', 'idea:shimokitazawa'] };
    controller.update(local);
    expect(controller.snapshot.state).toEqual(local);
    expect(controller.snapshot.status).toBe('conflict');
    expect(controller.snapshot.externalChange?.state?.savedKeys).toEqual(['idea:yanesen']);
    expect(storage.values.get(plannerStateStorageKey)).toBe(externalRaw);
  });

  it('requires a new review when the external value changes before accepting', () => {
    const storage = new FakeStorage();
    storage.values.set(plannerStateStorageKey, buildPlannerBackup(emptyPersonalState()));
    const controller = createPersonalPersistence(storage);
    controller.noteExternal(buildPlannerBackup({ ...emptyPersonalState(), savedKeys: ['idea:yanesen'] }));
    storage.values.set(plannerStateStorageKey, buildPlannerBackup({ ...emptyPersonalState(), savedKeys: ['idea:shimokitazawa'] }));
    controller.acceptExternal();
    expect(controller.snapshot.state).toEqual(emptyPersonalState());
    expect(controller.snapshot.status).toBe('conflict');
    expect(controller.snapshot.externalChange?.state?.savedKeys).toEqual(['idea:shimokitazawa']);
    expect(storage.writes).toHaveLength(0);
    controller.acceptExternal();
    expect(controller.snapshot.state.savedKeys).toEqual(['idea:shimokitazawa']);
    expect(controller.snapshot.status).toBe('saved');
    expect(storage.writes).toHaveLength(0);
    storage.values.delete(plannerStateStorageKey);
    controller.noteExternal(null);
    controller.acceptExternal();
    expect(controller.snapshot.state).toEqual(emptyPersonalState());
    expect(storage.writes).toHaveLength(1);
  });

  it('clears a stale conflict when storage returns to the accepted copy without writing', () => {
    const storage = new FakeStorage();
    const acceptedRaw = buildPlannerBackup(emptyPersonalState());
    storage.values.set(plannerStateStorageKey, acceptedRaw);
    const controller = createPersonalPersistence(storage);
    controller.noteExternal(buildPlannerBackup({ ...emptyPersonalState(), savedKeys: ['idea:yanesen'] }));
    controller.noteExternal(acceptedRaw);
    expect(controller.snapshot.externalChange).toBeUndefined();
    expect(controller.snapshot.status).toBe('saved');
    expect(storage.writes).toHaveLength(0);
  });

  it('preserves pending edits when an external conflict disappears and saves on the next explicit edit', () => {
    const storage = new FakeStorage();
    const acceptedRaw = buildPlannerBackup(emptyPersonalState());
    storage.values.set(plannerStateStorageKey, acceptedRaw);
    const controller = createPersonalPersistence(storage);
    const externalRaw = buildPlannerBackup({ ...emptyPersonalState(), savedKeys: ['idea:yanesen'] });
    storage.values.set(plannerStateStorageKey, externalRaw);
    const local = { ...emptyPersonalState(), savedKeys: ['idea:shimokitazawa'] as const };
    controller.update({ ...local, savedKeys: [...local.savedKeys] });
    storage.values.set(plannerStateStorageKey, acceptedRaw);
    controller.noteExternal(acceptedRaw);
    expect(controller.snapshot.state.savedKeys).toEqual(['idea:shimokitazawa']);
    expect(controller.snapshot.status).toBe('session');
    expect(controller.snapshot.externalChange).toBeUndefined();
    expect(storage.writes).toHaveLength(0);
    controller.update(controller.snapshot.state);
    expect(controller.snapshot.status).toBe('saved');
    expect(storage.writes).toHaveLength(1);
  });

  it('keeps pending local edits when accepting a conflict whose stored copy returned to the accepted value', () => {
    const storage = new FakeStorage();
    const acceptedRaw = buildPlannerBackup(emptyPersonalState());
    storage.values.set(plannerStateStorageKey, acceptedRaw);
    const controller = createPersonalPersistence(storage);
    storage.values.set(plannerStateStorageKey, buildPlannerBackup({ ...emptyPersonalState(), savedKeys: ['idea:yanesen'] }));
    controller.update({ ...emptyPersonalState(), savedKeys: ['idea:shimokitazawa'] });
    storage.values.set(plannerStateStorageKey, acceptedRaw);
    controller.acceptExternal();
    expect(controller.snapshot.state.savedKeys).toEqual(['idea:shimokitazawa']);
    expect(controller.snapshot.status).toBe('session');
    expect(controller.snapshot.externalChange).toBeUndefined();
    expect(storage.writes).toHaveLength(0);
  });

  it('saves pending local edits on explicit keep when storage returned to the accepted copy', () => {
    const storage = new FakeStorage();
    const acceptedRaw = buildPlannerBackup(emptyPersonalState());
    storage.values.set(plannerStateStorageKey, acceptedRaw);
    const controller = createPersonalPersistence(storage);
    storage.values.set(plannerStateStorageKey, buildPlannerBackup({ ...emptyPersonalState(), savedKeys: ['idea:yanesen'] }));
    controller.update({ ...emptyPersonalState(), savedKeys: ['idea:shimokitazawa'] });
    storage.values.set(plannerStateStorageKey, acceptedRaw);
    controller.keepCurrent();
    expect(controller.snapshot.state.savedKeys).toEqual(['idea:shimokitazawa']);
    expect(controller.snapshot.status).toBe('saved');
    expect(controller.snapshot.externalChange).toBeUndefined();
    expect(storage.writes).toHaveLength(1);
  });

  it('persists an accepted clear so legacy choices do not return after reload', () => {
    const storage = new FakeStorage();
    storage.values.set(tokyoStorageKey, JSON.stringify({ outings: { '2026-11-04': 'nezu-museum' }, evenings: {} }));
    const first = createPersonalPersistence(storage);
    expect(first.snapshot.state.choices.outings['2026-11-04']).toBe('nezu-museum');
    storage.values.delete(plannerStateStorageKey);
    first.noteExternal(null);
    first.acceptExternal();
    expect(storage.values.has(plannerStateStorageKey)).toBe(true);
    const reloaded = createPersonalPersistence(storage);
    expect(reloaded.snapshot.state).toEqual(emptyPersonalState());
  });

  it('does not keep local data over an external change newer than the reviewed marker', () => {
    const storage = new FakeStorage();
    storage.values.set(plannerStateStorageKey, buildPlannerBackup(emptyPersonalState()));
    const controller = createPersonalPersistence(storage);
    controller.noteExternal(buildPlannerBackup({ ...emptyPersonalState(), savedKeys: ['idea:yanesen'] }));
    storage.values.set(plannerStateStorageKey, buildPlannerBackup({ ...emptyPersonalState(), savedKeys: ['idea:shimokitazawa'] }));
    controller.keepCurrent();
    expect(controller.snapshot.status).toBe('conflict');
    expect(controller.snapshot.externalChange?.state?.savedKeys).toEqual(['idea:shimokitazawa']);
  });

  it('allows an explicitly reviewed invalid external value to be replaced while retaining its raw recovery copy', () => {
    const storage = new FakeStorage();
    storage.values.set(plannerStateStorageKey, buildPlannerBackup(emptyPersonalState()));
    const controller = createPersonalPersistence(storage);
    const invalid = '{"format":"future-plan","version":8}';
    storage.values.set(plannerStateStorageKey, invalid);
    controller.noteExternal(invalid);
    expect(controller.snapshot.status).toBe('recovery');
    controller.keepCurrent();
    expect(controller.snapshot.status).toBe('saved');
    expect(controller.snapshot.recoveryRaw).toBe(invalid);
    expect(storage.values.get(plannerStateStorageKey)).not.toBe(invalid);
  });

  it('keeps the local copy when explicitly resolving a reviewed conflict', () => {
    const storage = new FakeStorage();
    storage.values.set(plannerStateStorageKey, buildPlannerBackup(emptyPersonalState()));
    const controller = createPersonalPersistence(storage);
    controller.update({ ...emptyPersonalState(), savedKeys: ['idea:yanesen'] });
    const externalRaw = buildPlannerBackup({ ...emptyPersonalState(), savedKeys: ['idea:shimokitazawa'] });
    storage.values.set(plannerStateStorageKey, externalRaw);
    controller.noteExternal(externalRaw);
    expect(controller.snapshot.status).toBe('conflict');
    controller.keepCurrent();
    expect(controller.snapshot.status).toBe('saved');
    expect(controller.snapshot.state.savedKeys).toEqual(['idea:yanesen']);
    expect(storage.values.get(plannerStateStorageKey)).not.toBe(externalRaw);
  });

  it('reports storage read and write failures as session-only state', () => {
    const unreadable = new FakeStorage();
    unreadable.failReads = true;
    const noRead = createPersonalPersistence(unreadable);
    expect(noRead.snapshot.storageUnavailable).toBe(true);
    expect(noRead.snapshot.status).toBe('session');
    const storage = new FakeStorage();
    storage.failWrites = true;
    const controller = createPersonalPersistence(storage);
    controller.update({ ...emptyPersonalState(), savedKeys: ['idea:yanesen'] });
    expect(controller.snapshot.storageUnavailable).toBe(true);
    expect(controller.snapshot.status).toBe('session');
    expect(controller.snapshot.state.savedKeys).toEqual(['idea:yanesen']);
  });
});
