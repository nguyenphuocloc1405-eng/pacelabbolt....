import type { GPXPoint, GPXResult } from '@/types';

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function parseGPX(xmlText: string): GPXResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid GPX file');
  }

  const trkpts = Array.from(doc.querySelectorAll('trkpt'));
  if (trkpts.length === 0) {
    throw new Error('No track points found in GPX file');
  }

  const points: GPXPoint[] = trkpts.map((pt) => {
    const lat = parseFloat(pt.getAttribute('lat') ?? '0');
    const lon = parseFloat(pt.getAttribute('lon') ?? '0');
    const eleNode = pt.querySelector('ele');
    const timeNode = pt.querySelector('time');
    return {
      lat,
      lon,
      ele: eleNode ? parseFloat(eleNode.textContent ?? '0') : null,
      time: timeNode ? timeNode.textContent ?? null : null,
    };
  });

  let distanceKm = 0;
  for (let i = 1; i < points.length; i++) {
    distanceKm += haversine(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
  }

  let durationMin = 0;
  const firstTime = points[0].time;
  const lastTime = points[points.length - 1].time;
  if (firstTime && lastTime) {
    const start = new Date(firstTime).getTime();
    const end = new Date(lastTime).getTime();
    if (!isNaN(start) && !isNaN(end)) {
      durationMin = (end - start) / 60000;
    }
  }

  let elevationGain = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].ele !== null && points[i - 1].ele !== null) {
      const diff = (points[i].ele as number) - (points[i - 1].ele as number);
      if (diff > 0) elevationGain += diff;
    }
  }

  const avgPaceSecPerKm = distanceKm > 0 && durationMin > 0
    ? Math.round((durationMin * 60) / distanceKm)
    : 0;

  const routePoints: [number, number][] = points.map((p) => [p.lat, p.lon]);

  return {
    points: routePoints,
    distanceKm,
    durationMin,
    elevationGain,
    avgPaceSecPerKm,
  };
}
