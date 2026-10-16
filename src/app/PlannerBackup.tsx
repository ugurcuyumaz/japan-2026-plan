import { useRef, useState } from 'react';
import { Download, Upload, Undo2 } from 'lucide-react';
import { buildPlannerBackup, maxPlannerBackupBytes, parsePlannerBackup, type PlannerBackupSnapshot, type PlannerPersonalState } from '../data/plannerBackup';
import { tokyoPoolActivities } from '../data/tokyoPool';
import { shortDate } from '../data/map';
import { tokyoDateWarnings } from '../data/planner';
import './planner-backup.css';

export function PlannerBackup({ state, onRestore, undoAvailable, onUndo, storageUnavailable }: { state: PlannerPersonalState; onRestore: (state: PlannerPersonalState) => void; undoAvailable: boolean; onUndo: () => void; storageUnavailable: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const importButton = useRef<HTMLButtonElement>(null);
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const [incoming, setIncoming] = useState<PlannerBackupSnapshot>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const save = () => {
    try {
      const url = URL.createObjectURL(new Blob([buildPlannerBackup(state)], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = `japan-2026-personal-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('Backup download started. Keep the JSON file to restore on this or another device.');
    } catch { setError('The backup could not download. Try again in another browser.'); }
  };
  const load = async (file?: File) => {
    setIncoming(undefined); setError(''); setNotice('');
    if (!file) return;
    if (file.size > maxPlannerBackupBytes) { setError('This file is too large. Choose a Japan planner JSON backup smaller than 100 KB.'); return; }
    try {
      const parsed = parsePlannerBackup(await file.text());
      if (!parsed) { setError('This is not a valid Japan planner backup. Nothing was changed. Choose a JSON file downloaded from this planner.'); return; }
      setIncoming(parsed);
      window.requestAnimationFrame(() => reviewHeading.current?.focus());
    } catch { setError('The file could not be read. Your current plan is unchanged.'); }
  };
  const incomingPicks = incoming ? [...Object.entries(incoming.state.choices.outings), ...Object.entries(incoming.state.choices.evenings)] : [];
  const warnings = incoming ? [...new Set(incomingPicks.flatMap(([dayId]) => tokyoDateWarnings(incoming.state.choices, dayId)))] : [];
  return <section className="section planner-backup-section" id="planner-backup" aria-labelledby="planner-backup-title">
    <details className="planner-backup-disclosure"><summary><Download size={18} /><span><strong id="planner-backup-title">Keep your decisions safe</strong><small>Back up or restore picks, saved ideas and handled tasks</small></span></summary>
      <div className="planner-backup-content"><p>Your decisions stay in this browser. Download a backup to transfer them to your partner or another device. It contains choices and progress; it does not contain tickets or confirmation numbers.</p>
        {storageUnavailable && <p className="planning-warning">This browser could not save your changes. They last for this session; download a backup before closing the page.</p>}
        <div className="backup-actions"><button className="secondary-button" type="button" onClick={save}><Download size={16} />Download editable backup</button><button ref={importButton} className="secondary-button" type="button" onClick={() => input.current?.click()}><Upload size={16} />Import backup</button><input ref={input} type="file" accept=".json,application/json" className="sr-only" tabIndex={-1} aria-label="Choose planner backup file" onChange={(event) => { void load(event.target.files?.[0]); event.target.value = ''; }} /></div>
        <small>This JSON file restores decisions. Use “Save offline travel pack” for a readable plan without internet. Neither option synchronizes later edits.</small>
        {error && <p className="backup-error" role="alert">{error}</p>}
        {incoming && <section className="backup-review" aria-labelledby="backup-review-title"><h3 id="backup-review-title" tabIndex={-1} ref={reviewHeading}>Review backup before replacing</h3><p>Saved {new Date(incoming.exportedAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC.</p><dl><div><dt>Tokyo picks</dt><dd>{incomingPicks.length} incoming · {Object.keys(state.choices.outings).length + Object.keys(state.choices.evenings).length} current</dd></div><div><dt>Saved ideas</dt><dd>{incoming.state.savedKeys.length} incoming · {state.savedKeys.length} current</dd></div><div><dt>Handled tasks</dt><dd>{Object.keys(incoming.state.bookingProgress).length} incoming · {Object.keys(state.bookingProgress).length} current</dd></div></dl>{incomingPicks.length > 0 && <details><summary>Review incoming Tokyo dates</summary><ul>{incomingPicks.sort(([a], [b]) => a.localeCompare(b)).map(([dayId, id]) => <li key={`${dayId}-${id}`}>{shortDate(dayId)} · {tokyoPoolActivities.find((idea) => idea.id === id)?.title}</li>)}</ul></details>}{warnings.map((warning) => <p className="planning-warning" key={warning}>{warning}</p>)}<p><strong>Replace all three lists in this browser.</strong> Nothing is merged. Progress for an idea on another date is kept as a record and applies only if that exact dated task is active.</p><div className="backup-actions"><button className="primary-button" type="button" onClick={() => { onRestore(incoming.state); setIncoming(undefined); setNotice('Backup restored. Your picks, saved ideas and task progress were replaced.'); importButton.current?.focus(); }}>Replace with this backup</button><button className="secondary-button" type="button" onClick={() => { setIncoming(undefined); importButton.current?.focus(); }}>Cancel restore</button></div></section>}
        {notice && <p role="status">{notice}</p>}{undoAvailable && <button className="text-button" type="button" onClick={() => { onUndo(); setNotice('Your decisions before the restore have been restored.'); importButton.current?.focus(); }}><Undo2 size={16} />Undo last restore</button>}
      </div>
    </details>
  </section>;
}
