import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BedDouble, ChevronLeft, ExternalLink, Footprints, Layers, MapPin, Maximize2, Route, X } from 'lucide-react';
import { baseVisits, googleDirectionsUrl, googleMapsUrl, stays } from '../data/trip';
import { distanceKm, localMapPoints, mapEntries, mapTypeLabel, shortDate, type MapEntry } from '../data/map';
import type { ItemType, Place, TripDay } from '../types/trip';

const VectorCanvas = lazy(() => import('./VectorCanvas'));
const emptyDays: TripDay[] = [];

export function MapView({ selectedDay, allDays = emptyDays, selectedPlaceId, onSelectPlace, onJumpToPlace, onOpenOverviewPlace, onOpenOverviewDay, filter }: { selectedDay?: TripDay; allDays?: TripDay[]; selectedPlaceId?: string; onSelectPlace: (place: Place) => void; onJumpToPlace?: (place: Place) => void; onOpenOverviewPlace?: (day: TripDay, place: Place) => void; onOpenOverviewDay?: (day: TripDay) => void; filter: ItemType | 'all' }) {
  const entries = useMemo(() => mapEntries(allDays, filter, selectedDay), [allDays, filter, selectedDay]);
  const points = useMemo(() => localMapPoints(entries, selectedDay), [entries, selectedDay]);
  const route = useMemo(() => {
    if (!selectedDay) return filter === 'all' ? baseVisits.map((base) => base.coordinates) : [];
    const anchor = points[0];
    return selectedDay.places.filter((place) => place.coordinates && place.startTime && place.type !== 'stay' && place.role !== 'backup' && !place.fallback).map((place) => place.coordinates!).filter((point) => !anchor || distanceKm(point, anchor) <= 30);
  }, [points, selectedDay, filter]);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [style, setStyle] = useState<'liberty' | 'positron'>('liberty');
  const [reset, setReset] = useState(0);
  const [failed, setFailed] = useState(false);
  const [focusId, setFocusId] = useState<string>();
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setActiveIds([]); setFocusId(undefined); }, [filter, selectedDay?.id]);
  useEffect(() => {
    if (!selectedPlaceId) return;
    const found = entries.find((entry) => entry.place?.id === selectedPlaceId);
    if (found) { setActiveIds([found.id]); setFocusId(found.id); }
  }, [selectedPlaceId, entries]);
  useEffect(() => { if (panelRef.current) panelRef.current.scrollTop = 0; }, [activeIds]);
  const pick = useCallback((group: MapEntry[], keyboard: boolean) => {
    setActiveIds(group.map((entry) => entry.id));
    if (group.length === 1 && selectedDay && group[0].place) onSelectPlace(group[0].place);
    window.requestAnimationFrame(() => {
      if (keyboard) panelRef.current?.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true });
      if (window.matchMedia('(max-width: 767px)').matches) panelRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    });
  }, [onSelectPlace, selectedDay]);
  const active = entries.filter((entry) => activeIds.includes(entry.id));
  const chooseFromList = (entry: MapEntry) => { pick([entry], false); setFocusId(entry.id); };
  const resetView = () => { setActiveIds([]); setFocusId(undefined); setReset((current) => current + 1); };
  const showOnDay = (entry: MapEntry) => { if (!entry.place || !entry.day) return; if (selectedDay) (onJumpToPlace ?? onSelectPlace)(entry.place); else onOpenOverviewPlace?.(entry.day, entry.place); };
  return <div className={`travel-map ${selectedDay ? 'day-travel-map' : 'overview-travel-map'}`}>
    <div className="vector-map-stage">
      <Suspense fallback={<div className="map-loading" role="status"><MapPin size={24} /> Loading your map…</div>}><VectorCanvas entries={entries} points={points} route={route} activeIds={activeIds} focusId={focusId} reset={reset} style={style} day={Boolean(selectedDay)} onPick={pick} onError={setFailed} /></Suspense>
      <div className="vector-map-controls"><label><Layers size={15} /><span className="sr-only">Map appearance</span><select aria-label={selectedDay ? 'Day map appearance' : 'Route map appearance'} value={style} onChange={(event) => setStyle(event.target.value as typeof style)}><option value="liberty">Street map</option><option value="positron">Calm map</option></select></label><button type="button" onClick={resetView} aria-label={selectedDay ? 'Fit all local day stops' : 'Fit whole trip route'}><Maximize2 size={15} /><span>{selectedDay ? 'Fit stops' : 'Whole route'}</span></button></div>
      {active.length > 0 && <div className="map-selection-label"><MapPin size={15} /><span><strong>{active.length === 1 ? active[0].title : `${active.length} nearby stops`}</strong><small>{active.length === 1 ? active[0].subtitle : 'Choose a stop in the details panel'}</small></span><button type="button" onClick={resetView} aria-label="Clear map selection"><X size={17} /></button></div>}
      {failed && <p className="vector-map-error" role="status">The map could not load. You can still browse every place below and open its Google Maps link.</p>}
      <span className="map-route-note">{route.length > 1 ? 'Dashed line = stop order, not navigation' : 'Select a pin for place details'}</span>
    </div>
    <div className="map-details-panel" ref={panelRef} role="region" aria-label={selectedDay ? 'Day map place details' : 'Route map place details'}>
      {active.length === 1 ? <>
        <button type="button" className="map-back" onClick={() => setActiveIds([])}><ChevronLeft size={15} /> {selectedDay ? 'All mapped stops' : 'Browse the map'}</button>
        <EntryDetails entry={active[0]} allDays={allDays} onOpenDay={onOpenOverviewDay} onShowOnDay={() => showOnDay(active[0])} />
      </> : <>
        <span className="eyebrow">{active.length > 1 ? 'Nearby places' : selectedDay ? 'Explore this day' : 'Your autumn route'}</span>
        <h3 tabIndex={-1}>{active.length > 1 ? `${active.length} stops in this area` : selectedDay ? `${entries.length} mapped stops` : filter === 'all' ? 'Five bases. One easy journey.' : `${entries.length} ${mapTypeLabel[filter].toLowerCase()} places`}</h3>
        <p className="map-panel-intro">{active.length > 1 ? 'Some stops share a location. Choose one to see the full details.' : 'Select a labeled pin or choose a place here for dates, details and directions.'}</p>
        <div className="map-place-list">{(active.length > 1 ? active : entries).map((entry) => <button type="button" key={entry.id} onClick={() => chooseFromList(entry)}><span className={`map-list-icon icon-${entry.type}`}>{entry.city ? <BedDouble size={15} /> : entry.label}</span><span><strong>{entry.title}</strong><small>{entry.subtitle}</small></span><ArrowRight size={14} /></button>)}</div>
      </>}
    </div>
  </div>;
}

