import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type Language = 'es' | 'en';

export interface Translations {
  [key: string]: string;
}

const ES_TRANSLATIONS: Translations = {
  // App Header & HUD
  'app.title': 'SAN ANDREAS',
  'app.subtitle': 'MAPA & RASTREADOR 100%',
  'app.hudCore': '100% PRINCIPAL',

  // Navigation Tabs
  'tabs.layers': 'Capas',
  'tabs.checklist': 'Lista',
  'tabs.stats': '100%',
  'tabs.custom': 'Propias',
  'tabs.settings': 'Ajustes',

  // Tab 1: Layers
  'layers.header': 'COLECCIONABLES Y ACTIVIDADES',
  'layers.activeCount': '{count} ACTIVAS',
  'layers.focusMap': 'Enfocar en el mapa',

  // Layer details
  'layer.tags.name': 'Grafitis',
  'layer.tags.desc':
    '100 grafitis de Grove Street por todo Los Santos. Completa para obtener armas en la Casa de CJ.',
  'layer.tags.reward': 'Molotov, Recortada, Tec-9 y AK-47 en Casa Johnson',

  'layer.snapshots.name': 'Fotografías',
  'layer.snapshots.desc':
    '50 oportunidades fotográficas en San Fierro. Haz fotos con tu cámara para completar.',
  'layer.snapshots.reward': 'Micro-SMG, Granadas, Francotirador y Escopeta en Garaje Doherty',

  'layer.horseshoes.name': 'Herraduras',
  'layer.horseshoes.desc':
    '50 herraduras de la suerte repartidas por Las Venturas. Aumenta la suerte a 1.000.',
  'layer.horseshoes.reward': 'SMG, Cargas explosivas, Escopeta de combate y M4 en Four Dragons',

  'layer.oysters.name': 'Ostras',
  'layer.oysters.desc': '50 ostras sumergidas en mares, ríos y piscinas de todo San Andreas.',
  'layer.oysters.reward': 'Capacidad pulmonar al máximo y 100% de Sex Appeal con novias',

  'layer.stunt_jumps.name': 'Saltos Únicos',
  'layer.stunt_jumps.desc':
    '70 saltos acrobáticos cinematográficos únicos por todo San Andreas con vehículos.',
  'layer.stunt_jumps.reward': '500 $ por salto + progreso para el 100%',

  'layer.cop_bribes.name': 'Sobornos Policiales',
  'layer.cop_bribes.desc':
    'Estrellas policiales flotantes que reducen el nivel de búsqueda en 1 estrella al recogerlas.',
  'layer.cop_bribes.reward': 'Reduce el nivel de búsqueda en 1 estrella',

  'layer.race_tournaments.name': 'Torneos de Carreras',
  'layer.race_tournaments.desc':
    'Circuitos de carreras callejeras en Los Santos, San Fierro, Las Venturas y Carreras Aéreas.',
  'layer.race_tournaments.reward': '10.000 $ de premio por carrera + estado de completado',

  'layer.busted_warps.name': 'Comisarías (Arrestado)',
  'layer.busted_warps.desc': 'Zonas de reaparición en comisarías al ser arrestado en San Andreas.',
  'layer.busted_warps.reward': 'Zonas de reaparición al ser arrestado',

  'layer.death_warps.name': 'Hospitales (Eliminado)',
  'layer.death_warps.desc':
    'Ubicaciones de hospitales al morir. ¡La novia Katie Zhan conserva tus armas!',
  'layer.death_warps.reward': 'Zonas de reaparición de hospital al morir',

  'layer.airports.name': 'Aeropuertos',
  'layer.airports.desc': 'Ubicaciones de aeropuertos y pistas de aterrizaje en San Andreas.',
  'layer.airports.reward': 'Acceso a aviones y viajes rápidos',

  'layer.safe_houses.name': 'Casas de Resguardo',
  'layer.safe_houses.desc': 'Ubicaciones de casas de resguardo en San Andreas.',
  'layer.safe_houses.reward': 'Acceso a casas de resguardo',

  // Tab 2: Checklist
  'checklist.searchPlaceholder': 'Buscar por ID, nombre o zona...',
  'checklist.allCategories': 'Todas las categorías',
  'checklist.allStatuses': 'Todos los estados',
  'checklist.pendingOnly': 'Solo Pendientes',
  'checklist.completedOnly': 'Solo Completados',
  'checklist.results': 'Resultados: {count}',
  'checklist.toggleCheck': 'Marcar / Desmarcar',
  'checklist.hasPhoto': 'Tiene foto de ubicación',
  'checklist.hasVideo': 'Tiene video tutorial',
  'checklist.showOnMap': 'Ver en el mapa',
  'checklist.noResults': 'No se encontraron coleccionables con los filtros actuales.',

  // Tab 3: Stats
  'stats.title': 'PROGRESO DE COLECCIONABLES 100%',
  'stats.summary': '{completed} de {total} coleccionables principales',
  'stats.categoryBreakdown': 'Desglose por Categoría',
  'stats.completedRatio': '{completed} / {total} completados',

  // Tab 4: Custom Layers
  'custom.title': 'Capas Personalizadas',
  'custom.create': 'Crear',
  'custom.newLayerTitle': 'Nueva Capa de Marcadores',
  'custom.placeholder': 'Nombre de la capa (ej. Rampas Secretas)',
  'custom.cancel': 'Cancelar',
  'custom.save': 'Guardar',
  'custom.itemsCount': '{count} elementos',
  'custom.exportTooltip': 'Exportar GeoJSON',
  'custom.deleteTooltip': 'Eliminar capa',
  'custom.empty': 'No tienes capas personalizadas creadas aún.',
  'custom.deleteConfirm': '¿Deseas eliminar esta capa personalizada?',

  // Tab 5: Settings
  'settings.languageTitle': 'Idioma / Language',
  'settings.languageDesc': 'Selecciona el idioma de la aplicación y las descripciones.',
  'settings.langEs': 'Español',
  'settings.langEn': 'English',
  'settings.backupTitle': 'Respaldo de Progreso',
  'settings.backupDesc':
    'Exporta tu partida o importa un archivo JSON para sincronizar en otro dispositivo.',
  'settings.export': 'Exportar',
  'settings.import': 'Importar',
  'settings.importSuccess': '¡Progreso importado con éxito!',
  'settings.importError': 'Error al leer el archivo de respaldo.',
  'settings.resetTitle': 'Reiniciar Progreso',
  'settings.resetDesc': 'Borra todos los coleccionables marcados y restablece el progreso al 0%.',
  'settings.resetBtn': 'Reiniciar Todo',

  // Reset Modal
  'resetModal.title': '¿Reiniciar todo el progreso?',
  'resetModal.desc':
    'Se borrarán todos los coleccionables completados guardados en tu navegador. Esta acción no se puede deshacer.',
  'resetModal.cancel': 'Cancelar',
  'resetModal.confirm': 'Sí, borrar todo',

  // Sidebar Edge Toggle
  'sidebar.hide': 'Ocultar Panel',
  'sidebar.show': 'Mostrar Panel',

  // Map Controls & Tooltips
  'map.satelliteView': 'Vista Satelital',
  'map.classicView': 'Vista Mapa Clásico',
  'map.switchMapTitle': 'Cambiar Vista de Mapa (Satélite / Ingame)',
  'map.zoomIn': 'Acercar (+)',
  'map.zoomOut': 'Alejar (-)',
  'map.resetView': 'Centrar Todo el Estado de San Andreas',
  'map.sharePinActive': 'Cancelar Marcador',
  'map.sharePinInactive': 'Colocar Pin Compartible',
  'map.shareModeTooltip': 'Modo Compartir Ubicación (Haz clic en cualquier punto del mapa)',
  'map.shareBannerText': 'Haz clic o arrastra en el mapa para fijar tu pin compartido',
  'map.creditsTitle': 'Créditos y Fuentes',

  // Popups
  'popup.completed': 'Completado',
  'popup.markAsCollected': 'Marcar como Completado',
  'popup.shareUrl': 'Compartir URL',
  'popup.linkCopied': '¡Enlace a esta ubicación copiado al portapapeles!',

  // Attributions Modal
  'attributions.title': 'GTA San Andreas Mapa Interactivo',
  'attributions.subtitle': 'Versión Angular 22 Modernizada',
  'attributions.desc':
    'Este mapa interactivo y rastreador del 100% incluye todas las ubicaciones de coleccionables, saltos y misiones secundarias de Grand Theft Auto: San Andreas.',
  'attributions.sourcesTitle': 'Fuentes & Agradecimientos:',
  'attributions.sourceMarkers': 'Ubicaciones de marcadores de',
  'attributions.sourceWiki': 'Imágenes de Graffitis y Fotos de',
  'attributions.sourceWikiGta': 'Imágenes de Herraduras y Ostras de',
  'attributions.sourceMap': 'Mapa satelital de alta resolución por',
  'attributions.sourceGithub': 'Código fuente disponible en GitHub',
  'attributions.close': 'Entendido',
};

