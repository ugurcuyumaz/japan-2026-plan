import type { Booking } from '../types/trip';
import { shortDate } from './map';
import { bookings } from './trip';
import { tokyoPoolActivities } from './tokyoPool';
import type { TokyoChoices } from './tokyoChoices';

/** Static trip tasks plus only the advance actions for currently assigned Tokyo ideas. */
export function buildPlannerBookings(choices: TokyoChoices): Booking[] {
  const selected: { dayId: string; activityId: string }[] = [];
  for (const [dayId, activityId] of Object.entries(choices.outings)) selected.push({ dayId, activityId });
  for (const [dayId, activityId] of Object.entries(choices.evenings)) selected.push({ dayId, activityId });

  const dynamic = selected.flatMap(({ dayId, activityId }) => {
    const activity = tokyoPoolActivities.find((item) => item.id === activityId);
    return (activity?.bookingActions ?? []).map((action): Booking => ({
      id: `booking-tokyo-${action.id}-${dayId}`,
      item: action.item,
      date: shortDate(dayId),
      priority: action.priority,
      status: 'unbooked',
      deadline: action.deadline,
      destination: action.destination,
      purchaseUrl: action.purchaseUrl,
      purchaseLabel: action.purchaseLabel,
      referenceUrl: action.referenceUrl,
      referenceLabel: action.referenceLabel,
      notes: action.notes,
      dayId,
    }));
  });

  return [...bookings, ...dynamic];
}
