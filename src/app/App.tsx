import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, Polyline, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  ArrowLeft, ArrowRight, BedDouble, CalendarDays, Check, ChevronDown, CircleAlert, CircleHelp,
  Clock3, Coffee, ExternalLink, Filter, Footprints, Landmark, Map as MapIcon, Menu, Moon, Mountain,
  Navigation, Plane, Printer, Route, TrainFront, Utensils, X, Zap,
} from 'lucide-react';
import { baseCities, baseVisits, bookings, budgetCategories, budgetTotals, confirmedHotelTotalEUR, googleDirectionsUrl, googleMapsUrl, openItems, stays, totalNights, tripDays } from '../data/trip';
import { tokyoFlexibleDays, tokyoPoolActivities } from '../data/tokyoPool';
import { individualRailTotalJPY, railDecision } from '../data/rail';
import type { BookingState, ItemType, Place, TripDay } from '../types/trip';

const formatJPY = (amount: number) => `¥${amount.toLocaleString('en-US')}`;
const railPassWindowLabel = `${new Date(`${railDecision.validFrom}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}–${new Date(`${railDecision.validThrough}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}`;
const yenPerEuro = 177.39; // ECB reference rate published 14 Oct 2026; budget conversions are indicative only.
const formatApproxEUR = (yen: number) => `€${Math.round(yen / yenPerEuro).toLocaleString('en-GB')}`;
const itemLabel: Record<ItemType, string> = { sight: 'Sight', food: 'Food', optional: 'Optional', transit: 'Transit', stay: 'Stay', booking: 'Book / verify', note: 'Note' };
const itemGlyph: Record<ItemType, string> = { sight: '✦', food: '🍜', optional: '○', transit: '→', stay: '⌂', booking: '!', note: 'i' };
const itemIcon: Record<ItemType, typeof Landmark> = { sight: Landmark, food: Utensils, optional: CircleHelp, transit: TrainFront, stay: BedDouble, booking: Zap, note: CircleAlert };
const needsBookingAttention = (place: Place) => place.type === 'booking' || ['research', 'recommended', 'required'].includes(place.bookingState ?? '');

function markerIcon(type: ItemType, active: boolean) {
  return L.divIcon({ className: `map-marker marker-${type}${active ? ' is-active' : ''}`, html: `<span aria-hidden="true">${itemGlyph[type]}</span>`, iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -22] });
}

function distanceKm(a: [number, number], b: [number, number]) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const [lat1, lon1] = a.map(radians);
  const [lat2, lon2] = b.map(radians);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    let frame = 0;
    const fit = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        // Leaflet can mount before a responsive panel or mobile sheet has its
        // final dimensions. Re-measure first, then fit against the real size.
        map.invalidateSize({ animate: false, pan: false });
        const size = map.getSize();
        if (!size.x || !size.y || points.length === 0) return;
        if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [38, 38], maxZoom: 12 });
        else map.setView(points[0], 12);
      });
    };
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    fit();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [map, points]);
  return null;
}

function MapSelection({ place }: { place?: Place }) {
  const map = useMap();
  useEffect(() => {
    if (place?.coordinates) map.flyTo(place.coordinates, Math.max(map.getZoom(), 13), { duration: 0.45 });
  }, [map, place]);
  return null;
}

