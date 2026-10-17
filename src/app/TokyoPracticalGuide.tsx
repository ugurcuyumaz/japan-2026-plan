import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, MapPin, Search, Bookmark, BookmarkCheck } from 'lucide-react';
import { getTokyoResource, resourceMeals, tokyoResources, type TokyoMealTag, type TokyoResourceKind } from '../data/tokyoPractical';
import { normalizeSearchText, scrollToTarget } from '../data/navigation';
import './tokyo-practical.css';

const tripDates = [
  ['2026-10-31', 'Sat 31 Oct'],
  ['2026-11-01', 'Sun 1 Nov'], ['2026-11-03', 'Tue 3 Nov'], ['2026-11-04', 'Wed 4 Nov'],
  ['2026-11-05', 'Thu 5 Nov'], ['2026-11-06', 'Fri 6 Nov'], ['2026-11-07', 'Sat 7 Nov'],
  ['2026-11-08', 'Sun 8 Nov'], ['2026-11-09', 'Mon 9 Nov'], ['2026-11-10', 'Tue 10 Nov'],
] as const;
const hotelChoices = [
  ['stay-tokyo-halloween', 'Sakura Hotel Ikebukuro'], ['stay-tokyo-long', 'Comfort Hotel Kiyosumi-Shirakawa'],
] as const;
const hotelAddresses: Record<(typeof hotelChoices)[number][0], string> = {
  'stay-tokyo-halloween': '2-40-7 Ikebukuro, Toshima City, Tokyo',
  'stay-tokyo-long': '1-6-12 Shirakawa, Koto City, Tokyo',
};
const shortDate = (id: string) => tripDates.find(([date]) => date === id)?.[1] ?? id;

