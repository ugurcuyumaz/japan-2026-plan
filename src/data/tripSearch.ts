import type { Booking, Stay, TripDay } from '../types/trip';
import { stays as tripStays } from './trip';
import { tokyoPoolActivities } from './tokyoPool';
import { tokyoResources } from './tokyoPractical';
import { normalizeSearchText } from './navigation';

export type TripSearchTarget =
  | { kind: 'day'; dayId: string; placeId?: string }
  | { kind: 'booking'; bookingId: string }
  | { kind: 'stay'; stayId: string }
  | { kind: 'idea'; ideaId: string }
  | { kind: 'resource'; resourceId: string }
  | { kind: 'section'; sectionId: string };

export type TripSearchKind = 'day' | 'place' | 'booking' | 'stay' | 'idea' | 'resource' | 'section';

export interface TripSearchResult {
  id: string;
  kind: TripSearchKind;
  title: string;
  subtitle: string;
  target: TripSearchTarget;
  searchText: string;
}

const coreSections = [
  { id: 'travel-desk', title: 'Travel desk', keywords: 'today tomorrow preview hotel checkout preparation' },
  { id: 'overview', title: 'Trip overview', keywords: 'dates travelers countdown' },
  { id: 'saved-ideas', title: 'Saved ideas', keywords: 'saved shortlist favorites favourite bookmarks' },
  { id: 'planner-backup', title: 'Backup and restore', keywords: 'backup restore import json export decisions devices progress' },
  { id: 'route-map', title: 'Route map', keywords: 'map cities route hotels places' },
  { id: 'daily-plan', title: 'Daily plan', keywords: 'itinerary days schedule' },
  { id: 'city-guide', title: 'City food and activity alternatives', keywords: 'city guide alternatives food restaurants indoor swaps sightseeing' },
  { id: 'tokyo-practical', title: 'English workshops and local food', keywords: 'workshop English lesson restaurant izakaya near hotel' },
  { id: 'share-plan', title: 'Share your plan', keywords: 'share snapshot link partner device saving sync' },
  { id: 'tokyo-pool', title: 'Tokyo ideas', keywords: 'ideas outings activities tokyo pool' },
  { id: 'bookings', title: 'Reservations and to-dos', keywords: 'booking tickets train reserve tasks' },
  { id: 'stays', title: 'Confirmed stays', keywords: 'hotels accommodation lodging' },
  { id: 'budget', title: 'Budget', keywords: 'cost price estimate money' },
] as const;

const dateLabel = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const fieldsText = (...fields: (string | undefined)[]) => fields.filter(Boolean).join(' ');

export function buildTripSearchIndex(days: TripDay[], plannerBookings: Booking[], stays: Stay[] = tripStays): TripSearchResult[] {
  const results: TripSearchResult[] = [];

  for (const day of days) {
    const dayCaption = `${day.weekday} ${dateLabel(day.id)} · ${day.base}`;
    results.push({
      id: `day-${day.id}`,
      kind: 'day',
      title: day.title,
      subtitle: `${dayCaption} · day plan`,
      target: { kind: 'day', dayId: day.id },
      searchText: fieldsText(day.id, day.title, day.base, dayCaption, day.summary, day.tags.join(' ')),
    });
    for (const place of day.places) {
      if (place.type === 'stay' && !place.startTime) continue;
      results.push({
        id: `place-${day.id}-${place.id}`,
        kind: 'place',
        title: place.name,
        subtitle: `${dayCaption}${place.mealContext ? ` · ${place.mealContext}` : ''}${place.cuisine ? ` · ${place.cuisine}` : ''}`,
        target: { kind: 'day', dayId: day.id, placeId: place.id },
        searchText: fieldsText(day.id, day.date, dayCaption, place.name, place.cuisine, place.signature, place.mealContext, place.description, day.title, day.base),
      });
    }
  }

  for (const stay of stays) {
    results.push({
      id: `stay-${stay.id}`,
      kind: 'stay',
      title: stay.property,
      subtitle: `${stay.city} · ${stay.dates} · ${stay.status === 'booked' ? 'confirmed stay' : 'stay'}`,
      target: { kind: 'stay', stayId: stay.id },
      searchText: fieldsText(stay.property, stay.city, stay.dates, stay.note, 'hotel stay'),
    });
  }

  for (const booking of plannerBookings) {
    results.push({
      id: `booking-${booking.id}`,
      kind: 'booking',
      title: booking.item,
      subtitle: `${booking.date} · ${booking.status === 'booked' ? 'confirmed' : booking.status === 'on-site' ? 'buy on the day' : booking.handledAt ? 'Handled by you' : 'to do'}`,
      target: { kind: 'booking', bookingId: booking.id },
      searchText: fieldsText(booking.item, booking.destination, booking.date, booking.deadline, booking.notes),
    });
  }

  for (const idea of tokyoPoolActivities) {
    results.push({
      id: `idea-${idea.id}`,
      kind: 'idea',
      title: idea.title,
      subtitle: `${idea.area} · ${idea.durationLabel}`,
      target: { kind: 'idea', ideaId: idea.id },
      searchText: fieldsText(idea.title, idea.area, idea.summary, idea.routeNote, idea.weatherFit, ...(idea.themes ?? []), ...idea.places.flatMap((place) => [place.name, place.cuisine, place.signature])),
    });
  }

  for (const resource of tokyoResources) {
    results.push({ id: `resource-${resource.id}`, kind: 'resource', title: resource.title, subtitle: `${resource.kind === 'workshop' ? 'English workshop' : 'Food near hotel'} · ${resource.area}`, target: { kind: 'resource', resourceId: resource.id }, searchText: fieldsText(resource.title, resource.area, resource.description, resource.languageLabel, resource.scheduleNote, ...resource.notes) });
  }

  for (const section of coreSections) {
    results.push({
      id: `section-${section.id}`,
      kind: 'section',
      title: section.title,
      subtitle: 'Planner section',
      target: { kind: 'section', sectionId: section.id },
      searchText: fieldsText(section.title, section.keywords),
    });
  }

  return results;
}

function scoreResult(result: TripSearchResult, normalizedQuery: string, terms: string[]): number | undefined {
  if (result.target.kind === 'day' && (normalizedQuery === result.target.dayId || normalizedQuery === normalizeSearchText(dateLabel(result.target.dayId)))) return result.kind === 'day' ? -2 : -1;
  const title = normalizeSearchText(result.title);
  const fullText = normalizeSearchText(result.searchText);
  if (!terms.every((term) => fullText.includes(term))) return undefined;
  if (title === normalizedQuery) return 0;
  if (title.startsWith(normalizedQuery)) return 1;
  if (title.includes(normalizedQuery)) return 2;
  return 3;
}

export function searchTripIndex(index: TripSearchResult[], query: string, limit = 16): { results: TripSearchResult[]; totalMatches: number } {
  const normalizedQuery = normalizeSearchText(query.trim());
  if (!normalizedQuery) return { results: [], totalMatches: 0 };
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const matches = index.flatMap((result, order) => {
    const score = scoreResult(result, normalizedQuery, terms);
    return score === undefined ? [] : [{ result, score, order }];
  }).sort((a, b) => a.score - b.score || a.order - b.order);
  return { results: matches.slice(0, Math.max(0, limit)).map(({ result }) => result), totalMatches: matches.length };
}

export const tripSearchSectionShortcuts = coreSections.map(({ id, title }) => ({ id, title, target: { kind: 'section', sectionId: id } as const }));
