import type { TripDay } from '../types/trip';

export function japanDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function relevantTripDay(days: TripDay[], today: string): { day: TripDay; label: string } | undefined {
  if (!days.length) return undefined;
  if (today < days[0].id) return { day: days[0], label: 'Open first day' };
  const todayDay = days.find((day) => day.id === today);
  if (todayDay) return { day: todayDay, label: "Open today's plan" };
  if (today > days[days.length - 1].id) return { day: days[days.length - 1], label: 'Review final day' };
  const nextDay = days.find((day) => day.id > today);
  return nextDay ? { day: nextDay, label: 'Open next trip day' } : undefined;
}
