import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, Check, ChevronDown, ExternalLink, Undo2, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { bookingPartyEstimateJPY, bookingSupportingLinks, googleMapsUrl, stays } from '../data/trip';
import { isOpenBooking } from '../data/bookingProgress';
import { scrollToTarget } from '../data/navigation';
import type { Booking } from '../types/trip';
import './booking-progress.css';

export interface BookingBoardProps {
  onSelectDay: (dayId?: string) => void;
  focusId?: string;
  plannerBookings: Booking[];
  onSetHandled: (id: string, handled: boolean) => void;
  children?: ReactNode;
}

type BookingView = 'advance' | 'day-of' | 'handled';
const yenPerEuroReference = 177.39;

export function BookingBoard({ onSelectDay, focusId, plannerBookings, onSetHandled, children }: BookingBoardProps) {
  const [view, setView] = useState<BookingView>('advance');
  const consumedFocus = useRef<string>();
  const [announcement, setAnnouncement] = useState('');
  const advance = useMemo(() => plannerBookings.filter(isOpenBooking).sort((a, b) => {
    const priority = { required: 0, recommended: 1, research: 2 };
    const dependency = (bookingId: string) => bookingId === 'booking-jr-east-south-hokkaido-pass' ? -1 : 0;
    return dependency(a.id) - dependency(b.id) || priority[a.priority] - priority[b.priority] || (a.dayId ?? '9999-12-31').localeCompare(b.dayId ?? '9999-12-31');
  }), [plannerBookings]);
  const dayOf = plannerBookings.filter((booking) => booking.status === 'on-site').sort((a, b) => (a.dayId ?? '9999-12-31').localeCompare(b.dayId ?? '9999-12-31'));
  const handled = plannerBookings.filter((booking) => booking.handledAt && ['unbooked', 'verify'].includes(booking.status));
  const confirmed = plannerBookings.filter((booking) => booking.status === 'booked');
  const bookedStays = stays.filter((stay) => stay.status === 'booked');
  const visible = view === 'advance' ? advance : view === 'day-of' ? dayOf : handled;

  useEffect(() => {
    if (!focusId) { consumedFocus.current = undefined; return; }
    if (consumedFocus.current === focusId) return;
    const booking = plannerBookings.find((item) => item.id === focusId);
    if (!booking) return;
    consumedFocus.current = focusId;
    setView(booking.status === 'on-site' ? 'day-of' : booking.handledAt ? 'handled' : booking.status === 'booked' ? 'advance' : 'advance');
    const frame = window.requestAnimationFrame(() => {
      if (booking.status === 'booked') {
        const details = document.querySelector<HTMLDetailsElement>('.booking-progress-confirmed');
        if (details) details.open = true;
      }
      const entry = document.getElementById(focusId) as HTMLDetailsElement | null;
      if (entry) {
        scrollToTarget(entry, 'center');
        entry.focus({ preventScroll: true });
        if (entry instanceof HTMLDetailsElement) entry.open = true;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusId, plannerBookings]);

  const markHandled = (booking: Booking, value: boolean) => {
    onSetHandled(booking.id, value);
    setView(value ? 'handled' : 'advance');
    window.requestAnimationFrame(() => { const entry = document.getElementById(booking.id); scrollToTarget(entry, 'center'); entry?.querySelector<HTMLElement>('.booking-progress-toggle')?.focus({ preventScroll: true }); });
    setAnnouncement(`${booking.item} ${value ? 'marked handled' : 'reopened'}.`);
  };

  return <section id="bookings" className="section booking-progress-board">
    <header className="booking-progress-heading"><div><span className="eyebrow">Action board · reservations, transport & tickets</span><h2>A few things to arrange</h2></div><span className="booking-progress-count"><Zap size={16} /> {advance.length} open actions</span></header>
    <p className="booking-progress-intro">Arrange the seats, transfers and inn details that need attention. Day-of purchases stay separate. Mark an action handled when you’ve taken care of it; this records your progress and does not change its reservation status. Estimates are for two unless labeled per adult.</p>
    {children}
    <div className="booking-progress-views" role="group" aria-label="Booking action view">
      <button type="button" className={view === 'advance' ? 'is-active' : ''} aria-pressed={view === 'advance'} onClick={() => setView('advance')}>Before travel <span>{advance.length}</span></button>
      <button type="button" className={view === 'day-of' ? 'is-active' : ''} aria-pressed={view === 'day-of'} onClick={() => setView('day-of')}>Buy on the day <span>{dayOf.length}</span></button>
      <button type="button" className={view === 'handled' ? 'is-active' : ''} aria-pressed={view === 'handled'} onClick={() => setView('handled')}>Handled <span>{handled.length}</span></button>
    </div>
    <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    <div className="booking-progress-list" aria-live="polite">
      {visible.map((booking) => <details className={`booking-progress-entry priority-${booking.priority}${booking.handledAt ? ' is-handled' : ''}`} key={booking.id} id={booking.id} tabIndex={-1}>
        <summary><span className="booking-progress-tag">{booking.status === 'on-site' ? 'DAY OF' : booking.handledAt ? 'HANDLED' : booking.status === 'verify' ? 'CHECK' : booking.priority === 'required' ? 'BOOK' : booking.priority === 'recommended' ? 'CONFIRM' : 'CHECK'}</span><span className="booking-progress-main"><strong>{booking.item}</strong><small><CalendarDays size={13} /> {booking.date} · {booking.deadline}</small></span><span className="booking-progress-cost">{booking.estimatedCostJPY ? `¥${bookingPartyEstimateJPY(booking)?.toLocaleString('en-GB')}` : 'Cost varies'}<small>{booking.estimatedCostJPY ? `for two · ≈ €${Math.round((bookingPartyEstimateJPY(booking) ?? 0) / yenPerEuroReference).toLocaleString('en-GB')}${booking.priceBasis === 'per-adult' ? ` · ¥${booking.estimatedCostJPY.toLocaleString('en-GB')}/adult` : ''}` : 'check at booking'}</small></span><ChevronDown className="booking-progress-chevron" size={17} aria-hidden="true" /></summary>
        <div className="booking-progress-details"><p>{booking.notes}</p>
          {booking.handledAt && <p className="booking-progress-handled-label"><Check size={15} /> Handled by you · {new Date(booking.handledAt).toLocaleString()}</p>}
          <div className="booking-progress-links">{booking.mapsQuery && <a href={googleMapsUrl(booking.mapsQuery)} target="_blank" rel="noopener noreferrer">Map location <ExternalLink size={12} /></a>}{booking.purchaseUrl && <a href={booking.purchaseUrl} target="_blank" rel="noopener noreferrer">{booking.purchaseLabel ?? 'Buy / reserve'} <ExternalLink size={12} /></a>}{booking.referenceUrl && <a href={booking.referenceUrl} target="_blank" rel="noopener noreferrer">{booking.referenceLabel ?? 'Official information'} <ExternalLink size={12} /></a>}{[...(booking.extraLinks ?? []), ...(bookingSupportingLinks[booking.id] ?? [])].map((item) => <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer">{item.label} <ExternalLink size={12} /></a>)}<button type="button" className="booking-progress-text-button" onClick={() => onSelectDay(booking.dayId)}>Open related day <ArrowRight size={14} /></button></div>
          {['unbooked', 'verify'].includes(booking.status) && <button type="button" className="booking-progress-toggle" onClick={() => markHandled(booking, !booking.handledAt)}>{booking.handledAt ? <><Undo2 size={15} /> Reopen</> : <><Check size={15} /> Mark handled</>}</button>}
        </div>
      </details>)}
      {visible.length === 0 && <p className="booking-progress-empty">{view === 'handled' ? 'No actions marked handled yet.' : view === 'advance' ? 'All advance actions are handled.' : 'No day-of purchases are listed.'}</p>}
    </div>
    <details className="booking-progress-confirmed"><summary><span><Check size={15} /> Confirmed · {bookedStays.length} hotels + {confirmed.length} flight bookings</span><ChevronDown size={17} aria-hidden="true" /></summary><div>{bookedStays.map((stay) => <article key={stay.id}><div><strong>{stay.property}</strong><small>{stay.dates} · {stay.city}</small></div><span>€{stay.costEUR?.toLocaleString('en-GB') ?? 'confirmed'}</span></article>)}{confirmed.map((booking) => <article id={booking.id} tabIndex={-1} key={booking.id}><div><strong>{booking.item}</strong><small>{booking.date} · {booking.destination}</small></div><span>{booking.estimatedCostJPY ? `¥${bookingPartyEstimateJPY(booking)?.toLocaleString('en-GB')}` : 'Confirmed · cost not entered'}</span></article>)}</div></details>
  </section>;
}
