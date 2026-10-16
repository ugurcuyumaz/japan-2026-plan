import type { TripDay } from '../types/trip';

export type DayHistoryDecision = 'push' | 'replace' | 'back' | 'none';

export function dayHistoryDecision(currentDayId: string | undefined, targetDayId: string | undefined, ownedEntry: boolean): DayHistoryDecision {
  if (currentDayId === targetDayId) return 'none';
  if (targetDayId) return currentDayId ? 'replace' : 'push';
  if (!currentDayId) return 'none';
  return ownedEntry ? 'back' : 'replace';
}

export function dayTimeLabel(day: TripDay): string {
  const internationalFlight = day.places.some((place) => place.id === 'ib281-outbound' && place.travelMode === 'flight');
  return internationalFlight ? 'Local airport times · Madrid departure / Japan arrival next day' : 'Japan local time';
}

export function scrollToTarget(target: Element | null | undefined, block: ScrollLogicalPosition = 'start', immediate = false): void {
  if (!target) return;
  const instant = immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const previousScrollBehavior = instant ? root.style.scrollBehavior : '';
  if (instant) root.style.scrollBehavior = 'auto';
  target.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block });
  if (instant) root.style.scrollBehavior = previousScrollBehavior;
}

export function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

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
