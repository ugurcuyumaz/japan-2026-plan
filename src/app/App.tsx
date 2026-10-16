import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapView } from './MapView';
import { PlaceCard } from './PlaceCard';
import { TravelPackButton } from './TravelPackButton';
import { buildPlannedDays, tokyoPace } from '../data/planner';
import { DayEssentials } from './DayEssentials';
import { TokyoSharing } from './TokyoSharing';
import { TripFinder } from './TripFinder';
import { baseVisitArrival } from '../data/dayBrief';
import { emptyTokyoChoices, flexibleDayIdSet, parseTokyoChoices, tokyoPlacesForHotel, tokyoTimingWarning, tokyoStorageKey } from '../data/tokyoChoices';
import { isAlternative, matchesMapLayer, shortDate } from '../data/map';
import {
  ArrowLeft, ArrowRight, BedDouble, CalendarDays, Check, ChevronDown, CircleAlert,
  Coffee, ExternalLink, Map as MapIcon, Menu,
  Navigation, Printer, Route, TrainFront, X, Zap, Search, Compass, ListChecks, Copy,
} from 'lucide-react';
import { baseCities, baseVisits, bookingPartyEstimateJPY, bookingSupportingLinks, budgetCategories, budgetTotals, confirmedHotelTotalEUR, googleDirectionsUrl, googleMapsUrl, stays, totalNights, tripDays } from '../data/trip';
import { dayHistoryDecision, dayTimeLabel, japanDate, normalizeSearchText, relevantTripDay, scrollToTarget } from '../data/navigation';
import { tokyoFlexibleDays, tokyoPoolActivities } from '../data/tokyoPool';
import { individualRailTotalJPY, railDecision } from '../data/rail';
import { buildPlannerBookings } from '../data/bookingActions';
import type { TripSearchTarget } from '../data/tripSearch';
import { applyTokyoMutation, cloneTokyoChoices } from '../data/tokyoMutations';
import './planner-usability.css';
import './mobile-ux.css';
import type { Booking, ItemType, Place, TripDay } from '../types/trip';

