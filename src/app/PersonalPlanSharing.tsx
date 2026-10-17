import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import { hasPersonalPlanLink, parsePersonalPlanLink, personalPlanShareUrl, sharedDayId, withoutPersonalPlanLink } from '../data/personalSharing';
import type { PlannerPersonalState } from '../data/plannerBackup';
import { scrollToTarget } from '../data/navigation';
import { PlanSnapshotReview } from './PlanSnapshotReview';
import './personal-sharing.css';

export function PersonalPlanSharing({ state, onApply, onReviewStart, onReviewDone }: { state: PlannerPersonalState; onApply: (state: PlannerPersonalState) => void; onReviewStart: () => void; onReviewDone: (dayId?: string) => void }) {
  const [incomingHref, setIncomingHref] = useState(() => hasPersonalPlanLink(window.location.href) ? window.location.href : '');
  const incoming = useMemo(() => incomingHref ? parsePersonalPlanLink(incomingHref) : undefined, [incomingHref]);
  const [link, setLink] = useState('');
  const [notice, setNotice] = useState('');
  const section = useRef<HTMLElement>(null);
  const reviewStart = useRef(onReviewStart);
  reviewStart.current = onReviewStart;
  useEffect(() => {
    const read = () => { if (hasPersonalPlanLink(window.location.href)) { setIncomingHref(window.location.href); reviewStart.current(); } };
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  useEffect(() => {
    if (!incomingHref) return;
    const frame = window.requestAnimationFrame(() => { scrollToTarget(section.current); section.current?.querySelector<HTMLElement>('h3, h2')?.focus({ preventScroll: true }); });
    return () => window.cancelAnimationFrame(frame);
  }, [incomingHref]);
  const finish = () => {
    const dayId = sharedDayId(incomingHref);
    setIncomingHref('');
    window.history.replaceState(window.history.state, '', withoutPersonalPlanLink(window.location.href));
    onReviewDone(dayId);
  };
  useEffect(() => { if (link) { setLink(''); setNotice('Your plan changed. Create a fresh snapshot link to share the latest decisions.'); } }, [state]);
  const makeLink = () => {
    const next = personalPlanShareUrl(window.location.href, state);
    setLink(next ?? '');
    setNotice(next ? 'Snapshot ready. Anyone with this link can review these picks, saved ideas and progress. Later edits need a new link.' : 'This plan is too large for a reliable sharing link. Download an editable backup below and send that file instead.');
  };
  return <section ref={section} className="section personal-sharing" id="share-plan" aria-labelledby="share-plan-title">
    <div className="section-heading"><div><span className="eyebrow">Take your decisions with you</span><h2 id="share-plan-title" tabIndex={-1}>Share your plan</h2></div></div>
    {incomingHref && (incoming ? <PlanSnapshotReview snapshot={incoming} current={state} headingId="shared-personal-plan-title" applyLabel="Use this shared plan" onApply={() => { onApply(incoming.state); finish(); setNotice('Shared snapshot applied. Changes from now on stay in this browser until you share again.'); }} onCancel={finish} /> : <div className="backup-review" role="alert"><h3>Unable to read this shared plan</h3><p>The link is incomplete, unsupported or contains unknown choices. Your saved plan has not changed.</p><button className="secondary-button" type="button" onClick={finish}>Keep my current plan</button></div>)}
    <details className="personal-share-tools"><summary><Share2 size={17} />Create a full-plan sharing link</summary><p>Your picks, saved ideas and handled tasks stay on this device. A link sends a snapshot for another person to review and use. The published itinerary is common to everyone; personal edits are not automatically shared.</p><button className="secondary-button" type="button" onClick={makeLink}>Create plan snapshot link</button>{link && <div className="personal-share-link"><label><span>Plan snapshot link</span><textarea readOnly value={link} onFocus={(event) => event.target.select()} /></label><button type="button" className="secondary-button" onClick={async () => { try { await navigator.clipboard.writeText(link); setNotice('Plan snapshot link copied. Send a new snapshot after later edits.'); } catch { setNotice('Select and copy the link above.'); } }}><Copy size={16} />Copy snapshot link</button></div>}<p><a href="#planner-backup">Use an editable backup file instead</a></p></details>
    {notice && <p role="status">{notice}</p>}
  </section>;
}
