import { BedDouble, ArrowRight, ExternalLink, ListChecks } from 'lucide-react';
import { dayBrief } from '../data/dayBrief';
import { bookings, stays, googleDirectionsUrl, googleMapsUrl } from '../data/trip';
import type { Booking, TripDay } from '../types/trip';

export function DayEssentials({ day, onOpenBooking, plannerBookings = bookings }: { day: TripDay; onOpenBooking: (id: string) => void; plannerBookings?: Booking[] }) {
  const { tonight, leaving, advance, onSite } = dayBrief(day, stays, plannerBookings);
  return <section className="day-essentials" aria-label="Day essentials">
    <h3 tabIndex={-1}>At a glance</h3>
    {(tonight || leaving) && <div className="day-hotel-brief"><BedDouble size={18} /><div>
      {tonight && <><span className="eyebrow">{tonight.checkIn === day.id ? 'Check in tonight · confirmed' : 'Tonight · confirmed'}</span><strong>{tonight.property}</strong><div className="day-hotel-links"><a href={googleDirectionsUrl(tonight.property)} target="_blank" rel="noopener noreferrer">Directions to hotel <ExternalLink size={12} /></a><a href={googleMapsUrl(tonight.property)} target="_blank" rel="noopener noreferrer">Hotel details <ExternalLink size={12} /></a></div></>}
      {leaving && <p className="day-checkout">Check out of {leaving.property}. Check the booking for checkout time and luggage arrangements.</p>}
    </div></div>}
    {advance.length > 0 && <details className="day-booking-brief"><summary><ListChecks size={16} /> Prepare before this day · {advance.length} open action{advance.length === 1 ? '' : 's'}</summary><ul>{advance.map((booking) => <li key={booking.id}><button type="button" onClick={() => onOpenBooking(booking.id)}><span><strong>{booking.item}</strong><small>{booking.status === 'unbooked' ? 'Not booked' : 'Needs checking'} · {booking.deadline}</small></span><ArrowRight size={15} /></button></li>)}</ul></details>}
    {onSite.length > 0 && <p className="day-onsite">{onSite.length} on-the-day purchase{onSite.length === 1 ? '' : 's'} · no advance booking planned. See the stops below.</p>}
    {!tonight && !leaving && <p className="day-onsite">Overnight travel · follow the flight timings below.</p>}
  </section>;
}
