import { useEffect, useRef, useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import { tokyoFlexibleDays, tokyoPoolActivities } from '../data/tokyoPool';
import { parseTokyoChoices, tokyoShareUrl, type TokyoChoices } from '../data/tokyoChoices';

export function TokyoSharing({ choices, onReplace }: { choices: TokyoChoices; onReplace: (choices: TokyoChoices) => void }) {
  const [incoming] = useState(() => new URLSearchParams(window.location.search).get('picks'));
  const shared = incoming ? parseTokyoChoices(incoming) : undefined;
  const [reviewing, setReviewing] = useState(Boolean(incoming));
  const [showLink, setShowLink] = useState(false);
  const [notice, setNotice] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const count = Object.keys(choices.outings).length + Object.keys(choices.evenings).length;
  useEffect(() => {
    if (!incoming || new URLSearchParams(window.location.search).has('day')) return;
    const frame = window.requestAnimationFrame(() => {
      heading.current?.scrollIntoView({ block: 'center' });
      heading.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [incoming]);
  const dismiss = () => {
    setReviewing(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('picks');
    window.history.replaceState({}, '', url);
  };
  const shareUrl = tokyoShareUrl(window.location.href, choices);
  return <div className="tokyo-sharing">
    {reviewing && <section className="shared-picks-review" aria-labelledby="shared-picks-title"><h3 id="shared-picks-title" ref={heading} tabIndex={-1}>Shared Tokyo picks</h3>{shared ? <>
      <p>Review this snapshot before replacing the choices saved in this browser. It doesn’t reserve anything.</p>
      <ul>{tokyoFlexibleDays.map((day) => <li key={day.id}><strong>{day.label.split(' · ')[0]}</strong><span>{[shared.outings[day.id], shared.evenings[day.id]].filter(Boolean).map((id) => tokyoPoolActivities.find((activity) => activity.id === id)?.title).join(' + ') || 'Keep free'}</span></li>)}</ul>
      <p>{count ? `${count} existing pick${count === 1 ? '' : 's'} in this browser will be replaced.` : 'This browser has no Tokyo picks yet.'}</p>
      <div className="sharing-actions"><button className="primary-button" onClick={() => { onReplace(shared); dismiss(); setNotice('Shared picks applied. Use Undo in the Tokyo idea tools to restore your previous picks.'); }}>Use these picks</button><button className="secondary-button" onClick={dismiss}>Keep my current picks</button></div>
    </> : <><p>This link contains invalid or outdated picks. Your saved choices have not changed.</p><button className="secondary-button" onClick={dismiss}>Dismiss link</button></>}</section>}
    <details className="sharing-disclosure"><summary><Share2 size={16} /> Share your Tokyo picks</summary><p>Create a snapshot link for your travel partner or another device. The recipient reviews it before applying it. Later edits stay in each browser; create a new link to share updates.</p><button className="secondary-button" disabled={!count} onClick={() => { setShowLink(true); setNotice('Sharing link ready. It contains your selected dates and activity IDs.'); }}>Create sharing link</button>{!count && <small>Choose an outing or evening first.</small>}{showLink && count > 0 && <div className="share-link-row"><label><span className="sr-only">Tokyo picks sharing link</span><input readOnly value={shareUrl} onFocus={(event) => event.target.select()} /></label><button className="secondary-button" aria-label="Copy Tokyo picks sharing link" onClick={async () => { try { await navigator.clipboard.writeText(shareUrl); setNotice('Tokyo picks link copied.'); } catch { setNotice('Select and copy the link above.'); } }}><Copy size={16} /> Copy</button></div>}</details>
    {notice && <p className="sharing-notice" role="status">{notice}</p>}
  </div>;
}