function MapPlaceMarkers({ places, selectedPlaceId, onSelectPlace }: { places: Place[]; selectedPlaceId?: string; onSelectPlace: (place: Place) => void }) {
  const map = useMap();
  const [groups, setGroups] = useState<Place[][]>([]);
  useEffect(() => {
    const regroup = () => {
      const next: { point: L.Point; places: Place[] }[] = [];
      for (const place of places) {
        if (!place.coordinates) continue;
        const point = map.latLngToContainerPoint(place.coordinates);
        const nearby = next.find((group) => group.point.distanceTo(point) < 48);
        if (nearby) nearby.places.push(place);
        else next.push({ point, places: [place] });
      }
      setGroups(next.map((group) => group.places));
    };
    regroup();
    map.on('zoomend moveend resize', regroup);
    return () => { map.off('zoomend moveend resize', regroup); };
  }, [map, places]);

  return <>{groups.map((group) => {
    const first = group[0];
    if (group.length === 1) {
      const place = first;
      return <Marker key={place.id} position={place.coordinates!} title={`${place.startTime ? `${place.startTime} · ` : ''}${place.name}`} alt={`${itemLabel[place.type]}: ${place.name}`} icon={markerIcon(place.type, selectedPlaceId === place.id)} eventHandlers={{ click: () => onSelectPlace(place) }}><Popup><PlacePopup place={place} /></Popup></Marker>;
    }
    const active = group.some((place) => place.id === selectedPlaceId);
    const icon = L.divIcon({ className: `map-marker-cluster${active ? ' is-active' : ''}`, html: `<span aria-hidden="true">${group.length}</span>`, iconSize: [44, 44], iconAnchor: [22, 22] });
    return <Marker key={group.map((place) => place.id).join('|')} position={first.coordinates!} title={`${group.length} nearby itinerary stops`} alt={`${group.length} nearby itinerary stops; open to choose one`} icon={icon}><Popup><div className="map-popup map-cluster-popup"><strong>{group.length} nearby itinerary stops</strong><ul>{group.map((place) => <li key={place.id}><div><small>{place.startTime ? `${place.startTime} · ` : ''}{itemLabel[place.type]}</small><strong>{place.name}</strong><button type="button" onClick={() => onSelectPlace(place)}>Show on itinerary <ArrowRight size={12} /></button></div><div className="map-popup-links"><a href={googleMapsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer">Place <ExternalLink size={12} /></a>{place.travelMode !== 'flight' && <a href={googleDirectionsUrl(place.mapsQuery, place.originQuery, place.travelMode)} target="_blank" rel="noopener noreferrer">Directions <Footprints size={12} /></a>}</div></li>)}</ul></div></Popup></Marker>;
  })}</>;
}

function PlacePopup({ place }: { place: Place }) {
  return <div className="map-popup"><span className={`type-chip type-${place.type}`}>{itemLabel[place.type]}</span>{place.startTime && <small className="map-popup-time">{place.startTime}{place.durationMinutes ? ` · ${place.durationMinutes} min` : ''}</small>}<strong>{place.name}</strong><p>{place.description}</p>{place.cuisine && <p className="map-popup-detail">{place.cuisine}{place.signature ? ` · ${place.signature}` : ''}{place.mealContext ? ` · ${place.mealContext}` : ''}</p>}{place.bookingState && place.bookingState !== 'not-needed' && <p className="map-popup-detail">Status: {place.bookingState}</p>}<div className="map-popup-links"><a href={googleMapsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer">Place <ExternalLink size={13} /></a>{place.travelMode !== 'flight' && <a href={googleDirectionsUrl(place.mapsQuery, place.originQuery, place.travelMode)} target="_blank" rel="noopener noreferrer">Directions <Footprints size={13} /></a>}</div></div>;
}

function MapView({ selectedDay, allDays = [], selectedPlaceId, onSelectPlace, onOpenOverviewPlace, filter }: { selectedDay?: TripDay; allDays?: TripDay[]; selectedPlaceId?: string; onSelectPlace: (place: Place) => void; onOpenOverviewPlace?: (day: TripDay, place: Place) => void; filter: ItemType | 'all' }) {
  const places = selectedDay?.places ?? [];
  const mappedPlaces = useMemo(() => places.filter((place) => place.coordinates && (filter === 'all' || place.type === filter)), [places, filter]);
  const points = useMemo(() => mappedPlaces.map((place) => place.coordinates!).filter(Boolean), [mappedPlaces]);
  const overviewPlaces = useMemo(() => allDays.flatMap((day) => day.places.filter((place) => place.coordinates && place.type === filter).map((place) => ({ day, place }))), [allDays, filter]);
  const overviewStays = filter === 'stay' ? stays : [];
  const overviewPoints = filter === 'stay' ? overviewStays.map((stay) => stay.coordinates) : overviewPlaces.map(({ place }) => place.coordinates!).filter(Boolean);
  const routePoints = useMemo(() => selectedDay ? places.filter((place) => place.type !== 'stay').map((place) => place.coordinates).filter((point): point is [number, number] => Boolean(point)) : baseVisits.map((city) => city.coordinates), [selectedDay, places]);
  const dayFocusAnchor = selectedDay?.places.find((place) => place.coordinates && ['sight', 'food', 'optional'].includes(place.type))?.coordinates;
  // Keep a day map useful at a glance: long-distance train/flight endpoints
  // remain in the itinerary with directions, but should not zoom a local day
  // (for example, Toshogu) out to show all of Japan.
  const dayLocalPoints = selectedDay && dayFocusAnchor
    ? points.filter((point) => distanceKm(point, dayFocusAnchor) <= 30)
    : points;
  const dayLocalRoute = selectedDay && dayFocusAnchor
    ? routePoints.filter((point) => distanceKm(point, dayFocusAnchor) <= 30)
    : routePoints;
  const selectedPlace = selectedDay?.places.find((place) => place.id === selectedPlaceId);
  const mapDayLabel = selectedDay?.id === '2026-11-03' ? 'Nikko to Tokyo' : selectedDay?.base;
  const boundsPoints = selectedDay ? (dayLocalPoints.length ? dayLocalPoints : points.length ? points : routePoints) : filter === 'all' ? baseVisits.map((city) => city.coordinates) : overviewPoints.length ? overviewPoints : baseVisits.map((city) => city.coordinates);
  return <MapContainer className="leaflet-map" center={[39.8, 138.2]} zoom={5} minZoom={5} maxZoom={19} scrollWheelZoom zoomControl={false} keyboard aria-label={selectedDay ? `Interactive map of ${mapDayLabel} places` : 'Interactive map of Japan route'}>
    <TileLayer attribution='Map tiles: <a href="https://maps.gsi.go.jp/development/ichiran.html">GSI Japan (English)</a>' url="https://cyberjapandata.gsi.go.jp/xyz/english/{z}/{x}/{y}.png" minZoom={5} maxZoom={11} />
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" minZoom={12} maxZoom={19} />
    <ZoomControl position="bottomright" /><MapSelection place={selectedPlace} /><FitBounds points={boundsPoints} />
    <Polyline positions={selectedDay ? dayLocalRoute : routePoints} pathOptions={{ color: '#d7654d', weight: selectedDay ? 3 : 4, dashArray: selectedDay ? '8 8' : undefined, opacity: .85 }} />
    {!selectedDay && filter === 'all' && baseCities.map((city) => <Marker key={city.name} position={city.coordinates} title={`${city.name} base · ${city.nights} nights`} alt={`${city.name} base, ${city.nights} nights`} icon={markerIcon('stay', false)}><Popup><strong>{city.name}</strong><br />{city.nights} nights in the route</Popup></Marker>)}
    {!selectedDay && filter === 'stay' && overviewStays.map((stay) => <Marker key={stay.id} position={stay.coordinates} title={`${stay.property} · ${stay.dates}`} alt={`${stay.city} hotel: ${stay.property}, ${stay.dates}`} icon={markerIcon('stay', false)}><Popup><div className="map-popup"><span className="type-chip type-stay">Stay</span><strong>{stay.property}</strong><p>{stay.city} · {stay.dates}</p><a href={googleMapsUrl(stay.property)} target="_blank" rel="noopener noreferrer">Open property in Google Maps <ExternalLink size={13} /></a></div></Popup></Marker>)}
    {!selectedDay && filter !== 'all' && filter !== 'stay' && overviewPlaces.map(({ day, place }) => <Marker key={`${day.id}-${place.id}`} position={place.coordinates!} title={`${day.date} · ${place.name}`} alt={`${day.date}: ${itemLabel[place.type]} · ${place.name}`} icon={markerIcon(place.type, false)}><Popup><div className="map-popup"><span className={`type-chip type-${place.type}`}>{itemLabel[place.type]}</span><small className="map-popup-time">{day.date} · {day.base}</small><strong>{place.name}</strong><p>{place.description}</p><div className="map-popup-links"><a href={googleMapsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer">Place <ExternalLink size={13} /></a><button type="button" onClick={() => onOpenOverviewPlace?.(day, place)}>Open this day <ArrowRight size={13} /></button></div></div></Popup></Marker>)}
    {selectedDay && <MapPlaceMarkers places={mappedPlaces} selectedPlaceId={selectedPlaceId} onSelectPlace={onSelectPlace} />}
  </MapContainer>;
}

function Header({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  return <header className="site-header"><a className="brand" href="/japan-2026-plan/" aria-label="Japan, slowly home"><span className="brand-mark">日</span><span>Japan,<br /><em>slowly</em></span></a><nav className="main-nav" aria-label="Main navigation"><a href="#overview">Overview</a><a href="#daily-plan">Daily plan</a><a href="#bookings">Bookings</a><a href="#budget">Budget</a><a href="#practical">Practical notes</a></nav><button className="menu-button" onClick={onMenu} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-menu"><Menu size={22} /></button></header>;
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div className={`stat${accent ? ' accent' : ''}`}><strong>{value}</strong><span>{label}</span></div>; }

function PlaceCard({ place, selected, onSelect }: { place: Place; selected: boolean; onSelect: () => void }) {
  const Icon = itemIcon[place.type];
  return <li className={`place-card${selected ? ' selected' : ''}${place.fallback ? ' fallback' : ''}`}>
    <button className="place-main" onClick={onSelect} aria-pressed={selected}><span className={`place-icon icon-${place.type}`}><Icon size={17} /></span><span className="place-copy"><strong>{place.name}</strong><span>{place.description}</span>{place.durationMinutes && <small className="place-duration">{place.durationMinutes} min planned{place.endTime ? ` · until ${place.endTime}` : ''}</small>}{place.cuisine && <small>{place.cuisine}{place.signature ? ` · ${place.signature}` : ''}{place.mealContext ? ` · ${place.mealContext}` : ''}</small>}{place.travelNote && <small className="travel-note"><Navigation size={11} /> {place.travelNote}</small>}</span>{place.startTime && <time>{place.startTime}</time>}</button>
    <div className="place-meta">{place.role && <span className={`role-label role-${place.role}`}>{place.role}</span>}{place.bookingState && place.bookingState !== 'not-needed' && <span className={`status status-${place.bookingState}`}><span aria-hidden="true">{place.bookingState === 'booked' ? '✓' : '!'}</span> {place.bookingState}</span>}{place.priceBand && <span>{place.priceBand}</span>}{place.estimatedCostJPY && <span>{formatJPY(place.estimatedCostJPY)}</span>}<a href={googleMapsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${place.name} place details in Google Maps`}>Place <ExternalLink size={12} /></a>{place.travelMode !== 'flight' && <a href={googleDirectionsUrl(place.mapsQuery, place.originQuery, place.travelMode)} target="_blank" rel="noopener noreferrer" aria-label={`Get directions to ${place.name}`}>Directions <Footprints size={12} /></a>}</div>
    {place.verification !== 'confirmed' && <div className="verification"><CircleAlert size={13} /> {place.verification === 'verify-before-trip' ? 'Verify before the trip' : 'Research lead — check close to travel'}</div>}{place.sourceUrl && <div className="verification"><ExternalLink size={13} /><a href={place.sourceUrl} target="_blank" rel="noopener noreferrer">{place.sourceLabel ?? 'Official details'}</a></div>}
  </li>;
}

function DayCard({ day, selected, onSelect }: { day: TripDay; selected: boolean; onSelect: () => void }) {
  const foodCount = day.places.filter((place) => place.type === 'food').length;
  return <article className={`day-card${selected ? ' selected' : ''}`} role="button" tabIndex={0} aria-pressed={selected} aria-label={`Open ${day.weekday} ${day.date}, ${day.title}, on the map and itinerary`} onClick={onSelect} onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(); } }}><div className="day-date"><span>{day.weekday}</span><strong>{new Date(`${day.date}T12:00:00`).getDate()}</strong><small>{new Date(`${day.date}T12:00:00`).toLocaleString('en-US', { month: 'short' })}</small></div><div className="day-card-body"><div className="card-topline"><span className="eyebrow">{day.base}</span>{day.keyDay && <span className="key-badge">Key day</span>}</div><h3>{day.title}</h3><p>{day.summary}</p><div className="day-card-tags"><span>{day.pacing}</span><span>{day.places.filter((place) => place.type === 'sight').length} sights</span>{foodCount > 0 && <span>{foodCount} food</span>}</div><span className="text-button">{selected ? 'Day focus open' : 'View map + itinerary'} <ArrowRight size={15} /></span></div></article>;
}

function SectionHeading({ eyebrow, title, titleId, children }: { eyebrow: string; title: string; titleId?: string; children?: React.ReactNode }) { return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2 id={titleId}>{title}</h2></div>{children}</div>; }

function DayTimeline({ day, selectedPlaceId, onSelectPlace }: { day: TripDay; selectedPlaceId?: string; onSelectPlace: (place: Place) => void }) {
  const minutes = (time?: string) => time ? Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]) : -1;
  const groups: { label: string; items: Place[] }[] = [{ label: 'Morning', items: day.places.filter((place) => minutes(place.startTime) >= 300 && minutes(place.startTime) < 720) }, { label: 'Midday', items: day.places.filter((place) => minutes(place.startTime) >= 720 && minutes(place.startTime) < 900) }, { label: 'Afternoon', items: day.places.filter((place) => minutes(place.startTime) >= 900 && minutes(place.startTime) < 1140) }, { label: 'Evening', items: day.places.filter((place) => minutes(place.startTime) >= 1140 && minutes(place.startTime) < 1380) }, { label: 'Late night', items: day.places.filter((place) => minutes(place.startTime) >= 1380 || (minutes(place.startTime) >= 0 && minutes(place.startTime) < 300)) }, { label: 'Flexible', items: day.places.filter((place) => !place.startTime) }].filter((group) => group.items.length);
  return <div className="day-timeline">{groups.map((group) => <section key={group.label} className="timeline-group"><h3>{group.label}</h3><ol>{group.items.map((place, index) => <li key={place.id} className="timeline-row"><div className="timeline-time">{place.startTime || '—'}<span>{index < group.items.length - 1 ? '↓' : ''}</span></div><div className="timeline-line"><span className={`timeline-dot dot-${place.type}`} /></div><PlaceCard place={place} selected={selectedPlaceId === place.id} onSelect={() => onSelectPlace(place)} /></li>)}</ol></section>)}</div>;
}

function DayDetail({ day, selectedPlaceId, onSelectPlace, onClose, onChangeDay, first, last, mobile, mapFilter, onMapFilterChange }: { day: TripDay; selectedPlaceId?: string; onSelectPlace: (place: Place) => void; onClose: () => void; onChangeDay: (offset: number) => void; first: boolean; last: boolean; mobile: boolean; mapFilter: ItemType | 'all'; onMapFilterChange: (filter: ItemType | 'all') => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const background = Array.from(document.querySelectorAll<HTMLElement>('.app-shell > header, .app-shell > main, .app-shell > footer, .app-shell > .mobile-menu'));
    const inertBefore = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    dialogRef.current?.focus();
    const getFocusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? []).filter((element) => element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = getFocusable();
      if (!focusable.length) { event.preventDefault(); dialogRef.current.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); background.forEach((element, index) => { element.inert = inertBefore[index]; }); previous?.focus(); };
  }, [mobile, onClose]);
  const go = day.places.filter((place) => place.type === 'sight'); const eat = day.places.filter((place) => place.type === 'food'); const optional = day.places.filter((place) => place.type === 'optional'); const book = day.places.filter(needsBookingAttention);
  const visibleMapCount = day.places.filter((place) => place.coordinates && (mapFilter === 'all' || place.type === mapFilter)).length;
  return <aside className={`day-detail${mobile ? ' mobile-dialog' : ''}`} role={mobile ? 'dialog' : 'complementary'} aria-modal={mobile || undefined} aria-labelledby="day-detail-title" tabIndex={-1} ref={dialogRef}><div className="detail-top"><div><span className="eyebrow">Day focus · {day.weekday} {new Date(`${day.date}T12:00:00`).toLocaleString('en-US', { month: 'short', day: 'numeric' })}</span><h2 id="day-detail-title">{day.title}</h2><p>{day.base} · <span className={`pace pace-${day.pacing}`}>{day.pacing} pace</span>{day.dailyEstimateJPY ? ` · ¥${day.dailyEstimateJPY.low.toLocaleString()}–¥${day.dailyEstimateJPY.high.toLocaleString()} per day` : ''}</p></div><button className="icon-button close-detail" onClick={onClose} aria-label="Close day focus"><X size={21} /></button></div><div className="detail-actions"><button className="secondary-button" onClick={() => onChangeDay(-1)} disabled={first}><ArrowLeft size={16} /> Previous</button><button className="secondary-button" onClick={() => onChangeDay(1)} disabled={last}>Next <ArrowRight size={16} /></button><button className="secondary-button print-day-button" onClick={() => window.print()}><Printer size={15} /> Print day</button></div><p className="season-note"><Moon size={15} /> {day.seasonNote}</p><div className="detail-map-heading"><strong>{day.base} map</strong><span>Tap a marker for the stop and map link</span></div><div className="detail-map-shell" style={{ position: 'relative' }}><MapView selectedDay={day} selectedPlaceId={selectedPlaceId} onSelectPlace={onSelectPlace} filter={mapFilter} /><div className="map-overlay" role="group" aria-label={`${day.base} map layer controls`}><span aria-live="polite" aria-atomic="true">{visibleMapCount} shown</span><label><Filter size={13} aria-hidden="true" /><span className="sr-only">Filter {day.base} map layers</span><select aria-label={`Filter ${day.base} day map layers`} value={mapFilter} onChange={(event) => onMapFilterChange(event.target.value as ItemType | 'all')}><option value="all">All layers</option><option value="sight">Sights</option><option value="food">Food</option><option value="optional">Optional</option><option value="transit">Transit</option><option value="stay">Stays</option><option value="booking">Bookings</option></select></label></div>{visibleMapCount === 0 && <p className="map-empty-state" role="status">No mapped stops in this layer. Use the itinerary list and its Google Maps links to explore places.</p>}</div><DayTimeline day={day} selectedPlaceId={selectedPlaceId} onSelectPlace={onSelectPlace} /><div className="detail-sections"><DetailPlaceSection title="Go · committed sights" places={go} selectedPlaceId={selectedPlaceId} onSelectPlace={onSelectPlace} /><DetailPlaceSection title="Eat · primary first" places={eat} selectedPlaceId={selectedPlaceId} onSelectPlace={onSelectPlace} /><DetailPlaceSection title="Optional · only if energy allows" places={optional} selectedPlaceId={selectedPlaceId} onSelectPlace={onSelectPlace} /><DetailPlaceSection title="Book / verify" places={book} selectedPlaceId={selectedPlaceId} onSelectPlace={onSelectPlace} /></div>{(day.tiredPlan || day.rainPlan) && <div className="contingency"><h3><Coffee size={16} /> Keep a plan B</h3>{day.tiredPlan && <p><strong>If tired:</strong> {day.tiredPlan}</p>}{day.rainPlan && <p><strong>If raining:</strong> {day.rainPlan}</p>}</div>}</aside>;
}

function DetailPlaceSection({ title, places, selectedPlaceId, onSelectPlace }: { title: string; places: Place[]; selectedPlaceId?: string; onSelectPlace: (place: Place) => void }) { if (!places.length) return null; return <section className="detail-place-section"><h3>{title}</h3><ul>{places.map((place) => <PlaceCard key={place.id} place={place} selected={selectedPlaceId === place.id} onSelect={() => onSelectPlace(place)} />)}</ul></section>; }

function RailPassDecision() {
  return <section className="section rail-decision" aria-labelledby="rail-decision-title">
    <SectionHeading eyebrow={`Rail cost check · ${railPassWindowLabel}`} title="Compare the pass before you buy" />
    <div className="rail-decision-card">
      <div className="rail-decision-summary"><span className="rail-pass-price">¥40,000 <small>≈ €{formatApproxEUR(40_000)} / person · 6 consecutive days</small></span><p>Fits the long rail sequence from Sapporo through Noboribetsu, Hakodate and Sendai to Tokyo, plus the JR Matsushima day trip.</p><div className="rail-saving"><CircleAlert size={17} /> No reliable saving established yet</div><small>Published fare references conflict: individual segments suggest a different baseline from JR Hokkaido’s through-route example. Hakodate Liner is also unverified.</small></div>
      <div className="rail-fare-list"><h3>Published separate-ticket references · not a quote</h3>{railDecision.segments.map((segment) => <div key={segment.route}><span>{segment.date} · {segment.route}</span><strong>¥{segment.fareJPY.toLocaleString()} <small>≈ {formatApproxEUR(segment.fareJPY)}</small></strong></div>)}<div><span>Sendai ↔ Matsushima-Kaigan JR round trip · estimate</span><strong>~¥{railDecision.additionalCoveredRide.estimatedFareRangeJPY[0].toLocaleString()}–¥{railDecision.additionalCoveredRide.estimatedFareRangeJPY[1].toLocaleString()} <small>≈ {formatApproxEUR(railDecision.additionalCoveredRide.estimatedFareRangeJPY[0])}–{formatApproxEUR(railDecision.additionalCoveredRide.estimatedFareRangeJPY[1])}</small></strong></div><div className="rail-total"><span>Individual fare references + estimated Matsushima</span><strong>~¥{(individualRailTotalJPY + railDecision.additionalCoveredRide.estimatedFareRangeJPY[0]).toLocaleString()}–¥{(individualRailTotalJPY + railDecision.additionalCoveredRide.estimatedFareRangeJPY[1]).toLocaleString()} <small>≈ {formatApproxEUR(individualRailTotalJPY + railDecision.additionalCoveredRide.estimatedFareRangeJPY[0])}–{formatApproxEUR(individualRailTotalJPY + railDecision.additionalCoveredRide.estimatedFareRangeJPY[1])}</small></strong></div><p>JR Hokkaido’s own through-route example is ¥45,620 (≈ {formatApproxEUR(45_620)}); the exact ticket baseline and relative pass value need checking at purchase.</p></div>
      <div className="rail-decision-foot"><p><strong>Check first:</strong> whether you already bought the pass. Eligibility requires a non-Japanese passport and short-term-visitor entry status. Seat reservations are separate; buses, trams, subways and taxis are not covered. Figures are current published standard-fare estimates, not a checkout quote.</p><div><a className="primary-button" href={railDecision.passPurchaseUrl} target="_blank" rel="noopener noreferrer">Pass details <ExternalLink size={14} /></a><a className="secondary-button" href={railDecision.reservationUrl} target="_blank" rel="noopener noreferrer">Buy / reserve trains <ExternalLink size={14} /></a><a href={railDecision.regularTicketsUrl} target="_blank" rel="noopener noreferrer">Fare source <ExternalLink size={12} /></a></div></div>
    </div>
  </section>;
}

function BookingBoard({ onSelectDay }: { onSelectDay: (dayId?: string) => void }) {
  const actionBookings = bookings.filter((booking) => booking.status !== 'booked').sort((a, b) => (a.dayId ?? '9999-12-31').localeCompare(b.dayId ?? '9999-12-31'));
  const confirmedBookings = bookings.filter((booking) => booking.status === 'booked');
  const bookedStays = stays.filter((stay) => stay.status === 'booked');
  return <section id="bookings" className="section"><SectionHeading eyebrow="Action board" title="Book before it becomes urgent"><span className="section-count"><Zap size={16} /> {actionBookings.length} open bookings · {bookedStays.length + confirmedBookings.length} confirmed</span></SectionHeading>
    <p className="booking-intro">Time-sensitive train seats and reservations are listed first. Confirmed hotels and the Peach flight stay recorded below, separate from actions still to do.</p>
    <div className="booking-list">{actionBookings.map((booking) => <details className={`booking-entry priority-${booking.priority}`} key={booking.id}>
      <summary><span className="booking-entry-priority">{booking.status === 'verify' ? 'CHECK' : booking.priority === 'required' ? 'BOOK' : booking.priority === 'recommended' ? 'CONFIRM' : 'CHECK'}</span><span className="booking-entry-main"><strong>{booking.item}</strong><small><CalendarDays size={13} /> {booking.date} · {booking.deadline}</small></span><span className="booking-entry-cost">{booking.estimatedCostJPY ? formatJPY(booking.estimatedCostJPY) : 'Cost varies'}<small>{booking.estimatedCostJPY ? `≈ ${formatApproxEUR(booking.estimatedCostJPY)}` : 'check at booking'}</small></span><ChevronDown className="booking-entry-chevron" size={17} aria-hidden="true" /></summary>
      <div className="booking-entry-details"><p>{booking.notes}</p><div className="booking-meta">{booking.mapsQuery && <a href={googleMapsUrl(booking.mapsQuery)} target="_blank" rel="noopener noreferrer">Map location <ExternalLink size={12} /></a>}{booking.purchaseUrl && <a className="booking-buy-link" href={booking.purchaseUrl} target="_blank" rel="noopener noreferrer">{booking.purchaseLabel ?? 'Buy / reserve'} <ExternalLink size={12} /></a>}{booking.referenceUrl && <a href={booking.referenceUrl} target="_blank" rel="noopener noreferrer">{booking.referenceLabel ?? 'Official information'} <ExternalLink size={12} /></a>}<button className="text-button" onClick={() => onSelectDay(booking.dayId)}>Open related day <ArrowRight size={14} /></button></div></div>
    </details>)}</div>
    <details className="booking-confirmed"><summary><span><Check size={15} /> Confirmed reservations · {bookedStays.length} hotels + {confirmedBookings.length} flight</span><ChevronDown size={17} aria-hidden="true" /></summary><div className="confirmed-booking-list">{bookedStays.map((stay) => <article key={stay.id}><div><strong>{stay.property}</strong><small>{stay.dates} · {stay.city}</small></div><span>€{stay.costEUR?.toLocaleString('en-GB') ?? 'confirmed'}</span></article>)}{confirmedBookings.map((booking) => <article key={booking.id}><div><strong>{booking.item}</strong><small>{booking.date} · {booking.destination}</small></div><span>{booking.estimatedCostJPY ? `${formatJPY(booking.estimatedCostJPY)} ≈ ${formatApproxEUR(booking.estimatedCostJPY)}` : 'Confirmed'}</span></article>)}</div></details>
  </section>;
}

function AccommodationTimeline() { return <section className="section compact-section" id="stays"><SectionHeading eyebrow="Where we sleep" title="Seven stays, five bases"><span className="section-count"><Check size={16} /> {stays.filter((stay) => stay.status === 'booked').length} confirmed · €{confirmedHotelTotalEUR}</span></SectionHeading><div className="stay-grid">{stays.map((stay) => <article className={`stay-card${stay.conflict ? ' stay-conflict' : ''}`} key={stay.id}><div className="stay-marker"><BedDouble size={17} /></div><div><div className="stay-card-top"><span>{stay.dates}</span><span className={`status status-${stay.status}`}>{stay.conflict ? 'date conflict' : stay.status}</span></div><h3>{stay.city}</h3><p>{stay.property}{stay.privateBath ? ' · Private bath' : ''}</p><small>{stay.note}{stay.costEUR ? ` · €${stay.costEUR}` : ''}</small><a className="stay-map-link" href={googleMapsUrl(stay.property)} target="_blank" rel="noopener noreferrer">Open property in Google Maps <ExternalLink size={12} /></a></div></article>)}</div></section>; }

function BudgetPanel() {
  const max = Math.max(...budgetCategories.map((category) => category.centre));
  return <section id="budget" className="section budget-section"><SectionHeading eyebrow="The envelope" title="A budget with honest edges" /><div className="budget-layout"><div className="budget-hero"><span className="eyebrow">Estimated total · two adults · includes confirmed hotels · excludes shopping</span><strong>{formatJPY(budgetTotals.low)} <em>→</em> {formatJPY(budgetTotals.high)}</strong><p className="budget-euro-total">Approximately {formatApproxEUR(budgetTotals.low)}–{formatApproxEUR(budgetTotals.high)} total</p><p>Centre estimate {formatJPY(budgetTotals.centre)} ({formatApproxEUR(budgetTotals.centre)}) · {formatJPY(Math.round(budgetTotals.centre / 2))} ({formatApproxEUR(Math.round(budgetTotals.centre / 2))}) per person. Planning ranges, not live prices.</p><div className="budget-confirmed"><span><Check size={15} /> Confirmed hotels · 18 nights</span><strong>€{confirmedHotelTotalEUR.toLocaleString('en-GB')} <small>≈ {formatJPY(Math.round(confirmedHotelTotalEUR * yenPerEuro))}</small></strong></div><p className="budget-note">Peach MM571 is included in the transport estimate and traveler-confirmed at ¥30,220 for two adults (≈ {formatApproxEUR(30_220)}). Yen-to-euro figures use the ECB reference of €1 = ¥{yenPerEuro.toFixed(2)} on 14 Oct 2026; card rates and fees differ.</p><a className="budget-fx-link" href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html" target="_blank" rel="noopener noreferrer">Check the ECB reference rate <ExternalLink size={12} /></a></div><div className="budget-breakdown">{budgetCategories.map((category) => <div className="budget-line" key={category.id}><div><span>{category.label}</span><small>{formatJPY(category.low)}–{formatJPY(category.high)} <em>≈ {formatApproxEUR(category.low)}–{formatApproxEUR(category.high)}</em></small></div><div className="budget-bar"><i style={{ width: `${Math.max(10, category.centre / max * 100)}%` }} /></div>{category.note && <p>{category.note}</p>}</div>)}</div></div></section>;
}

function OpenItemsPanel({ onSelectDay }: { onSelectDay: (dayId?: string) => void }) { return <section id="practical" className="section open-section"><div className="open-panel"><div className="open-intro"><span className="eyebrow">Before you go</span><strong>{openItems.length}</strong><h2>open decisions</h2><p>Priority-ordered actions. Expand an item for the next step, related booking link and day plan.</p></div><div className="open-list">{openItems.map((item) => { const relatedBooking = item.relatedId ? bookings.find((booking) => booking.id === item.relatedId) : undefined; return <details className={`open-item priority-${item.priority}`} key={item.id}><summary><span className="open-item-icon"><CircleAlert size={16} /></span><span className="open-item-title"><strong>{item.label}</strong><small>{item.kind} · {item.priority} priority{item.relatedDate ? ` · ${new Date(`${item.relatedDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}</small></span><ChevronDown size={16} aria-hidden="true" /></summary><div className="open-item-details"><p>{item.action}</p><div>{relatedBooking?.purchaseUrl && <a href={relatedBooking.purchaseUrl} target="_blank" rel="noopener noreferrer">{relatedBooking.purchaseLabel ?? 'Buy / reserve'} <ExternalLink size={12} /></a>}{relatedBooking?.mapsQuery && <a href={googleMapsUrl(relatedBooking.mapsQuery)} target="_blank" rel="noopener noreferrer">Map location <ExternalLink size={12} /></a>}{item.relatedDate && <button className="text-button" onClick={() => onSelectDay(item.relatedDate)}>Open related day <ArrowRight size={14} /></button>}</div></div></details>; })}</div></div></section>; }

function TokyoActivityPool({ outings, evenings, onAssign, onRemove, onOpenDay, storageUnavailable }: { outings: Record<string, string>; evenings: Record<string, string>; onAssign: (dayId: string, activityId: string, kind: 'outing' | 'evening') => void; onRemove: (dayId: string, kind: 'outing' | 'evening') => void; onOpenDay: (dayId?: string) => void; storageUnavailable: boolean }) {
  const [targets, setTargets] = useState<Record<string, string>>(() => Object.fromEntries(tokyoPoolActivities.map((activity) => [activity.id, ''])));
  const [notice, setNotice] = useState('');
  const poolDays = tokyoFlexibleDays.map((day) => ({ ...day, outing: outings[day.id], evening: evenings[day.id] }));
  return <section className="section tokyo-pool" id="tokyo-pool" aria-labelledby="tokyo-pool-title">
    <SectionHeading eyebrow="Make the last Tokyo week yours" title="Tokyo activity pool" titleId="tokyo-pool-title"><span className="section-count">Kamakura fixed · all other full Tokyo days open</span></SectionHeading>
    <p className="pool-intro">Every full Tokyo day except Kamakura is intentionally unplanned. Browse the researched day ideas—from Tokyo neighborhoods to full day trips—plus an optional izakaya evening. Picks stay optional until you assign one; selected ideas appear in that day’s map and timed itinerary. One main outing per day keeps travel manageable.</p>
    <div className="pool-day-strip" aria-label="Flexible Tokyo days">{poolDays.map((day) => <article key={day.id} className="pool-day"><div><strong>{day.label}</strong><span>{day.outing ? tokyoPoolActivities.find((item) => item.id === day.outing)?.title : 'Choose a day outing'}{day.evening ? ` · ${tokyoPoolActivities.find((item) => item.id === day.evening)?.title}` : ''}</span></div><button className="text-button" onClick={() => onOpenDay(day.id)}>Open day map <ArrowRight size={14} /></button></article>)}</div>
    <p className="pool-notice" role="status" aria-live="polite">{storageUnavailable ? 'This browser blocked local storage, so activity choices will last only for this session.' : notice}</p>
    <details className="pool-board"><summary className="pool-board-summary"><span><strong>Browse activity ideas</strong><small>{tokyoPoolActivities.filter((activity) => activity.kind === 'outing').length} day outings · {tokyoPoolActivities.filter((activity) => activity.kind === 'evening').length} evening add-on · all routes expandable</small></span><span className="pool-board-toggle"><span className="pool-board-closed">Show ideas</span><span className="pool-board-open">Hide ideas</span><ChevronDown size={17} aria-hidden="true" /></span></summary><div className="pool-grid">{tokyoPoolActivities.map((activity) => {
      const assignment = Object.entries(activity.kind === 'outing' ? outings : evenings).find(([, id]) => id === activity.id)?.[0];
      const target = targets[activity.id] ?? tokyoFlexibleDays[0].id;
      const incumbentId = (activity.kind === 'outing' ? outings : evenings)[target];
      const incumbent = tokyoPoolActivities.find((item) => item.id === incumbentId);
      const dayLabel = tokyoFlexibleDays.find((day) => day.id === target)?.label ?? 'selected day';
      return <details className={`pool-card pool-${activity.kind}${assignment ? ' is-assigned' : ''}`} key={activity.id}>
        <summary className="pool-card-summary"><span className="pool-card-top"><span className="pool-kind">{activity.kind === 'outing' ? 'DAY OUTING' : 'EVENING ADD-ON'}</span><span>{activity.durationLabel}</span></span><span className="eyebrow">{activity.area}</span><strong className="pool-card-title">{activity.title}</strong><span className="pool-card-description">{activity.summary}</span><span className="pool-card-expand"><span>{assignment ? `Added to ${tokyoFlexibleDays.find((day) => day.id === assignment)?.label}` : <><span className="pool-card-closed">Open route, stops, food and map links</span><span className="pool-card-open">Close route details</span></>}</span><ChevronDown size={17} aria-hidden="true" /></span></summary>
        <div className="pool-card-content"><p className="pool-route"><Navigation size={14} /> {activity.routeNote}</p>
          <details className="pool-route-details"><summary>View timed route · {activity.places.length} stops</summary><ol>{activity.places.map((place) => <li key={place.id}><span>{place.startTime ? `${place.startTime} · ` : ''}{place.name}</span><small>{place.durationMinutes ? `${place.durationMinutes} min · ` : ''}{place.description}</small><a href={place.originQuery ? googleDirectionsUrl(place.mapsQuery, place.originQuery, place.travelMode) : googleMapsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer">{place.originQuery ? 'Directions from previous stop' : 'Open place in Google Maps'} <ExternalLink size={12} /></a></li>)}</ol>{activity.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} <ExternalLink size={12} /></a>)}</details>
          <div className="pool-card-actions">{assignment ? <><span className="pool-assigned">Added to {tokyoFlexibleDays.find((day) => day.id === assignment)?.label}</span><button className="secondary-button" onClick={() => { onRemove(assignment, activity.kind); setNotice(`${activity.title} removed from ${tokyoFlexibleDays.find((day) => day.id === assignment)?.label}.`); }}>Remove</button></> : <><label className="sr-only" htmlFor={`pool-day-${activity.id}`}>Choose a flexible Tokyo day for {activity.title}</label><select id={`pool-day-${activity.id}`} value={target} onChange={(event) => setTargets((current) => ({ ...current, [activity.id]: event.target.value }))}><option value="">Choose an open day</option>{tokyoFlexibleDays.map((day) => <option key={day.id} value={day.id}>{day.label}</option>)}</select><button className="primary-button" disabled={!target} onClick={() => { onAssign(target, activity.id, activity.kind); setNotice(`${activity.title} added to ${dayLabel}. Its map and itinerary are updated.`); }}>{target ? incumbent ? `Replace ${incumbent.title}` : activity.kind === 'outing' ? 'Add outing' : 'Add evening' : 'Choose a day first'}</button></>}</div>
        </div>
      </details>;
    })}</div></details>
  </section>;
}

// Start with blank Tokyo days after the itinerary was deliberately reset; any v2 choices remain untouched in local storage.
const storageKey = 'japan-2026-tokyo-flex-v3';
const flexibleDayIdSet = new Set(tokyoFlexibleDays.map((day) => day.id));
function readTokyoChoices(): { outings: Record<string, string>; evenings: Record<string, string> } {
  try { const value = JSON.parse(window.localStorage.getItem(storageKey) || '{}'); return { outings: value.outings ?? {}, evenings: value.evenings ?? {} }; } catch { return { outings: {}, evenings: {} }; }
}

export function App() {
  const [selectedDayId, setSelectedDayId] = useState<string | undefined>(() => { const requested = new URLSearchParams(window.location.search).get('day') || undefined; return tripDays.some((day) => day.id === requested) ? requested : undefined; });
  const initialDayLink = useRef(new URLSearchParams(window.location.search).get('day') || undefined);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>();
  const [filter, setFilter] = useState<'all' | 'key' | 'food' | 'culture' | 'nature' | 'booking' | 'light' | 'balanced' | 'full'>('all');
  const [mapFilter, setMapFilter] = useState<ItemType | 'all'>('all');
  const [dayMapFilter, setDayMapFilter] = useState<ItemType | 'all'>('all');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [tokyoChoices, setTokyoChoices] = useState(readTokyoChoices);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  useEffect(() => { try { window.localStorage.setItem(storageKey, JSON.stringify(tokyoChoices)); setStorageUnavailable(false); } catch { setStorageUnavailable(true); } }, [tokyoChoices]);
  const plannedDays = useMemo(() => tripDays.map((day) => {
    if (!flexibleDayIdSet.has(day.id)) return day;
    const outing = tokyoPoolActivities.find((activity) => activity.id === tokyoChoices.outings[day.id]);
    const evening = tokyoPoolActivities.find((activity) => activity.id === tokyoChoices.evenings[day.id]);
    const choices = [outing, evening].filter((activity) => activity !== undefined);
    return {
      ...day,
      title: choices.length ? `Tokyo, your way · ${choices.map((activity) => activity.title).join(' + ')}` : 'Tokyo flex day · choose from the pool',
      summary: choices.length ? choices.map((activity) => activity.summary).join(' ') : 'No fixed sightseeing today. Pick one outing from the Tokyo activity pool below, or keep this day free.',
      pacing: outing ? 'balanced' as const : 'light' as const,
      dailyEstimateJPY: undefined,
      // Flexible days show only the booked hotel base until a pool activity is explicitly assigned.
      places: [...day.places.filter((place) => place.type === 'stay'), ...choices.flatMap((activity) => activity.places)].sort((a, b) => (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99')),
    };
  }), [tokyoChoices]);
  const selectedDay = plannedDays.find((day) => day.id === selectedDayId);
  const selectedIndex = selectedDay ? plannedDays.indexOf(selectedDay) : -1;
  useEffect(() => { const media = window.matchMedia('(max-width: 767px)'); const onChange = () => setMobile(media.matches); media.addEventListener('change', onChange); return () => media.removeEventListener('change', onChange); }, []);
  useEffect(() => {
    if (!initialDayLink.current) return;
    if (!plannedDays.some((day) => day.id === initialDayLink.current)) {
      const url = new URL(window.location.href);
      url.searchParams.delete('day');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      initialDayLink.current = undefined;
      return;
    }
    const frame = window.requestAnimationFrame(() => document.getElementById('daily-plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    initialDayLink.current = undefined;
    return () => window.cancelAnimationFrame(frame);
  }, [plannedDays]);
  useEffect(() => { const onPop = () => { const url = new URL(window.location.href); const requested = url.searchParams.get('day') || undefined; const valid = tripDays.some((day) => day.id === requested); if (requested && !valid) { url.searchParams.delete('day'); window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`); } setSelectedDayId(valid ? requested : undefined); }; window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop); }, []);
  useEffect(() => { document.body.classList.toggle('modal-open', Boolean(selectedDay && mobile)); return () => document.body.classList.remove('modal-open'); }, [selectedDay, mobile]);
  const selectDay = useCallback((dayId?: string) => { if (!dayId) return; const url = new URL(window.location.href); url.searchParams.set('day', dayId); window.history.pushState({}, '', url); setSelectedDayId(dayId); setSelectedPlaceId(undefined); document.getElementById('daily-plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, []);
  const closeDay = useCallback(() => { const url = new URL(window.location.href); url.searchParams.delete('day'); window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`); setSelectedDayId(undefined); setSelectedPlaceId(undefined); }, []);
  const changeDay = useCallback((offset: number) => { const target = plannedDays[selectedIndex + offset]; if (target) selectDay(target.id); }, [plannedDays, selectDay, selectedIndex]);
  const shownDays = useMemo(() => plannedDays.filter((day) => filter === 'all' || (filter === 'key' ? day.keyDay : filter === 'food' ? day.places.some((place) => place.type === 'food') : filter === 'booking' ? day.places.some(needsBookingAttention) : filter === 'culture' || filter === 'nature' ? day.tags.includes(filter) : day.pacing === filter)), [filter, plannedDays]);
  const assignTokyoActivity = useCallback((dayId: string, activityId: string, kind: 'outing' | 'evening') => {
    if (!flexibleDayIdSet.has(dayId) || !tokyoPoolActivities.some((activity) => activity.id === activityId && activity.kind === kind)) return;
    setTokyoChoices((current) => ({ ...current, [kind === 'outing' ? 'outings' : 'evenings']: { ...current[kind === 'outing' ? 'outings' : 'evenings'], [dayId]: activityId } }));
  }, []);
  const removeTokyoActivity = useCallback((dayId: string, kind: 'outing' | 'evening') => {
    setTokyoChoices((current) => { const key = kind === 'outing' ? 'outings' : 'evenings'; const next = { ...current[key] }; delete next[dayId]; return { ...current, [key]: next }; });
  }, []);
  const selectPlace = useCallback((place: Place) => setSelectedPlaceId(place.id), []);
  const openOverviewPlace = useCallback((day: TripDay, place: Place) => { selectDay(day.id); setSelectedPlaceId(place.id); }, [selectDay]);
  const mappedSelectedPlaces = selectedDay?.places.filter((place) => place.coordinates && (mapFilter === 'all' || place.type === mapFilter)) ?? [];
  return <div className="app-shell"><Header onMenu={() => setMobileMenu((open) => !open)} menuOpen={mobileMenu} />{mobileMenu && <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation"><button onClick={() => setMobileMenu(false)} className="icon-button" aria-label="Close navigation"><X /></button>{['overview', 'daily-plan', 'bookings', 'budget', 'practical'].map((id) => <a href={`#${id}`} key={id} onClick={() => setMobileMenu(false)}>{id.replace('-', ' ')}</a>)}</nav>}<main>
    <section className="hero" id="overview"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-content"><span className="eyebrow">23 October — 11 November 2026 · two adults</span><h1>Japan,<br /><em>slowly.</em></h1><p className="hero-lede">A north-to-Tokyo autumn journey built around local food, direct rail days, a slow Nikko overnight and enough blank space to notice where you are.</p><div className="stats"><Stat label="nights" value={String(totalNights)} /><Stat label="bases" value={String(baseCities.length)} accent /><Stat label="hotel nights booked" value={String(stays.filter((stay) => stay.status === 'booked').reduce((sum, stay) => sum + stay.nights, 0))} /><Stat label="open decisions" value={String(openItems.length)} /></div></div><div className="hero-stamp"><span>Route</span><strong>Hokkaido<br />to Tokyo</strong><Route size={30} /></div></section>
    <section className="section route-section"><SectionHeading eyebrow="The shape of it" title="North first, then deep Tokyo"><span className="route-note"><Route size={16} /> 5 bases · 20 days · Tokyo split around Nikko</span></SectionHeading><div className="map-toolbar"><div className="map-legend"><span><i className="legend-dot dot-stay" /> Base stays</span><span><i className="legend-dot dot-sight" /> Day places</span><span><i className="legend-dot dot-food" /> Food</span></div>{selectedDay && <button className="secondary-button" onClick={closeDay}>Show whole route</button>}</div><div className="map-shell"><MapView selectedDay={selectedDay} allDays={plannedDays} selectedPlaceId={selectedPlaceId} onSelectPlace={selectPlace} onOpenOverviewPlace={openOverviewPlace} filter={mapFilter} /><div className="map-overlay"><span>{selectedDay ? `${selectedDay.id === '2026-11-03' ? 'Nikko → Tokyo' : selectedDay.base} · ${mappedSelectedPlaces.length} mapped places` : mapFilter === 'all' ? 'Whole trip route · city bases' : `${itemLabel[mapFilter]} · ${mapFilter === 'stay' ? stays.length : plannedDays.flatMap((day) => day.places).filter((place) => place.type === mapFilter && place.coordinates).length} mapped places`}</span><label><Filter size={13} /><span className="sr-only">Map filter</span><select value={mapFilter} onChange={(event) => setMapFilter(event.target.value as ItemType | 'all')}><option value="all">All layers</option><option value="sight">Sights</option><option value="food">Food</option><option value="optional">Optional</option><option value="transit">Transit</option><option value="stay">Stays</option><option value="booking">Bookings</option></select></label></div></div><div className="route-strip">{baseVisits.map((city, index) => <div className="route-stop" key={`${city.name}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{city.name}</strong><small>{city.nights} {city.nights === 1 ? 'night' : 'nights'}</small></div>)}</div></section>
    <AccommodationTimeline />
    <section id="daily-plan" className="section daily-section"><SectionHeading eyebrow="Every day has a shape" title="The daily plan"><div className="filter-bar"><label htmlFor="day-filter">Show</label><select id="day-filter" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">All 20 days</option><option value="key">Key days</option><option value="food">Food anchors</option><option value="culture">Culture</option><option value="nature">Nature</option><option value="booking">Booking attention</option><option value="light">Light pace</option><option value="balanced">Balanced pace</option><option value="full">Full pace</option></select></div></SectionHeading><div className="day-explorer-layout"><nav className="day-list" aria-label="Choose an itinerary day">{shownDays.map((day) => <DayCard key={day.id} day={day} selected={selectedDayId === day.id} onSelect={() => selectDay(day.id)} />)}</nav>{selectedDay && !mobile && <DayDetail day={selectedDay} selectedPlaceId={selectedPlaceId} onSelectPlace={selectPlace} onClose={closeDay} onChangeDay={changeDay} first={selectedIndex === 0} last={selectedIndex === plannedDays.length - 1} mobile={false} mapFilter={dayMapFilter} onMapFilterChange={setDayMapFilter} />}</div></section>
    <TokyoActivityPool outings={tokyoChoices.outings} evenings={tokyoChoices.evenings} onAssign={assignTokyoActivity} onRemove={removeTokyoActivity} onOpenDay={selectDay} storageUnavailable={storageUnavailable} />
    <section className="section key-section"><SectionHeading eyebrow="Do not miss" title="Key moments"><div className="section-count"><Zap size={16} /> {tripDays.filter((day) => day.keyDay).length} key days</div></SectionHeading><div className="moment-grid">{[{ icon: '🌋', title: 'Noboribetsu valley', date: '27 Oct', text: 'A focused Hell Valley walk between the Sapporo and Hakodate trains; no onsen stop.' }, { icon: '⛴', title: 'Matsushima', date: '30 Oct', text: 'Cruise, Zuiganji and anago by the bay.' }, { icon: '✦', title: 'Nikko, then Tokyo', date: '2–3 Nov', text: 'Travel and settle in on day one; Shōgun-era Toshogu and nearby grounds the next morning.' }, { icon: '🌊', title: 'Kamakura', date: '5 Nov', text: 'The one planned Tokyo-area day trip: Great Buddha, Hasedera, Hase lunch and Tsurugaoka Hachimangu; return from Kamakura before evening.' }].map((moment) => <article key={moment.title}><span className="moment-icon">{moment.icon}</span><span className="eyebrow">{moment.date}</span><h3>{moment.title}</h3><p>{moment.text}</p></article>)}</div></section>
    <RailPassDecision /><BookingBoard onSelectDay={selectDay} /><BudgetPanel /><OpenItemsPanel onSelectDay={selectDay} />
  </main><footer><span>Japan, slowly · planning document for two</span><span>October — November 2026</span></footer>{selectedDay && mobile && <><div className="dialog-backdrop" onClick={closeDay} /><DayDetail day={selectedDay} selectedPlaceId={selectedPlaceId} onSelectPlace={selectPlace} onClose={closeDay} onChangeDay={changeDay} first={selectedIndex === 0} last={selectedIndex === plannedDays.length - 1} mobile mapFilter={dayMapFilter} onMapFilterChange={setDayMapFilter} /></>}</div>;
}

