import { useEffect, useRef, useState } from 'react';
import { AttributionControl, LngLatBounds, Map, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { groupMapEntries, type MapEntry } from '../data/map';

setWorkerUrl(workerUrl);
const lngLat = ([lat, lon]: [number, number]): [number, number] => [lon, lat];
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const routeData = (points: [number, number][]) => ({ type: 'FeatureCollection' as const, features: points.length > 1 ? [{ type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: points.map(lngLat) } }] : [] });

interface Props {
  entries: MapEntry[];
  points: [number, number][];
  route: [number, number][];
  activeIds: string[];
  focusId?: string;
  reset: number;
  style: 'liberty' | 'positron';
  day: boolean;
  onPick: (entries: MapEntry[], keyboard: boolean) => void;
  onError: (failed: boolean) => void;
}

export default function VectorCanvas(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map>();
  const markers = useRef<Marker[]>([]);
  const latest = useRef(props);
  latest.current = props;
  const [ready, setReady] = useState(false);
  const [groups, setGroups] = useState<MapEntry[][]>([]);
  const fitRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!container.current) return;
    let map: Map;
    try {
      map = new Map({ container: container.current, style: `https://tiles.openfreemap.org/styles/${latest.current.style}`, center: [139, 39], zoom: 4.5, minZoom: 3, maxZoom: 18, attributionControl: false, cooperativeGestures: true, renderWorldCopies: false, maxPitch: 0 });
    } catch { latest.current.onError(true); return; }
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new AttributionControl({ compact: true, customAttribution: '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a>' }), 'bottom-right');
    map.getCanvas().setAttribute('aria-label', latest.current.day ? 'Interactive day map. Use the place list for all stop details.' : 'Interactive Japan route map. Select a labeled pin or use the place list.');
    const fit = () => {
      const points = latest.current.points;
      if (!points.length) return;
      map.resize();
      const bounds = new LngLatBounds(lngLat(points[0]), lngLat(points[0]));
      points.forEach((point) => bounds.extend(lngLat(point)));
      map.fitBounds(bounds, { padding: { top: 65, bottom: 65, left: 55, right: 65 }, maxZoom: points.length === 1 ? 12 : 13, duration: 0 });
    };
    fitRef.current = fit;
    const regroup = () => setGroups(groupMapEntries(latest.current.entries, (point) => map.project(lngLat(point))));
    const installRoute = () => {
      // Prefer readable English labels while keeping a local-name fallback.
      for (const layer of map.getStyle().layers ?? []) {
        if (layer.type === 'symbol' && JSON.stringify(layer.layout?.['text-field'] ?? '').includes('name')) {
          map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name'], '']);
        }
      }
      if (!map.getSource('trip-route')) map.addSource('trip-route', { type: 'geojson', data: routeData(latest.current.route) });
      if (!map.getLayer('trip-route-line')) map.addLayer({ id: 'trip-route-line', type: 'line', source: 'trip-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#b8543c', 'line-width': latest.current.day ? 2.5 : 3.5, 'line-opacity': .65, 'line-dasharray': [2, 2] } });
      latest.current.onError(false);
    };
    map.on('style.load', installRoute);
    map.on('load', () => { fit(); regroup(); setReady(true); latest.current.onError(false); });
    map.on('moveend', regroup);
    map.on('error', () => { if (!map.isStyleLoaded()) latest.current.onError(true); });
    const resize = new ResizeObserver(() => { map.resize(); regroup(); });
    resize.observe(container.current);
    return () => { resize.disconnect(); markers.current.forEach((marker) => marker.remove()); markers.current = []; map.remove(); mapRef.current = undefined; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    fitRef.current();
    setGroups(groupMapEntries(props.entries, (point) => map.project(lngLat(point))));
  }, [ready, props.entries, props.points, props.reset]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const source = map.getSource('trip-route') as import('maplibre-gl').GeoJSONSource | undefined;
    source?.setData(routeData(props.route));
  }, [ready, props.route]);

  const previousStyle = useRef(props.style);
  useEffect(() => {
    if (previousStyle.current === props.style) return;
    previousStyle.current = props.style;
    mapRef.current?.setStyle(`https://tiles.openfreemap.org/styles/${props.style}`);
  }, [props.style]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !props.focusId) return;
    const entry = props.entries.find((entry) => entry.id === props.focusId);
    if (entry) map.easeTo({ center: lngLat(entry.coordinates), zoom: Math.max(map.getZoom(), 13), duration: reducedMotion() ? 0 : 450 });
  }, [ready, props.focusId, props.entries]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    markers.current.forEach((marker) => marker.remove());
    markers.current = groups.map((group) => {
      const entry = group[0];
      const active = group.some((item) => props.activeIds.includes(item.id));
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `vector-pin pin-${entry.type}${group.length > 1 ? ' pin-cluster' : ''}${active ? ' is-active' : ''}`;
      button.setAttribute('aria-label', group.length > 1 ? `View ${group.length} nearby stops: ${group.slice(0, 3).map((item) => item.title).join(', ')}` : `View ${entry.title} · ${entry.subtitle}`);
      button.setAttribute('aria-pressed', String(active));
      button.title = group.length > 1 ? `${group.length} nearby stops` : entry.title;
      const dot = document.createElement('span');
      dot.className = 'vector-pin-dot'; dot.textContent = group.length > 1 ? `${group.length}` : entry.label;
      const label = document.createElement('span');
      label.className = 'vector-pin-label'; label.textContent = group.length > 1 ? `${group.length} stops` : entry.title;
      if (entry.city || active || group.length > 1) button.classList.add('has-label');
      button.append(dot, label);
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        latest.current.onPick(group, event.detail === 0);
        if (group.length > 1) {
          const bounds = new LngLatBounds(lngLat(entry.coordinates), lngLat(entry.coordinates));
          group.forEach((item) => bounds.extend(lngLat(item.coordinates)));
          map.fitBounds(bounds, { padding: 75, maxZoom: 15, duration: reducedMotion() ? 0 : 450 });
        } else map.easeTo({ center: lngLat(entry.coordinates), zoom: entry.city ? Math.max(map.getZoom(), 9) : Math.max(map.getZoom(), 13), duration: reducedMotion() ? 0 : 450 });
      });
      return new Marker({ element: button, anchor: 'center' }).setLngLat(lngLat(entry.coordinates)).addTo(map);
    });
    return () => { markers.current.forEach((marker) => marker.remove()); markers.current = []; };
  }, [groups, ready, props.activeIds]);

  return <div className="vector-canvas" ref={container} />;
}
