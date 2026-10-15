import { BedDouble, CircleAlert, CircleHelp, ExternalLink, Footprints, Landmark, Navigation, TrainFront, Utensils, Zap } from 'lucide-react';
import { googleDirectionsUrl, googleMapsUrl } from '../data/trip';
import type { ItemType, Place } from '../types/trip';

const itemIcon: Record<ItemType, typeof Landmark> = { sight: Landmark, food: Utensils, optional: CircleHelp, transit: TrainFront, stay: BedDouble, booking: Zap, note: CircleAlert };
const bookingLabel = { booked: 'Confirmed', research: 'Check details', recommended: 'Reservation suggested', required: 'Booking needed', 'not-needed': '' };

export function PlaceCard({ place, selected, onSelect, compact = false, showTime = true }: { place: Place; selected: boolean; onSelect: () => void; compact?: boolean; showTime?: boolean }) {
  const Icon = itemIcon[place.type];
  const essentialInstructions = place.type === 'transit' || place.type === 'booking';
  const hasFoldedNotes = !essentialInstructions || place.cuisine || place.sourceUrl;
  const notes = <>
    {(!compact || !essentialInstructions) && <p>{place.description}</p>}
    {place.cuisine && <small>{place.cuisine}{place.signature ? ` · ${place.signature}` : ''}{place.mealContext ? ` · ${place.mealContext}` : ''}</small>}
    {place.sourceUrl && <p><a href={place.sourceUrl} target="_blank" rel="noopener noreferrer">{place.sourceLabel ?? 'Official details'} <ExternalLink size={12} /></a></p>}
  </>;
  return <article className={`place-card${compact ? ' compact-place' : ''}${selected ? ' selected' : ''}${place.fallback ? ' fallback' : ''}`}>
    <button className="place-main" onClick={onSelect} aria-pressed={selected} aria-label={`Show ${place.name} on the day map`}><span className={`place-icon icon-${place.type}`}><Icon size={17} /></span><span className="place-copy"><strong>{place.name}</strong>{place.durationMinutes && <small className="place-duration">{place.durationMinutes} min planned{place.endTime ? ` · until ${place.endTime}` : ''}</small>}</span>{showTime && place.startTime && <time>{place.startTime}</time>}</button>
    <div className="place-meta">{place.role === 'backup' && <span className="role-label role-backup">Backup</span>}{place.bookingState && place.bookingState !== 'not-needed' && <span className={`status status-${place.bookingState}`}><span aria-hidden="true">{place.bookingState === 'booked' ? '✓' : '!'}</span> {bookingLabel[place.bookingState]}</span>}{place.priceBand && <span>{place.priceBand}</span>}{place.estimatedCostJPY && <span>¥{place.estimatedCostJPY.toLocaleString('en-US')}</span>}<a href={googleMapsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${place.name} place details in Google Maps`}>Place <ExternalLink size={12} /></a>{place.travelMode !== 'flight' && <a href={googleDirectionsUrl(place.mapsQuery, place.originQuery, place.travelMode)} target="_blank" rel="noopener noreferrer" aria-label={`Get directions to ${place.name}`}>Directions <Footprints size={12} /></a>}</div>
    {place.travelNote && <p className="stop-important-note"><Navigation size={13} />{place.travelNote}</p>}
    {place.bookingNote && <p className="stop-important-note booking-note"><CircleAlert size={13} />{place.bookingNote}</p>}
    {compact && essentialInstructions && <p className="stop-travel-description">{place.description}</p>}
    {place.verification !== 'confirmed' && <div className="verification"><CircleAlert size={13} />{place.verification === 'research' ? 'Research option · check before going' : 'Recheck before travel'}</div>}
    {compact ? hasFoldedNotes && <details className="stop-notes"><summary>Details & sources</summary><div>{notes}</div></details> : <div className="stop-full-notes">{notes}</div>}
  </article>;
}
