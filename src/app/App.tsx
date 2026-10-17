import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapView } from './MapView';
import { PlaceCard } from './PlaceCard';
import { TravelPackButton } from './TravelPackButton';
import { tokyoDateWarnings, buildPlannedDays } from '../data/planner';
import { DayEssentials } from './DayEssentials';
import { CityGuide } from './CityGuide';
import { TripFinder } from './TripFinder';
import { baseVisitArrival } from '../data/dayBrief';
import { emptyTokyoChoices, flexibleDayIdSet, tokyoTimingWarning, type TokyoChoices } from '../data/tokyoChoices';
import { isAlternative, matchesMapLayer, shortDate } from '../data/map';
import {
  ArrowLeft, ArrowRight, BedDouble, CalendarDays, Check, ChevronDown, CircleAlert,
  Coffee, ExternalLink, Map as MapIcon, Menu,
  Printer, Route, TrainFront, X, Search, Compass, ListChecks, Copy,
} from 'lucide-react';
import { baseCities, baseVisits, budgetCategories, budgetTotals, confirmedHotelTotalEUR, googleMapsUrl, stays, totalNights, tripDays } from '../data/trip';
import { dayHistoryDecision, dayTimeLabel, japanDate, normalizeSearchText, relevantTripDay, scrollToTarget } from '../data/navigation';
import { TokyoActivityPool } from './TokyoActivityPool';
import { BookingBoard } from './BookingBoard';
import { TravelDesk } from './TravelDesk';
import { SavedIdeas } from './SavedIdeas';
import { PlannerBackup } from './PlannerBackup';
import { isOpenBooking, withBookingProgress, parseBookingProgress, type BookingProgress } from '../data/bookingProgress';
import { placeKey, resourceKey, isKnownShortlistKey, type ShortlistKey } from '../data/shortlist';
import { type PlannerPersonalState } from '../data/plannerBackup';
import { openPreparationTasks } from '../data/travelDesk';
import './personal-planner.css';
import { usePersonalPlanner } from './usePersonalPlanner';
import { PersistenceNotice } from './PersistenceNotice';
import { PersonalPlanSharing } from './PersonalPlanSharing';
import { MobileNavigation } from './MobileNavigation';
import { TokyoPracticalGuide } from './TokyoPracticalGuide';
import { hasPersonalPlanLink, personalPlanShareUrl } from '../data/personalSharing';
import { individualRailTotalJPY, railDecision } from '../data/rail';
import { buildPlannerBookings } from '../data/bookingActions';
import type { TripSearchTarget } from '../data/tripSearch';
import { applyTokyoMutation, cloneTokyoChoices, isTokyoAssignmentAllowed } from '../data/tokyoMutations';
import './planner-usability.css';
import './mobile-ux.css';
import type { Booking, ItemType, Place, TripDay } from '../types/trip';

const formatJPY = (amount: number) => `¥${amount.toLocaleString('en-US')}`;
const railPassWindowLabel = `${new Date(`${railDecision.validFrom}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}–${new Date(`${railDecision.validThrough}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}`;
const yenPerEuro = 177.39; // ECB reference rate published 14 Oct 2026; budget conversions are indicative only.
const formatApproxEUR = (yen: number) => `€${Math.round(yen / yenPerEuro).toLocaleString('en-GB')}`;
const confirmedSpendJPY = Math.round(confirmedHotelTotalEUR * yenPerEuro) + 30_220;
const confirmedSpendEUR = confirmedHotelTotalEUR + 30_220 / yenPerEuro;
const ownedDayEntry = (state: unknown) => Boolean(state && typeof state === 'object' && (state as Record<string, unknown>).__japanPlannerDayEntry === true);
const withoutOwnedDayEntry = (state: unknown) => {
  if (!state || typeof state !== 'object') return {};
  const next = { ...(state as Record<string, unknown>) };
  delete next.__japanPlannerDayEntry;
  return next;
};

function Header({ onMenu, menuOpen, onFind }: { onMenu: () => void; menuOpen: boolean; onFind: () => void }) {
  return <header className="site-header"><a className="brand" href="/japan-2026-plan/" aria-label="Japan, slowly home"><span className="brand-mark">日</span><span>Japan,<br /><em>slowly</em></span></a><nav className="main-nav" aria-label="Main navigation"><a href="#travel-desk">Travel desk</a><a href="#daily-plan">Daily plan</a><a href="#tokyo-pool">Tokyo ideas</a><a href="#bookings">Reservations</a><a href="#stays">Stays</a><a href="#budget">Budget</a></nav><button type="button" className="header-find" onClick={onFind} aria-keyshortcuts="Control+K Meta+K"><Search size={17} /><span>Find</span><kbd>Ctrl K</kbd></button><button className="menu-button" onClick={onMenu} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-menu"><Menu size={22} /></button></header>;
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div className={`stat${accent ? ' accent' : ''}`}><strong>{value}</strong><span>{label}</span></div>; }

function DayCard({ day, selected, onSelect }: { day: TripDay; selected: boolean; onSelect: () => void }) {
  const planned = day.places.filter((place) => !isAlternative(place) && place.type !== 'stay' && place.type !== 'note');
  const alternatives = day.places.filter(isAlternative).length;
  return <button type="button" className={`day-card${selected ? ' selected' : ''}`} aria-pressed={selected} aria-label={`Open ${day.weekday} ${day.date}, ${day.title}, on the map and itinerary`} onClick={onSelect}><span className="day-date"><span>{day.weekday}</span><strong>{new Date(`${day.date}T12:00:00`).getDate()}</strong><small>{new Date(`${day.date}T12:00:00`).toLocaleString('en-US', { month: 'short' })}</small></span><span className="day-card-body"><span className="card-topline"><span className="eyebrow">{day.base}</span>{day.keyDay && <span className="key-badge">Anchor day</span>}</span><strong className="day-card-title">{day.title}</strong><span className="day-card-summary">{day.summary}</span><span className="day-card-tags"><span className={`pace-${day.pacing}`}>{day.pacing} pace</span><span>{planned.length ? `${planned.length} planned stops` : 'Open day'}</span>{alternatives > 0 && <span>{alternatives} alternatives</span>}</span><span className="text-button">{selected ? 'Day plan open' : 'Open day plan'} <ArrowRight size={15} /></span></span></button>;
}

function SectionHeading({ eyebrow, title, titleId, children }: { eyebrow: string; title: string; titleId?: string; children?: React.ReactNode }) { return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2 id={titleId} tabIndex={titleId ? -1 : undefined}>{title}</h2></div>{children}</div>; }

function DayTimeline({ day, selectedPlaceId, onSelectPlace, compact }: { day: TripDay; selectedPlaceId?: string; onSelectPlace: (place: Place) => void; compact: boolean }) {
  const plannedPlaces = day.places.filter((place) => !isAlternative(place) && (place.type !== 'stay' || place.startTime));
  const minutes = (time?: string) => time ? Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]) : -1;
  const groups: { label: string; items: Place[] }[] = [{ label: 'Morning', items: plannedPlaces.filter((place) => minutes(place.startTime) >= 300 && minutes(place.startTime) < 720) }, { label: 'Midday', items: plannedPlaces.filter((place) => minutes(place.startTime) >= 720 && minutes(place.startTime) < 900) }, { label: 'Afternoon', items: plannedPlaces.filter((place) => minutes(place.startTime) >= 900 && minutes(place.startTime) < 1140) }, { label: 'Evening', items: plannedPlaces.filter((place) => minutes(place.startTime) >= 1140 && minutes(place.startTime) < 1380) }, { label: 'Late night', items: plannedPlaces.filter((place) => minutes(place.startTime) >= 1380 || (minutes(place.startTime) >= 0 && minutes(place.startTime) < 300)) }, { label: 'Flexible', items: plannedPlaces.filter((place) => !place.startTime) }].filter((group) => group.items.length);
  return <div className="day-timeline">{groups.map((group) => <section key={group.label} className="timeline-group"><h3>{group.label}</h3><ol>{group.items.map((place, index) => <li key={place.id} className="timeline-row" data-place-id={place.id}><div className="timeline-time">{place.startTime || '—'}<span>{index < group.items.length - 1 ? '↓' : ''}</span></div><div className="timeline-line"><span className={`timeline-dot dot-${place.type}`} /></div><PlaceCard place={place} selected={selectedPlaceId === place.id} onSelect={() => onSelectPlace(place)} compact={compact} showTime={false} /></li>)}</ol></section>)}</div>;
}

