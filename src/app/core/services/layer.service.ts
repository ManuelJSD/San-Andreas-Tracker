import { Injectable, inject, signal, computed } from '@angular/core';
import * as L from 'leaflet';
import { LayerMetadata } from '../models/layer.model';
import { CollectibleFeature, CollectibleItem, LayerId } from '../models/collectible.model';
import { CustomLayerData } from '../models/custom-layer.model';
import { MapService } from './map.service';
import { ProgressService } from './progress.service';
import { StorageService } from './storage.service';
import { I18nService } from './i18n.service';
import { gtaCoordinatesToLeaflet } from '../utils/coordinates';
import { getCustomIcon } from '../utils/custom-icons';

// Import JSON data
import tagsData from '../../data/tags.json';
import snapshotsData from '../../data/snapshots.json';
import horseshoesData from '../../data/horseshoes.json';
import oystersData from '../../data/oysters.json';
import stuntJumpsData from '../../data/stunt_jumps.json';
import copBribesData from '../../data/cop_bribes.json';
import raceTournamentsData from '../../data/race_tournaments.json';
import bustedWarpsData from '../../data/busted_warps.json';
import deathWarpsData from '../../data/death_warps.json';
import airportsData from '../../data/airports.json';
import safeHousesData from '../../data/safe_houses.json';

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  private mapService = inject(MapService);
  private progressService = inject(ProgressService);
  private storage = inject(StorageService);
  public i18n = inject(I18nService);

  // Layer metadata definitions
  public readonly layerMetadata: LayerMetadata[] = [
    {
      id: 'tags',
      name: 'Spray Tags',
      icon: 'fa-spray-can',
      iconType: 'fa',
      color: '#22c55e',
      tagColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description:
        "100 Grove Street spray tags located across Los Santos. Complete for weapons at CJ's Johnson House.",
      isDefault: true,
      createCheckbox: true,
      createPopup: true,
      totalCount: 100,
      category: 'collectibles',
      rewardText: 'Molotov, Sawn-off, Tec-9, AK-47 at Johnson House',
    },
    {
      id: 'snapshots',
      name: 'Snapshots',
      icon: 'fa-camera',
      iconType: 'fa',
      color: '#3b82f6',
      tagColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      description:
        '50 photo opportunities in San Fierro. Take photos with your camera to complete.',
      isDefault: true,
      createCheckbox: true,
      createPopup: true,
      totalCount: 50,
      category: 'collectibles',
      rewardText: 'Micro-SMG, Grenades, Sniper, Shotgun at Doherty Garage',
    },
    {
      id: 'horseshoes',
      name: 'Horseshoes',
      icon: 'fa-horse',
      iconType: 'fa',
      color: '#f59e0b',
      tagColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      description:
        '50 lucky horseshoes scattered around Las Venturas. Increases Luck stat to 1,000.',
      isDefault: true,
      createCheckbox: true,
      createPopup: true,
      totalCount: 50,
      category: 'collectibles',
      rewardText: 'SMG, Satchel Charges, Combat Shotgun, M4 at Four Dragons',
    },
    {
      id: 'oysters',
      name: 'Oysters',
      icon: '🦪',
      iconType: 'emoji',
      color: '#06b6d4',
      tagColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      description:
        '50 oysters submerged in oceans, rivers and swimming pools throughout San Andreas.',
      isDefault: true,
      createCheckbox: true,
      createPopup: true,
      totalCount: 50,
      category: 'collectibles',
      rewardText: 'Max Lung Capacity & 100% Sex Appeal with girlfriends',
    },
    {
      id: 'stunt_jumps',
      name: 'Unique Stunt Jumps',
      icon: 'fa-car-burst',
      iconType: 'fa',
      color: '#ec4899',
      tagColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      description: '70 unique cinematic stunt jumps to conquer across San Andreas with vehicles.',
      isDefault: false,
      createCheckbox: true,
      createPopup: true,
      totalCount: 70,
      category: 'collectibles',
      rewardText: '$500 cash per jump + 100% completion progress',
    },
    {
      id: 'cop_bribes',
      name: 'Police Bribes',
      icon: 'fa-star',
      iconType: 'fa',
      color: '#eab308',
      tagColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      description: 'Floating police badge icons that reduce wanted level by 1 star when picked up.',
      isDefault: false,
      createCheckbox: true,
      createPopup: true,
      totalCount: 65,
      category: 'utilities',
      rewardText: 'Reduces Wanted Level by 1 Star',
    },
    {
      id: 'race_tournaments',
      name: 'Race Tournaments',
      icon: 'fa-flag-checkered',
      iconType: 'fa',
      color: '#8b5cf6',
      tagColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      description: 'Street race circuits in Los Santos, San Fierro, Las Venturas, and Air races.',
      isDefault: false,
      createCheckbox: true,
      createPopup: true,
      totalCount: 25,
      category: 'activities',
      rewardText: '$10,000 first prize per race + completion status',
    },
    {
      id: 'busted_warps',
      name: 'Busted Police Warps',
      icon: '👮',
      iconType: 'emoji',
      color: '#38bdf8',
      tagColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      description: 'Police department spawn zones and boundary areas when arrested in San Andreas.',
      isDefault: false,
      createCheckbox: false,
      createPopup: true,
      totalCount: 16,
      category: 'utilities',
      rewardText: 'Respawn zones when arrested',
    },
    {
      id: 'death_warps',
      name: 'Hospital Respawn Warps',
      icon: 'fa-hospital',
      iconType: 'fa',
      color: '#ef4444',
      tagColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      description:
        'Hospital locations and respawn zones when wasted. Katie Zhan girlfriend retains weapons!',
      isDefault: false,
      createCheckbox: false,
      createPopup: true,
      totalCount: 17,
      category: 'utilities',
      rewardText: 'Respawn hospital zones when wasted',
    },
    {
      id: 'airports',
      name: 'Airports',
      icon: 'fa-plane',
      iconType: 'fa',
      color: '#ef4444',
      tagColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      description: 'Airport locations',
      isDefault: false,
      createCheckbox: false,
      createPopup: true,
      totalCount: 4,
      category: 'utilities',
      rewardText: '',
    },
    {
      id: 'safe_houses',
      name: 'Safe Houses',
      icon: 'fa-home',
      iconType: 'fa',
      color: '#a78bfa',
      tagColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      description: 'Safe house locations',
      isDefault: true,
      createCheckbox: true,
      createPopup: true,
      totalCount: 37,
      category: 'utilities',
      rewardText: '',
    },
  ];

  // Active layers set
  public activeLayerIds = signal<Set<string>>(new Set());

  // Localized Layer Metadata (reactive to current language)
  public readonly localizedLayerMetadata = computed(() => {
    this.i18n.currentLang();
    return this.layerMetadata.map((meta) => ({
      ...meta,
      name: this.i18n.t(`layer.${meta.id}.name`),
      description: this.i18n.t(`layer.${meta.id}.desc`),
      rewardText: meta.rewardText ? this.i18n.t(`layer.${meta.id}.reward`) : undefined,
    }));
  });

  // Custom user created layers
  public customLayers = signal<CustomLayerData[]>([]);

  // Internal layer storage: layerId -> { subgroup: L.FeatureGroup, featureLayers: Map<featureId, L.Layer[]> }
  private layerInstances = new Map<
    string,
    {
      group: L.LayerGroup;
      featureLayers: Map<string, L.Layer[]>;
      bounds: L.LatLngBounds;
    }
  >();

  constructor() {
    this.loadCustomLayersFromStorage();
  }

  public initLayers(): void {
    const savedActive = this.storage.getItem<string[]>('active_layers', []);
    const initialActive = new Set<string>();

    if (savedActive.length > 0) {
      savedActive.forEach((id) => initialActive.add(id));
    } else {
      this.layerMetadata.filter((l) => l.isDefault).forEach((l) => initialActive.add(l.id));
    }

    this.activeLayerIds.set(initialActive);

    // Register and build all layers
    this.buildTagsLayer();
    this.buildSnapshotsLayer();
    this.buildHorseshoesLayer();
    this.buildOystersLayer();
    this.buildStuntJumpsLayer();
    this.buildCopBribesLayer();
    this.buildRaceTournamentsLayer();
    this.buildBustedWarpsLayer();
    this.buildDeathWarpsLayer();
    this.buildAirportsLayer();
    this.buildSafeHousesLayer();

    // Custom layers
    this.customLayers().forEach((cl) => this.buildCustomLayer(cl));

    // Show initial active layers on map
    initialActive.forEach((id) => this.showLayer(id));

    // Check URL parameters for direct feature navigation
    this.checkDirectNavigation();
  }

  public isLayerActive(layerId: string): boolean {
    return this.activeLayerIds().has(layerId);
  }

  public toggleLayer(layerId: string): void {
    const current = new Set(this.activeLayerIds());
    if (current.has(layerId)) {
      current.delete(layerId);
      this.hideLayer(layerId);
    } else {
      current.add(layerId);
      this.showLayer(layerId);
    }
    this.activeLayerIds.set(current);
    this.storage.setItem('active_layers', Array.from(current));
  }

  public showLayer(layerId: string): void {
    const instance = this.layerInstances.get(layerId);
    const map = this.mapService.getMap();
    if (instance && map && !map.hasLayer(instance.group)) {
      map.addLayer(instance.group);
    }
  }

  public hideLayer(layerId: string): void {
    const instance = this.layerInstances.get(layerId);
    const map = this.mapService.getMap();
    if (instance && map && map.hasLayer(instance.group)) {
      map.removeLayer(instance.group);
    }
  }

  public zoomToLayer(layerId: string): void {
    const instance = this.layerInstances.get(layerId);
    if (instance && instance.bounds.isValid()) {
      if (!this.isLayerActive(layerId)) {
        this.toggleLayer(layerId);
      }
      this.mapService.zoomToBounds(instance.bounds, 6);
    }
  }

  public zoomToFeature(layerId: string, featureId: string): void {
    if (!this.isLayerActive(layerId)) {
      this.toggleLayer(layerId);
    }

    const instance = this.layerInstances.get(layerId);
    if (!instance) return;

    const layers = instance.featureLayers.get(featureId);
    if (!layers || layers.length === 0) return;

    this.mapService.removeAllHighlights();

    const bounds = L.latLngBounds([]);
    layers.forEach((l) => {
      this.mapService.highlightLayer(l);
      if (l instanceof L.Polyline) {
        bounds.extend(l.getBounds());
      } else if (l instanceof L.Circle) {
        const c = l.getLatLng();
        const r = (l as any).getRadius ? (l as any).getRadius() : 2;
        bounds.extend([
          [c.lat - r, c.lng - r],
          [c.lat + r, c.lng + r],
        ]);
      } else if (l instanceof L.Marker) {
        bounds.extend(l.getLatLng());
      }
    });

    if (bounds.isValid()) {
      if (layers.length === 1 && layers[0] instanceof L.Marker) {
        const marker = layers[0] as L.Marker;
        const parentCluster = this.mapService.getParentClusterGroup();
        if (parentCluster && (parentCluster as any).hasLayer(marker)) {
          (parentCluster as any).zoomToShowLayer(marker, () => {
            this.mapService.panTo(marker.getLatLng(), 6);
            marker.openPopup();
          });
          return;
        }
      }
      this.mapService.zoomToBounds(bounds, 6);
    }
  }

  // --- POPUP GENERATOR ---

  private createPopupContent(
    layerId: string,
    feature: CollectibleFeature,
    layer: L.Layer,
  ): HTMLElement {
    const container = document.createElement('div');
    container.className = 'gta-popup-content';

    const header = document.createElement('div');
    header.className = 'gta-popup-header';

    const title = document.createElement('h3');
    title.className = 'gta-popup-title';
    title.textContent =
      feature.properties.name || `${this.getLayerName(layerId)} #${feature.properties.id}`;
    header.appendChild(title);

    container.appendChild(header);

    // Media: image or video
    const mediaEl = this.createPopupMedia(layerId, feature);
    if (mediaEl) {
      container.appendChild(mediaEl);
    }

    // Description
    if (feature.properties.description) {
      const desc = document.createElement('p');
      desc.className = 'gta-popup-desc';
      desc.textContent = feature.properties.description;
      container.appendChild(desc);
    }

    // Collectible Checkbox (Toggle completed status)
    const meta = this.layerMetadata.find((l) => l.id === layerId);
    if (meta?.createCheckbox) {
      const isChecked = this.progressService.isChecked(layerId, feature.properties.id);

      const checkboxContainer = document.createElement('label');
      checkboxContainer.className = `gta-popup-checkbox-btn ${isChecked ? 'completed' : ''}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isChecked;

      const iconSpan = document.createElement('span');
      iconSpan.innerHTML = isChecked
        ? '<i class="fas fa-check-circle text-emerald-400"></i>'
        : '<i class="far fa-circle text-neutral-400"></i>';

      const labelText = document.createElement('span');
      labelText.className = 'btn-label-text';
      labelText.textContent = isChecked
        ? this.i18n.t('popup.completed')
        : this.i18n.t('popup.markAsCollected');

      checkbox.addEventListener('change', () => {
        const next = this.progressService.toggleChecked(
          layerId,
          feature.properties.id,
          checkbox.checked,
        );
        checkbox.checked = next;
        if (next) {
          checkboxContainer.classList.add('completed');
          iconSpan.innerHTML = '<i class="fas fa-check-circle text-emerald-400"></i>';
          labelText.textContent = this.i18n.t('popup.completed');
        } else {
          checkboxContainer.classList.remove('completed');
          iconSpan.innerHTML = '<i class="far fa-circle text-neutral-400"></i>';
          labelText.textContent = this.i18n.t('popup.markAsCollected');
        }

        // Update marker icon to toggle ghost mode
        if (layer instanceof L.Marker && layer.options.icon) {
          const iconOpts = (layer.options.icon as L.DivIcon).options;
          if (typeof iconOpts.html === 'string') {
            let html = iconOpts.html;
            if (next && !html.includes('marker-ghost')) {
              html = html.replace('class="marker-root ', 'class="marker-root marker-ghost ');
              html = html.replace('class="marker-root"', 'class="marker-root marker-ghost"'); // Fallback
            } else if (!next && html.includes('marker-ghost')) {
              html = html
                .replace('marker-ghost ', '')
                .replace('marker-ghost', '')
                .replace('  ', ' ');
            }
            layer.setIcon(L.divIcon({ ...iconOpts, html }));
          }
        }
      });

      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(iconSpan);
      checkboxContainer.appendChild(labelText);
      container.appendChild(checkboxContainer);
    }

    // Locate & Share Action
    const footer = document.createElement('div');
    footer.className = 'gta-popup-footer';

    const shareBtn = document.createElement('button');
    shareBtn.className = 'gta-popup-share-btn';
    shareBtn.innerHTML = `<i class="fas fa-share-nodes"></i> ${this.i18n.t('popup.shareUrl')}`;
    shareBtn.addEventListener('click', () => {
      const shareUrl = `${window.location.origin}${window.location.pathname}?list=${layerId}&id=${feature.properties.id}`;
      navigator.clipboard.writeText(shareUrl);
      this.mapService.setFeatureHistory(layerId, feature.properties.id);
      alert(this.i18n.t('popup.linkCopied'));
    });
    footer.appendChild(shareBtn);

    container.appendChild(footer);

    return container;
  }

  private createPopupMedia(layerId: string, feature: CollectibleFeature): HTMLElement | null {
    if (feature.properties.image_id) {
      // Changed to use local images format: images/<layerId>/<id>.webp
      const imageSrc = `images/${layerId}/${feature.properties.id}.webp`;

      const mediaWrap = document.createElement('div');
      mediaWrap.className = 'gta-popup-media-wrap';

      const img = document.createElement('img');
      img.src = imageSrc;
      img.className = 'gta-popup-img';
      img.alt = feature.properties.name || feature.properties.id;
      img.loading = 'lazy';
      img.style.cursor = 'zoom-in'; // Indicate it's clickable

      // Lightbox functionality
      img.onclick = () => {
        const lightbox = document.createElement('div');
        lightbox.style.position = 'fixed';
        lightbox.style.top = '0';
        lightbox.style.left = '0';
        lightbox.style.width = '100vw';
        lightbox.style.height = '100vh';
        lightbox.style.backgroundColor = 'rgba(0,0,0,0.85)';
        lightbox.style.zIndex = '9999';
        lightbox.style.display = 'flex';
        lightbox.style.justifyContent = 'center';
        lightbox.style.alignItems = 'center';
        lightbox.style.cursor = 'zoom-out';

        const largeImg = document.createElement('img');
        largeImg.src = img.src; // Uses the same source (including placeholder if fallback triggered)
        largeImg.style.maxWidth = '90%';
        largeImg.style.maxHeight = '90%';
        largeImg.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
        largeImg.style.borderRadius = '8px';
        largeImg.style.objectFit = 'contain';

        lightbox.appendChild(largeImg);
        lightbox.onclick = () => document.body.removeChild(lightbox);
        document.body.appendChild(lightbox);
      };

      img.onerror = () => {
        img.onerror = null; // Prevent infinite loop if placeholder is also missing
        img.src = 'images/placeholder.webp';
      };

      mediaWrap.appendChild(img);
      return mediaWrap;
    } else if (feature.properties.video_id) {
      const videoWrap = document.createElement('div');
      videoWrap.className = 'gta-popup-video-wrap';

      const iframe = document.createElement('iframe');
      iframe.className = 'gta-popup-iframe';
      iframe.src = `https://www.youtube-nocookie.com/embed/${feature.properties.video_id}`;
      iframe.title = 'YouTube video';
      iframe.frameBorder = '0';
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;

      videoWrap.appendChild(iframe);
      return videoWrap;
    }
    return null;
  }

  // --- LAYER BUILDERS ---

  private buildStandardPointLayer(
    layerId: LayerId,
    geojsonData: any,
    iconId: string,
    iconColor: string,
  ): void {
    const parentCluster = this.mapService.getParentClusterGroup();
    const L_ext = (window as any).L || L;
    const subgroup = L_ext.featureGroup.subGroup(parentCluster);
    const featureMap = new Map<string, L.Layer[]>();
    const bounds = L.latLngBounds([]);
    const collectibleItems: CollectibleItem[] = [];

    const geojsonLayer = L.geoJSON(geojsonData, {
      pointToLayer: (feature: any, latlng: L.LatLng) => {
        const isCompleted = this.progressService.isChecked(layerId, String(feature.properties.id));
        const marker = L.marker(latlng, {
          icon: getCustomIcon(iconId, undefined, iconColor, isCompleted),
          riseOnHover: true,
        });

        marker.bindPopup(() => this.createPopupContent(layerId, feature, marker), {
          maxWidth: 320,
          className: 'gta-leaflet-popup',
        });

        marker.on('click', () => {
          this.mapService.setFeatureHistory(layerId, feature.properties.id);
        });

        return marker;
      },
      coordsToLatLng: (coords: any) => {
        const latlng = gtaCoordinatesToLeaflet(coords);
        bounds.extend(latlng);
        return latlng;
      },
      onEachFeature: (feature: any, layer: L.Layer) => {
        const fid = String(feature.properties.id);
        if (!featureMap.has(fid)) {
          featureMap.set(fid, []);
        }
        featureMap.get(fid)!.push(layer);

        // Register item
        const latlng = gtaCoordinatesToLeaflet(feature.geometry.coordinates);
        collectibleItems.push({
          id: fid,
          layerId,
          title: feature.properties.name || `${this.getLayerName(layerId)} #${fid}`,
          description: feature.properties.description,
          imageId: feature.properties.image_id,
          imageLink: feature.properties.image_link,
          videoId: feature.properties.video_id,
          completed: this.progressService.isChecked(layerId, fid),
          coordinates: [latlng.lat, latlng.lng],
        });
      },
    });

    subgroup.addLayer(geojsonLayer);
    this.layerInstances.set(layerId, { group: subgroup, featureLayers: featureMap, bounds });
    this.progressService.registerCollectibles(collectibleItems);
  }

  private buildTagsLayer(): void {
    this.buildStandardPointLayer('tags', tagsData, 'fa-spray-can', '#22c55e');
  }

  private buildSnapshotsLayer(): void {
    this.buildStandardPointLayer('snapshots', snapshotsData, 'fa-camera', '#3b82f6');
  }

  private buildHorseshoesLayer(): void {
    this.buildStandardPointLayer('horseshoes', horseshoesData, 'fa-horse', '#f59e0b');
  }

  private buildOystersLayer(): void {
    this.buildStandardPointLayer('oysters', oystersData, 'emoji:🦪', '#06b6d4');
  }

  private buildCopBribesLayer(): void {
    this.buildStandardPointLayer('cop_bribes', copBribesData, 'fa-star', '#eab308');
  }

  private buildAirportsLayer(): void {
    this.buildStandardPointLayer('airports', airportsData, 'fa-plane', '#06b6d4');
  }

  private buildSafeHousesLayer(): void {
    this.buildStandardPointLayer('safe_houses', safeHousesData, 'fa-home', '#a78bfa');
  }

  private buildStuntJumpsLayer(): void {
    const parentCluster = this.mapService.getParentClusterGroup();
    const L_ext = (window as any).L || L;
    const subgroup = L_ext.featureGroup.subGroup(parentCluster);
    const featureMap = new Map<string, L.Layer[]>();
    const bounds = L.latLngBounds([]);
    const collectibleItems: CollectibleItem[] = [];

    const geojsonLayer = L.geoJSON(stuntJumpsData as any, {
      style: () => ({
        color: '#ec4899',
        weight: 4,
        opacity: 0.8,
        fillColor: '#ec4899',
        fillOpacity: 0.2,
      }),
      pointToLayer: (feature: any, latlng: L.LatLng) => {
        const isCompleted = this.progressService.isChecked(
          'stunt_jumps',
          String(feature.properties.id),
        );
        const marker = L.marker(latlng, {
          icon: getCustomIcon('fa-car-burst', undefined, '#ec4899', isCompleted),
          riseOnHover: true,
        });

        marker.bindPopup(() => this.createPopupContent('stunt_jumps', feature, marker), {
          maxWidth: 320,
          className: 'gta-leaflet-popup',
        });

        return marker;
      },
      coordsToLatLng: (coords: any) => {
        const latlng = gtaCoordinatesToLeaflet(coords);
        bounds.extend(latlng);
        return latlng;
      },
      onEachFeature: (feature: any, layer: L.Layer) => {
        const fid = String(feature.properties.id);
        if (!featureMap.has(fid)) {
          featureMap.set(fid, []);
        }
        featureMap.get(fid)!.push(layer);

        if (feature.geometry.type === 'Point') {
          const latlng = gtaCoordinatesToLeaflet(feature.geometry.coordinates);
          collectibleItems.push({
            id: fid,
            layerId: 'stunt_jumps',
            title: `Unique Stunt Jump #${fid}`,
            description: feature.properties.description,
            imageId: feature.properties.image_id,
            videoId: feature.properties.video_id,
            completed: this.progressService.isChecked('stunt_jumps', fid),
            coordinates: [latlng.lat, latlng.lng],
          });
        }

        layer.on({
          mouseover: () => {
            const list = featureMap.get(fid) || [];
            list.forEach((l) => this.mapService.highlightLayer(l));
          },
          mouseout: () => {
            this.mapService.removeAllHighlights();
          },
          click: () => {
            this.mapService.setFeatureHistory('stunt_jumps', fid);
          },
        });
      },
    });

    subgroup.addLayer(geojsonLayer);
    this.layerInstances.set('stunt_jumps', { group: subgroup, featureLayers: featureMap, bounds });
    this.progressService.registerCollectibles(collectibleItems);
  }

  private buildRaceTournamentsLayer(): void {
    const group = L.featureGroup();
    const featureMap = new Map<string, L.Layer[]>();
    const bounds = L.latLngBounds([]);
    const collectibleItems: CollectibleItem[] = [];

    const raceConfigs = [
      { data: (raceTournamentsData as any).los_santos_races, color: '#3b82f6', name: 'Los Santos' },
      { data: (raceTournamentsData as any).san_fierro_races, color: '#06b6d4', name: 'San Fierro' },
      {
        data: (raceTournamentsData as any).las_venturas_races,
        color: '#f59e0b',
        name: 'Las Venturas',
      },
      { data: (raceTournamentsData as any).air_races, color: '#eab308', name: 'Air Races' },
    ];

    raceConfigs.forEach((rc) => {
      if (!rc.data) return;

      const layer = L.geoJSON(rc.data, {
        style: () => ({
          color: rc.color,
          weight: 5,
          opacity: 0.85,
        }),
        pointToLayer: (feature: any, latlng: L.LatLng) => {
          bounds.extend(latlng);
          const isCompleted = this.progressService.isChecked(
            'race_tournaments',
            String(feature.properties.id),
          );
          const marker = L.marker(latlng, {
            icon: getCustomIcon('fa-flag-checkered', undefined, rc.color, isCompleted),
            riseOnHover: true,
          });

          marker.bindTooltip(`${rc.name}: ${feature.properties.id}`, {
            direction: 'bottom',
            className: 'gta-map-tooltip',
          });

          marker.bindPopup(() => this.createPopupContent('race_tournaments', feature, marker), {
            maxWidth: 320,
            className: 'gta-leaflet-popup',
          });

          return marker;
        },
        onEachFeature: (feature: any, l: L.Layer) => {
          const fid = String(feature.properties.id);
          if (!featureMap.has(fid)) {
            featureMap.set(fid, []);
          }
          featureMap.get(fid)!.push(l);

          if (feature.geometry.type === 'Point') {
            collectibleItems.push({
              id: fid,
              layerId: 'race_tournaments',
              title: `${rc.name} - ${fid}`,
              description: feature.properties.description,
              videoId: feature.properties.video_id,
              completed: this.progressService.isChecked('race_tournaments', fid),
              coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
            });
          }

          l.on({
            mouseover: () => {
              const list = featureMap.get(fid) || [];
              list.forEach((item) => this.mapService.highlightLayer(item));
            },
            mouseout: () => {
              this.mapService.removeAllHighlights();
            },
            click: () => {
              this.mapService.setFeatureHistory('race_tournaments', fid);
            },
          });
        },
      });

      group.addLayer(layer);
    });

    this.layerInstances.set('race_tournaments', { group, featureLayers: featureMap, bounds });
    this.progressService.registerCollectibles(collectibleItems);
  }

  private buildBustedWarpsLayer(): void {
    const group = L.featureGroup();
    const featureMap = new Map<string, L.Layer[]>();
    const bounds = L.latLngBounds([]);

    const layer = L.geoJSON(bustedWarpsData as any, {
      style: () => ({
        color: '#0284c7',
        fillColor: '#38bdf8',
        opacity: 0.8,
        fillOpacity: 0.25,
        weight: 3,
      }),
      pointToLayer: (feature: any, latlng: L.LatLng) => {
        bounds.extend(latlng);
        const marker = L.marker(latlng, {
          icon: getCustomIcon('emoji:👮', undefined, '#0284c7'),
          riseOnHover: true,
        });

        marker.bindPopup(() => this.createPopupContent('busted_warps', feature, marker), {
          maxWidth: 320,
          className: 'gta-leaflet-popup',
        });

        return marker;
      },
      onEachFeature: (feature: any, l: L.Layer) => {
        const fid = String(feature.properties.id);
        if (!featureMap.has(fid)) {
          featureMap.set(fid, []);
        }
        featureMap.get(fid)!.push(l);

        l.on({
          mouseover: () => {
            const list = featureMap.get(fid) || [];
            list.forEach((item) => this.mapService.highlightLayer(item));
          },
          mouseout: () => {
            this.mapService.removeAllHighlights();
          },
          click: () => {
            this.mapService.setFeatureHistory('busted_warps', fid);
          },
        });
      },
    });

    group.addLayer(layer);
    this.layerInstances.set('busted_warps', { group, featureLayers: featureMap, bounds });
  }

  private buildDeathWarpsLayer(): void {
    const group = L.featureGroup();
    const featureMap = new Map<string, L.Layer[]>();
    const bounds = L.latLngBounds([]);

    const layer = L.geoJSON(deathWarpsData as any, {
      style: (feature: any) => ({
        color: feature?.properties?.id === 'Katie' ? '#10b981' : '#ef4444',
        fillColor: feature?.properties?.id === 'Katie' ? '#10b981' : '#ef4444',
        opacity: 0.85,
        fillOpacity: 0.2,
        weight: 3,
      }),
      pointToLayer: (feature: any, latlng: L.LatLng) => {
        bounds.extend(latlng);
        if (feature.properties?.radius) {
          return L.circle(latlng, {
            radius: feature.properties.radius,
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.25,
          });
        }
        const marker = L.marker(latlng, {
          icon: getCustomIcon('fa-hospital', undefined, '#ef4444'),
          riseOnHover: true,
        });

        marker.bindPopup(() => this.createPopupContent('death_warps', feature, marker), {
          maxWidth: 320,
          className: 'gta-leaflet-popup',
        });

        return marker;
      },
      onEachFeature: (feature: any, l: L.Layer) => {
        const fid = String(feature.properties.id);
        if (!featureMap.has(fid)) {
          featureMap.set(fid, []);
        }
        featureMap.get(fid)!.push(l);

        l.on({
          mouseover: () => {
            const list = featureMap.get(fid) || [];
            list.forEach((item) => this.mapService.highlightLayer(item));
          },
          mouseout: () => {
            this.mapService.removeAllHighlights();
          },
          click: () => {
            this.mapService.setFeatureHistory('death_warps', fid);
          },
        });
      },
    });

    group.addLayer(layer);
    this.layerInstances.set('death_warps', { group, featureLayers: featureMap, bounds });
  }

  // --- CUSTOM USER LAYERS ---

  public createCustomLayer(name: string): CustomLayerData {
    const id = `custom_${Date.now()}`;
    const newLayer: CustomLayerData = {
      id,
      name,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
      createdAt: Date.now(),
    };

    const current = this.customLayers();
    const updated = [...current, newLayer];
    this.customLayers.set(updated);
    this.saveCustomLayersToStorage(updated);

    this.buildCustomLayer(newLayer);
    this.toggleLayer(id);

    return newLayer;
  }

  public deleteCustomLayer(id: string): void {
    this.hideLayer(id);
    this.layerInstances.delete(id);

    const updated = this.customLayers().filter((l) => l.id !== id);
    this.customLayers.set(updated);
    this.saveCustomLayersToStorage(updated);

    const active = new Set(this.activeLayerIds());
    active.delete(id);
    this.activeLayerIds.set(active);
  }

  public exportCustomLayer(id: string): void {
    const layer = this.customLayers().find((l) => l.id === id);
    if (!layer) return;

    const blob = new Blob([JSON.stringify(layer.geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${layer.name.toLowerCase().replace(/\s+/g, '_')}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private buildCustomLayer(customLayer: CustomLayerData): void {
    const group = L.featureGroup();
    const featureMap = new Map<string, L.Layer[]>();
    const bounds = L.latLngBounds([]);

    const geojsonLayer = L.geoJSON(customLayer.geojson as any, {
      pointToLayer: (feature: any, latlng: L.LatLng) => {
        bounds.extend(latlng);
        return L.marker(latlng, {
          icon: getCustomIcon(customLayer.name.substring(0, 2), undefined, '#a855f7'),
          riseOnHover: true,
        });
      },
    });

    group.addLayer(geojsonLayer);
    this.layerInstances.set(customLayer.id, { group, featureLayers: featureMap, bounds });
  }

  private loadCustomLayersFromStorage(): void {
    const list = this.storage.getItem<CustomLayerData[]>('custom_layers', []);
    this.customLayers.set(list);
  }

  private saveCustomLayersToStorage(layers: CustomLayerData[]): void {
    this.storage.setItem('custom_layers', layers);
  }

  public getLayerName(layerId: string): string {
    const key = `layer.${layerId}.name`;
    const val = this.i18n.t(key);
    if (val && val !== key) return val;
    const found = this.layerMetadata.find((l) => l.id === layerId);
    return found ? found.name : layerId;
  }

  private checkDirectNavigation(): void {
    const params = new URLSearchParams(window.location.search);
    const list = params.get('list');
    const id = params.get('id');

    if (list) {
      if (!this.isLayerActive(list)) {
        this.toggleLayer(list);
      }
      if (id) {
        setTimeout(() => this.zoomToFeature(list, id), 300);
      } else {
        setTimeout(() => this.zoomToLayer(list), 300);
      }
    }
  }
}
