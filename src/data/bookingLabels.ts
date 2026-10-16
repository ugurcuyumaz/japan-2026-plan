import type { BookingState } from '../types/trip';

export function bookingStateLabel(state?: BookingState): string {
  if (state === 'booked') return 'Confirmed';
  if (state === 'required') return 'Booking needed';
  if (state === 'recommended') return 'Reservation suggested';
  if (state === 'research') return 'Check details';
  return '';
}
