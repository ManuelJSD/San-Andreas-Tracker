import { Injectable, signal, inject } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.featuregroup.subgroup';
import '@geoman-io/leaflet-geoman-free';
import { StorageService } from './storage.service';
import { getCustomIcon } from '../utils/custom-icons';
import { leafletToGtaCoordinates } from '../utils/coordinates';

export type TileLayerType = 'ingame' | 'satellite';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private storage = inject(StorageService);

  private map: L.Map | null = null;
  private tileLayers: Record<TileLayerType, L.TileLayer> = {} as any;
  private parentClusterGroup: L.MarkerClusterGroup | null = null;

  public isMapReady = signal<boolean>(false);
  public activeTileLayer = signal<TileLayerType>('ingame');
  public isShareMarkerActive = signal<boolean>(false);
  public shareMarkerCoords = signal<{ lat: number; lng: number; gtaX: number; gtaY: number } | null>(null);
  public isEditMode = signal<boolean>(false);
  public activeEditingLayerId = signal<string | null>(null);

  private shareMarker: L.Marker | null = null;
  private highlightedLayers: (L.Layer & { _prevStyle?: any; _prevHtml?: string })[] = [];
  public destroyMap(): void {
    if (this.map) {
      try {
        this.map.off();
        this.map.remove();
      } catch (e) {
        console.warn('Error removing map:', e);
      }
      this.map = null;
      this.isMapReady.set(false);
    }
  }

  public initMap(containerId: string): L.Map {
    const el = document.getElementById(containerId);
    if (el && (el as any)._leaflet_id) {
      (el as any)._leaflet_id = null;
    }

    if (this.map) {
      this.destroyMap();
    }

    const savedTile = this.storage.getItem<TileLayerType>('active_tile_layer', 'ingame');
    this.activeTileLayer.set(savedTile);

    // GTA SA map bounds in CRS.Simple:
    // (0,0) top-left, (-192, 192) bottom-right
    const mapBounds = L.latLngBounds(L.latLng(0, 0), L.latLng(-192, 192));

    this.map = L.map(containerId, {
      crs: L.CRS.Simple,
      minZoom: 1,
      maxZoom: 8,
      zoomControl: false,
      attributionControl: false,
      maxBounds: L.latLngBounds(L.latLng(30, -30), L.latLng(-222, 222)),
      maxBoundsViscosity: 0.8
    });

    // Setup base tile layers
    this.tileLayers.ingame = L.tileLayer('map_tiles/{z}/{x}/{y}.png', {
      minNativeZoom: 2,
      maxNativeZoom: 5,
      minZoom: 1,
      maxZoom: 8,
      noWrap: true,
      bounds: mapBounds,
      attribution: 'Map from TheCynicalAutist'
    });

    this.tileLayers.satellite = L.tileLayer('satellite_tiles/{z}/{x}/{y}.png', {
      minNativeZoom: 0,
      maxNativeZoom: 5,
      minZoom: 1,
      maxZoom: 8,
      noWrap: true,
      tileSize: 262,
      bounds: mapBounds,
      attribution: 'Map by Ian Albert'
    });

    // Add active base tile layer
    this.tileLayers[savedTile].addTo(this.map);

    // Create central parent cluster group
    this.parentClusterGroup = (L as any).markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 35,
      disableClusteringAtZoom: 7,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        let sizeClass = 'marker-cluster-small';
        if (count > 20) sizeClass = 'marker-cluster-medium';
        if (count > 50) sizeClass = 'marker-cluster-large';

        return L.divIcon({
          html: `<div class="gta-cluster ${sizeClass}"><span>${count}</span></div>`,
          className: 'custom-cluster-icon',
          iconSize: [38, 38]
        });
      }
    });

    if (this.parentClusterGroup) {
      this.map.addLayer(this.parentClusterGroup);
    }

    // Set initial view centered on San Andreas
    this.map.fitBounds(mapBounds, { padding: [20, 20] });

    // Handle map click for share marker placement & highlight clearing
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.removeAllHighlights();

      if (this.isShareMarkerActive()) {
        this.placeShareMarker(e.latlng);
      }
    });

    // Initialize Geoman options - use L.PM.setOptIn for global opt-in
    try {
      if ((L as any).PM && typeof (L as any).PM.setOptIn === 'function') {
        (L as any).PM.setOptIn(true);
      }
    } catch (e) {
      console.warn('Geoman PM not available:', e);
    }

    this.isMapReady.set(true);
    this.checkUrlParams();

    return this.map;
  }

  public getMap(): L.Map | null {
    return this.map;
  }

  public getParentClusterGroup(): L.MarkerClusterGroup | null {
    return this.parentClusterGroup;
  }

  public setTileLayer(type: TileLayerType): void {
    if (!this.map) return;

    if (this.activeTileLayer() !== type) {
      this.map.removeLayer(this.tileLayers[this.activeTileLayer()]);
      this.tileLayers[type].addTo(this.map);
      this.activeTileLayer.set(type);
      this.storage.setItem('active_tile_layer', type);
    }
  }

  public toggleTileLayer(): void {
    const next = this.activeTileLayer() === 'ingame' ? 'satellite' : 'ingame';
    this.setTileLayer(next);
  }

  public zoomIn(): void {
    this.map?.zoomIn();
  }

  public zoomOut(): void {
    this.map?.zoomOut();
  }

  public resetView(): void {
    if (!this.map) return;
    const mapBounds = L.latLngBounds(L.latLng(0, 0), L.latLng(-192, 192));
    this.map.fitBounds(mapBounds, { padding: [20, 20], maxZoom: 6 });
  }

  public zoomToBounds(bounds: L.LatLngBoundsExpression, maxZoom: number = 6): void {
    this.map?.fitBounds(bounds, { maxZoom, padding: [40, 40] });
  }

  public panTo(latlng: L.LatLngExpression, zoom: number = 6): void {
    this.map?.setView(latlng, zoom, { animate: true });
  }

  // --- HIGHLIGHT SYSTEM ---

  public highlightLayer(layer: any): void {
    if (!layer || this.highlightedLayers.includes(layer)) return;

    if (layer instanceof L.Path) {
      const origStyle = {
        color: (layer.options as any).color,
        fillColor: (layer.options as any).fillColor,
        opacity: (layer.options as any).opacity,
        fillOpacity: (layer.options as any).fillOpacity,
        weight: (layer.options as any).weight
      };
      (layer as any)._prevStyle = origStyle;
      layer.setStyle({
        color: '#ff0033',
        weight: 6,
        opacity: 1,
        fillOpacity: 0.7
      });
      if (!(L.Browser as any).ie) {
        layer.bringToFront();
      }
    } else if (typeof (layer as any).getIcon === 'function') {
      const icon = (layer as any).getIcon();
      if (icon && icon.options && icon.options.html) {
        (layer as any)._prevHtml = icon.options.html;
        icon.options.html = `<div class="map-marker-ping"></div>${icon.options.html}`;
        (layer as any).setIcon(icon);
      }
    }

    this.highlightedLayers.push(layer);
  }

  public removeAllHighlights(): void {
    this.highlightedLayers.forEach(layer => {
      if (layer instanceof L.Path && (layer as any)._prevStyle) {
        layer.setStyle((layer as any)._prevStyle);
      } else if (typeof (layer as any).getIcon === 'function' && (layer as any)._prevHtml) {
        const icon = (layer as any).getIcon();
        icon.options.html = (layer as any)._prevHtml;
        (layer as any).setIcon(icon);
      }
    });
    this.highlightedLayers = [];
  }

  // --- SHARE MARKER ---

  public toggleShareMarkerMode(): void {
    const next = !this.isShareMarkerActive();
    this.isShareMarkerActive.set(next);
    if (!next && this.shareMarker) {
      this.removeShareMarker();
    }
  }

  public placeShareMarker(latlng: L.LatLng): void {
    if (!this.map) return;

    if (!this.shareMarker) {
      this.shareMarker = L.marker(latlng, {
        icon: getCustomIcon('fa-share-nodes', undefined, '#06b6d4'),
        draggable: true,
        riseOnHover: true
      });

      this.shareMarker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        this.updateShareMarkerData(pos);
      });

      this.shareMarker.addTo(this.map);
    } else {
      this.shareMarker.setLatLng(latlng);
    }

    this.updateShareMarkerData(latlng);
  }

  private updateShareMarkerData(latlng: L.LatLng): void {
    const gtaCoords = leafletToGtaCoordinates(latlng);
    this.shareMarkerCoords.set({
      lat: Number(latlng.lat.toFixed(3)),
      lng: Number(latlng.lng.toFixed(3)),
      gtaX: gtaCoords[0],
      gtaY: gtaCoords[1]
    });

    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${latlng.lng.toFixed(3)},${latlng.lat.toFixed(3)}`;
    window.history.replaceState({}, '', `?share=${latlng.lng.toFixed(3)},${latlng.lat.toFixed(3)}`);

    if (this.shareMarker) {
      this.shareMarker.bindPopup(`
        <div class="p-3 bg-neutral-900 text-white rounded-lg min-w-[200px] border border-amber-500/40">
          <h4 class="font-bold text-amber-400 text-sm mb-1 flex items-center gap-1.5">
            <i class="fas fa-location-dot"></i> Shared Location
          </h4>
          <p class="text-xs text-neutral-300 mb-1">GTA: <strong>X: ${gtaCoords[0]}, Y: ${gtaCoords[1]}</strong></p>
          <div class="mt-2 flex gap-2">
            <button onclick="navigator.clipboard.writeText('${shareUrl}'); alert('Link copied!');" class="w-full py-1 px-2 text-xs bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded transition">
              Copy URL
            </button>
          </div>
        </div>
      `).openPopup();
    }
  }

  public removeShareMarker(): void {
    if (this.shareMarker && this.map) {
      this.map.removeLayer(this.shareMarker);
      this.shareMarker = null;
      this.shareMarkerCoords.set(null);
      this.isShareMarkerActive.set(false);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  // --- URL STATE CHECK ---

  private checkUrlParams(): void {
    const params = new URLSearchParams(window.location.search);
    if (params.has('share')) {
      const share = params.get('share');
      if (share) {
        const [lng, lat] = share.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng) && this.map) {
          const latlng = L.latLng(lat, lng);
          this.isShareMarkerActive.set(true);
          this.placeShareMarker(latlng);
          this.map.setView(latlng, 6);
        }
      }
    }
  }

  // Set URL query parameter for feature navigation
  public setFeatureHistory(layerId?: string, featureId?: string): void {
    if (layerId && featureId) {
      window.history.replaceState({}, '', `?list=${layerId}&id=${featureId}`);
    } else if (layerId) {
      window.history.replaceState({}, '', `?list=${layerId}`);
    } else {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }
}
