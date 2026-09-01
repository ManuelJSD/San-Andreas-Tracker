import * as L from 'leaflet';

/**
 * Converts GTA San Andreas in-game coordinates [x, y, (z)] to Leaflet [lat, lng]
 * In GTA: 0,0 is the center of a 6000x6000 unit map.
 * In Leaflet CRS.Simple: 192 / 6000 = 0.032 scale factor.
 */
export function gtaCoordinatesToLeaflet(coords: [number, number] | [number, number, number] | number[]): L.LatLng {
  const lx = (coords[0] + 3000) * 0.032;
  const ly = (coords[1] - 3000) * 0.032;
  return L.latLng(ly, lx);
}

/**
 * Converts Leaflet [lat, lng] to GTA San Andreas in-game coordinates [x, y]
 */
export function leafletToGtaCoordinates(latlng: L.LatLng): [number, number] {
  const x = Math.round((latlng.lng / 0.032) - 3000);
  const y = Math.round((latlng.lat / 0.032) + 3000);
  return [x, y];
}
