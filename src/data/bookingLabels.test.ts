import { describe, expect, it } from 'vitest';
import { bookingStateLabel } from './bookingLabels';

describe('traveler-facing booking labels', () => {
  it('maps each actionable state and hides states with no reservation action', () => {
    expect(bookingStateLabel('booked')).toBe('Confirmed');
    expect(bookingStateLabel('required')).toBe('Booking needed');
    expect(bookingStateLabel('recommended')).toBe('Reservation suggested');
    expect(bookingStateLabel('research')).toBe('Check details');
    expect(bookingStateLabel('not-needed')).toBe('');
    expect(bookingStateLabel()).toBe('');
  });
});
