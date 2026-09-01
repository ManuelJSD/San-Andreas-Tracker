import { Component, AfterViewInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../core/services/map.service';
import { LayerService } from '../../core/services/layer.service';
import { ProgressService } from '../../core/services/progress.service';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.css'
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  public mapService = inject(MapService);
  public layerService = inject(LayerService);
  public progressService = inject(ProgressService);

  public showAttributions = signal<boolean>(false);

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mapService.initMap('gta-map-container');
      this.layerService.initLayers();
    }, 50);
  }

  ngOnDestroy(): void {
    this.mapService.destroyMap();
  }

  public toggleTile(): void {
    this.mapService.toggleTileLayer();
  }

  public zoomIn(): void {
    this.mapService.zoomIn();
  }

  public zoomOut(): void {
    this.mapService.zoomOut();
  }

  public resetView(): void {
    this.mapService.resetView();
  }

  public toggleShareMarker(): void {
    this.mapService.toggleShareMarkerMode();
  }

  public removeShareMarker(): void {
    this.mapService.removeShareMarker();
  }
}
