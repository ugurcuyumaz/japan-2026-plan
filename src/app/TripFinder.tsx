import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { japanDate, relevantTripDay } from '../data/navigation';
import { buildTripSearchIndex, searchTripIndex, tripSearchSectionShortcuts, type TripSearchKind, type TripSearchTarget } from '../data/tripSearch';
import type { Booking, TripDay } from '../types/trip';
import './trip-finder.css';

const kindLabel: Record<TripSearchKind, string> = {
  day: 'Day',
  place: 'Stop',
  booking: 'To do',
  stay: 'Stay',
  idea: 'Tokyo idea',
  section: 'Section',
};

export interface TripFinderProps {
  open: boolean;
  onClose: () => void;
  days: TripDay[];
  plannerBookings: Booking[];
  onNavigate: (target: TripSearchTarget) => void;
}

export function TripFinder({ open, onClose, days, plannerBookings, onNavigate }: TripFinderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const index = useMemo(() => buildTripSearchIndex(days, plannerBookings), [days, plannerBookings]);
  const search = useMemo(() => searchTripIndex(index, query), [index, query]);
  const relevantDay = useMemo(() => relevantTripDay(days, japanDate()), [days]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const close = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
    else onClose();
  };

  const navigate = (target: TripSearchTarget) => {
    if (dialogRef.current?.open) dialogRef.current.close();
    onNavigate(target);
  };

  const submitFirstMatch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim() && search.results[0]) navigate(search.results[0].target);
  };

  const shortcut = (target: TripSearchTarget, label: string, key: string) => <button type="button" className="trip-finder-shortcut" key={key} onClick={() => navigate(target)}>{label}<ArrowRight size={15} aria-hidden="true" /></button>;

  return createPortal(<dialog
    ref={dialogRef}
    className="trip-finder-dialog"
    aria-labelledby="trip-finder-title"
    onClose={onClose}
    onClick={(event) => { if (event.target === dialogRef.current) close(); }}
  >
    <div className="trip-finder-shell">
      <header className="trip-finder-header">
        <div><span className="eyebrow">Japan, slowly</span><h2 id="trip-finder-title">Find in your trip</h2></div>
        <button type="button" className="trip-finder-close" onClick={close} aria-label="Close trip finder"><X size={20} /></button>
      </header>
      <form className="trip-finder-form" role="search" onSubmit={submitFirstMatch}>
        <Search size={19} aria-hidden="true" />
        <label className="sr-only" htmlFor="trip-finder-query">Search days, places, food, hotels, reservations, and Tokyo ideas</label>
        <input ref={inputRef} id="trip-finder-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “gyutan”, “Nikko” or “Fuji Excursion”" autoComplete="off" />
        <kbd>Enter</kbd>
      </form>
      <div className="trip-finder-content">
        {query.trim() ? <>
          <p className="trip-finder-count" role="status" aria-live="polite">{search.totalMatches === 0 ? 'No matches.' : `${search.totalMatches} match${search.totalMatches === 1 ? '' : 'es'}${search.totalMatches > search.results.length ? ` · showing ${search.results.length}; narrow your search to see fewer results` : ''}`}</p>
          {search.results.length ? <ul className="trip-finder-results">{search.results.map((result) => <li key={result.id}><button type="button" className="trip-finder-result" onClick={() => navigate(result.target)}><span className="trip-finder-result-copy"><span className="trip-finder-kind">{kindLabel[result.kind]}</span><strong>{result.title}</strong><small>{result.subtitle}</small></span><ArrowRight size={17} aria-hidden="true" /></button></li>)}</ul> : <div className="trip-finder-no-results"><strong>No matches yet</strong><span>Try a place, dish, date, hotel, train or shorter search term.</span>{relevantDay && shortcut({ kind: 'day', dayId: relevantDay.day.id }, relevantDay.label, 'relevant-day-no-results')}<div className="trip-finder-shortcuts">{tripSearchSectionShortcuts.slice(1, 6).map((item) => shortcut(item.target, item.title, `no-results-${item.id}`))}</div></div>}
        </> : <div className="trip-finder-start">
          <p className="trip-finder-prompt">Search the planned itinerary, selected Tokyo ideas, hotel stays and current to-dos.</p>
          {relevantDay && shortcut({ kind: 'day', dayId: relevantDay.day.id }, relevantDay.label, 'relevant-day')}
          <h3>Jump to a section</h3>
          <div className="trip-finder-shortcuts">{tripSearchSectionShortcuts.map((item) => shortcut(item.target, item.title, item.id))}</div>
        </div>}
      </div>
      <footer className="trip-finder-footer"><span>Search is kept in this page only.</span><button type="button" onClick={close}>Close</button></footer>
    </div>
  </dialog>, document.body);
}
