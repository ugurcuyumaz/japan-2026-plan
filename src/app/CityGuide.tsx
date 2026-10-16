import { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, ExternalLink, MapPin, Utensils } from 'lucide-react';
import { cityAlternatives } from '../data/cityAlternatives';
import { shortDate } from '../data/map';
import { googleMapsUrl, tripDays } from '../data/trip';
import './city-guide.css';

type PlaceFilter = 'all' | 'food' | 'sight';
type WeatherFilter = 'all' | 'indoors';

export function CityGuide({ onOpenDay }: { onOpenDay: (dayId: string) => void }) {
  const [city, setCity] = useState('all');
  const [placeType, setPlaceType] = useState<PlaceFilter>('all');
  const [weather, setWeather] = useState<WeatherFilter>('all');
  const cities = useMemo(() => [...new Set(cityAlternatives.map((alternative) => alternative.city))], []);
  const visible = cityAlternatives.filter((alternative) =>
    (city === 'all' || alternative.city === city)
    && (placeType === 'all' || (placeType === 'food' ? alternative.place.type === 'food' : alternative.place.type !== 'food'))
    && (weather === 'all' || alternative.weatherFit === 'indoors'),
  );

  const clearFilters = () => { setCity('all'); setPlaceType('all'); setWeather('all'); };
  const filtersActive = city !== 'all' || placeType !== 'all' || weather !== 'all';

  return <section className="section city-guide-section" id="city-guide" aria-labelledby="city-guide-title">
    <div className="section-heading"><div><span className="eyebrow">Optional swaps along the route</span><h2 id="city-guide-title" tabIndex={-1}>City guide</h2></div><span className="section-count">{cityAlternatives.length} researched alternatives</span></div>
    <details className="city-guide-board"><summary className="city-guide-summary"><span><strong>Find a nearby food stop or change of pace</strong><small>These are alternatives for dated plans. They do not add another commitment.</small></span><span className="city-guide-toggle">Browse guide <ChevronDown size={17} /></span></summary>
      <div className="city-guide-content"><div className="city-guide-filters">
        <label><span>City</span><select value={city} onChange={(event) => setCity(event.target.value)} aria-label="Filter city guide by city"><option value="all">All cities</option>{cities.map((name) => <option value={name} key={name}>{name}</option>)}</select></label>
        <label><span>Food or sights</span><select value={placeType} onChange={(event) => setPlaceType(event.target.value as PlaceFilter)} aria-label="Filter city guide by food or sights"><option value="all">Food and sights</option><option value="food">Food</option><option value="sight">Sights</option></select></label>
        <label><span>Weather</span><select value={weather} onChange={(event) => setWeather(event.target.value as WeatherFilter)} aria-label="Filter city guide for indoor options"><option value="all">Any weather</option><option value="indoors">Indoor options</option></select></label>
        <p role="status" aria-live="polite">{visible.length} option{visible.length === 1 ? '' : 's'} shown</p>{filtersActive && <button type="button" className="planner-filter-reset" onClick={clearFilters}>Clear filters</button>}
      </div>
      {visible.length ? <div className="city-guide-grid">{visible.map((alternative) => {
        const targetDay = alternative.suitableDayIds.find((id) => tripDays.some((day) => day.id === id));
        const day = tripDays.find((item) => item.id === targetDay);
        const place = alternative.place;
        return <article className="city-guide-card" key={alternative.id}>
          <div className="city-guide-card-top"><span>{place.type === 'food' ? <Utensils size={14} /> : <MapPin size={14} />}{place.type === 'food' ? 'Food' : 'Sight'}</span><span>{alternative.weatherFit === 'indoors' ? 'Indoors' : alternative.weatherFit === 'outdoors' ? 'Outdoors' : 'Mixed setting'}</span></div>
          <h3>{place.name}</h3><p className="city-guide-area">{alternative.city} · {alternative.area}{place.durationMinutes ? ` · ${place.durationMinutes} min` : ''}</p>
          <p>{alternative.reason}</p>
          {place.type === 'food' && <p className="city-guide-cuisine"><strong>{place.mealContext ? `${place.mealContext[0].toUpperCase()}${place.mealContext.slice(1)} · ` : ''}{place.cuisine || 'Food option'}</strong>{place.signature ? ` · ${place.signature}` : ''}</p>}
          <details className="city-guide-visit-notes"><summary>Visit notes</summary><p>{place.description}</p>{place.verification === 'verify-before-trip' && <small>Check current hours, admission and access before choosing.</small>}</details>
          <div className="city-guide-links"><a href={googleMapsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer">Open map <ExternalLink size={12} /></a>{place.sourceUrl && <a href={place.sourceUrl} target="_blank" rel="noopener noreferrer">{place.sourceLabel || 'Source'} <ExternalLink size={12} /></a>}</div>
          {day && alternative.suitableDayIds.filter((id) => tripDays.some((item) => item.id === id)).map((dayId) => {
            const suitableDay = tripDays.find((item) => item.id === dayId)!;
            return <button type="button" className="text-button" key={dayId} onClick={() => onOpenDay(dayId)}>Open {suitableDay.weekday} {shortDate(dayId)} plan <ArrowRight size={14} /></button>;
          })}
        </article>;
      })}</div> : <div className="city-guide-empty" role="status"><p>No options match those filters. Choose another city or show all weather.</p>{filtersActive && <button type="button" className="secondary-button" onClick={clearFilters}>Clear filters</button>}</div>}
      </div>
    </details>
  </section>;
}