function EntryDetails({ entry, allDays, onOpenDay, onShowOnDay }: { entry: MapEntry; allDays: TripDay[]; onOpenDay?: (day: TripDay) => void; onShowOnDay: () => void }) {
  const cityStays = entry.city ? stays.filter((stay) => stay.city === entry.city) : [];
  const cityDays = entry.city ? allDays.filter((day) => day.base === entry.city || (entry.city === 'Nikko' && day.base.startsWith('Nikko'))) : [];
  const place = entry.place;
  return <div className="map-entry-details">
    <span className={`type-chip type-${entry.type}`}>{entry.city ? 'Trip base' : mapTypeLabel[entry.type]}</span>
    <h3 tabIndex={-1}>{entry.title}</h3><p className="map-entry-date">{entry.subtitle}</p><p>{entry.description}</p>
    {place?.cuisine && <p className="map-entry-fact"><strong>Food:</strong> {place.cuisine}{place.signature ? ` · ${place.signature}` : ''}</p>}
    {place?.durationMinutes && <p className="map-entry-fact"><strong>Allow:</strong> {place.durationMinutes} minutes</p>}
    {place?.travelNote && <p className="map-entry-fact"><strong>Getting there:</strong> {place.travelNote}</p>}
    {place?.bookingNote && <p className="map-entry-warning">{place.bookingNote}</p>}
    {place?.verification !== undefined && place.verification !== 'confirmed' && <p className="map-entry-warning">{place.verification === 'research' ? 'Research option · check details before going.' : 'Recheck the current details before travel.'}</p>}
    {cityStays.length > 0 && <div className="map-entry-hotels"><h4><BedDouble size={14} /> Confirmed stays</h4>{cityStays.map((stay) => <a key={stay.id} href={googleMapsUrl(stay.property)} target="_blank" rel="noopener noreferrer"><strong>{stay.property}</strong><span>{stay.dates} · {stay.nights} night{stay.nights === 1 ? '' : 's'} <ExternalLink size={12} /></span></a>)}</div>}
    {cityDays.length > 0 && <div className="map-entry-days"><h4><Route size={14} /> Open an itinerary day</h4>{cityDays.map((day) => <button type="button" key={day.id} onClick={() => onOpenDay?.(day)}><span>{shortDate(day.id)}</span><strong>{day.title}</strong><ArrowRight size={13} /></button>)}</div>}
    {place && <div className="map-entry-actions"><button type="button" className="primary-button" onClick={onShowOnDay}>{entry.day ? `Open ${shortDate(entry.day.id)} itinerary` : 'Show on itinerary'} <ArrowRight size={14} /></button><a href={googleMapsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer">Google Maps <ExternalLink size={13} /></a>{place.travelMode !== 'flight' && <a href={googleDirectionsUrl(place.mapsQuery, place.originQuery, place.travelMode)} target="_blank" rel="noopener noreferrer">Directions <Footprints size={13} /></a>}{place.sourceUrl && <a href={place.sourceUrl} target="_blank" rel="noopener noreferrer">{place.sourceLabel ?? 'Official details'} <ExternalLink size={13} /></a>}</div>}
    {entry.stay && <a className="primary-button" href={googleMapsUrl(entry.stay.property)} target="_blank" rel="noopener noreferrer">Open hotel in Google Maps <ExternalLink size={14} /></a>}
  </div>;
}
