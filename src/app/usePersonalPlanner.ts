import { useCallback, useEffect, useRef, useState } from 'react';
import { emptyPersonalState, type PlannerPersonalState } from '../data/plannerBackup';
import { createPersonalPersistence, type PersonalPersistenceController, type PersonalPersistenceSnapshot } from '../data/personalPersistence';
import { plannerStateStorageKey } from '../data/plannerBackup';

type StateUpdate = PlannerPersonalState | ((current: PlannerPersonalState) => PlannerPersonalState);

export function usePersonalPlanner() {
  const [controller] = useState<PersonalPersistenceController>(() => {
    try { return createPersonalPersistence(window.localStorage); }
    catch { return createPersonalPersistence({ getItem() { throw new Error('Storage unavailable'); }, setItem() { throw new Error('Storage unavailable'); } }); }
  });
  const [snapshot, setSnapshot] = useState<PersonalPersistenceSnapshot>(() => controller.snapshot);
  const snapshotRef = useRef(snapshot);
  const publish = useCallback((next: PersonalPersistenceSnapshot) => {
    snapshotRef.current = next;
    setSnapshot(next);
  }, []);

  const update = useCallback((stateOrUpdater: StateUpdate) => {
    const current = snapshotRef.current.state;
    const next = typeof stateOrUpdater === 'function' ? stateOrUpdater(current) : stateOrUpdater;
    publish(controller.update(next));
  }, [controller, publish]);
  const replace = useCallback((reviewedState: PlannerPersonalState) => publish(controller.replace(reviewedState)), [controller, publish]);
  const acceptExternal = useCallback(() => publish(controller.acceptExternal()), [controller, publish]);
  const keepCurrent = useCallback(() => publish(controller.keepCurrent()), [controller, publish]);
  const resetRecovery = useCallback(() => publish(controller.resetRecovery()), [controller, publish]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea && event.storageArea !== window.localStorage) return;
      if (event.key !== plannerStateStorageKey && event.key !== null) return;
      publish(controller.noteExternal(event.key === null ? null : event.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [controller, publish]);

  return {
    state: snapshot.state ?? emptyPersonalState(),
    update,
    replace,
    storageUnavailable: snapshot.storageUnavailable,
    status: snapshot.status,
    recoveryRaw: snapshot.recoveryRaw,
    externalChange: snapshot.externalChange,
    acceptExternal,
    keepCurrent,
    resetRecovery,
    revision: snapshot.revision,
  };
}
