import { useEffect, useRef } from 'react';
import { tokyoPoolActivities } from '../data/tokyoPool';
import { shortDate } from '../data/map';
import { tokyoDateWarnings } from '../data/planner';
import { shortlistEntries } from '../data/shortlist';
import { buildPlannerBookings } from '../data/bookingActions';
import type { PlannerBackupSnapshot, PlannerPersonalState } from '../data/plannerBackup';

export function PlanSnapshotReview({ snapshot, current, headingId, applyLabel, onApply, onCancel }: { snapshot: PlannerBackupSnapshot; current: PlannerPersonalState; headingId: string; applyLabel: string; onApply: () => void; onCancel: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [snapshot]);
  const picks = [...Object.entries(snapshot.state.choices.outings), ...Object.entries(snapshot.state.choices.evenings)].sort(([a], [b]) => a.localeCompare(b));
  const warnings = [...new Set(picks.flatMap(([dayId]) => tokyoDateWarnings(snapshot.state.choices, dayId)))];
  const saved = shortlistEntries(snapshot.state.savedKeys);
  const activeHandled = buildPlannerBookings(snapshot.state.choices).filter((item) => snapshot.state.bookingProgress[item.id]);
  const inactiveCount = Object.keys(snapshot.state.bookingProgress).length - activeHandled.length;
  return <section className="backup-review" aria-labelledby={headingId}>
    <h3 id={headingId} tabIndex={-1} ref={heading}>Review before replacing your plan</h3><p>Snapshot saved {new Date(snapshot.exportedAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC.</p>
    <dl><div><dt>Tokyo picks</dt><dd>{picks.length} incoming · {Object.keys(current.choices.outings).length + Object.keys(current.choices.evenings).length} current</dd></div><div><dt>Saved ideas</dt><dd>{snapshot.state.savedKeys.length} incoming · {current.savedKeys.length} current</dd></div><div><dt>Handled tasks</dt><dd>{Object.keys(snapshot.state.bookingProgress).length} incoming · {Object.keys(current.bookingProgress).length} current</dd></div></dl>
    <details><summary>Review Tokyo dates</summary>{picks.length ? <ul>{picks.map(([dayId, id]) => <li key={`${dayId}-${id}`}>{shortDate(dayId)} · {tokyoPoolActivities.find((idea) => idea.id === id)?.title}</li>)}</ul> : <p>All flexible Tokyo dates are left free.</p>}</details>
    {saved.length > 0 && <details><summary>Review {saved.length} saved ideas</summary><ul>{saved.map((item) => <li key={item.key}>{item.title} · {item.area}</li>)}</ul></details>}
    {activeHandled.length > 0 && <details><summary>Review handled tasks</summary><ul>{activeHandled.map((item) => <li key={item.id}>{item.item} · {item.date}</li>)}</ul></details>}
    {inactiveCount > 0 && <p>{inactiveCount} progress record{inactiveCount === 1 ? '' : 's'} belong to earlier choices. They apply only when that exact dated task is active.</p>}
    {warnings.map((warning) => <p className="planning-warning" key={warning}>{warning}</p>)}
    <p><strong>Replace picks, saved ideas and task progress in this browser.</strong> Nothing is merged. This does not reserve or confirm anything. Later edits are not synchronized.</p>
    <div className="backup-actions"><button type="button" className="primary-button" onClick={onApply}>{applyLabel}</button><button type="button" className="secondary-button" onClick={onCancel}>Keep my current plan</button></div>
  </section>;
}
