# 🗺️ GTA San Andreas — Interactive Map & 100% Checklist Tracker

Mapa interactivo moderno y completo de **Grand Theft Auto: San Andreas** desarrollado en **Angular 22** con **Leaflet.js**, **TailwindCSS** y **Angular Signals**.

---

## ✨ Características Principales

- **🗺️ Doble Capa de Mapa en Alta Resolución**:
  - Mapa Ingame clásico.
  - Mapa Satelital de alta resolución (por Ian Albert).
- **⭐ Rastreador 100% Core en Tiempo Real**:
  - 100 Graffitis / Spray Tags de Grove Street (Los Santos).
  - 50 Fotos / Snapshots (San Fierro).
  - 50 Herraduras / Horseshoes (Las Venturas).
  - 50 Ostras submarinas / Oysters (Todo el estado).
  - 70 Saltos Únicos / Stunt Jumps (con zonas y videos).
- **🏁 Actividades y Utilidades**:
  - 25 Circuitos de Carreras (Los Santos, San Fierro, Las Venturas, Carreras Aéreas).
  - 65 Sobornos Policiales (bajan 1 estrella de nivel de búsqueda).
  - 16 Zonas de Reaparición de Policía (Busted).
  - 17 Hospitales y Zonas de Reaparición (Wasted).
- **📋 Checklist y Buscador**:
  - Buscador instantáneo por ID, nombre o zona.
  - Filtros por categoría y estado (Pendiente / Completado).
  - Botón de enfoque rápido en el mapa con animación de mira telescópica.
- **📍 Popups Enriquecidos**:
  - Miniaturas directas de Wiki/WikiGTA y reproductores de YouTube.
  - Checkbox para marcar coleccionables directamente desde el mapa.
  - Generador de enlaces compartibles.
- **📌 Modo Compartir Ubicación**:
  - Coloca un pin en cualquier punto del mapa y obtén coordenadas in-game exactas `[X, Y]`.
- **💾 Respaldo & Exportación**:
  - Guardado automático en `localStorage`.
  - Exportar/Importar partida en formato JSON.
  - Creación y exportación de capas personalizadas en GeoJSON.

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js (v20 o superior)
- npm

### Instalación
```bash
npm install
```

### Ejecutar Servidor Local
```bash
npm start -- --port 4250
```
Abre tu navegador en [http://localhost:4250](http://localhost:4250).

### Compilar para Producción
```bash
npm run build
```

---

## 🛠️ Stack Tecnológico

- **Framework**: Angular 22 (Signals, Standalone Components)
- **Mapas**: Leaflet.js con `CRS.Simple` y coordenadas personalizadas GTA
- **Clustering**: `leaflet.markercluster` + `leaflet.featuregroup.subgroup`
- **Editor de capas**: `@geoman-io/leaflet-geoman-free`
- **Estilos**: TailwindCSS v4 + CSS custom GTA Dark theme
- **Iconografía**: FontAwesome 6 + Radar Icons remasterizados
