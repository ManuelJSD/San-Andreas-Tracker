import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressService } from '../../core/services/progress.service';
import { LayerService } from '../../core/services/layer.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-progress-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-2 bg-neutral-900/85 backdrop-blur-md border-b border-neutral-800/60 pointer-events-auto select-none overflow-hidden w-full">
      <!-- GTA Logo / Brand -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center">
          <i class="fas fa-star text-neutral-950 text-[10px] sm:text-xs"></i>
        </div>
        <span class="font-gta text-amber-400 text-xs sm:text-sm tracking-wider hidden sm:block">{{ i18n.t('app.title') }}</span>
      </div>

      <!-- Separator -->
      <div class="w-px h-5 bg-neutral-700 shrink-0 hidden sm:block"></div>

      <!-- Core Collectibles Progress Bar -->
      <div class="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
        <span class="hidden sm:block text-[11px] font-semibold text-neutral-400 shrink-0">{{ i18n.t('app.hudCore') }}</span>
        <div class="flex-1 h-1.5 sm:h-2 bg-neutral-800 rounded-full overflow-hidden min-w-[50px] sm:min-w-20">
          <div
            class="h-full rounded-full transition-all duration-700 bg-linear-to-r from-amber-600 to-amber-400"
            [style.width.%]="progressService.overallStats().corePercentage">
          </div>
        </div>
        <span class="text-[10px] sm:text-xs font-bold text-amber-400 shrink-0 font-mono tabular-nums w-8 sm:w-9 text-right">
          {{ progressService.overallStats().corePercentage }}%
        </span>
        <span class="text-[11px] text-neutral-500 shrink-0 font-mono hidden md:block">
          ({{ progressService.overallStats().coreCompleted }}/{{ progressService.overallStats().coreTotal }})
        </span>
      </div>

      <!-- Separator -->
      <div class="hidden sm:block w-px h-5 bg-neutral-700 shrink-0"></div>

      <!-- Active Layers Pills -->
      <div class="hidden sm:flex items-center gap-1.5 shrink-0">
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

      <!-- Separator -->
      <div class="w-px h-5 bg-neutral-700 shrink-0"></div>

      <!-- Quick Language Toggle Button in HUD -->
      <div class="flex items-center gap-1 bg-neutral-950/80 p-0.5 rounded-lg border border-neutral-800 shrink-0">
        <button
          (click)="i18n.setLanguage('es')"
          [class.bg-amber-500]="i18n.currentLang() === 'es'"
          [class.text-neutral-950]="i18n.currentLang() === 'es'"
          [class.font-bold]="i18n.currentLang() === 'es'"
          [class.text-neutral-400]="i18n.currentLang() !== 'es'"
          class="px-2 py-0.5 rounded text-[11px] transition cursor-pointer flex items-center gap-1"
          title="Cambiar idioma a Español">
          <span>🇪🇸</span>
          <span class="text-[10px]">ES</span>
        </button>
        <button
          (click)="i18n.setLanguage('en')"
          [class.bg-amber-500]="i18n.currentLang() === 'en'"
          [class.text-neutral-950]="i18n.currentLang() === 'en'"
          [class.font-bold]="i18n.currentLang() === 'en'"
          [class.text-neutral-400]="i18n.currentLang() !== 'en'"
          class="px-2 py-0.5 rounded text-[11px] transition cursor-pointer flex items-center gap-1"
          title="Switch language to English">
          <span>🇬🇧</span>
          <span class="text-[10px]">EN</span>
        </button>
      </div>
    </div>
  `
})
export class ProgressHudComponent {
  public progressService = inject(ProgressService);
  public layerService = inject(LayerService);
  public i18n = inject(I18nService);

  public activeLayerCount = computed(() => this.layerService.activeLayerIds().size);

  public visibleLayers = computed(() => {
    const activeIds = this.layerService.activeLayerIds();
    return this.layerService.localizedLayerMetadata()
      .filter(m => activeIds.has(m.id))
      .slice(0, 4);
  });
}