const formatJPY = (amount: number) => `¥${amount.toLocaleString('en-US')}`;
const railPassWindowLabel = `${new Date(`${railDecision.validFrom}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}–${new Date(`${railDecision.validThrough}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}`;
const yenPerEuro = 177.39; // ECB reference rate published 14 Oct 2026; budget conversions are indicative only.
const formatApproxEUR = (yen: number) => `€${Math.round(yen / yenPerEuro).toLocaleString('en-GB')}`;
const confirmedSpendJPY = Math.round(confirmedHotelTotalEUR * yenPerEuro) + 30_220;
const confirmedSpendEUR = confirmedHotelTotalEUR + 30_220 / yenPerEuro;
const needsBookingAttention = (place: Place) => place.type === 'booking' || ['research', 'recommended', 'required'].includes(place.bookingState ?? '');
const ownedDayEntry = (state: unknown) => Boolean(state && typeof state === 'object' && (state as Record<string, unknown>).__japanPlannerDayEntry === true);
const withoutOwnedDayEntry = (state: unknown) => {
  if (!state || typeof state !== 'object') return {};
  const next = { ...(state as Record<string, unknown>) };
  delete next.__japanPlannerDayEntry;
  return next;
};

function Header({ onMenu, menuOpen, onFind }: { onMenu: () => void; menuOpen: boolean; onFind: () => void }) {
  return <header className="site-header"><a className="brand" href="/japan-2026-plan/" aria-label="Japan, slowly home"><span className="brand-mark">日</span><span>Japan,<br /><em>slowly</em></span></a><nav className="main-nav" aria-label="Main navigation"><a href="#overview">Overview</a><a href="#daily-plan">Daily plan</a><a href="#tokyo-pool">Tokyo ideas</a><a href="#bookings">Reservations</a><a href="#stays">Stays</a><a href="#budget">Budget</a></nav><button type="button" className="header-find" onClick={onFind} aria-keyshortcuts="Control+K Meta+K"><Search size={17} /><span>Find</span><kbd>Ctrl K</kbd></button><button className="menu-button" onClick={onMenu} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-menu"><Menu size={22} /></button></header>;
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

function DayDetail({ day, selectedPlaceId, onSelectPlace, onClose, onChangeDay, first, last, mobile, mapFilter, onMapFilterChange, onOpenIdeas, onOpenBooking, planningWarning, tokyoChoices, plannerBookings }: { day: TripDay; selectedPlaceId?: string; onSelectPlace: (place: Place) => void; onClose: () => void; onChangeDay: (offset: number) => void; first: boolean; last: boolean; mobile: boolean; mapFilter: ItemType | 'all'; onMapFilterChange: (filter: ItemType | 'all') => void; onOpenIdeas: () => void; onOpenBooking: (id: string) => void; planningWarning?: string; tokyoChoices: ReturnType<typeof emptyTokyoChoices>; plannerBookings: Booking[] }) {
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
  const [copyNotice, setCopyNotice] = useState('');
  const copyDayLink = async () => { try { const url = new URL(window.location.href); url.searchParams.delete('picks'); await navigator.clipboard.writeText(url.href); setCopyNotice('Day link copied. Share Tokyo picks separately to include your choices.'); } catch { setCopyNotice('Use the address bar to copy this day’s link.'); } };
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
  return <aside className={`day-detail${mobile ? ' mobile-dialog' : ''}`} role={mobile ? 'dialog' : 'complementary'} aria-modal={mobile || undefined} aria-labelledby="day-detail-title" tabIndex={-1} ref={dialogRef}>{mobile && <div className="day-mobile-bar"><span>Day plan · {shortDate(day.id)}</span><button className="icon-button close-detail" onClick={onClose} aria-label="Close day focus"><X size={20} /></button></div>}<div className="detail-top"><div><span className="eyebrow">Day focus · {day.weekday} {new Date(`${day.date}T12:00:00`).toLocaleString('en-US', { month: 'short', day: 'numeric' })}</span><h2 id="day-detail-title" tabIndex={-1}>{day.title}</h2><p>{day.base} · <span className={`pace pace-${day.pacing}`}>{day.pacing} pace</span>{day.dailyEstimateJPY ? ' · daily estimate basis not recorded' : ''}</p><small className="day-time-label">{dayTimeLabel(day)}. Times are shown as researched for each place.</small></div><button className="icon-button close-detail" onClick={onClose} aria-label="Close day focus"><X size={21} /></button></div><div className="detail-actions"><button className="secondary-button" onClick={() => onChangeDay(-1)} disabled={first}><ArrowLeft size={16} /> Previous</button><button className="secondary-button" onClick={() => onChangeDay(1)} disabled={last}>Next <ArrowRight size={16} /></button><button className="secondary-button print-day-button" onClick={() => window.print()} aria-label="Print this day"><Printer size={15} /></button><button className="secondary-button" onClick={copyDayLink} aria-label="Copy link to this day"><Copy size={15} /></button><TravelPackButton choices={tokyoChoices} dayId={day.id} iconOnly /></div>{copyNotice && <p className="copy-notice" role="status">{copyNotice}</p>}<p className="day-detail-summary">{day.summary}</p><DayEssentials day={day} onOpenBooking={onOpenBooking} plannerBookings={plannerBookings} />{planningWarning && <p className="planning-warning"><CircleAlert size={16} />{planningWarning}</p>}{flexibleDayIdSet.has(day.id) && day.places.some((place) => place.type !== 'stay') && day.id === '2026-11-01' && <p className="planning-warning"><CircleAlert size={16} />This idea was researched from Comfort Hotel. Directions now use your Ikebukuro hotel; recheck travel times and evening access before going.</p>}{flexibleDayIdSet.has(day.id) && <button type="button" className="day-pool-link" onClick={onOpenIdeas}><Compass size={17} />{day.places.length > 1 ? "Change your Tokyo idea" : "Choose a Tokyo idea"}<ArrowRight size={15} /></button>}<details className="day-notes"><summary><CircleAlert size={15} /> Timing & travel notes <ChevronDown size={15} /></summary><p className="season-note">{day.seasonNote}</p></details><div className="day-map-section"><button type="button" className="day-map-toggle" aria-expanded={mapExpanded} aria-controls="day-map-content" onClick={() => setMapExpanded((open) => !open)}><MapIcon size={17} /><span>{mapExpanded ? 'Hide day map' : 'Explore the day on a map'}<small>Places, details & directions</small></span><ChevronDown size={17} /></button><div id="day-map-content" hidden={!mapExpanded}>{mapExpanded && <><div className="detail-map-heading"><strong><MapIcon size={15} /> Explore the day</strong><label><span className="sr-only">Filter day map</span><select aria-label={`Filter ${day.base} day map layers`} value={mapFilter} onChange={(event) => onMapFilterChange(event.target.value as ItemType | 'all')}><option value="all">All stops</option><option value="sight">Sights</option><option value="food">Food</option><option value="optional">Alternatives</option><option value="transit">Transport</option><option value="stay">Stays</option><option value="booking">Book / check</option></select></label></div><div className="detail-map-shell"><MapView selectedDay={day} selectedPlaceId={selectedPlaceId} onSelectPlace={onSelectPlace} onJumpToPlace={jumpToPlace} filter={mapFilter} /></div>{visibleMapCount === 0 && <p className="inline-empty" role="status">No mapped stops in this layer. Choose another layer or use the itinerary below.</p>}</>}</div></div><div className="day-view-toggle" role="group" aria-label="Day plan detail"><span>Read the plan</span><button type="button" aria-pressed={compact} onClick={() => changeDetail(true)}>Quick view</button><button type="button" aria-pressed={!compact} onClick={() => changeDetail(false)}>Full notes</button></div><DayTimeline day={day} selectedPlaceId={selectedPlaceId} onSelectPlace={explorePlace} compact={compact} />{alternatives.length > 0 && <details className="day-alternatives"><summary><Coffee size={16} /><span>Food backups & optional stops<small>{alternatives.length} {alternatives.length === 1 ? 'option' : 'options'} · choose if useful, not extra commitments</small></span><ChevronDown size={16} /></summary><ul>{alternatives.map((place) => <li key={place.id} data-place-id={place.id}><PlaceCard place={place} selected={selectedPlaceId === place.id} onSelect={() => explorePlace(place)} compact={compact} /></li>)}</ul></details>}{(day.tiredPlan || day.rainPlan) && <div className="contingency"><h3><Coffee size={16} /> Keep a plan B</h3>{day.tiredPlan && <p><strong>If tired:</strong> {day.tiredPlan}</p>}{day.rainPlan && <p><strong>If raining:</strong> {day.rainPlan}</p>}</div>}</aside>;
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

function BookingBoard({ onSelectDay, focusId, plannerBookings }: { onSelectDay: (dayId?: string) => void; focusId?: string; plannerBookings: Booking[] }) {
  const [view, setView] = useState<'advance' | 'day-of'>('advance');
  useEffect(() => {
    if (!focusId) return;
    const booking = plannerBookings.find((item) => item.id === focusId);
    if (booking?.status === 'on-site') setView('day-of');
    else setView('advance');
    const frame = window.requestAnimationFrame(() => {
      if (booking?.status === 'booked') {
        const confirmed = document.querySelector<HTMLDetailsElement>('.booking-confirmed');
        if (confirmed) confirmed.open = true;
        window.requestAnimationFrame(() => {
          const confirmedEntry = document.getElementById(focusId);
          if (confirmedEntry) { scrollToTarget(confirmedEntry, 'center'); confirmedEntry.focus({ preventScroll: true }); }
        });
        return;
      }
      const entry = document.getElementById(focusId) as HTMLDetailsElement | null;
      if (entry) { entry.open = true; scrollToTarget(entry, 'center'); entry.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true }); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusId, plannerBookings]);
  const advanceBookings = plannerBookings.filter((booking) => booking.status === 'unbooked' || booking.status === 'verify').sort((a, b) => {
    const priority = { required: 0, recommended: 1, research: 2 };
    const dependency = (bookingId: string) => bookingId === 'booking-jr-east-south-hokkaido-pass' ? -1 : 0;
    return dependency(a.id) - dependency(b.id) || priority[a.priority] - priority[b.priority] || (a.dayId ?? '9999-12-31').localeCompare(b.dayId ?? '9999-12-31');
  });
  const dayOfBookings = plannerBookings.filter((booking) => booking.status === 'on-site').sort((a, b) => (a.dayId ?? '9999-12-31').localeCompare(b.dayId ?? '9999-12-31'));
  const visibleBookings = view === 'advance' ? advanceBookings : dayOfBookings;
  const confirmedBookings = plannerBookings.filter((booking) => booking.status === 'booked');
  const bookedStays = stays.filter((stay) => stay.status === 'booked');
  return <section id="bookings" className="section">
    <SectionHeading eyebrow="Action board · reservations, transport & tickets" title="A few things to arrange"><span className="section-count" aria-label={`${advanceBookings.length} advance actions; ${dayOfBookings.length} day-of purchases; ${bookedStays.length + confirmedBookings.length} confirmed reservations`}><Zap size={16} /> {advanceBookings.length} advance actions · {dayOfBookings.length} day-of</span></SectionHeading>
    <p className="booking-intro">Start with the seats, transfers and inn arrangements that need attention before travel. Day-of purchases are listed separately. Expand a row for the next step, official link and related day. Displayed estimates are for two; per-adult references are labeled. Status reflects the traveler’s 15 Oct 2026 update and does not change when a booking link is opened.</p>
    <details className="rail-disclosure"><summary><TrainFront size={19} /><span><strong>Rail pass or separate tickets?</strong><small>Compare the published references before buying</small></span><ChevronDown size={17} /></summary><RailPassDecision /></details>
    <div className="booking-views" role="group" aria-label="Booking action type"><button type="button" className={view === 'advance' ? 'is-active' : ''} aria-pressed={view === 'advance'} onClick={() => setView('advance')}>Before travel <span>{advanceBookings.length}</span></button><button type="button" className={view === 'day-of' ? 'is-active' : ''} aria-pressed={view === 'day-of'} onClick={() => setView('day-of')}>Buy on the day <span>{dayOfBookings.length}</span></button></div>
    <div className="booking-list" aria-live="polite">{visibleBookings.map((booking) => <details className={`booking-entry priority-${booking.priority}`} key={booking.id} id={booking.id}>
      <summary><span className="booking-entry-priority">{booking.status === 'on-site' ? 'DAY OF' : booking.status === 'verify' ? 'CHECK' : booking.priority === 'required' ? 'BOOK' : booking.priority === 'recommended' ? 'CONFIRM' : 'CHECK'}</span><span className="booking-entry-main"><strong>{booking.item}</strong><small><CalendarDays size={13} /> {booking.date} · {booking.deadline}</small></span><span className="booking-entry-cost">{booking.estimatedCostJPY ? formatJPY(bookingPartyEstimateJPY(booking)!) : 'Cost varies'}<small>{booking.estimatedCostJPY ? `for two${booking.priceBasis === 'per-adult' ? ` · ${formatJPY(booking.estimatedCostJPY)}/adult` : ''} · ≈ ${formatApproxEUR(bookingPartyEstimateJPY(booking)!)}` : 'check at booking'}</small></span><ChevronDown className="booking-entry-chevron" size={17} aria-hidden="true" /></summary>
      <div className="booking-entry-details"><p>{booking.notes}</p><div className="booking-meta">{booking.mapsQuery && <a href={googleMapsUrl(booking.mapsQuery)} target="_blank" rel="noopener noreferrer">Map location <ExternalLink size={12} /></a>}{booking.purchaseUrl && <a className="booking-buy-link" href={booking.purchaseUrl} target="_blank" rel="noopener noreferrer">{booking.purchaseLabel ?? 'Buy / reserve'} <ExternalLink size={12} /></a>}{booking.referenceUrl && <a href={booking.referenceUrl} target="_blank" rel="noopener noreferrer">{booking.referenceLabel ?? 'Official information'} <ExternalLink size={12} /></a>}{[...(booking.extraLinks ?? []), ...(bookingSupportingLinks[booking.id] ?? [])].map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label} <ExternalLink size={12} /></a>)}<button className="text-button" onClick={() => onSelectDay(booking.dayId)}>Open related day <ArrowRight size={14} /></button></div></div>
    </details>)}</div>
    <details className="booking-confirmed"><summary><span><Check size={15} /> Confirmed · {bookedStays.length} hotels + {confirmedBookings.length} flight bookings</span><ChevronDown size={17} aria-hidden="true" /></summary><div className="confirmed-booking-list">{bookedStays.map((stay) => <article key={stay.id}><div><strong>{stay.property}</strong><small>{stay.dates} · {stay.city}</small></div><span>€{stay.costEUR?.toLocaleString('en-GB') ?? 'confirmed'}</span></article>)}{confirmedBookings.map((booking) => <article id={booking.id} tabIndex={-1} key={booking.id}><div><strong>{booking.item}</strong><small>{booking.date} · {booking.destination}</small></div><span>{booking.estimatedCostJPY ? `${formatJPY(booking.estimatedCostJPY)} ≈ ${formatApproxEUR(booking.estimatedCostJPY)}` : 'Confirmed · cost not entered'}</span></article>)}</div></details>
  </section>;
}

function AccommodationTimeline() { return <section className="section compact-section" id="stays"><SectionHeading eyebrow="Where we sleep" title="Seven stays, five bases"><span className="section-count"><Check size={16} /> {stays.filter((stay) => stay.status === 'booked').length} confirmed · €{confirmedHotelTotalEUR}</span></SectionHeading><details className="stays-disclosure"><summary><BedDouble size={18} /><span>View all seven confirmed stays</span><ChevronDown size={17} /></summary><div className="stay-grid">{stays.map((stay) => <article id={stay.id} tabIndex={-1} className={`stay-card${stay.conflict ? ' stay-conflict' : ''}`} key={stay.id}><div className="stay-marker"><BedDouble size={17} /></div><div><div className="stay-card-top"><span>{stay.dates}</span><span className={`status status-${stay.status}`}>{stay.conflict ? 'date conflict' : stay.status === 'booked' ? 'Confirmed' : stay.status}</span></div><h3>{stay.city}</h3><p>{stay.property}{stay.privateBath ? ' · Private bath' : ''}</p><small>{stay.note}{stay.costEUR ? ` · €${stay.costEUR}` : ''}</small><a className="stay-map-link" href={googleMapsUrl(stay.property)} target="_blank" rel="noopener noreferrer">Open property in Google Maps <ExternalLink size={12} /></a></div></article>)}</div></details></section>; }

function BudgetPanel() {
  const max = Math.max(...budgetCategories.map((category) => category.centre));
  return <section id="budget" className="section budget-section"><SectionHeading eyebrow="Know your envelope" title="A clear view of the costs" /><div className="budget-layout"><div className="budget-hero"><span className="eyebrow">Japan planning range · two adults</span><strong>{formatJPY(budgetTotals.low)} <em>–</em><br />{formatJPY(budgetTotals.high)}</strong><p className="budget-euro-total">≈ {formatApproxEUR(budgetTotals.low)}–{formatApproxEUR(budgetTotals.high)} for two</p><p>Planning midpoint: <strong>{formatJPY(budgetTotals.centre)}</strong> (≈ {formatApproxEUR(budgetTotals.centre)})<br />About {formatApproxEUR(Math.round(budgetTotals.centre / 2))} per person.</p><div className="budget-confirmed"><span><Check size={15} /> Booked · hotels + Peach</span><strong>{formatJPY(confirmedSpendJPY)} <small>≈ €{Math.round(confirmedSpendEUR).toLocaleString('en-GB')}</small></strong></div><p className="budget-exclusions">International airfare and shopping are excluded. International flights are confirmed; their fare has not been entered.</p><details className="budget-assumptions"><summary>What’s behind these estimates <ChevronDown size={14} /></summary><p>Booked subtotal: 7 hotels / 18 nights (€{confirmedHotelTotalEUR.toLocaleString('en-GB')}; ≈ {formatJPY(Math.round(confirmedHotelTotalEUR * yenPerEuro))}) plus Peach MM571 (¥30,220 / ≈ {formatApproxEUR(30_220)}). Hotel yen is a reference conversion, not the amount charged. This range is a planning aid, not a final trip total. Rail, local transport, airport transfer and daily-spend prices still need checking. No personal budget ceiling has been set.</p><p>ECB reference: €1 = ¥{yenPerEuro.toFixed(2)} on 14 Oct 2026. Card rates differ.</p><a className="budget-fx-link" href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html" target="_blank" rel="noopener noreferrer">Check the ECB reference <ExternalLink size={12} /></a></details></div><div className="budget-breakdown" aria-label="Indicative two-adult budget ranges by category">{budgetCategories.map((category) => <div className="budget-line" key={category.id}><div><span>{category.label}</span><small>{formatJPY(category.low)}–{formatJPY(category.high)} <em>≈ {formatApproxEUR(category.low)}–{formatApproxEUR(category.high)}</em></small></div><div className="budget-bar" aria-hidden="true"><i style={{ width: `${Math.max(10, category.centre / max * 100)}%` }} /></div>{category.note && <details><summary>Estimate details</summary><p>{category.note}</p></details>}</div>)}</div></div></section>;
}

function TokyoActivityPool({ outings, evenings, onAssign, onRemove, onOpenDay, storageUnavailable, preferredDay, requestId, onReplace, undoAvailable, onUndo, requestedIdeaId }: { outings: Record<string, string>; evenings: Record<string, string>; onAssign: (dayId: string, activityId: string, kind: 'outing' | 'evening') => void; onRemove: (dayId: string, kind: 'outing' | 'evening') => void; onOpenDay: (dayId?: string) => void; storageUnavailable: boolean; preferredDay?: string; requestId: number; onReplace: (choices: ReturnType<typeof emptyTokyoChoices>) => void; undoAvailable: boolean; onUndo: () => void; requestedIdeaId?: string }) {
  const [targets, setTargets] = useState<Record<string, string>>(() => ({}));
  const [notice, setNotice] = useState('');
  const [planningDay, setPlanningDay] = useState(preferredDay ?? '');
  const boardRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (preferredDay) { setPlanningDay(preferredDay); setTargets({}); if (boardRef.current) boardRef.current.open = true; } }, [preferredDay, requestId]);
  const [poolSearch, setPoolSearch] = useState('');
  const [poolCategory, setPoolCategory] = useState('all');
  const [poolEffort, setPoolEffort] = useState('all');
  useEffect(() => {
    if (!requestedIdeaId) return;
    setPoolSearch(''); setPoolCategory('all'); setPoolEffort('all');
    if (boardRef.current) boardRef.current.open = true;
    const frame = window.requestAnimationFrame(() => {
      const card = Array.from(boardRef.current?.querySelectorAll<HTMLDetailsElement>('[data-idea-id]') ?? []).find((element) => element.dataset.ideaId === requestedIdeaId);
      if (!card) return;
      card.open = true;
      scrollToTarget(card, 'center');
      card.querySelector<HTMLElement>('.pool-card-summary')?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [requestedIdeaId, requestId]);
  const visibleActivities = tokyoPoolActivities.filter((activity) => (poolEffort === 'all' || tokyoPace([activity]) === poolEffort) && (poolCategory === 'all' || (poolCategory === 'city' ? activity.kind === 'outing' && activity.categoryId !== 'day-trip' : poolCategory === 'day-trip' ? activity.categoryId === 'day-trip' : activity.kind === 'evening')) && normalizeSearchText([activity.title, activity.area, activity.summary, ...activity.places.flatMap((place) => [place.name, place.description, place.cuisine, place.signature])].filter(Boolean).join(' ')).includes(normalizeSearchText(poolSearch.trim())));
  const poolDays = tokyoFlexibleDays.map((day) => ({ ...day, outing: outings[day.id], evening: evenings[day.id] }));
  return <section className="section tokyo-pool" id="tokyo-pool" aria-labelledby="tokyo-pool-title">
    <SectionHeading eyebrow="Make the last Tokyo week yours" title="Choose your Tokyo days" titleId="tokyo-pool-title"><span className="section-count">Kamakura fixed · all other full Tokyo days open</span></SectionHeading>
    <p className="pool-intro">Every full Tokyo day except Kamakura is intentionally unplanned. Browse the researched day ideas—from Tokyo neighborhoods to full day trips—plus an optional izakaya evening. Picks stay optional until you assign one; selected ideas appear in that day’s map and timed itinerary. One main outing per day keeps travel manageable.</p>
    <TokyoSharing choices={{ outings, evenings }} onReplace={onReplace} />
    <details className="pool-calendar"><summary><CalendarDays size={18} /><span>Your flexible Tokyo days<small>{Object.keys(outings).length} of {poolDays.length} outings chosen · view your calendar</small></span><ChevronDown size={16} /></summary><div className="pool-day-strip" aria-label="Flexible Tokyo days">{poolDays.map((day) => <article key={day.id} className="pool-day"><div><strong>{day.label}</strong><span>{day.outing ? tokyoPoolActivities.find((item) => item.id === day.outing)?.title : 'Choose a day outing'}{day.evening ? ` · ${tokyoPoolActivities.find((item) => item.id === day.evening)?.title}` : ''}</span>{tokyoTimingWarning(day.outing, day.evening) && <small className="pool-timing-warning">Timing clash · review this day</small>}</div><button className="text-button" onClick={() => onOpenDay(day.id)}>Open day plan <ArrowRight size={14} /></button></article>)}</div></details>
    <p className="pool-notice" role="status" aria-live="polite">{storageUnavailable ? 'This browser blocked local storage, so activity choices will last only for this session.' : notice || 'Your picks are saved in this browser and appear in the day’s map and itinerary.'}{undoAvailable && <button type="button" className="planner-filter-reset pool-undo" onClick={() => { onUndo(); setTargets({}); setNotice('Your previous Tokyo picks have been restored.'); }}>Undo</button>}</p>
    <details className="pool-board" ref={boardRef}><summary className="pool-board-summary"><span><strong>Browse activity ideas</strong><small>{tokyoPoolActivities.filter((activity) => activity.kind === 'outing').length} day outings · {tokyoPoolActivities.filter((activity) => activity.kind === 'evening').length} evening add-on · all routes expandable</small></span><span className="pool-board-toggle"><span className="pool-board-closed">Show ideas</span><span className="pool-board-open">Hide ideas</span><ChevronDown size={17} aria-hidden="true" /></span></summary><div className="pool-browse-controls"><label className="pool-planning-day"><span>Plan an outing for</span><select aria-label="Plan an outing for" value={planningDay} onChange={(event) => { setPlanningDay(event.target.value); setTargets({}); }}><option value="">Choose a date while browsing</option>{tokyoFlexibleDays.map((day) => <option key={day.id} value={day.id}>{day.label}</option>)}</select></label><label className="day-search"><Search size={17} /><span className="sr-only">Search Tokyo ideas</span><input type="search" placeholder="Search neighborhoods, food, views…" value={poolSearch} onChange={(event) => setPoolSearch(event.target.value)} /></label><div className="base-tabs" role="group" aria-label="Tokyo activity type">{([["all", "All ideas"], ["city", "In the city"], ["day-trip", "Day trips"], ["evening", "Evening"]] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={poolCategory === value} className={poolCategory === value ? "is-active" : ""} onClick={() => setPoolCategory(value)}>{label}</button>)}</div><label className="pool-effort-filter"><span>Time commitment</span><select aria-label="Tokyo idea time commitment" value={poolEffort} onChange={(event) => setPoolEffort(event.target.value)}><option value="all">Any length</option><option value="light">Up to 6 hours</option><option value="balanced">6–9 hours</option><option value="full">Over 9 hours</option></select></label><small className="pool-effort-explainer">Based on the sample route including travel, not walking difficulty. Recheck timings for your hotel.</small>{(poolSearch || poolCategory !== 'all' || poolEffort !== 'all') && <button type="button" className="planner-filter-reset" onClick={() => { setPoolSearch(''); setPoolCategory('all'); setPoolEffort('all'); }}>Clear filters</button>}<p role="status">{visibleActivities.length} idea{visibleActivities.length === 1 ? '' : 's'} shown</p></div><div className="pool-grid">{visibleActivities.map((activity) => {
      const assignment = Object.entries(activity.kind === 'outing' ? outings : evenings).find(([, id]) => id === activity.id)?.[0];
      const target = targets[activity.id] ?? assignment ?? planningDay;
      const incumbentId = (activity.kind === 'outing' ? outings : evenings)[target];
      const incumbent = tokyoPoolActivities.find((item) => item.id === incumbentId);
      const dayLabel = tokyoFlexibleDays.find((day) => day.id === target)?.label ?? 'selected day';
      const routeDay = assignment ?? target;
      const routeHotel = stays.find((stay) => stay.checkIn <= routeDay && routeDay < stay.checkOut);
      const previewPlaces = tokyoPlacesForHotel(activity, routeHotel);
      const differentHotel = routeHotel && routeHotel.id !== 'stay-tokyo-long';
      const proposedWarning = target ? tokyoTimingWarning(activity.kind === 'outing' ? activity.id : outings[target], activity.kind === 'evening' ? activity.id : evenings[target]) : undefined;
      return <details className={`pool-card pool-${activity.kind}${assignment ? ' is-assigned' : ''}`} key={activity.id} data-idea-id={activity.id}>
        <summary className="pool-card-summary"><span className="pool-card-top"><span className="pool-kind">{activity.kind === 'outing' ? 'DAY OUTING' : 'EVENING ADD-ON'}</span><span>{activity.durationLabel}</span></span><span className="eyebrow">{activity.area}</span><strong className="pool-card-title">{activity.title}</strong><span className={`pool-commitment pace-${tokyoPace([activity])}`}>{tokyoPace([activity]) === 'full' ? 'Full day · protect your evening' : tokyoPace([activity]) === 'light' ? 'Shorter plan · up to 6 hours' : 'Day plan · 6–9 hours'}{activity.places.some((place) => ['required', 'recommended'].includes(place.bookingState ?? '')) ? ' · reservation attention' : ''}</span><span className="pool-card-description">{activity.summary}</span><span className="pool-card-expand"><span>{assignment ? `Added to ${tokyoFlexibleDays.find((day) => day.id === assignment)?.label}` : <><span className="pool-card-closed">Open route, stops, food and map links</span><span className="pool-card-open">Close route details</span></>}</span><ChevronDown size={17} aria-hidden="true" /></span></summary>
        <div className="pool-card-content"><p className="pool-route"><Navigation size={14} /> {differentHotel ? `Directions use ${routeHotel.property}. The original route was researched from Comfort Hotel; recheck transfer times and adjust the schedule for this hotel.` : activity.routeNote}</p><p className="pool-route-base">Starting hotel: {routeHotel?.property ?? 'Comfort Hotel Tokyo Kiyosumi Shirakawa (sample route — choose a date)'}</p>
          <details className="pool-route-details"><summary>View timed route · {previewPlaces.length} stops</summary><ol>{previewPlaces.map((place) => <li key={place.id}><span>{place.startTime ? `${place.startTime} · ` : ''}{place.name}</span><small>{place.durationMinutes ? `${place.durationMinutes} min · ` : ''}{place.description}</small><a href={place.originQuery ? googleDirectionsUrl(place.mapsQuery, place.originQuery, place.travelMode) : googleMapsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer">{place.originQuery ? 'Directions from previous stop' : 'Open place in Google Maps'} <ExternalLink size={12} /></a></li>)}</ol>{activity.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} <ExternalLink size={12} /></a>)}</details>
          {activity.bookingActions?.length ? <p className="pool-booking-note"><CircleAlert size={16} />Booking attention: {activity.bookingActions.map((action) => `${action.item} · ${action.deadline}`).join('; ')}. Assigning this idea adds the task to Reservations.</p> : null}{proposedWarning && !assignment && <p className="planning-warning"><CircleAlert size={16} />{proposedWarning}</p>}<div className="pool-card-actions">{assignment && <span className="pool-assigned">Added to {tokyoFlexibleDays.find((day) => day.id === assignment)?.label}</span>}<label className="sr-only" htmlFor={`pool-day-${activity.id}`}>{assignment ? `Move ${activity.title} to a date` : `Choose a flexible Tokyo day for ${activity.title}`}</label><select id={`pool-day-${activity.id}`} value={target} onChange={(event) => setTargets((current) => ({ ...current, [activity.id]: event.target.value }))}><option value="">Choose a date</option>{tokyoFlexibleDays.map((day) => <option key={day.id} value={day.id}>{day.label}</option>)}</select><button className={assignment ? 'secondary-button' : 'primary-button'} disabled={!target || target === assignment} onClick={() => { onAssign(target, activity.id, activity.kind); setNotice(`${activity.title} ${assignment ? 'moved' : incumbent ? 'replaced the existing idea' : 'added'} for ${dayLabel}. Its map, itinerary and reservation tasks are updated.`); }}>{assignment ? 'Move to date' : target ? incumbent ? `Replace ${incumbent.title}` : activity.kind === 'outing' ? 'Add outing' : 'Add evening' : 'Choose a date'}</button>{assignment && <button className="secondary-button" onClick={() => { onRemove(assignment, activity.kind); setNotice(`${activity.title} removed from ${tokyoFlexibleDays.find((day) => day.id === assignment)?.label}.`); }}>Remove</button>}</div>
        </div>
      </details>;
    })}{visibleActivities.length === 0 && <p className="inline-empty">No matching ideas. Try another search or activity type.</p>}</div></details>
  </section>;
}

function readTokyoChoices() {
  try { return parseTokyoChoices(window.localStorage.getItem(tokyoStorageKey) || '{}') ?? emptyTokyoChoices(); } catch { return emptyTokyoChoices(); }
}

export function App() {
  const [selectedDayId, setSelectedDayId] = useState<string | undefined>(() => { const requested = new URLSearchParams(window.location.search).get('day') || undefined; return tripDays.some((day) => day.id === requested) ? requested : undefined; });
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
  const [tokyoChoices, setTokyoChoices] = useState(readTokyoChoices);
  const [tokyoUndo, setTokyoUndo] = useState<ReturnType<typeof emptyTokyoChoices> | null>(null);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [todayInJapan, setTodayInJapan] = useState(japanDate);
  useEffect(() => {
    if (!mobileMenu) return;
    const trigger = document.querySelector<HTMLElement>('.menu-button');
    document.querySelector<HTMLElement>('#mobile-menu a')?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileMenu(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); if (document.activeElement?.closest('#mobile-menu')) trigger?.focus({ preventScroll: true }); };
  }, [mobileMenu]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const onChange = () => { if (!media.matches) setMobileMenu(false); };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  useEffect(() => { try { window.localStorage.setItem(tokyoStorageKey, JSON.stringify(tokyoChoices)); setStorageUnavailable(false); } catch { setStorageUnavailable(true); } }, [tokyoChoices]);
  const plannedDays = useMemo(() => buildPlannedDays(tripDays, tokyoChoices), [tokyoChoices]);
  const plannerBookings = useMemo(() => buildPlannerBookings(tokyoChoices), [tokyoChoices]);
  const entryPoint = relevantTripDay(plannedDays, todayInJapan);
  const beforeTrip = todayInJapan < plannedDays[0].id;
  const selectedDay = plannedDays.find((day) => day.id === selectedDayId);
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
    if (!initialDayLink.current) return;
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
  }, [plannedDays]);
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
    const bookingAttention = day.places.some(needsBookingAttention) || plannerBookings.some((booking) => booking.dayId === day.id && ['unbooked', 'verify'].includes(booking.status));
    return (baseFilter === 'all' || day.base.includes(baseFilter)) && (!daySearch.trim() || searchable.includes(normalizeSearchText(daySearch.trim()))) && (filter === 'all' || (filter === 'key' ? day.keyDay : filter === 'food' ? day.places.some((place) => place.type === 'food') : filter === 'booking' ? bookingAttention : filter === 'culture' || filter === 'nature' ? day.tags.includes(filter) : day.pacing === filter));
  }), [filter, plannedDays, baseFilter, daySearch, plannerBookings]);
  const assignTokyoActivity = useCallback((dayId: string, activityId: string, kind: 'outing' | 'evening') => {
    if (!flexibleDayIdSet.has(dayId) || !tokyoPoolActivities.some((activity) => activity.id === activityId && activity.kind === kind)) return;
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
  return <div className="app-shell"><a className="skip-link" href="#daily-plan">Skip to the daily plan</a><Header onMenu={() => setMobileMenu((open) => !open)} menuOpen={mobileMenu} onFind={openTripFinder} />{mobileMenu && <><div className="mobile-menu-backdrop" onClick={() => setMobileMenu(false)} aria-hidden="true" /><nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation"><button onClick={() => setMobileMenu(false)} className="icon-button" aria-label="Close navigation"><X /></button>{[['overview', 'Overview'], ['daily-plan', 'Daily plan'], ['tokyo-pool', 'Tokyo ideas'], ['bookings', 'Reservations'], ['stays', 'Stays'], ['budget', 'Budget']].map(([id, label]) => <a href={`#${id}`} key={id} onClick={() => setMobileMenu(false)}>{label}</a>)}</nav></>}<main>
    <section className="hero" id="overview"><div className="hero-orbit orbit-one" /><div className="hero-content"><span className="eyebrow">23 Oct — 11 Nov 2026 · two travelers</span><h1>Japan,<br /><em>at your pace.</em></h1><p className="hero-lede">Autumn in the north. Local food along the way. A little room to get lost in Tokyo.</p><small className="hero-time-note">Trip dates follow Japan local days; flight times use the local airport time.</small><div className="hero-actions">{entryPoint && <button type="button" className="primary-button" onClick={() => selectDay(entryPoint.day.id)}><CalendarDays size={17} /> {entryPoint.label} <ArrowRight size={16} /></button>}<a className="hero-booking-link" href="#daily-plan">Browse all days <ArrowRight size={16} /></a></div><div className="stats"><Stat label="nights" value={String(totalNights)} /><Stat label="bases" value={String(baseCities.length)} accent /><Stat label="travelers" value="2" /></div></div><aside className="trip-brief" aria-label="Trip readiness"><span className="brief-countdown"><span className="live-dot" />{beforeTrip ? `${daysUntilTrip} days until takeoff` : todayInJapan <= plannedDays[plannedDays.length - 1].id ? 'Enjoy the journey' : 'Your Japan travel notebook'}</span><h2>The big pieces are in place.</h2><p className="brief-confirmed"><Check size={16} /> All hotels & flights confirmed</p><div className="brief-tasks"><span className="eyebrow">Next, take care of these</span><button type="button" onClick={() => openBooking('booking-jr-east-south-hokkaido-pass')}><TrainFront size={19} /><span><strong>Rail pass & reserved seats</strong><small>Choose the tickets, then reserve trains</small></span><ArrowRight size={16} /></button><button type="button" onClick={() => openBooking('booking-gableview-dinner')}><BedDouble size={19} /><span><strong>Nikko inn arrangements</strong><small>Meals, taxis and luggage storage</small></span><ArrowRight size={16} /></button></div><a className="brief-all" href="#bookings">Review all {plannerBookings.filter((booking) => booking.status === 'unbooked' || booking.status === 'verify').length} advance actions <ArrowRight size={15} /></a></aside></section>
    <section className="section route-section" id="route-map"><SectionHeading eyebrow="Get your bearings" title="A journey from north to south"><span className="route-note"><Route size={16} /> Sapporo → Hakodate → Sendai → Tokyo ↔ Nikko</span></SectionHeading><p className="section-intro">Explore the bases, find a food stop, or open a day straight from the map.</p><div className="map-toolbar"><div className="map-layer-tabs" role="group" aria-label="Route map layers">{([['all', 'Trip bases'], ['sight', 'Sights'], ['food', 'Food'], ['stay', 'Hotels'], ['transit', 'Transport'], ['optional', 'Alternatives'], ['booking', 'To check']] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={mapFilter === value} className={mapFilter === value ? 'is-active' : ''} onClick={() => setMapFilter(value)}>{label}</button>)}</div></div><div className="map-shell"><MapView allDays={plannedDays} onSelectPlace={selectPlace} onOpenOverviewPlace={openOverviewPlace} onOpenOverviewDay={(day) => selectDay(day.id)} filter={mapFilter} /></div><div className="route-strip" aria-label="Route in travel order">{baseVisits.map((city, index) => <button type="button" className="route-stop" key={`${city.name}-${index}`} onClick={() => { const day = baseVisitArrival(city.name, baseVisits.slice(0, index).filter((visit) => visit.name === city.name).length, stays, plannedDays); if (day) selectDay(day.id); }}><span>{String(index + 1).padStart(2, '0')}</span><strong>{city.name}</strong><small>{city.nights} {city.nights === 1 ? 'night' : 'nights'} <ArrowRight size={12} /></small></button>)}</div></section>
    <section id="daily-plan" className="section daily-section"><SectionHeading eyebrow="Your travel notebook" title="Find your next good day"><span className="section-count"><CalendarDays size={16} /> {shownDays.length} of {plannedDays.length} days</span></SectionHeading><div className="planner-save-tools"><TravelPackButton choices={tokyoChoices} /><span>All days, hotels, reservation notes & your Tokyo picks · HTML file</span></div><div className="day-search-controls"><label className="day-search"><Search size={18} /><span className="sr-only">Search itinerary days and places</span><input type="search" placeholder="Search a day, place or meal…" value={daySearch} onChange={(event) => setDaySearch(event.target.value)} /></label><div className="filter-bar"><label className="sr-only" htmlFor="day-filter">Filter itinerary days</label><select id="day-filter" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">Every kind of day</option><option value="key">Anchor days</option><option value="food">Food stops</option><option value="culture">Culture</option><option value="nature">Nature</option><option value="booking">Booking attention</option><option value="light">Light pace</option><option value="balanced">Balanced pace</option><option value="full">Full pace</option></select></div></div><p className="planner-date-hint">Date shortcuts cover the whole trip, including travel days. Times use Japan local time except on the Madrid departure day.</p>{(daySearch || filter !== 'all' || baseFilter !== 'all') && <button type="button" className="planner-filter-reset" onClick={() => { setDaySearch(''); setFilter('all'); setBaseFilter('all'); }}>Clear filters</button>}<div className="base-tabs" role="group" aria-label="Filter days by base">{['all', 'Sapporo', 'Hakodate', 'Sendai', 'Tokyo', 'Nikko'].map((base) => <button type="button" key={base} className={baseFilter === base ? 'is-active' : ''} aria-pressed={baseFilter === base} onClick={() => setBaseFilter(base)}>{base === 'all' ? 'Whole trip' : base}</button>)}</div><nav className="date-jump-strip" aria-label="Jump to a trip date">{plannedDays.map((day) => <button type="button" key={day.id} aria-label={`Open ${shortDate(day.id)} itinerary`} aria-pressed={selectedDayId === day.id} className={selectedDayId === day.id ? 'is-active' : ''} onClick={() => selectDay(day.id)}><small>{day.weekday}</small><strong>{shortDate(day.id)}</strong><i className={day.keyDay ? 'anchor-dot' : ''} /></button>)}</nav><div className="day-explorer-layout"><div className="day-list" aria-label="Choose an itinerary day">{shownDays.map((day) => <DayCard key={day.id} day={day} selected={selectedDayId === day.id} onSelect={() => selectDay(day.id)} />)}{shownDays.length === 0 && <div className="day-empty"><Search size={24} /><h3>No matching days</h3><p>Try another place, or clear the filters to see the whole trip.</p><button className="secondary-button" onClick={() => { setDaySearch(''); setBaseFilter('all'); setFilter('all'); }}>Clear filters</button></div>}</div>{selectedDay && !mobile && <DayDetail day={selectedDay} selectedPlaceId={selectedPlaceId} onSelectPlace={selectPlace} onClose={closeDayFromControl} onChangeDay={changeDay} first={selectedIndex === 0} last={selectedIndex === plannedDays.length - 1} mobile={false} mapFilter={dayMapFilter} onMapFilterChange={setDayMapFilter} onOpenIdeas={() => openIdeas(selectedDay.id)} onOpenBooking={openBooking} planningWarning={tokyoTimingWarning(tokyoChoices.outings[selectedDay.id], tokyoChoices.evenings[selectedDay.id])} tokyoChoices={tokyoChoices} plannerBookings={plannerBookings} />}</div></section>
    <TokyoActivityPool outings={tokyoChoices.outings} evenings={tokyoChoices.evenings} onAssign={assignTokyoActivity} onRemove={removeTokyoActivity} onOpenDay={selectDay} storageUnavailable={storageUnavailable} preferredDay={ideasDay} requestedIdeaId={requestedIdeaId} requestId={ideasRequest} onReplace={(choices) => { setTokyoUndo(cloneTokyoChoices(tokyoChoices)); setTokyoChoices(choices); }} undoAvailable={Boolean(tokyoUndo)} onUndo={undoTokyoMutation} />
    <BookingBoard onSelectDay={selectDay} focusId={bookingFocus} plannerBookings={plannerBookings} /><AccommodationTimeline /><BudgetPanel />
  </main><footer><span>Japan, slowly · planning document for two</span><span>October — November 2026</span></footer><nav className="mobile-bottom-nav" aria-label="Quick navigation"><a href="#route-map"><MapIcon size={18} /><span>Map</span></a><a href="#daily-plan"><CalendarDays size={18} /><span>Days</span></a><a href="#tokyo-pool"><Compass size={18} /><span>Ideas</span></a><a href="#bookings"><ListChecks size={18} /><span>To do</span></a><button type="button" className="mobile-find" onClick={openTripFinder} aria-label="Find in your trip"><Search size={18} /><span>Find</span></button></nav><TripFinder open={finderOpen} onClose={() => setFinderOpen(false)} days={plannedDays} plannerBookings={plannerBookings} onNavigate={navigateFinderTarget} />{selectedDay && mobile && <><div className="dialog-backdrop" onClick={closeDayFromControl} /><DayDetail day={selectedDay} selectedPlaceId={selectedPlaceId} onSelectPlace={selectPlace} onClose={closeDayFromControl} onChangeDay={changeDay} first={selectedIndex === 0} last={selectedIndex === plannedDays.length - 1} mobile mapFilter={dayMapFilter} onMapFilterChange={setDayMapFilter} onOpenIdeas={() => openIdeas(selectedDay.id)} onOpenBooking={openBooking} planningWarning={tokyoTimingWarning(tokyoChoices.outings[selectedDay.id], tokyoChoices.evenings[selectedDay.id])} tokyoChoices={tokyoChoices} plannerBookings={plannerBookings} /></>}</div>;
}
