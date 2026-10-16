import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, Route, Trash2, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009]; // Ho Chi Minh City
const DEFAULT_ZOOM = 13;

const blueIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#f97316;border:2px solid #fff;box-shadow:0 0 6px rgba(249,115,22,0.6)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const endIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#ef4444;border:2px solid #fff;box-shadow:0 0 6px rgba(239,68,68,0.6)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface RunMapProps {
  routePoints: [number, number][];
  onPointsChange?: (points: [number, number][]) => void;
  interactive?: boolean;
}

export default function RunMap({ routePoints, onPointsChange, interactive = false }: RunMapProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (!interactive || !onPointsChange) return;
      onPointsChange([...routePoints, [e.latlng.lat, e.latlng.lng] as [number, number]]);
    });

    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers and polyline when route changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (routePoints.length === 0) return;

    routePoints.forEach((pt, idx) => {
      const icon = idx === 0 ? blueIcon : idx === routePoints.length - 1 && routePoints.length > 1 ? endIcon : blueIcon;
      const marker = L.marker(pt, { icon }).addTo(map);
      if (interactive && onPointsChange) {
        marker.on('click', () => {
          const newPoints = routePoints.filter((_, i) => i !== idx);
          onPointsChange(newPoints);
        });
      }
      markersRef.current.push(marker);
    });

    if (routePoints.length >= 2) {
      polylineRef.current = L.polyline(routePoints, {
        color: '#f97316',
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 8',
      }).addTo(map);
    }

    if (routePoints.length > 0) {
      const bounds = L.latLngBounds(routePoints);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [routePoints, interactive, onPointsChange, mapReady]);

  // Fix tile rendering after becoming visible
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 100);
  }, [mapReady]);

  const routeDistance = (() => {
    let dist = 0;
    for (let i = 1; i < routePoints.length; i++) {
      const [lat1, lon1] = routePoints[i - 1];
      const [lat2, lon2] = routePoints[i];
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      dist += 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    return dist;
  })();

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800">
        <div ref={containerRef} className="h-80 w-full" style={{ background: '#1a1a1a' }} />
        {routePoints.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/40">
            <MapPin className="mb-2 h-8 w-8 text-neutral-600" />
            <p className="text-sm text-neutral-500">
              {interactive ? t('map.clickToAdd') : t('map.noRoute')}
            </p>
          </div>
        )}
      </div>

      {routePoints.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-neutral-400">{t('map.routeDistance')}</span>
            <span className="font-bold text-white">{routeDistance.toFixed(2)} km</span>
          </div>
          {interactive && onPointsChange && (
            <button
              onClick={() => onPointsChange([])}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-800"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('map.clearRoute')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export { RunMap };
