import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'satracker:';

  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (item === null) {
        // Also check legacy keys without prefix if migrated
        const legacy = localStorage.getItem(key);
        if (legacy !== null) {
          return JSON.parse(legacy) as T;
        }
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Error reading localStorage key ${key}`, e);
      return defaultValue;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing localStorage key ${key}`, e);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.PREFIX + key);
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Error removing localStorage key ${key}`, e);
    }
  }

  isFeatureChecked(layerId: string, featureId: string): boolean {
    const key = `checked:${layerId}:${featureId}`;
    // check both new prefix and old format
    const legacyKey = `:${layerId}:${featureId}`;
    return this.getItem<boolean>(key, false) || localStorage.getItem(legacyKey) === 'true';
  }

  setFeatureChecked(layerId: string, featureId: string, checked: boolean): void {
    const key = `checked:${layerId}:${featureId}`;
    if (checked) {
      this.setItem(key, true);
    } else {
      this.removeItem(key);
      localStorage.removeItem(`:${layerId}:${featureId}`);
    }
  }

  getAllCheckedFeatures(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.PREFIX + 'checked:')) {
        const identifier = k.replace(this.PREFIX + 'checked:', '');
        result[identifier] = true;
      } else if (k && k.startsWith(':')) {
        const identifier = k.substring(1);
        result[identifier] = true;
      }
    }
    return result;
  }

  clearAllProgress(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(this.PREFIX) || k.startsWith(':') || k.includes('user_layers'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
}