const EN_TRANSLATIONS: Translations = {
  // App Header & HUD
  'app.title': 'SAN ANDREAS',
  'app.subtitle': 'MAP & 100% TRACKER',
  'app.hudCore': '100% CORE',

  // Navigation Tabs
  'tabs.layers': 'Layers',
  'tabs.checklist': 'Checklist',
  'tabs.stats': '100%',
  'tabs.custom': 'Custom',
  'tabs.settings': 'Settings',

  // Tab 1: Layers
  'layers.header': 'COLLECTIBLES & ACTIVITIES',
  'layers.activeCount': '{count} ACTIVE',
  'layers.focusMap': 'Focus on map',

  // Layer details
  'layer.tags.name': 'Spray Tags',
  'layer.tags.desc':
    "100 Grove Street spray tags located across Los Santos. Complete for weapons at CJ's Johnson House.",
  'layer.tags.reward': 'Molotov, Sawn-off, Tec-9, AK-47 at Johnson House',

  'layer.snapshots.name': 'Snapshots',
  'layer.snapshots.desc':
    '50 photo opportunities in San Fierro. Take photos with your camera to complete.',
  'layer.snapshots.reward': 'Micro-SMG, Grenades, Sniper, Shotgun at Doherty Garage',

  'layer.horseshoes.name': 'Horseshoes',
  'layer.horseshoes.desc':
    '50 lucky horseshoes scattered around Las Venturas. Increases Luck stat to 1,000.',
  'layer.horseshoes.reward': 'SMG, Satchel Charges, Combat Shotgun, M4 at Four Dragons',

  'layer.oysters.name': 'Oysters',
  'layer.oysters.desc':
    '50 oysters submerged in oceans, rivers and swimming pools throughout San Andreas.',
  'layer.oysters.reward': 'Max Lung Capacity & 100% Sex Appeal with girlfriends',

  'layer.stunt_jumps.name': 'Unique Stunt Jumps',
  'layer.stunt_jumps.desc':
    '70 unique cinematic stunt jumps to conquer across San Andreas with vehicles.',
  'layer.stunt_jumps.reward': '$500 cash per jump + 100% completion progress',

  'layer.cop_bribes.name': 'Police Bribes',
  'layer.cop_bribes.desc':
    'Floating police badge icons that reduce wanted level by 1 star when picked up.',
  'layer.cop_bribes.reward': 'Reduces Wanted Level by 1 Star',

  'layer.race_tournaments.name': 'Race Tournaments',
  'layer.race_tournaments.desc':
    'Street race circuits in Los Santos, San Fierro, Las Venturas, and Air races.',
  'layer.race_tournaments.reward': '$10,000 first prize per race + completion status',

  'layer.busted_warps.name': 'Busted Police Warps',
  'layer.busted_warps.desc':
    'Police department spawn zones and boundary areas when arrested in San Andreas.',
  'layer.busted_warps.reward': 'Respawn zones when arrested',

  'layer.death_warps.name': 'Hospital Respawn Warps',
  'layer.death_warps.desc':
    'Hospital locations and respawn zones when wasted. Katie Zhan girlfriend retains weapons!',
  'layer.death_warps.reward': 'Respawn hospital zones when wasted',

  'layer.airports.name': 'Airports',
  'layer.airports.desc': 'Airport locations and airfields in San Andreas.',
  'layer.airports.reward': 'Access to airplanes and fast travel',

  'layer.safe_houses.name': 'Safe Houses',
  'layer.safe_houses.desc': 'Safe house locations in San Andreas.',
  'layer.safe_houses.reward': 'Access to save progress and change clothes',

  // Tab 2: Checklist
  'checklist.searchPlaceholder': 'Search by ID, name or zone...',
  'checklist.allCategories': 'All categories',
  'checklist.allStatuses': 'All statuses',
  'checklist.pendingOnly': 'Pending Only',
  'checklist.completedOnly': 'Completed Only',
  'checklist.results': 'Results: {count}',
  'checklist.toggleCheck': 'Toggle completed',
  'checklist.hasPhoto': 'Has location photo',
  'checklist.hasVideo': 'Has video guide',
  'checklist.showOnMap': 'Show on map',
  'checklist.noResults': 'No collectibles found with current filters.',

  // Tab 3: Stats
  'stats.title': '100% COLLECTIBLES PROGRESS',
  'stats.summary': '{completed} of {total} core collectibles',
  'stats.categoryBreakdown': 'Breakdown by Category',
  'stats.completedRatio': '{completed} / {total} completed',

  // Tab 4: Custom Layers
  'custom.title': 'Custom Layers',
  'custom.create': 'Create',
  'custom.newLayerTitle': 'New Marker Layer',
  'custom.placeholder': 'Layer name (e.g. Secret Ramps)',
  'custom.cancel': 'Cancel',
  'custom.save': 'Save',
  'custom.itemsCount': '{count} items',
  'custom.exportTooltip': 'Export GeoJSON',
  'custom.deleteTooltip': 'Delete layer',
  'custom.empty': "You don't have any custom layers created yet.",
  'custom.deleteConfirm': 'Do you want to delete this custom layer?',

  // Tab 5: Settings
  'settings.languageTitle': 'Language / Idioma',
  'settings.languageDesc': 'Choose interface and descriptions language.',
  'settings.langEs': 'Español',
  'settings.langEn': 'English',
  'settings.backupTitle': 'Progress Backup',
  'settings.backupDesc': 'Export your save or import a JSON file to sync across devices.',
  'settings.export': 'Export',
  'settings.import': 'Import',
  'settings.importSuccess': 'Progress imported successfully!',
  'settings.importError': 'Error reading backup file.',
  'settings.resetTitle': 'Reset Progress',
  'settings.resetDesc': 'Clears all checked collectibles and resets progress to 0%.',
  'settings.resetBtn': 'Reset All',

  // Reset Modal
  'resetModal.title': 'Reset all progress?',
  'resetModal.desc':
    'All completed collectibles saved in your browser will be deleted. This action cannot be undone.',
  'resetModal.cancel': 'Cancel',
  'resetModal.confirm': 'Yes, delete all',

  // Sidebar Edge Toggle
  'sidebar.hide': 'Hide Panel',
  'sidebar.show': 'Show Panel',

  // Map Controls & Tooltips
  'map.satelliteView': 'Satellite View',
  'map.classicView': 'Classic Map View',
  'map.switchMapTitle': 'Switch Map View (Satellite / Ingame)',
  'map.zoomIn': 'Zoom In (+)',
  'map.zoomOut': 'Zoom Out (-)',
  'map.resetView': 'Center San Andreas State',
  'map.sharePinActive': 'Cancel Pin',
  'map.sharePinInactive': 'Drop Shareable Pin',
  'map.shareModeTooltip': 'Share Location Mode (Click anywhere on the map)',
  'map.shareBannerText': 'Click or drag on map to set your shared pin',
  'map.creditsTitle': 'Credits & Sources',

  // Popups
  'popup.completed': 'Completed',
  'popup.markAsCollected': 'Mark as Collected',
  'popup.shareUrl': 'Share URL',
  'popup.linkCopied': 'Link to this location copied to clipboard!',

  // Attributions Modal
  'attributions.title': 'GTA San Andreas Interactive Map',
  'attributions.subtitle': 'Modernized Angular 22 Version',
  'attributions.desc':
    'This interactive map and 100% tracker includes all collectible locations, stunt jumps, and side missions for Grand Theft Auto: San Andreas.',
  'attributions.sourcesTitle': 'Sources & Acknowledgments:',
  'attributions.sourceMarkers': 'Marker locations from',
  'attributions.sourceWiki': 'Spray Tag and Snapshot photos from',
  'attributions.sourceWikiGta': 'Horseshoe and Oyster photos from',
  'attributions.sourceMap': 'High-resolution satellite map by',
  'attributions.sourceGithub': 'Source code available on GitHub',
  'attributions.close': 'Got it',
};

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private storage = inject(StorageService);

  // Spanish is primary and default
  public currentLang = signal<Language>('es');

  constructor() {
    const saved = this.storage.getItem<Language>('language', 'es');
    if (saved === 'es' || saved === 'en') {
      this.currentLang.set(saved);
    } else {
      this.currentLang.set('es');
    }
  }

  public setLanguage(lang: Language): void {
    this.currentLang.set(lang);
    this.storage.setItem('language', lang);
  }

  public t(key: string, params?: Record<string, string | number>): string {
    const lang = this.currentLang();
    const dictionary = lang === 'en' ? EN_TRANSLATIONS : ES_TRANSLATIONS;
    let translation = dictionary[key] || ES_TRANSLATIONS[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return translation;
  }
}
