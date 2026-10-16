import type { Booking, Place, TripDay } from '../types/trip';
import { isOpenBooking } from './bookingProgress';
import { dayTimeLabel, relevantTripDay } from './navigation';

export interface TravelDeskContext {
  selectedDay: TripDay;
  selectedIndex: number;
  actualTripDay?: TripDay;
  dateMode: 'before' | 'during' | 'after';
  shortcutLabel: 'Today' | 'First day' | 'Final day';
  nextDay?: TripDay;
  nextTransfer?: Place;
  nextTransferTimeLabel?: string;
}

/** Resolve the preview date without changing or inferring anything in the plan. */
export function travelDeskContext(days: TripDay[], today: string, selectedDayId?: string): TravelDeskContext | undefined {
  if (!days.length) return undefined;
  const selectedDay = days.find((day) => day.id === selectedDayId) ?? relevantTripDay(days, today)?.day ?? days[0];
  const selectedIndex = days.indexOf(selectedDay);
  const actualTripDay = days.find((day) => day.id === today);
  const dateMode = today < days[0].id ? 'before' : today > days[days.length - 1].id ? 'after' : 'during';
  const nextDay = days[selectedIndex + 1];
  const nextTransfer = nextDay && firstPlannedTransfer(nextDay);
  return {
    selectedDay,
    selectedIndex,
    actualTripDay,
    dateMode,
    shortcutLabel: actualTripDay ? 'Today' : dateMode === 'before' ? 'First day' : dateMode === 'after' ? 'Final day' : 'Today',
    nextDay,
    nextTransfer,
    nextTransferTimeLabel: nextTransfer ? dayTimeLabel(nextDay!) : undefined,
  };
}

/** First timed, planned transfer on a day; backup/alternative rows are excluded. */
export function firstPlannedTransfer(day: TripDay): Place | undefined {
  return day.places
    .filter((place) => place.type === 'transit' && place.role !== 'backup' && Boolean(place.startTime))
    .sort((a, b) => a.startTime!.localeCompare(b.startTime!))[0];
}

/** Exact-day actions first, then upcoming or undated tasks; past dated actions stay out of later previews. */
export function openPreparationTasks(bookings: Booking[], dayId: string, limit = 3): { items: Booking[]; exactCount: number } {
  const open = bookings.filter(isOpenBooking);
  const priority = { required: 0, recommended: 1, research: 2 };
  const dependency = (item: Booking) => item.id === 'booking-jr-east-south-hokkaido-pass' ? -1 : 0;
  const byDate = (a: Booking, b: Booking) => (a.dayId ?? '9999-12-31').localeCompare(b.dayId ?? '9999-12-31') || dependency(a) - dependency(b) || priority[a.priority] - priority[b.priority] || a.deadline.localeCompare(b.deadline);
  const exact = open.filter((booking) => booking.dayId === dayId).sort(byDate);
  const upcoming = open.filter((booking) => booking.dayId !== dayId && (!booking.dayId || booking.dayId > dayId)).sort(byDate);
  const items = [...exact, ...upcoming].slice(0, limit);
  return { items, exactCount: items.filter((booking) => booking.dayId === dayId).length };
}
