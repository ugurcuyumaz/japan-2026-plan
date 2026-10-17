import { useRef } from 'react';
import { ArrowRight, Bookmark, X } from 'lucide-react';
import { shortlistEntries, type ShortlistKey } from '../data/shortlist';
import type { TripSearchTarget } from '../data/tripSearch';
import type { TripDay } from '../types/trip';
import { tokyoPoolActivities } from '../data/tokyoPool';
import './shortlist.css';

export function SavedIdeas({ savedKeys, onToggleSave, onNavigate, days }: { savedKeys: ShortlistKey[]; onToggleSave: (key: ShortlistKey) => void; onNavigate: (target: TripSearchTarget) => void; days?: TripDay[] }) {
  const entries = shortlistEntries(savedKeys);
  const section = useRef<HTMLElement>(null);
  const removeSaved = (key: ShortlistKey) => {
    const index = entries.findIndex((entry) => entry.key === key);
    onToggleSave(key);
    window.requestAnimationFrame(() => {
      const buttons = Array.from(section.current?.querySelectorAll<HTMLButtonElement>('.saved-ideas-actions .secondary-button') ?? []);
      (buttons[Math.min(index, buttons.length - 1)] ?? section.current?.querySelector<HTMLElement>('h2'))?.focus({ preventScroll: true });
    });
  };
  return <section ref={section} className="section saved-ideas" id="saved-ideas" aria-labelledby="saved-ideas-title">
    <div className="section-heading"><div><span className="eyebrow">Keep options handy</span><h2 id="saved-ideas-title" tabIndex={-1}>Saved ideas</h2></div><span className="section-count">{entries.length} saved</span></div>
    {entries.length ? <ul className="saved-ideas-list">{entries.map((entry) => {
      const datedTarget = entry.target.kind === 'day' && entry.target.placeId ? entry.target : undefined;
      const dayHasPlace = !datedTarget || !days || days.some((day) => day.id === datedTarget.dayId && day.places.some((place) => place.id === datedTarget.placeId));
      const sourceIdea = datedTarget && !dayHasPlace ? tokyoPoolActivities.find((activity) => activity.places.some((place) => place.id === datedTarget.placeId)) : undefined;
      const openTarget: TripSearchTarget = sourceIdea ? { kind: 'idea', ideaId: sourceIdea.id } : entry.target;
      return <li key={entry.key}><div><span className="eyebrow">{entry.kind === 'idea' ? 'Tokyo idea' : entry.kind === 'resource' ? 'Workshop or food option' : 'Dated place'} · {entry.area}</span><strong>{entry.title}</strong>{sourceIdea && <p className="saved-ideas-missing-note">Not in current day · open source idea</p>}<p>{entry.summary}</p></div><div className="saved-ideas-actions"><button type="button" className="secondary-button" aria-label={sourceIdea ? `Open source idea: ${sourceIdea.title}` : `Open ${entry.title}`} onClick={() => onNavigate(openTarget)}>{sourceIdea ? 'Open source idea' : 'Open'} <ArrowRight size={14} /></button><button type="button" className="saved-remove" aria-label={`Unsave ${entry.title}`} title={`Unsave ${entry.title}`} onClick={() => removeSaved(entry.key)}><X size={16} /><span className="sr-only">Unsave</span></button></div></li>;
    })}</ul> : <div className="saved-ideas-empty"><Bookmark size={18} /><p>No saved ideas yet. Save a Tokyo outing in <a href="#tokyo-pool">Tokyo ideas</a> or a dated place in the <a href="#city-guide">city guide</a>.</p></div>}
  </section>;
}
