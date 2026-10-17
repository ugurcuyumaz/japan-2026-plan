import { buildPlannerBackup, parsePlannerBackup, type PlannerPersonalState } from './plannerBackup';
import { tripDays } from './trip';

export const maxPersonalShareLength = 12_000;
export const hasPersonalPlanLink = (href: string) => new URLSearchParams(new URL(href).hash.slice(1)).has('plan');
export function personalPlanShareUrl(href: string, state: PlannerPersonalState, dayId?: string, now = new Date()): string | undefined {
  const url = new URL(href);
  url.search = '';
  if (dayId) {
    if (!tripDays.some((day) => day.id === dayId)) return undefined;
    url.searchParams.set('day', dayId);
  }
  const fragment = new URLSearchParams();
  fragment.set('plan', JSON.stringify(JSON.parse(buildPlannerBackup(state, now))));
  url.hash = fragment.toString();
  return url.href.length <= maxPersonalShareLength ? url.href : undefined;
}
export function parsePersonalPlanLink(href: string) {
  if (href.length > maxPersonalShareLength) return undefined;
  const raw = new URLSearchParams(new URL(href).hash.slice(1)).get('plan');
  return raw ? parsePlannerBackup(raw) : undefined;
}
export function sharedDayId(href: string): string | undefined {
  const id = new URL(href).searchParams.get('day');
  return tripDays.some((day) => day.id === id) ? id! : undefined;
}
export function withoutPersonalPlanLink(href: string): string {
  const url = new URL(href);
  url.hash = sharedDayId(href) ? 'daily-plan' : 'share-plan';
  return url.href;
}
