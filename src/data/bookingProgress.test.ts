import { describe, expect, it } from 'vitest';
import { bookings } from './trip';
import { buildPlannerBookings } from './bookingActions';
import { emptyTokyoChoices } from './tokyoChoices';
import { isOpenBooking, parseBookingProgress, withBookingProgress } from './bookingProgress';

describe('booking progress', () => {
  it('accepts known static and dynamic action IDs, including valid orphan dates', () => {
    const parsed = parseBookingProgress(JSON.stringify({
      'booking-tobu': '2026-10-15T10:00:00.000Z',
      'booking-tokyo-teamlab-ticket-2026-11-04': '2026-10-15T10:01:00.000Z',
    }));
    expect(parsed).toEqual({
      'booking-tobu': '2026-10-15T10:00:00.000Z',
      'booking-tokyo-teamlab-ticket-2026-11-04': '2026-10-15T10:01:00.000Z',
    });
  });

  it('rejects malformed, oversized, unknown IDs and noncanonical timestamps', () => {
    expect(parseBookingProgress('{')).toBeUndefined();
    expect(parseBookingProgress(' '.repeat(20_001))).toBeUndefined();
    expect(parseBookingProgress('{"unknown":"2026-10-15T10:00:00.000Z"}')).toBeUndefined();
    expect(parseBookingProgress('{"booking-tobu":"yesterday"}')).toBeUndefined();
    expect(parseBookingProgress('{"booking-tobu":"2026-10-15T10:00:00Z"}')).toBeUndefined();
  });

  it('annotates without changing source status and only open advance tasks count as open', () => {
    const source = [...bookings];
    const handled = withBookingProgress(source, { 'booking-tobu': '2026-10-15T10:00:00.000Z' });
    const item = handled.find((booking) => booking.id === 'booking-tobu')!;
    expect(item).toMatchObject({ status: 'unbooked', handledAt: '2026-10-15T10:00:00.000Z' });
    expect(isOpenBooking(item)).toBe(false);
    expect(isOpenBooking(source.find((booking) => booking.id === 'booking-tobu')!)).toBe(true);
    expect(source.find((booking) => booking.id === 'booking-tobu')?.handledAt).toBeUndefined();
    expect(isOpenBooking(source.find((booking) => booking.status === 'booked')!)).toBe(false);
  });

  it('keeps progress for a valid dynamic task after its date is no longer selected', () => {
    const orphan = 'booking-tokyo-teamlab-ticket-2026-11-04';
    const parsed = parseBookingProgress(JSON.stringify({ [orphan]: '2026-10-15T10:00:00.000Z' }))!;
    expect(withBookingProgress(buildPlannerBookings(emptyTokyoChoices()), parsed).some((booking) => booking.id === orphan)).toBe(false);
    expect(parsed[orphan]).toBe('2026-10-15T10:00:00.000Z');
  });
});
