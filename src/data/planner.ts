import type { TripDay } from '../types/trip';
import { stays } from './trip';
import { tokyoPoolActivities, type TokyoPoolActivity } from './tokyoPool';
import { flexibleDayIdSet, tokyoPlacesForHotel, type TokyoChoices } from './tokyoChoices';

const minutes = (time: string) => Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]);
export function plannedSpanMinutes(activities: TokyoPoolActivity[]): number {
  const stops = activities.flatMap((activity) => activity.places).filter((place) => place.startTime);
  if (!stops.length) return 0;
  const first = Math.min(...stops.map((place) => minutes(place.startTime!)));
  const last = Math.max(...stops.map((place) => place.endTime ? minutes(place.endTime) : minutes(place.startTime!) + (place.durationMinutes ?? 0)));
  return Math.max(0, last - first);
}

export function tokyoPace(activities: TokyoPoolActivity[]): TripDay['pacing'] {
  const span = plannedSpanMinutes(activities);
  return span > 540 ? 'full' : span > 360 ? 'balanced' : 'light';
}

export function buildPlannedDays(days: TripDay[], choices: TokyoChoices): TripDay[] {
  return days.map((day) => {
    if (!flexibleDayIdSet.has(day.id)) return day;
    const selected = [choices.outings[day.id], choices.evenings[day.id]].map((id) => tokyoPoolActivities.find((activity) => activity.id === id)).filter((activity): activity is TokyoPoolActivity => Boolean(activity));
    const hotel = stays.find((stay) => stay.checkIn <= day.id && day.id < stay.checkOut);
    return {
      ...day,
      title: selected.length ? `Tokyo, your way · ${selected.map((activity) => activity.title).join(' + ')}` : 'Tokyo flex day · choose from the pool',
      summary: selected.length ? selected.map((activity) => activity.summary).join(' ') : 'No fixed sightseeing today. Pick one outing from the Tokyo activity pool below, or keep this day free.',
      pacing: tokyoPace(selected),
      dailyEstimateJPY: undefined,
      places: [...day.places.filter((place) => place.type === 'stay'), ...selected.flatMap((activity) => tokyoPlacesForHotel(activity, hotel))].sort((a, b) => (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99')),
    };
  });
}