function DayDetail({ day, selectedPlaceId, onSelectPlace, onClose, onChangeDay, first, last, mobile, mapFilter, onMapFilterChange, onOpenIdeas, onOpenBooking, planningWarning, tokyoChoices, plannerBookings, bookingProgress, savedKeys, onToggleSave }: { day: TripDay; selectedPlaceId?: string; onSelectPlace: (place: Place) => void; onClose: () => void; onChangeDay: (offset: number) => void; first: boolean; last: boolean; mobile: boolean; mapFilter: ItemType | 'all'; onMapFilterChange: (filter: ItemType | 'all') => void; onOpenIdeas: () => void; onOpenBooking: (id: string) => void; planningWarning?: string; tokyoChoices: ReturnType<typeof emptyTokyoChoices>; plannerBookings: Booking[]; bookingProgress: BookingProgress; savedKeys: ShortlistKey[]; onToggleSave: (key: ShortlistKey) => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(() => { try { return window.localStorage.getItem('japan-2026-day-view') !== 'full'; } catch { return true; } });
  const changeDetail = (value: boolean) => { setCompact(value); try { window.localStorage.setItem('japan-2026-day-view', value ? 'quick' : 'full'); } catch { /* The view still works for this session. */ } };
  const [mapExpanded, setMapExpanded] = useState(Boolean(selectedPlaceId));
  useEffect(() => { setMapExpanded(Boolean(selectedPlaceId)); }, [day.id]);
  useEffect(() => {
    if (!selectedPlaceId) return;
    setMapExpanded(true);
    const frame = window.requestAnimationFrame(() => {
      const row = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('[data-place-id]') ?? []).find((element) => element.dataset.placeId === selectedPlaceId);
      if (!row) return;
      row.closest<HTMLDetailsElement>('details')?.setAttribute('open', '');
      scrollToTarget(row, 'center');
      row.querySelector<HTMLElement>('.place-main, h3[tabindex], a[href]')?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedPlaceId, day.id]);
  const explorePlace = (place: Place) => {
    setMapExpanded(true);
    onSelectPlace(place);
    window.requestAnimationFrame(() => scrollToTarget(dialogRef.current?.querySelector<HTMLElement>('.day-map-toggle')));
  };
  useEffect(() => {
    if (!mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const background = Array.from(document.querySelectorAll<HTMLElement>('.app-shell > header, .app-shell > main, .app-shell > footer, .app-shell > .mobile-menu, .app-shell > .mobile-bottom-nav, .app-shell > .skip-link'));
    const inertBefore = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    dialogRef.current?.focus();
    const getFocusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? []).filter((element) => element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = getFocusable();
      if (!focusable.length) { event.preventDefault(); dialogRef.current.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); background.forEach((element, index) => { element.inert = inertBefore[index]; }); previous?.focus(); };
  }, [mobile, onClose]);
  useEffect(() => {
    if (!dialogRef.current) return;
    dialogRef.current.scrollTop = 0;
    dialogRef.current.querySelector<HTMLElement>('#day-detail-title')?.focus({ preventScroll: true });
  }, [day.id, mobile]);
  const alternatives = day.places.filter(isAlternative);
  const [alternativeFilter, setAlternativeFilter] = useState<'all' | 'food' | 'things'>('all');
  useEffect(() => setAlternativeFilter('all'), [day.id, selectedPlaceId]);
  const shownAlternatives = alternatives.filter((place) => alternativeFilter === 'all' || (alternativeFilter === 'food' ? place.type === 'food' : place.type !== 'food'));
  const [copyNotice, setCopyNotice] = useState('');
  const [dayShareLink, setDayShareLink] = useState('');
  const copyDayLink = async () => {
    const link = personalPlanShareUrl(window.location.href, { choices: tokyoChoices, bookingProgress, savedKeys }, day.id);
    if (!link) { setCopyNotice('This plan is too large for a sharing link. Use the editable backup to transfer your decisions.'); return; }
    setDayShareLink(link);
    try { await navigator.clipboard.writeText(link); setCopyNotice('Day and plan snapshot copied. The recipient reviews your picks, saves and progress before using them; later edits need a new link.'); }
    catch { setCopyNotice('Select and copy the snapshot link below.'); }
  };
  useEffect(() => { setDayShareLink(''); setCopyNotice(''); }, [day.id, tokyoChoices, bookingProgress, savedKeys]);
  useEffect(() => setCopyNotice(''), [day.id]);
  const visibleMapCount = day.places.filter((place) => place.coordinates && matchesMapLayer(place, mapFilter)).length;
  const jumpToPlace = (place: Place) => {
    onSelectPlace(place);
    window.requestAnimationFrame(() => {
      const row = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('[data-place-id]') ?? []).find((element) => element.dataset.placeId === place.id) ?? (place.type === 'stay' ? dialogRef.current?.querySelector<HTMLElement>('.day-essentials') : undefined);
      row?.closest<HTMLDetailsElement>('details')?.setAttribute('open', '');
      scrollToTarget(row, 'center');
      row?.querySelector<HTMLElement>('.place-main, h3[tabindex], a[href]')?.focus({ preventScroll: true });
    });
  };
  return <aside className={`day-detail${mobile ? ' mobile-dialog' : ''}`} role={mobile ? 'dialog' : 'complementary'} aria-modal={mobile || undefined} aria-labelledby="day-detail-title" tabIndex={-1} ref={dialogRef}>{mobile && <div className="day-mobile-bar"><span>Day plan · {shortDate(day.id)}</span><button className="icon-button close-detail" onClick={onClose} aria-label="Close day focus"><X size={20} /></button></div>}<div className="detail-top"><div><span className="eyebrow">Day focus · {day.weekday} {new Date(`${day.date}T12:00:00`).toLocaleString('en-US', { month: 'short', day: 'numeric' })}</span><h2 id="day-detail-title" tabIndex={-1}>{day.title}</h2><p>{day.base} · <span className={`pace pace-${day.pacing}`}>{day.pacing} pace</span>{day.dailyEstimateJPY ? ' · daily estimate basis not recorded' : ''}</p><small className="day-time-label">{dayTimeLabel(day)}. Times are shown as researched for each place.</small></div><button className="icon-button close-detail" onClick={onClose} aria-label="Close day focus"><X size={21} /></button></div><div className="detail-actions"><button className="secondary-button" onClick={() => onChangeDay(-1)} disabled={first}><ArrowLeft size={16} /> Previous</button><button className="secondary-button" onClick={() => onChangeDay(1)} disabled={last}>Next <ArrowRight size={16} /></button><button className="secondary-button print-day-button" onClick={() => window.print()} aria-label="Print this day"><Printer size={15} /></button><button className="secondary-button" onClick={copyDayLink} aria-label="Copy this day with your plan"><Copy size={15} /></button><TravelPackButton choices={tokyoChoices} dayId={day.id} bookingProgress={bookingProgress} savedKeys={savedKeys} iconOnly /></div>{copyNotice && <p className="copy-notice" role="status">{copyNotice}</p>}{dayShareLink && <label className="day-share-link"><span>Day and plan snapshot link</span><textarea readOnly value={dayShareLink} onFocus={(event) => event.target.select()} /></label>}<p className="day-detail-summary">{day.summary}</p>{alternatives.length > 0 && <p className="day-alternative-note"><Coffee size={15} />{alternatives.length} option{alternatives.length === 1 ? '' : 's'} below are swaps for the day plan, not extra commitments. {alternatives.filter((place) => place.sourceUrl).length} source links. Check the alternative’s notes before changing the day.</p>}<DayEssentials day={day} onOpenBooking={onOpenBooking} plannerBookings={plannerBookings} />{planningWarning && <p className="planning-warning"><CircleAlert size={16} />{planningWarning}</p>}{flexibleDayIdSet.has(day.id) && day.places.some((place) => place.type !== 'stay') && day.id === '2026-11-01' && <p className="planning-warning"><CircleAlert size={16} />This idea was researched from Comfort Hotel. Directions now use your Ikebukuro hotel; recheck travel times and evening access before going.</p>}{flexibleDayIdSet.has(day.id) && <button type="button" className="day-pool-link" onClick={onOpenIdeas}><Compass size={17} />{day.places.length > 1 ? "Change your Tokyo idea" : "Choose a Tokyo idea"}<ArrowRight size={15} /></button>}<details className="day-notes"><summary><CircleAlert size={15} /> Timing & travel notes <ChevronDown size={15} /></summary><p className="season-note">{day.seasonNote}</p></details><div className="day-map-section"><button type="button" className="day-map-toggle" aria-expanded={mapExpanded} aria-controls="day-map-content" onClick={() => setMapExpanded((open) => !open)}><MapIcon size={17} /><span>{mapExpanded ? 'Hide day map' : 'Explore the day on a map'}<small>Places, details & directions</small></span><ChevronDown size={17} /></button><div id="day-map-content" hidden={!mapExpanded}>{mapExpanded && <><div className="detail-map-heading"><strong><MapIcon size={15} /> Explore the day</strong><label><span className="sr-only">Filter day map</span><select aria-label={`Filter ${day.base} day map layers`} value={mapFilter} onChange={(event) => onMapFilterChange(event.target.value as ItemType | 'all')}><option value="all">All stops</option><option value="sight">Sights</option><option value="food">Food</option><option value="optional">Alternatives</option><option value="transit">Transport</option><option value="stay">Stays</option><option value="booking">Book / check</option></select></label></div><div className="detail-map-shell"><MapView selectedDay={day} selectedPlaceId={selectedPlaceId} onSelectPlace={onSelectPlace} onJumpToPlace={jumpToPlace} filter={mapFilter} /></div>{visibleMapCount === 0 && <p className="inline-empty" role="status">No mapped stops in this layer. Choose another layer or use the itinerary below.</p>}</>}</div></div><div className="day-view-toggle" role="group" aria-label="Day plan detail"><span>Read the plan</span><button type="button" aria-pressed={compact} onClick={() => changeDetail(true)}>Quick view</button><button type="button" aria-pressed={!compact} onClick={() => changeDetail(false)}>Full notes</button></div><DayTimeline day={day} selectedPlaceId={selectedPlaceId} onSelectPlace={explorePlace} compact={compact} />{alternatives.length > 0 && <details className="day-alternatives"><summary><Coffee size={16} /><span>Food backups & optional stops<small>{alternatives.length} {alternatives.length === 1 ? 'option' : 'options'} · choose if useful, not extra commitments</small></span><ChevronDown size={16} /></summary><div className="day-alternative-filters" role="group" aria-label="Filter day alternatives">{([['all', `All ${alternatives.length}`], ['food', `Food ${alternatives.filter((place) => place.type === 'food').length}`], ['things', `Things to do ${alternatives.filter((place) => place.type !== 'food').length}`]] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={alternativeFilter === value} className={alternativeFilter === value ? 'is-active' : ''} onClick={() => setAlternativeFilter(value)}>{label}</button>)}</div>{shownAlternatives.length > 0 ? <ul>{shownAlternatives.map((place) => <li key={place.id} data-place-id={place.id}><PlaceCard place={place} selected={selectedPlaceId === place.id} onSelect={() => explorePlace(place)} compact={compact} /><button type="button" className="alternative-save secondary-button" aria-pressed={savedKeys.includes(placeKey(day.id, place.id))} aria-label={`${savedKeys.includes(placeKey(day.id, place.id)) ? 'Unsave' : 'Save'} alternative: ${place.name}`} onClick={() => onToggleSave(placeKey(day.id, place.id))}>{savedKeys.includes(placeKey(day.id, place.id)) ? 'Saved alternative' : 'Save alternative'}</button></li>)}</ul> : <p className="inline-empty" role="status">No {alternativeFilter === 'food' ? 'food' : 'things to do'} alternatives for this day.</p>}</details>}{(day.tiredPlan || day.rainPlan) && <div className="contingency"><h3><Coffee size={16} /> Keep a plan B</h3>{day.tiredPlan && <p><strong>If tired:</strong> {day.tiredPlan}</p>}{day.rainPlan && <p><strong>If raining:</strong> {day.rainPlan}</p>}</div>}</aside>;
}

function RailPassDecision() {
  return <section className="section rail-decision" aria-labelledby="rail-decision-title">
    <SectionHeading eyebrow={`Rail cost check · ${railPassWindowLabel}`} title="Compare the pass before you buy" titleId="rail-decision-title" />
    <div className="rail-decision-card">
      <div className="rail-decision-summary"><span className="rail-pass-price">¥40,000 <small>≈ {formatApproxEUR(40_000)} / person · 6 consecutive days</small></span><p>Could cover the long JR sequence from Sapporo through Noboribetsu, Hakodate and Sendai to Tokyo, plus the JR Matsushima day trip.</p><div className="rail-saving"><CircleAlert size={17} /> Purchase status and value: verify</div><small>Published fares are route-table references, not a dated checkout comparison. The exact Hakodate Liner and stopover ticket construction remains unresolved.</small></div>
      <div className="rail-fare-list"><h3>Published separate-ticket references · not a quote</h3>{railDecision.segments.map((segment) => <div key={segment.route}><span>{segment.date} · {segment.route}</span><strong>¥{segment.fareJPY.toLocaleString()} <small>≈ {formatApproxEUR(segment.fareJPY)}</small></strong></div>)}<div><span>Sendai ↔ Matsushima-Kaigan JR round trip · estimate</span><strong>~¥{railDecision.additionalCoveredRide.estimatedFareRangeJPY[0].toLocaleString()}–¥{railDecision.additionalCoveredRide.estimatedFareRangeJPY[1].toLocaleString()} <small>≈ {formatApproxEUR(railDecision.additionalCoveredRide.estimatedFareRangeJPY[0])}–{formatApproxEUR(railDecision.additionalCoveredRide.estimatedFareRangeJPY[1])}</small></strong></div><div className="rail-total"><span>Individual fare references + estimated Matsushima</span><strong>~¥{(individualRailTotalJPY + railDecision.additionalCoveredRide.estimatedFareRangeJPY[0]).toLocaleString()}–¥{(individualRailTotalJPY + railDecision.additionalCoveredRide.estimatedFareRangeJPY[1]).toLocaleString()} <small>≈ {formatApproxEUR(individualRailTotalJPY + railDecision.additionalCoveredRide.estimatedFareRangeJPY[0])}–{formatApproxEUR(individualRailTotalJPY + railDecision.additionalCoveredRide.estimatedFareRangeJPY[1])}</small></strong></div><p>JR Hokkaido’s own through-route example is ¥45,620 (≈ {formatApproxEUR(45_620)}); the exact ticket baseline and relative pass value need checking at purchase.</p></div>
      <div className="rail-decision-foot"><p><strong>Check first:</strong> whether you already bought the pass. Eligibility requires a non-Japanese passport and short-term-visitor entry status. Seat reservations are separate; buses, trams, subways and taxis are not covered. Figures are current published standard-fare estimates, not a checkout quote.</p><div><a className="primary-button" href={railDecision.passPurchaseUrl} target="_blank" rel="noopener noreferrer">Pass details <ExternalLink size={14} /></a><a className="secondary-button" href={railDecision.reservationUrl} target="_blank" rel="noopener noreferrer">Buy / reserve trains <ExternalLink size={14} /></a><a href={railDecision.regularTicketsUrl} target="_blank" rel="noopener noreferrer">Fare source <ExternalLink size={12} /></a></div></div>
    </div>
  </section>;
}

function AccommodationTimeline() { return <section className="section compact-section" id="stays"><SectionHeading eyebrow="Where we sleep" title="Seven stays, five bases"><span className="section-count"><Check size={16} /> {stays.filter((stay) => stay.status === 'booked').length} confirmed · €{confirmedHotelTotalEUR}</span></SectionHeading><details className="stays-disclosure"><summary><BedDouble size={18} /><span>View all seven confirmed stays</span><ChevronDown size={17} /></summary><div className="stay-grid">{stays.map((stay) => <article id={stay.id} tabIndex={-1} className={`stay-card${stay.conflict ? ' stay-conflict' : ''}`} key={stay.id}><div className="stay-marker"><BedDouble size={17} /></div><div><div className="stay-card-top"><span>{stay.dates}</span><span className={`status status-${stay.status}`}>{stay.conflict ? 'date conflict' : stay.status === 'booked' ? 'Confirmed' : stay.status}</span></div><h3>{stay.city}</h3><p>{stay.property}{stay.privateBath ? ' · Private bath' : ''}</p><small>{stay.note}{stay.costEUR ? ` · €${stay.costEUR}` : ''}</small><a className="stay-map-link" href={googleMapsUrl(stay.property)} target="_blank" rel="noopener noreferrer">Open property in Google Maps <ExternalLink size={12} /></a></div></article>)}</div></details></section>; }

function BudgetPanel() {
  const max = Math.max(...budgetCategories.map((category) => category.centre));
  return <section id="budget" className="section budget-section"><SectionHeading eyebrow="Know your envelope" title="A clear view of the costs" /><div className="budget-layout"><div className="budget-hero"><span className="eyebrow">Japan planning range · two adults</span><strong>{formatJPY(budgetTotals.low)} <em>–</em><br />{formatJPY(budgetTotals.high)}</strong><p className="budget-euro-total">≈ {formatApproxEUR(budgetTotals.low)}–{formatApproxEUR(budgetTotals.high)} for two</p><p>Planning midpoint: <strong>{formatJPY(budgetTotals.centre)}</strong> (≈ {formatApproxEUR(budgetTotals.centre)})<br />About {formatApproxEUR(Math.round(budgetTotals.centre / 2))} per person.</p><div className="budget-confirmed"><span><Check size={15} /> Booked · hotels + Peach</span><strong>{formatJPY(confirmedSpendJPY)} <small>≈ €{Math.round(confirmedSpendEUR).toLocaleString('en-GB')}</small></strong></div><p className="budget-exclusions">International airfare and shopping are excluded. International flights are confirmed; their fare has not been entered.</p><details className="budget-assumptions"><summary>What’s behind these estimates <ChevronDown size={14} /></summary><p>Booked subtotal: 7 hotels / 18 nights (€{confirmedHotelTotalEUR.toLocaleString('en-GB')}; ≈ {formatJPY(Math.round(confirmedHotelTotalEUR * yenPerEuro))}) plus Peach MM571 (¥30,220 / ≈ {formatApproxEUR(30_220)}). Hotel yen is a reference conversion, not the amount charged. This range is a planning aid, not a final trip total. Rail, local transport, airport transfer and daily-spend prices still need checking. No personal budget ceiling has been set.</p><p>ECB reference: €1 = ¥{yenPerEuro.toFixed(2)} on 14 Oct 2026. Card rates differ.</p><a className="budget-fx-link" href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html" target="_blank" rel="noopener noreferrer">Check the ECB reference <ExternalLink size={12} /></a></details></div><div className="budget-breakdown" aria-label="Indicative two-adult budget ranges by category">{budgetCategories.map((category) => <div className="budget-line" key={category.id}><div><span>{category.label}</span><small>{formatJPY(category.low)}–{formatJPY(category.high)} <em>≈ {formatApproxEUR(category.low)}–{formatApproxEUR(category.high)}</em></small></div><div className="budget-bar" aria-hidden="true"><i style={{ width: `${Math.max(10, category.centre / max * 100)}%` }} /></div>{category.note && <details><summary>Estimate details</summary><p>{category.note}</p></details>}</div>)}</div></div></section>;
}

export function App() {
  const [selectedDayId, setSelectedDayId] = useState<string | undefined>(() => { const requested = new URLSearchParams(window.location.search).get('day') || undefined; return !hasPersonalPlanLink(window.location.href) && tripDays.some((day) => day.id === requested) ? requested : undefined; });
  const initialDayLink = useRef(new URLSearchParams(window.location.search).get('day') || undefined);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>();
  const [filter, setFilter] = useState<'all' | 'key' | 'food' | 'culture' | 'nature' | 'booking' | 'light' | 'balanced' | 'full'>('all');
  const [daySearch, setDaySearch] = useState('');
  const [baseFilter, setBaseFilter] = useState('all');
  const [bookingFocus, setBookingFocus] = useState<string>();
  const [ideasDay, setIdeasDay] = useState<string>();
  const [ideasRequest, setIdeasRequest] = useState(0);
  const [mapFilter, setMapFilter] = useState<ItemType | 'all'>('all');
  const [dayMapFilter, setDayMapFilter] = useState<ItemType | 'all'>('all');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [finderPlaceTarget, setFinderPlaceTarget] = useState<{ dayId: string; placeId: string }>();
  const [requestedIdeaId, setRequestedIdeaId] = useState<string>();
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 1023px)').matches);
  const personal = usePersonalPlanner();
  const { state: personalState, update: setPersonalState, replace: replacePersonalState, storageUnavailable } = personal;
  const [sharedReviewPending, setSharedReviewPending] = useState(() => hasPersonalPlanLink(window.location.href));
  const [requestedResourceId, setRequestedResourceId] = useState<string>();
  const [resourceRequest, setResourceRequest] = useState(0);
  const { choices: tokyoChoices, bookingProgress, savedKeys } = personalState;
  const [restoreUndo, setRestoreUndo] = useState<PlannerPersonalState>();
  const setTokyoChoices = useCallback((update: TokyoChoices | ((current: TokyoChoices) => TokyoChoices)) => {
    setRestoreUndo(undefined);
    setPersonalState((current) => ({ ...current, choices: typeof update === 'function' ? update(current.choices) : update }));
  }, []);
  const toggleSaved = useCallback((key: ShortlistKey) => {
    if (!isKnownShortlistKey(key)) return;
    setRestoreUndo(undefined);
    setPersonalState((current) => ({ ...current, savedKeys: current.savedKeys.includes(key) ? current.savedKeys.filter((item) => item !== key) : [...current.savedKeys, key].slice(0, 300) }));
  }, []);
  const setHandled = useCallback((id: string, handled: boolean) => {
    setRestoreUndo(undefined);
    setPersonalState((current) => {
      const next = { ...current.bookingProgress };
      if (handled) next[id] = new Date().toISOString(); else delete next[id];
      const validated = parseBookingProgress(JSON.stringify(next));
      return validated ? { ...current, bookingProgress: validated } : current;
    });
  }, []);
  const [tokyoUndo, setTokyoUndo] = useState<ReturnType<typeof emptyTokyoChoices> | null>(null);
  const [todayInJapan, setTodayInJapan] = useState(japanDate);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const onChange = () => { if (!media.matches) setMobileMenu(false); };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  const plannedDays = useMemo(() => buildPlannedDays(tripDays, tokyoChoices), [tokyoChoices]);
  const plannerBookings = useMemo(() => withBookingProgress(buildPlannerBookings(tokyoChoices), bookingProgress), [tokyoChoices, bookingProgress]);
  const nextActions = openPreparationTasks(plannerBookings, todayInJapan, 2).items;
  const entryPoint = relevantTripDay(plannedDays, todayInJapan);
  const beforeTrip = todayInJapan < plannedDays[0].id;
  const selectedDay = sharedReviewPending ? undefined : plannedDays.find((day) => day.id === selectedDayId);
  const selectedIndex = selectedDay ? plannedDays.indexOf(selectedDay) : -1;
  useEffect(() => {
    if (!selectedDayId) return;
    const strip = document.querySelector<HTMLElement>('.date-jump-strip');
    const selected = strip?.querySelector<HTMLElement>('button[aria-pressed="true"]');
    if (!strip || !selected) return;
    const stripRect = strip.getBoundingClientRect();
    const selectedRect = selected.getBoundingClientRect();
    const delta = selectedRect.left < stripRect.left ? selectedRect.left - stripRect.left : selectedRect.right > stripRect.right ? selectedRect.right - stripRect.right : 0;
    if (delta) strip.scrollTo({ left: strip.scrollLeft + delta, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [selectedDayId]);
  useEffect(() => { const timer = window.setInterval(() => setTodayInJapan(japanDate()), 60_000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { const media = window.matchMedia('(max-width: 1023px)'); const onChange = () => setMobile(media.matches); media.addEventListener('change', onChange); return () => media.removeEventListener('change', onChange); }, []);
  useEffect(() => {
    if (!initialDayLink.current || sharedReviewPending) return;
    if (!plannedDays.some((day) => day.id === initialDayLink.current)) {
      const url = new URL(window.location.href);
      url.searchParams.delete('day');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      initialDayLink.current = undefined;
      return;
    }
    const frame = window.requestAnimationFrame(() => scrollToTarget(document.getElementById('daily-plan'), 'start', true));
    initialDayLink.current = undefined;
    return () => window.cancelAnimationFrame(frame);
  }, [plannedDays, sharedReviewPending]);
  useEffect(() => { const onPop = () => { const url = new URL(window.location.href); const requested = url.searchParams.get('day') || undefined; const valid = tripDays.some((day) => day.id === requested); if (requested && !valid) { url.searchParams.delete('day'); window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`); } setSelectedDayId(valid ? requested : undefined); setSelectedPlaceId(undefined); }; window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop); }, []);
  useEffect(() => { document.body.classList.toggle('modal-open', Boolean(selectedDay && mobile)); return () => document.body.classList.remove('modal-open'); }, [selectedDay, mobile]);
  const selectDay = useCallback((dayId?: string) => {
    if (!dayId || !tripDays.some((day) => day.id === dayId)) return;
    const current = new URL(window.location.href);
    const currentId = current.searchParams.get('day') || undefined;
    const decision = dayHistoryDecision(currentId, dayId, ownedDayEntry(window.history.state));
    if (decision !== 'none') {
      current.searchParams.set('day', dayId);
      if (decision === 'push') window.history.pushState({ ...withoutOwnedDayEntry(window.history.state), __japanPlannerDayEntry: true }, '', current);
      else window.history.replaceState(ownedDayEntry(window.history.state) ? window.history.state : withoutOwnedDayEntry(window.history.state), '', current);
    }
    setSelectedDayId(dayId);
    setSelectedPlaceId(undefined);
    scrollToTarget(document.getElementById('daily-plan'));
  }, []);
  const closeDay = useCallback((forNavigation = false) => {
    const current = new URL(window.location.href);
    const currentId = current.searchParams.get('day') || undefined;
    const decision = dayHistoryDecision(currentId, undefined, ownedDayEntry(window.history.state));
    if (decision === 'back' && !forNavigation) window.history.back();
    else if (decision !== 'none') {
      current.searchParams.delete('day');
      window.history.replaceState(withoutOwnedDayEntry(window.history.state), '', `${current.pathname}${current.search}${current.hash}`);
    }
    setSelectedDayId(undefined);
    setSelectedPlaceId(undefined);
  }, []);
  const closeDayFromControl = useCallback(() => closeDay(), [closeDay]);
  const openTripFinder = useCallback(() => { if (selectedDayId) closeDay(true); setFinderOpen(true); }, [closeDay, selectedDayId]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.key.toLowerCase() !== 'k') return;
      if (document.querySelector('dialog[open], .mobile-dialog')) return;
      event.preventDefault();
      openTripFinder();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openTripFinder]);
  const openIdeas = useCallback((dayId: string) => { setRequestedIdeaId(undefined); setIdeasDay(dayId); setIdeasRequest((value) => value + 1); closeDay(true); window.requestAnimationFrame(() => { const heading = document.getElementById('tokyo-pool-title'); scrollToTarget(heading); heading?.focus({ preventScroll: true }); }); }, [closeDay]);
  const changeDay = useCallback((offset: number) => { const target = plannedDays[selectedIndex + offset]; if (target) selectDay(target.id); }, [plannedDays, selectDay, selectedIndex]);
  const shownDays = useMemo(() => plannedDays.filter((day) => {
    const searchable = normalizeSearchText([day.title, day.summary, day.base, day.date, ...day.places.flatMap((place) => [place.name, place.description, place.cuisine, place.signature])].filter(Boolean).join(' '));
    const bookingAttention = plannerBookings.some((booking) => booking.dayId === day.id && isOpenBooking(booking));
    return (baseFilter === 'all' || day.base.includes(baseFilter)) && (!daySearch.trim() || searchable.includes(normalizeSearchText(daySearch.trim()))) && (filter === 'all' || (filter === 'key' ? day.keyDay : filter === 'food' ? day.places.some((place) => place.type === 'food') : filter === 'booking' ? bookingAttention : filter === 'culture' || filter === 'nature' ? day.tags.includes(filter) : day.pacing === filter));
  }), [filter, plannedDays, baseFilter, daySearch, plannerBookings]);
  const assignTokyoActivity = useCallback((dayId: string, activityId: string, kind: 'outing' | 'evening') => {
    if (!isTokyoAssignmentAllowed(dayId, activityId, kind)) return;
    setTokyoUndo(cloneTokyoChoices(tokyoChoices));
    setTokyoChoices((current) => applyTokyoMutation(current, { type: 'assign', dayId, activityId, kind }));
  }, [tokyoChoices]);
  const removeTokyoActivity = useCallback((dayId: string, kind: 'outing' | 'evening') => {
    setTokyoUndo(cloneTokyoChoices(tokyoChoices));
    setTokyoChoices((current) => applyTokyoMutation(current, { type: 'remove', dayId, kind }));
  }, [tokyoChoices]);
  const undoTokyoMutation = useCallback(() => { if (!tokyoUndo) return; setTokyoChoices(cloneTokyoChoices(tokyoUndo)); setTokyoUndo(null); }, [tokyoUndo]);
  const selectPlace = useCallback((place: Place) => { setSelectedPlaceId(place.id); setMapFilter((current) => current === 'all' || current === place.type ? current : 'all'); setDayMapFilter((current) => current === 'all' || current === place.type ? current : 'all'); }, []);
  const openOverviewPlace = useCallback((day: TripDay, place: Place) => { selectDay(day.id); setSelectedPlaceId(place.id); }, [selectDay]);
  const departureDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const daysUntilTrip = Math.max(0, Math.ceil((Date.parse(`${plannedDays[0].id}T00:00:00Z`) - Date.parse(`${departureDate}T00:00:00Z`)) / 86400000));
  const openBooking = (id: string) => { if (selectedDayId) closeDay(true); setBookingFocus(undefined); window.requestAnimationFrame(() => setBookingFocus(id)); };
  useEffect(() => {
    if (!finderPlaceTarget || finderPlaceTarget.dayId !== selectedDayId) return;
    const frame = window.requestAnimationFrame(() => {
      const row = Array.from(document.querySelectorAll<HTMLElement>('.day-detail [data-place-id]')).find((element) => element.dataset.placeId === finderPlaceTarget.placeId);
      row?.closest<HTMLDetailsElement>('details')?.setAttribute('open', '');
      scrollToTarget(row, 'center');
      row?.querySelector<HTMLElement>('.place-main')?.focus({ preventScroll: true });
      setFinderPlaceTarget(undefined);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [finderPlaceTarget, selectedDayId, mobile]);
  const navigateFinderTarget = (target: TripSearchTarget) => {
    setFinderOpen(false);
    if (target.kind === 'day') {
      const day = plannedDays.find((item) => item.id === target.dayId);
      if (!day) return;
      selectDay(day.id);
      const place = target.placeId ? day.places.find((item) => item.id === target.placeId) : undefined;
      if (place) { selectPlace(place); setFinderPlaceTarget({ dayId: day.id, placeId: place.id }); }
      return;
    }
    if (target.kind === 'resource') {
      if (selectedDayId) closeDay(true);
      setRequestedResourceId(target.resourceId); setResourceRequest((value) => value + 1);
      return;
    }
    if (target.kind === 'booking') { openBooking(target.bookingId); return; }
    if (target.kind === 'stay') {
      const openStay = () => {
        const section = document.querySelector<HTMLDetailsElement>('.stays-disclosure');
        if (section) section.open = true;
        window.requestAnimationFrame(() => { const card = document.getElementById(target.stayId); scrollToTarget(card, 'center'); card?.focus({ preventScroll: true }); });
      };
      openStay();
      return;
    }
    if (target.kind === 'idea') {
      setRequestedIdeaId(target.ideaId);
      setIdeasRequest((value) => value + 1);
      scrollToTarget(document.getElementById('tokyo-pool'));
      return;
    }
    if (selectedDayId) closeDay(true);
    window.requestAnimationFrame(() => {
      const section = document.getElementById(target.sectionId);
      scrollToTarget(section);
      const heading = section?.querySelector<HTMLElement>('h1, h2');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    });
  };
  return <div className="app-shell"><a className="skip-link" href="#daily-plan">Skip to the daily plan</a><Header onMenu={() => setMobileMenu((open) => !open)} menuOpen={mobileMenu} onFind={openTripFinder} /><MobileNavigation open={mobileMenu} onClose={() => setMobileMenu(false)} onNavigate={(id) => { setMobileMenu(false); if (selectedDayId) closeDay(true); window.requestAnimationFrame(() => { const section = document.getElementById(id); scrollToTarget(section); const heading = section?.querySelector<HTMLElement>('h1, h2, [id="planner-backup-title"]'); heading?.setAttribute('tabindex', '-1'); heading?.focus({ preventScroll: true }); }); }} /><main>
    <PersistenceNotice onRetry={() => setPersonalState((current) => current)} state={personalState} status={personal.status} recoveryRaw={personal.recoveryRaw} externalChange={personal.externalChange} onAccept={() => { personal.acceptExternal(); setRestoreUndo(undefined); setTokyoUndo(null); }} onKeep={() => { personal.keepCurrent(); setRestoreUndo(undefined); setTokyoUndo(null); }} onReset={() => { personal.resetRecovery(); setRestoreUndo(undefined); setTokyoUndo(null); }} />
    <section className="hero" id="overview"><div className="hero-orbit orbit-one" /><div className="hero-content"><span className="eyebrow">23 Oct — 11 Nov 2026 · two travelers</span><h1>Japan,<br /><em>at your pace.</em></h1><p className="hero-lede">Autumn in the north. Local food along the way. A little room to get lost in Tokyo.</p><small className="hero-time-note">Trip dates follow Japan local days; flight times use the local airport time.</small><div className="hero-actions">{entryPoint && <button type="button" className="primary-button" onClick={() => selectDay(entryPoint.day.id)}><CalendarDays size={17} /> {entryPoint.label} <ArrowRight size={16} /></button>}<a className="hero-booking-link" href="#daily-plan">Browse all days <ArrowRight size={16} /></a></div><div className="stats"><Stat label="nights" value={String(totalNights)} /><Stat label="bases" value={String(baseCities.length)} accent /><Stat label="travelers" value="2" /></div></div><aside className="trip-brief" aria-label="Trip readiness"><span className="brief-countdown"><span className="live-dot" />{beforeTrip ? `${daysUntilTrip} days until takeoff` : todayInJapan <= plannedDays[plannedDays.length - 1].id ? 'Enjoy the journey' : 'Your Japan travel notebook'}</span><h2>The big pieces are in place.</h2><p className="brief-confirmed"><Check size={16} /> All hotels & flights confirmed</p><div className="brief-tasks"><span className="eyebrow">{nextActions.length ? 'Next, take care of these' : plannerBookings.some(isOpenBooking) ? 'Review outstanding actions' : 'Advance actions handled'}</span>{nextActions.map((booking) => <button type="button" key={booking.id} onClick={() => openBooking(booking.id)}><ListChecks size={19} /><span><strong>{booking.item}</strong><small>{booking.date} · {booking.deadline}</small></span><ArrowRight size={16} /></button>)}</div><a className="brief-all" href="#bookings">Review {plannerBookings.filter(isOpenBooking).length} open advance actions <ArrowRight size={15} /></a></aside></section>
    <PersonalPlanSharing state={personalState} onApply={(incoming) => { setRestoreUndo(personalState); replacePersonalState(incoming); setTokyoUndo(null); }} onReviewStart={() => { setSharedReviewPending(true); setSelectedDayId(undefined); }} onReviewDone={(dayId) => { initialDayLink.current = undefined; setSharedReviewPending(false); if (dayId) window.requestAnimationFrame(() => selectDay(dayId)); }} />
    {restoreUndo && <div className="section shared-plan-undo"><button type="button" className="secondary-button" onClick={() => { replacePersonalState(restoreUndo); setRestoreUndo(undefined); setTokyoUndo(null); }}>Undo last imported plan</button><small>Restores your picks, saved ideas and progress from before the import.</small></div>}
    <TravelDesk days={plannedDays} plannerBookings={plannerBookings} choices={tokyoChoices} bookingProgress={bookingProgress} today={todayInJapan} savedKeys={savedKeys} onOpenDay={selectDay} onOpenBooking={openBooking} />
    <section className="section route-section" id="route-map"><SectionHeading eyebrow="Get your bearings" title="A journey from north to south"><span className="route-note"><Route size={16} /> Sapporo → Hakodate → Sendai → Tokyo ↔ Nikko</span></SectionHeading><p className="section-intro">Explore the bases, find a food stop, or open a day straight from the map.</p><div className="map-toolbar"><div className="map-layer-tabs" role="group" aria-label="Route map layers">{([['all', 'Trip bases'], ['sight', 'Sights'], ['food', 'Food'], ['stay', 'Hotels'], ['transit', 'Transport'], ['optional', 'Alternatives'], ['booking', 'To check']] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={mapFilter === value} className={mapFilter === value ? 'is-active' : ''} onClick={() => setMapFilter(value)}>{label}</button>)}</div></div><div className="map-shell"><MapView allDays={plannedDays} onSelectPlace={selectPlace} onOpenOverviewPlace={openOverviewPlace} onOpenOverviewDay={(day) => selectDay(day.id)} filter={mapFilter} /></div><div className="route-strip" aria-label="Route in travel order">{baseVisits.map((city, index) => <button type="button" className="route-stop" key={`${city.name}-${index}`} onClick={() => { const day = baseVisitArrival(city.name, baseVisits.slice(0, index).filter((visit) => visit.name === city.name).length, stays, plannedDays); if (day) selectDay(day.id); }}><span>{String(index + 1).padStart(2, '0')}</span><strong>{city.name}</strong><small>{city.nights} {city.nights === 1 ? 'night' : 'nights'} <ArrowRight size={12} /></small></button>)}</div></section>
    <section id="daily-plan" className="section daily-section"><SectionHeading eyebrow="Your travel notebook" title="Find your next good day"><span className="section-count"><CalendarDays size={16} /> {shownDays.length} of {plannedDays.length} days</span></SectionHeading><div className="planner-save-tools"><TravelPackButton choices={tokyoChoices} bookingProgress={bookingProgress} savedKeys={savedKeys} /><span>All days, hotels, tasks & Tokyo picks · readable HTML snapshot</span></div><div className="day-search-controls"><label className="day-search"><Search size={18} /><span className="sr-only">Search itinerary days and places</span><input type="search" placeholder="Search a day, place or meal…" value={daySearch} onChange={(event) => setDaySearch(event.target.value)} /></label><div className="filter-bar"><label className="sr-only" htmlFor="day-filter">Filter itinerary days</label><select id="day-filter" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">Every kind of day</option><option value="key">Anchor days</option><option value="food">Food stops</option><option value="culture">Culture</option><option value="nature">Nature</option><option value="booking">Booking attention</option><option value="light">Light pace</option><option value="balanced">Balanced pace</option><option value="full">Full pace</option></select></div></div><p className="planner-date-hint">Date shortcuts cover the whole trip, including travel days. Times use Japan local time except on the Madrid departure day.</p>{(daySearch || filter !== 'all' || baseFilter !== 'all') && <button type="button" className="planner-filter-reset" onClick={() => { setDaySearch(''); setFilter('all'); setBaseFilter('all'); }}>Clear filters</button>}<div className="base-tabs" role="group" aria-label="Filter days by base">{['all', 'Sapporo', 'Hakodate', 'Sendai', 'Tokyo', 'Nikko'].map((base) => <button type="button" key={base} className={baseFilter === base ? 'is-active' : ''} aria-pressed={baseFilter === base} onClick={() => setBaseFilter(base)}>{base === 'all' ? 'Whole trip' : base}</button>)}</div><nav className="date-jump-strip" aria-label="Jump to a trip date">{plannedDays.map((day) => <button type="button" key={day.id} aria-label={`Open ${shortDate(day.id)} itinerary`} aria-pressed={selectedDayId === day.id} className={selectedDayId === day.id ? 'is-active' : ''} onClick={() => selectDay(day.id)}><small>{day.weekday}</small><strong>{shortDate(day.id)}</strong><i className={day.keyDay ? 'anchor-dot' : ''} /></button>)}</nav><div className="day-explorer-layout"><div className="day-list" aria-label="Choose an itinerary day">{shownDays.map((day) => <DayCard key={day.id} day={day} selected={selectedDayId === day.id} onSelect={() => selectDay(day.id)} />)}{shownDays.length === 0 && <div className="day-empty"><Search size={24} /><h3>No matching days</h3><p>Try another place, or clear the filters to see the whole trip.</p><button className="secondary-button" onClick={() => { setDaySearch(''); setBaseFilter('all'); setFilter('all'); }}>Clear filters</button></div>}</div>{selectedDay && !mobile && <DayDetail day={selectedDay} selectedPlaceId={selectedPlaceId} onSelectPlace={selectPlace} onClose={closeDayFromControl} onChangeDay={changeDay} first={selectedIndex === 0} last={selectedIndex === plannedDays.length - 1} mobile={false} mapFilter={dayMapFilter} onMapFilterChange={setDayMapFilter} onOpenIdeas={() => openIdeas(selectedDay.id)} onOpenBooking={openBooking} planningWarning={[tokyoTimingWarning(tokyoChoices.outings[selectedDay.id], tokyoChoices.evenings[selectedDay.id]), ...tokyoDateWarnings(tokyoChoices, selectedDay.id)].filter(Boolean).join(' ')} tokyoChoices={tokyoChoices} plannerBookings={plannerBookings} bookingProgress={bookingProgress} savedKeys={savedKeys} onToggleSave={toggleSaved} />}</div></section>
    <SavedIdeas savedKeys={savedKeys} onToggleSave={toggleSaved} onNavigate={navigateFinderTarget} days={plannedDays} />
    <CityGuide onOpenDay={selectDay} savedKeys={savedKeys} onToggleSave={toggleSaved} onOpenPlace={(dayId, placeId) => navigateFinderTarget({ kind: 'day', dayId, placeId })} />
    <TokyoPracticalGuide savedResourceIds={savedKeys.filter((key) => key.startsWith('resource:')).map((key) => key.slice('resource:'.length))} onToggleSave={(id) => toggleSaved(resourceKey(id))} requestedResourceId={requestedResourceId} requestId={resourceRequest} onOpenTokyoIdea={(id) => navigateFinderTarget({ kind: 'idea', ideaId: id })} />
    <TokyoActivityPool outings={tokyoChoices.outings} evenings={tokyoChoices.evenings} onAssign={assignTokyoActivity} onRemove={removeTokyoActivity} onOpenDay={selectDay} storageUnavailable={storageUnavailable} preferredDay={ideasDay} requestedIdeaId={requestedIdeaId} requestId={ideasRequest} onReplace={(choices) => { setTokyoUndo(cloneTokyoChoices(tokyoChoices)); setTokyoChoices(choices); }} undoAvailable={Boolean(tokyoUndo)} onUndo={undoTokyoMutation} savedKeys={savedKeys} onToggleSave={toggleSaved} />
    <BookingBoard onSelectDay={selectDay} focusId={bookingFocus} plannerBookings={plannerBookings} onSetHandled={setHandled}><details className="rail-disclosure"><summary><TrainFront size={19} /><span><strong>Rail pass or separate tickets?</strong><small>Compare the published references before buying</small></span><ChevronDown size={17} /></summary><RailPassDecision /></details></BookingBoard><AccommodationTimeline /><BudgetPanel /><PlannerBackup state={personalState} onRestore={(incoming) => { setRestoreUndo(personalState); replacePersonalState(incoming); setTokyoUndo(null); }} undoAvailable={Boolean(restoreUndo)} onUndo={() => { if (restoreUndo) { replacePersonalState(restoreUndo); setRestoreUndo(undefined); setTokyoUndo(null); } }} storageUnavailable={storageUnavailable} />
  </main><footer><span>Japan, slowly · planning document for two</span><span>October — November 2026</span></footer><nav className="mobile-bottom-nav" aria-label="Quick navigation"><a href="#travel-desk"><CalendarDays size={18} /><span>Today</span></a><a href="#daily-plan"><CalendarDays size={18} /><span>Days</span></a><a href="#tokyo-pool"><Compass size={18} /><span>Ideas</span></a><a href="#bookings"><ListChecks size={18} /><span>To do</span></a><button type="button" className="mobile-find" onClick={openTripFinder} aria-label="Find in your trip"><Search size={18} /><span>Find</span></button></nav><TripFinder open={finderOpen} onClose={() => setFinderOpen(false)} days={plannedDays} plannerBookings={plannerBookings} onNavigate={navigateFinderTarget} />{selectedDay && mobile && <><div className="dialog-backdrop" onClick={closeDayFromControl} /><DayDetail day={selectedDay} selectedPlaceId={selectedPlaceId} onSelectPlace={selectPlace} onClose={closeDayFromControl} onChangeDay={changeDay} first={selectedIndex === 0} last={selectedIndex === plannedDays.length - 1} mobile mapFilter={dayMapFilter} onMapFilterChange={setDayMapFilter} onOpenIdeas={() => openIdeas(selectedDay.id)} onOpenBooking={openBooking} planningWarning={[tokyoTimingWarning(tokyoChoices.outings[selectedDay.id], tokyoChoices.evenings[selectedDay.id]), ...tokyoDateWarnings(tokyoChoices, selectedDay.id)].filter(Boolean).join(' ')} tokyoChoices={tokyoChoices} plannerBookings={plannerBookings} bookingProgress={bookingProgress} savedKeys={savedKeys} onToggleSave={toggleSaved} /></>}</div>;
}
