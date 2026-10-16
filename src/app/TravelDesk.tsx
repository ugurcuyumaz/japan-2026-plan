import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BedDouble, CalendarDays, Clock3, Luggage, MapPin, PlaneTakeoff } from 'lucide-react';
import { stays, googleDirectionsUrl } from '../data/trip';
import { openPreparationTasks, travelDeskContext } from '../data/travelDesk';
import type { Booking, TripDay } from '../types/trip';
import type { ShortlistKey } from '../data/shortlist';
import type { TokyoChoices } from '../data/tokyoChoices';
import type { BookingProgress } from '../data/bookingProgress';
import { TravelPackButton } from './TravelPackButton';
import './travel-desk.css';

export interface TravelDeskProps {
  days: TripDay[];
  plannerBookings: Booking[];
  choices: TokyoChoices;
  bookingProgress?: BookingProgress;
  onOpenDay: (id: string) => void;
  onOpenBooking: (id: string) => void;
  today: string;
  savedKeys?: ShortlistKey[];
}

const dateOption = (day: TripDay) => `${day.weekday} · ${new Date(`${day.id}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })} · ${day.base}`;

export function TravelDesk({ days, plannerBookings, choices, bookingProgress, onOpenDay, onOpenBooking, today, savedKeys = [] }: TravelDeskProps) {
  const initialDate = travelDeskContext(days, today)?.selectedDay.id ?? '';
  const [selectedDayId, setSelectedDayId] = useState(initialDate);
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!days.some((day) => day.id === selectedDayId)) setSelectedDayId(initialDate);
  }, [days, initialDate, selectedDayId]);

  const context = useMemo(() => travelDeskContext(days, today, selectedDayId), [days, today, selectedDayId]);
  if (!context) return null;
  const { selectedDay, dateMode, shortcutLabel, nextDay, nextTransfer, nextTransferTimeLabel } = context;
  const hotel = stays.find((stay) => stay.checkIn <= selectedDay.id && selectedDay.id < stay.checkOut);
  const checkout = stays.find((stay) => stay.checkOut === selectedDay.id);
  const { items: prepTasks, exactCount } = openPreparationTasks(plannerBookings, selectedDay.id);
  const isOvernightFlight = selectedDay.places.some((place) => place.id === 'ib281-outbound');
  const japanTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(clock);
  const japanCurrentDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', weekday: 'short', day: 'numeric', month: 'short' }).format(clock);
  const shortSelectedDate = new Date(`${selectedDay.id}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const hotelHeading = isOvernightFlight && !hotel ? 'Overnight travel' : selectedDay.id === today ? 'Tonight' : `Hotel · ${shortSelectedDate}`;
  const displayedDate = new Date(`${selectedDay.id}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

  const goToShortcut = () => {
    const target = context.actualTripDay ?? (dateMode === 'before' ? days[0] : dateMode === 'after' ? days[days.length - 1] : undefined);
    if (target) setSelectedDayId(target.id);
  };

  return <section id="travel-desk" className="travel-desk" aria-labelledby="travel-desk-title">
    <div className="travel-desk-heading">
      <div><span className="eyebrow">Your trip, at a glance</span><h2 id="travel-desk-title">Travel desk</h2></div>
      <div className="travel-desk-clock" aria-live="off"><Clock3 size={16} /><span>{japanCurrentDate} · Japan time <strong>{japanTime}</strong></span></div>
    </div>
    <div className="travel-desk-grid">
      <div className="travel-desk-preview">
        <div className="travel-desk-date-controls">
          <label htmlFor="travel-desk-date">Preview a trip day</label>
          <select id="travel-desk-date" value={selectedDay.id} onChange={(event) => setSelectedDayId(event.target.value)}>
            {days.map((day) => <option key={day.id} value={day.id}>{dateOption(day)}</option>)}
          </select>
          <div className="travel-desk-shortcuts">
            <button type="button" className="travel-desk-shortcut" onClick={goToShortcut}>{shortcutLabel}</button>
            {nextDay && <button type="button" className="travel-desk-shortcut" onClick={() => setSelectedDayId(nextDay.id)}>Next day <ArrowRight size={14} /></button>}
          </div>
        </div>
        <div className="travel-desk-day-summary">
          <span className="eyebrow">{dateMode === 'before' ? 'Preview · before your trip' : dateMode === 'after' ? 'Preview · after your trip' : 'Selected day'}</span>
          <h3>{displayedDate} · {selectedDay.base}</h3>
          <p className="travel-desk-day-title">{selectedDay.title}</p><details className="travel-desk-overview" key={selectedDay.id}><summary>Day overview & timing</summary><p>{selectedDay.summary}</p></details>
          <button type="button" className="travel-desk-open-day" onClick={() => onOpenDay(selectedDay.id)}>Open day plan <ArrowRight size={16} /></button>
        </div>
      </div>

      <div className="travel-desk-card travel-desk-stay">
        <div className="travel-desk-card-title">{hotel ? <BedDouble size={18} /> : isOvernightFlight ? <PlaneTakeoff size={18} /> : <BedDouble size={18} />}<h3>{hotelHeading}</h3></div>
        {hotel ? <>
          <span className="travel-desk-confirmed">Confirmed reservation</span>
          <strong className="travel-desk-property">{hotel.property}</strong>
          <a className="travel-desk-directions" href={googleDirectionsUrl(hotel.property)} target="_blank" rel="noopener noreferrer"><MapPin size={15} /> Directions to hotel <span className="sr-only">(opens in a new tab)</span></a>
        </> : isOvernightFlight ? <p className="travel-desk-muted">Overnight flight · follow local airport times in the day plan.</p> : <p className="travel-desk-muted">No confirmed hotel is listed for this night.</p>}
        {checkout && <p className="travel-desk-luggage"><Luggage size={16} /><span>Check out of {checkout.property}. Check the booking for checkout time and luggage arrangements.</span></p>}
      </div>

      <div className="travel-desk-card travel-desk-prep">
        <div className="travel-desk-card-title"><CalendarDays size={18} /><h3>{exactCount ? 'Prepare for selected day' : 'Next open actions'}</h3></div>
        {prepTasks.length ? <ul className="travel-desk-task-list">{prepTasks.map((booking) => <li key={booking.id}><button type="button" onClick={() => onOpenBooking(booking.id)}><span><strong>{booking.item}</strong><small>{booking.date} · {booking.status === 'unbooked' ? 'Not booked' : 'Needs checking'} · {booking.deadline}</small></span><ArrowRight size={15} /></button></li>)}</ul> : <p className="travel-desk-muted">No open actions remain for this or a later date.</p>}
        <p className="travel-desk-progress-note">Handled tasks record your progress; source reservation statuses stay unchanged.</p>
      </div>

      <div className="travel-desk-card travel-desk-next">
        <div className="travel-desk-card-title"><PlaneTakeoff size={18} /><h3>Next day · {nextDay ? nextDay.weekday : 'End of trip'}</h3></div>
        {nextDay ? <>
          <strong className="travel-desk-next-date">{dateOption(nextDay)}</strong>
          {nextTransfer ? <div className="travel-desk-transfer"><span className="travel-desk-transfer-time">{nextTransfer.startTime}</span><span><strong>{nextTransfer.name}</strong><small>Planned transfer · {nextTransferTimeLabel}</small></span></div> : <p className="travel-desk-muted">No timed transfer is planned for this day.</p>}
          <button type="button" className="travel-desk-inline-link" onClick={() => onOpenDay(nextDay.id)}>Open next day plan <ArrowRight size={15} /></button>
        </> : <p className="travel-desk-muted">This is the final planned trip day.</p>}
      </div>
    </div>
    <div className="travel-desk-footer"><TravelPackButton choices={choices} dayId={selectedDay.id} bookingProgress={bookingProgress} savedKeys={savedKeys} /><span>Save this day to open offline</span><nav className="travel-desk-tool-links" aria-label="Travel desk tools"><a href="#route-map">Trip map</a><a href="#saved-ideas">Saved ideas · {savedKeys.length}</a><a href="#planner-backup">Backup & restore</a></nav></div>
  </section>;
}
