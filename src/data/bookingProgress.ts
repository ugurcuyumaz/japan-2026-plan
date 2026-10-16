import type { Booking } from '../types/trip';
import { bookings as sourceBookings } from './trip';
import { flexibleDayIdSet } from './tokyoChoices';
import { tokyoPoolActivities } from './tokyoPool';

export type BookingProgress = Record<string, string>;
export const bookingProgressStorageKey = 'japan-2026-booking-progress-v1';
const maxRawLength = 20_000;

const staticActionIds = new Set(sourceBookings
  .filter((booking) => booking.status === 'unbooked' || booking.status === 'verify')
  .map((booking) => booking.id));
const dynamicActionIds = new Set<string>();
for (const dayId of flexibleDayIdSet) {
  for (const activity of tokyoPoolActivities) {
    for (const action of activity.bookingActions ?? []) dynamicActionIds.add(`booking-tokyo-${action.id}-${dayId}`);
  }
}

const isKnownActionId = (id: string) => staticActionIds.has(id) || dynamicActionIds.has(id);
const isCanonicalIsoTimestamp = (value: string) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
};

/** Parses only bounded, known action IDs and canonical ISO timestamps. Valid orphan dynamic IDs survive date/choice changes. */
export function parseBookingProgress(raw: string): BookingProgress | undefined {
  if (raw.length > maxRawLength) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    const progress: BookingProgress = {};
    for (const [id, handledAt] of Object.entries(value)) {
      if (!isKnownActionId(id) || typeof handledAt !== 'string' || !isCanonicalIsoTimestamp(handledAt)) return undefined;
      progress[id] = handledAt;
    }
    return progress;
  } catch {
    return undefined;
  }
}

export function withBookingProgress(bookings: Booking[], progress: BookingProgress): Booking[] {
  return bookings.map((booking) => {
    const handledAt = isKnownActionId(booking.id) ? progress[booking.id] : undefined;
    if (!handledAt) return booking;
    return { ...booking, handledAt };
  });
}

export function isOpenBooking(booking: Booking): boolean {
  return (booking.status === 'unbooked' || booking.status === 'verify') && !booking.handledAt;
}
