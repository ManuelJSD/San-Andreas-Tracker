# Guía: Cómo añadir un nuevo coleccionable o actividad

Este documento detalla paso a paso el proceso para añadir un nuevo tipo de coleccionable, actividad o capa de puntos de interés al mapa interactivo de **San Andreas Tracker**.

## 1. Crear el archivo de datos (GeoJSON)

Los marcadores del mapa se cargan a partir de archivos en formato GeoJSON. 

1. Crea un nuevo archivo JSON en la carpeta `src/app/data/`, por ejemplo: `src/app/data/nuevo_coleccionable.json`.
2. El formato debe seguir la estructura `FeatureCollection`. Las coordenadas deben ser las del juego original (GTA San Andreas X e Y).

**Ejemplo básico (`nuevo_coleccionable.json`):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "1",
        "name": "Nombre opcional del punto",
        "description": "Descripción opcional",
        "image_id": "1", 
        "video_id": "youtube_id_aqui"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [2492.23, -1669.58]
      }
    }
  ]
}
```
*Nota importante sobre los textos:*
Si incluyes `name` o `description` directamente en este JSON, **ese texto aparecerá estático y no cambiará de idioma** cuando el usuario cambie entre Inglés y Español. 
* Si quieres que el título de cada punto sea simplemente "NombreDeLaCapa #1", omite las propiedades `name` y `description`. La aplicación generará automáticamente un nombre traducido usando el nombre de la capa (ej. "Grafitis #1", "Spray Tags #1").
* Si necesitas que cada punto tenga un nombre único traducible, tendrías que modificar el código de los popups en `layer.service.ts` para que extraiga el texto desde el `i18n.service.ts`.

*Nota sobre archivos multimedia:* `image_id` y `video_id` son opcionales. Si usas `image_id`, la app buscará la imagen en la carpeta correspondiente explicada en el paso 2.

## 2. ¿Cómo obtener las coordenadas X e Y?

Las coordenadas de la propiedad `coordinates` corresponden al sistema de coordenadas original de GTA San Andreas (X, Y).
La forma más fácil de obtenerlas es usar tu propia aplicación:

1. Abre la aplicación en tu navegador.
2. En los controles del mapa (esquina inferior derecha), haz clic en el botón de **"Colocar Pin Compartible"** (el icono de compartir/red).
3. Haz clic en cualquier lugar del mapa donde quieras ubicar tu coleccionable.
4. Se abrirá un popup que dirá algo como: `GTA: X: 2492.23, Y: -1669.58`.
5. Copia esos valores y pégalos en tu archivo GeoJSON en el orden `[X, Y]`.

## 3. Añadir las imágenes (Opcional)

Si los marcadores tienen imágenes asociadas que se mostrarán en el popup al hacer clic:
1. Las imágenes deben guardarse en la carpeta de assets públicos: `public/images/<id_de_la_capa>/`.
2. Cada imagen debe llamarse igual que el `id` del feature en el GeoJSON y tener la extensión `.webp`.
3. Por ejemplo, para el marcador con `id: "1"` de tu capa `nuevo_coleccionable`, la ruta debe ser: `public/images/nuevo_coleccionable/1.webp`.

## 4. Actualizar el Modelo de Datos

Debes registrar el nuevo ID de la capa en el sistema de tipos de TypeScript.

1. Abre el archivo `src/app/core/models/collectible.model.ts`.
2. Localiza el tipo `LayerId` y añade el identificador (el nombre interno) de tu nuevo coleccionable usando `|`.

**Ejemplo:**
```typescript
export type LayerId =
  | 'tags'
  | 'snapshots'
  // ... otras capas existentes
  | 'death_warps'
  | 'nuevo_coleccionable'; // <-- Tu nueva capa
```

## 5. Configurar las Traducciones (Textos e Idiomas)

La aplicación tiene soporte multilingüe. Debes añadir el nombre, la descripción y la recompensa del nuevo coleccionable.

1. Abre `src/app/core/services/i18n.service.ts`.
2. Localiza los objetos `ES_TRANSLATIONS` (Español) y `EN_TRANSLATIONS` (Inglés).
3. Añade las claves de tu nueva capa en ambos diccionarios:

```typescript
// En ES_TRANSLATIONS
'layer.nuevo_coleccionable.name': 'Mis Nuevos Coleccionables',
'layer.nuevo_coleccionable.desc': 'Descripción de lo que son y qué tienes que hacer.',
'layer.nuevo_coleccionable.reward': 'Recompensa por completarlos',

// En EN_TRANSLATIONS
'layer.nuevo_coleccionable.name': 'My New Collectibles',
'layer.nuevo_coleccionable.desc': 'Description of what they are and what to do.',
'layer.nuevo_coleccionable.reward': 'Reward for completing them',
```

## 6. Implementar y Registrar la Capa en el Mapa

El paso final es conectar todo en el servicio del mapa para que se dibuje.

1. Abre `src/app/core/services/layer.service.ts`.
2. **Importa** el archivo JSON en la parte superior:
   ```typescript
   import nuevoColeccionableData from '../../data/nuevo_coleccionable.json';
   ```
3. **Añade los metadatos** al array `layerMetadata`:
   ```typescript
   {
     id: 'nuevo_coleccionable',
     name: 'Nombre temporal', // Se sobreescribe por la traducción de i18n
     icon: 'fa-star', // Usa un icono de FontAwesome (ej. fa-star) o un emoji
     iconType: 'fa', // 'fa' si es FontAwesome, 'emoji' si es un emoji
     color: '#ff00ff', // Color hexadecimal para el marcador
     tagColor: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30', // Estilos Tailwind para la etiqueta
     description: '', // Se sobreescribe por i18n
     isDefault: false, // true si quieres que aparezca visible por defecto al abrir el mapa
     createCheckbox: true, // true si se pueden marcar como "completados" (checklist)
     createPopup: true, // true si al hacer clic abren un popup con info
     totalCount: 50, // La cantidad total de elementos que hay
     category: 'collectibles', // 'collectibles', 'activities', 'utilities' o 'custom'
     rewardText: '' // Se sobreescribe por i18n
   }
   ```
4. **Crea la función** para construir la capa dentro de la clase `LayerService`. Si son puntos estándar simples, usa la función genérica `buildStandardPointLayer`:
   ```typescript
   private buildNuevoColeccionableLayer(): void {
     this.buildStandardPointLayer('nuevo_coleccionable', nuevoColeccionableData, 'fa-star', '#ff00ff');
   }
   ```
   *(Si el coleccionable necesita polígonos, zonas de colores distintos o lógicas complejas de iconos, deberás crear una función personalizada guiándote de `buildRaceTournamentsLayer()` por ejemplo).*
5. **Llama a la función** dentro del método `initLayers()` para inicializarla en el arranque:
   ```typescript
   public initLayers(): void {
     // ...
     this.buildDeathWarpsLayer();
     
     // Registra tu nueva capa aquí:
     this.buildNuevoColeccionableLayer();
     // ...
   }
   ```

## ¡Listo!

Una vez guardados todos los cambios, la aplicación recargará y:
- La nueva capa aparecerá en la pestaña de **Capas** para poder encenderla y apagarla.
- Aparecerá en la pestaña **Lista** (Checklist) para llevar el seguimiento.
- Aportará progreso al porcentaje total en la pestaña **100%**.
- Mostrará imágenes emergentes en el mapa si configuras la carpeta correspondiente en `public/images/`.
