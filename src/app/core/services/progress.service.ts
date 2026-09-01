import { Injectable, inject, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { LayerId, CollectibleItem } from '../models/collectible.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private storage = inject(StorageService);

  // Map of completed items: key is `${layerId}:${featureId}` -> boolean
  private checkedMap = signal<Record<string, boolean>>({});

  // List of all registered collectibles in the app
  private allCollectibles = signal<CollectibleItem[]>([]);

  // Search filter query
  public searchQuery = signal<string>('');
  public selectedLayerFilter = signal<string | 'all'>('all');
  public statusFilter = signal<'all' | 'pending' | 'completed'>('all');

  constructor() {
    this.checkedMap.set(this.storage.getAllCheckedFeatures());
  }

  public registerCollectibles(items: CollectibleItem[]): void {
    const current = this.allCollectibles();
    const existingIds = new Set(current.map(c => `${c.layerId}:${c.id}`));
    const newItems = items.filter(c => !existingIds.has(`${c.layerId}:${c.id}`));
    if (newItems.length > 0) {
      this.allCollectibles.set([...current, ...newItems]);
    }
  }

  public isChecked(layerId: string, featureId: string): boolean {
    return !!this.checkedMap()[`${layerId}:${featureId}`];
  }

  public toggleChecked(layerId: string, featureId: string, forcedValue?: boolean): boolean {
    const key = `${layerId}:${featureId}`;
    const currentValue = !!this.checkedMap()[key];
    const nextValue = forcedValue !== undefined ? forcedValue : !currentValue;

    const updated = { ...this.checkedMap() };
    if (nextValue) {
      updated[key] = true;
    } else {
      delete updated[key];
    }

    this.checkedMap.set(updated);
    this.storage.setFeatureChecked(layerId, featureId, nextValue);
    return nextValue;
  }

  public getLayerProgress(layerId: string, totalCount: number) {
    const checked = Object.keys(this.checkedMap()).filter(k => k.startsWith(`${layerId}:`)).length;
    const pct = totalCount > 0 ? Math.min(100, Math.round((checked / totalCount) * 100)) : 0;
    return {
      completed: checked,
      total: totalCount,
      percentage: pct
    };
  }

  // Grand Theft Auto 100% Core Collectibles (Tags: 100, Snapshots: 50, Horseshoes: 50, Oysters: 50, Stunt Jumps: 70)
  public readonly overallStats = computed(() => {
    const items = this.allCollectibles();
    const checked = this.checkedMap();

    const collectibleLayers: LayerId[] = ['tags', 'snapshots', 'horseshoes', 'oysters', 'stunt_jumps'];
    const coreItems = items.filter(i => collectibleLayers.includes(i.layerId as LayerId));

    const totalCore = coreItems.length || 320; // 100+50+50+50+70 = 320
    const completedCore = coreItems.filter(i => !!checked[`${i.layerId}:${i.id}`]).length;
    const percentage = totalCore > 0 ? Math.round((completedCore / totalCore) * 100) : 0;

    return {
      totalItems: items.length,
      totalCompleted: Object.keys(checked).length,
      coreTotal: totalCore,
      coreCompleted: completedCore,
      corePercentage: percentage
    };
  });

  // Filtered collectibles for the checklist panel
  public readonly filteredCollectibles = computed(() => {
    const items = this.allCollectibles();
    const checked = this.checkedMap();
    const query = this.searchQuery().toLowerCase().trim();
    const layerFilter = this.selectedLayerFilter();
    const status = this.statusFilter();

    return items.filter(item => {
      // Layer filter
      if (layerFilter !== 'all' && item.layerId !== layerFilter) {
        return false;
      }

      const isItemChecked = !!checked[`${item.layerId}:${item.id}`];
      // Status filter
      if (status === 'completed' && !isItemChecked) return false;
      if (status === 'pending' && isItemChecked) return false;

      // Search query filter
      if (query) {
        const matchId = item.id.toLowerCase().includes(query);
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query) || false;
        const matchLayer = item.layerId.toLowerCase().includes(query);
        if (!matchId && !matchTitle && !matchDesc && !matchLayer) {
          return false;
        }
      }

      return true;
    });
  });

  public exportProgress(): void {
    const data = {
      app: 'GTA-SA-Tracker',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      checkedMap: this.checkedMap()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gtasa_progress_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public importProgress(jsonText: string): boolean {
    try {
      const data = JSON.parse(jsonText);
      if (data && typeof data.checkedMap === 'object') {
        this.checkedMap.set(data.checkedMap);
        this.storage.clearAllProgress();
        Object.entries(data.checkedMap).forEach(([k, v]) => {
          if (v) {
            const parts = k.split(':');
            if (parts.length >= 2) {
              this.storage.setFeatureChecked(parts[0], parts.slice(1).join(':'), true);
            }
          }
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import progress JSON', e);
      return false;
    }
  }

  public resetAllProgress(): void {
    this.checkedMap.set({});
    this.storage.clearAllProgress();
  }
}
