import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressService } from '../../core/services/progress.service';
import { LayerService } from '../../core/services/layer.service';

@Component({
  selector: 'app-progress-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-4 px-4 py-2 bg-neutral-900/85 backdrop-blur-md border-b border-neutral-800/60 pointer-events-auto select-none">
      <!-- GTA Logo / Brand -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
          <i class="fas fa-star text-neutral-950 text-xs"></i>
        </div>
        <span class="font-gta text-amber-400 text-sm tracking-wider hidden sm:block">SAN ANDREAS</span>
      </div>

      <!-- Separator -->
      <div class="w-px h-5 bg-neutral-700 flex-shrink-0 hidden sm:block"></div>

      <!-- Core Collectibles Progress Bar -->
      <div class="flex-1 flex items-center gap-3 min-w-0">
        <span class="text-[11px] font-semibold text-neutral-400 flex-shrink-0">100% CORE</span>
        <div class="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden min-w-[80px]">
          <div
            class="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-600 to-amber-400"
            [style.width.%]="progressService.overallStats().corePercentage">
          </div>
        </div>
        <span class="text-xs font-bold text-amber-400 flex-shrink-0 font-mono tabular-nums w-9 text-right">
          {{ progressService.overallStats().corePercentage }}%
        </span>
        <span class="text-[11px] text-neutral-500 flex-shrink-0 font-mono hidden md:block">
          ({{ progressService.overallStats().coreCompleted }}/{{ progressService.overallStats().coreTotal }})
        </span>
      </div>

      <!-- Separator -->
      <div class="w-px h-5 bg-neutral-700 flex-shrink-0"></div>

      <!-- Active Layers Pills -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        @for (meta of visibleLayers(); track meta.id) {
          <div
            [style.backgroundColor]="meta.color + '20'"
            [style.borderColor]="meta.color + '60'"
            [style.color]="meta.color"
            class="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold">
            @if (meta.iconType === 'fa') {
              <i class="fas {{ meta.icon }} text-[9px]"></i>
            } @else {
              <span class="text-[9px]">{{ meta.icon }}</span>
            }
            <span class="hidden lg:block">{{ meta.name.split(' ')[0] }}</span>
          </div>
        }
        @if (activeLayerCount() > 4) {
          <span class="text-[10px] text-neutral-500 font-mono">+{{ activeLayerCount() - 4 }}</span>
        }
      </div>
    </div>
  `
})
export class ProgressHudComponent {
  progressService = inject(ProgressService);
  layerService = inject(LayerService);

  activeLayerCount = computed(() => this.layerService.activeLayerIds().size);

  visibleLayers = computed(() => {
    const activeIds = this.layerService.activeLayerIds();
    return this.layerService.layerMetadata
      .filter(m => activeIds.has(m.id))
      .slice(0, 4);
  });
}