export function TokyoPracticalGuide({ savedResourceIds, onToggleSave, requestedResourceId, requestId, onOpenTokyoIdea }: {
  savedResourceIds: string[];
  onToggleSave: (id: string) => void;
  requestedResourceId?: string;
  requestId?: number;
  onOpenTokyoIdea?: (id: string) => void;
}) {
  const boardRef = useRef<HTMLDetailsElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [kind, setKind] = useState<TokyoResourceKind>('workshop');
  const [query, setQuery] = useState('');
  const [hotel, setHotel] = useState('all');
  const [date, setDate] = useState('all');
  const [meal, setMeal] = useState<'all' | TokyoMealTag>('all');
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    if (!requestedResourceId) return;
    const resource = getTokyoResource(requestedResourceId);
    if (!resource) return;
    setKind(resource.kind);
    setQuery(''); setHotel('all'); setDate('all'); setMeal('all'); setSavedOnly(false);
    if (boardRef.current) boardRef.current.open = true;
    const frame = window.requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      const card = boardRef.current?.querySelector<HTMLElement>('[data-resource-id]') &&
        Array.from(boardRef.current.querySelectorAll<HTMLElement>('[data-resource-id]')).find((item) => item.dataset.resourceId === requestedResourceId);
      if (card) { scrollToTarget(card, 'center'); card.querySelector<HTMLElement>('.tokyo-resource-title')?.focus({ preventScroll: true }); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [requestedResourceId, requestId]);

  const shown = tokyoResources.filter((resource) => resource.kind === kind &&
    (!savedOnly || savedResourceIds.includes(resource.id)) &&
    (kind !== 'food' || hotel === 'all' || resource.hotelId === hotel) &&
    (date === 'all' || resource.candidateDayIds.includes(date)) &&
    (kind !== 'food' || meal === 'all' || (date === 'all'
      ? [...resourceMeals(resource), ...Object.values(resource.mealByDate ?? {}).flat()].includes(meal)
      : resourceMeals(resource, date).includes(meal))) &&
    normalizeSearchText([resource.title, resource.area, resource.description, resource.priceLabel, resource.scheduleNote, ...resource.notes].join(' ')).includes(normalizeSearchText(query.trim())));
  const dateOptions = [...new Set(tokyoResources.filter((resource) => resource.kind === kind).flatMap((resource) => resource.candidateDayIds))].sort();
  const clearFilters = () => { setQuery(''); setHotel('all'); setDate('all'); setMeal('all'); setSavedOnly(false); };
  const activeFilters = Boolean(query || (kind === 'food' && (hotel !== 'all' || meal !== 'all')) || date !== 'all' || savedOnly);
  const toggleSave = (resourceId: string, isSaved: boolean) => {
    onToggleSave(resourceId);
    if (!isSaved || !savedOnly) return;
    window.requestAnimationFrame(() => {
      const cards = Array.from(boardRef.current?.querySelectorAll<HTMLElement>('[data-resource-id]') ?? []);
      const candidate = cards.find((card) => card.dataset.resourceId !== resourceId);
      if (candidate) candidate.querySelector<HTMLElement>('.tokyo-resource-save')?.focus({ preventScroll: true });
      else boardRef.current?.querySelector<HTMLElement>('.tokyo-practical-count')?.focus({ preventScroll: true });
    });
  };
  return <section className="section tokyo-practical" id="tokyo-practical" aria-labelledby="tokyo-practical-title">
    <div className="section-heading"><div><span className="eyebrow">Plan a small Tokyo anchor</span><h2 id="tokyo-practical-title" ref={headingRef} tabIndex={-1}>English workshops &amp; local food</h2></div></div>
    <p className="tokyo-practical-intro">Browse workshops across Tokyo and meal ideas near your two booked hotels. Published date fit is shown where known; no seats or tables have been checked. Saving an idea does not add it to a day or make a reservation.</p>
    <details className="tokyo-practical-board" ref={boardRef}>
      <summary><span><strong>Browse practical ideas</strong><small>{tokyoResources.filter((r) => r.kind === 'workshop').length} workshops · {tokyoResources.filter((r) => r.kind === 'food').length} food options · saved ideas stay in your shortlist</small></span><span className="tokyo-practical-toggle"><span className="tokyo-practical-closed">Show ideas</span><span className="tokyo-practical-open">Hide ideas</span><ChevronDown size={17} aria-hidden="true" /></span></summary>
      <div className="tokyo-practical-controls">
        <div className="tokyo-practical-tabs" role="group" aria-label="Tokyo practical idea type">
          {([['workshop', 'Workshops'], ['food', 'Near-hotel food']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={kind === value} className={kind === value ? 'is-active' : ''} onClick={() => { setKind(value); setDate('all'); setHotel('all'); setMeal('all'); }}>{label}</button>)}
        </div>
        <label className="tokyo-practical-search"><Search size={17} /><span className="sr-only">Search workshops and food</span><input type="search" placeholder="Search names, areas, details…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        {kind === 'food' && <label><span>Hotel</span><select aria-label="Filter by Tokyo hotel" value={hotel} onChange={(event) => setHotel(event.target.value)}><option value="all">Both hotels</option>{hotelChoices.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>}
        <label><span>Candidate date</span><select aria-label="Filter by candidate date" value={date} onChange={(event) => setDate(event.target.value)}><option value="all">Any candidate date</option>{dateOptions.map((id) => <option key={id} value={id}>{shortDate(id)}</option>)}</select></label>
        {kind === 'food' && <label><span>Meal</span><select aria-label="Filter food by meal time" value={meal} onChange={(event) => setMeal(event.target.value as 'all' | TokyoMealTag)}><option value="all">All meals</option>{(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((tag) => <option key={tag} value={tag}>{tag[0].toUpperCase() + tag.slice(1)}</option>)}</select></label>}
        <label className="tokyo-practical-saved"><input type="checkbox" checked={savedOnly} onChange={(event) => setSavedOnly(event.target.checked)} /><span>Saved only</span></label>
        {activeFilters && <button className="tokyo-practical-clear" type="button" onClick={clearFilters}>Clear filters</button>}
        <p className="tokyo-practical-count" role="status" aria-live="polite" tabIndex={-1}>{shown.length} {kind === 'workshop' ? 'workshop' : 'food option'}{shown.length === 1 ? '' : 's'} shown</p>
      </div>
      {kind === 'food' && (date === '2026-11-09' || (shown.length === 0 && meal === 'dinner' && !savedOnly && !query && hotel !== 'stay-tokyo-halloween')) && <aside className="tokyo-practical-fallback"><h3>A Monday dinner option already in your Tokyo pool</h3><p><strong>Kimuraya Honten, Monzen-Nakacho</strong> · 1-7-5 Tomioka. The branch lists Monday service 12:00–23:00 (food last order 22:00). 9 November is a dinner candidate; confirm current hours and seating. English menu and spoken English are not verified. An à-la-carte seat charge applies.</p><div className="tokyo-resource-actions">{onOpenTokyoIdea && <button className="secondary-button" type="button" onClick={() => onOpenTokyoIdea('izakaya-evening')}>Open existing izakaya evening</button>}<a href="https://kimurayahonten-monzennakacho.com/" target="_blank" rel="noopener noreferrer">Official branch details <ExternalLink size={14} /></a><a href="https://www.google.com/maps/dir/?api=1&origin=Comfort+Hotel+Tokyo+Kiyosumi+Shirakawa&destination=Kimuraya+Honten+Monzen+Nakacho+1-7-5+Tomioka&travelmode=walking" target="_blank" rel="noopener noreferrer">Directions from Comfort Hotel <ExternalLink size={14} /></a></div><small>This reuses an existing idea; no table has been checked or booked.</small></aside>}
      <div className="tokyo-practical-list">{shown.map((resource) => {
        const isSaved = savedResourceIds.includes(resource.id);
        const hotelName = hotelChoices.find(([id]) => id === resource.hotelId)?.[1];
        const mealsForDisplay = resourceMeals(resource, date === 'all' ? undefined : date);
        const mapUrl = resource.hotelId
          ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(hotelAddresses[resource.hotelId])}&destination=${encodeURIComponent(resource.mapsQuery)}&travelmode=walking`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.mapsQuery)}`;
        return <article className="tokyo-resource-card" key={resource.id} data-resource-id={resource.id}>
          <div className="tokyo-resource-head"><div><span className="tokyo-resource-area"><MapPin size={14} />{resource.area}</span><h3 className="tokyo-resource-title" tabIndex={-1}>{resource.title}</h3></div><button className="tokyo-resource-save" type="button" aria-pressed={isSaved} aria-label={`${isSaved ? 'Remove' : 'Save'} ${resource.title}${isSaved ? ' from' : ' to'} shortlist`} onClick={() => toggleSave(resource.id, isSaved)}>{isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}<span>{isSaved ? 'Saved' : 'Save'}</span></button></div>
          <p>{resource.description}</p>
          {mealsForDisplay.length > 0 && <div className="tokyo-resource-meals" aria-label="Meal times shown for selected date">{mealsForDisplay.map((tag) => <span key={tag}>{tag}</span>)}</div>}
          <dl className="tokyo-resource-facts">{resource.kind === 'food' && hotelName && <div><dt>Near</dt><dd>{hotelName}</dd></div>}{resource.address && <div className="tokyo-resource-address"><dt>Address</dt><dd>{resource.address}</dd></div>}{resource.durationLabel && <div><dt>Duration</dt><dd>{resource.durationLabel}</dd></div>}<div><dt>Price</dt><dd>{resource.priceLabel}</dd></div><div><dt>{resource.kind === 'workshop' ? 'Instruction language' : 'Language'}</dt><dd>{resource.languageLabel}</dd></div></dl>
          {resource.languageEvidenceUrl && <a className="tokyo-resource-language" href={resource.languageEvidenceUrl} target="_blank" rel="noopener noreferrer">English teaching evidence <ExternalLink size={13} /></a>}
          <div className="tokyo-resource-schedule"><p><strong>Schedule &amp; date fit:</strong> {resource.scheduleNote}</p>{resource.candidateDayIds.length > 0 && <p><strong>Candidate dates:</strong> {resource.candidateDayIds.map(shortDate).join(', ')}</p>}<span>No slots checked</span></div>
          <details className="tokyo-resource-details"><summary>Preparation &amp; other notes</summary><ul>{resource.notes.map((note) => <li key={note}>{note}</li>)}</ul></details>
          <div className="tokyo-resource-actions"><a href={mapUrl} target="_blank" rel="noopener noreferrer">{resource.hotelId ? 'Directions from hotel' : 'Open map'} <ExternalLink size={14} /></a>{resource.bookingUrl && <a href={resource.bookingUrl} target="_blank" rel="noopener noreferrer">{resource.kind === 'workshop' ? 'Operator / booking' : 'Venue details'} <ExternalLink size={14} /></a>}</div>
          <div className="tokyo-resource-sources"><span>Sources · checked 16 Oct 2026</span>{resource.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} <ExternalLink size={12} /></a>)}</div>
        </article>;
      })}{shown.length === 0 && <p className="tokyo-practical-empty">No {kind === 'workshop' ? 'workshops' : 'food options'} match these filters. <button type="button" onClick={clearFilters}>Clear filters</button></p>}</div>
    </details>
  </section>;
}
