import type { Booking, Stay, TripDay } from '../types/trip';

export function dayBrief(day: TripDay, stays: Stay[], bookings: Booking[]) {
  return {
    tonight: stays.find((stay) => stay.checkIn <= day.id && day.id < stay.checkOut),
    leaving: stays.find((stay) => stay.checkOut === day.id),
    advance: bookings.filter((booking) => booking.dayId === day.id && ['unbooked', 'verify'].includes(booking.status)),
    onSite: bookings.filter((booking) => booking.dayId === day.id && booking.status === 'on-site'),
  };
}

export function baseVisitArrival(city: string, occurrence: number, stays: Stay[], days: TripDay[]): TripDay | undefined {
  const cityStays = stays.filter((stay) => stay.city === city).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const arrivals = cityStays.filter((stay, index) => index === 0 || cityStays[index - 1].checkOut !== stay.checkIn);
  return days.find((day) => day.id === arrivals[occurrence]?.checkIn);
}
