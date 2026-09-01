import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayerService } from '../../core/services/layer.service';
import { ProgressService } from '../../core/services/progress.service';
import { MapService } from '../../core/services/map.service';
import { LayerMetadata } from '../../core/models/layer.model';
import { CollectibleItem } from '../../core/models/collectible.model';

export type SidebarTab = 'layers' | 'checklist' | 'stats' | 'custom' | 'settings';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  public layerService = inject(LayerService);
  public progressService = inject(ProgressService);
  public mapService = inject(MapService);

  public isOpen = signal<boolean>(true);
  public activeTab = signal<SidebarTab>('layers');

  // Custom layer creation form state
  public newLayerName = signal<string>('');
  public showNewLayerForm = signal<boolean>(false);

  // Reset confirmation modal
  public showResetConfirm = signal<boolean>(false);

  public setTab(tab: SidebarTab): void {
    this.activeTab.set(tab);
    if (!this.isOpen()) {
      this.isOpen.set(true);
    }
  }

  public toggleSidebar(): void {
    this.isOpen.set(!this.isOpen());
  }

  public toggleLayer(layerId: string): void {
    this.layerService.toggleLayer(layerId);
  }

  public isLayerActive(layerId: string): boolean {
    return this.layerService.isLayerActive(layerId);
  }

  public zoomToLayer(layerId: string, event?: MouseEvent): void {
    event?.stopPropagation();
    this.layerService.zoomToLayer(layerId);
  }

  public getLayerProgress(meta: LayerMetadata) {
    return this.progressService.getLayerProgress(meta.id, meta.totalCount);
  }

  // Checklist interactions
  public toggleItemCheck(item: CollectibleItem, event?: MouseEvent): void {
    event?.stopPropagation();
    this.progressService.toggleChecked(item.layerId, item.id);
  }

  public locateItem(item: CollectibleItem, event?: MouseEvent): void {
    event?.stopPropagation();
    this.layerService.zoomToFeature(item.layerId, item.id);
  }

  public isItemCompleted(item: CollectibleItem): boolean {
    return this.progressService.isChecked(item.layerId, item.id);
  }

  // Custom Layer interactions
  public createCustomLayer(): void {
    const name = this.newLayerName().trim();
    if (name) {
      this.layerService.createCustomLayer(name);
      this.newLayerName.set('');
      this.showNewLayerForm.set(false);
    }
  }

  public deleteCustomLayer(id: string): void {
    if (confirm('¿Deseas eliminar esta capa personalizada?')) {
      this.layerService.deleteCustomLayer(id);
    }
  }

  public exportCustomLayer(id: string): void {
    this.layerService.exportCustomLayer(id);
  }

  // Progress Backup
  public exportProgress(): void {
    this.progressService.exportProgress();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const success = this.progressService.importProgress(reader.result as string);
        if (success) {
          alert('¡Progreso importado con éxito!');
        } else {
          alert('Error al leer el archivo de respaldo.');
        }
      };
      reader.readAsText(input.files[0]);
    }
  }

  public confirmReset(): void {
    this.progressService.resetAllProgress();
    this.showResetConfirm.set(false);
  }
}
