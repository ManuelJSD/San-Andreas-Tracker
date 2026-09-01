import * as L from 'leaflet';

export function getCustomIcon(
  iconId: string | undefined = undefined,
  iconMode: string | undefined = undefined,
  colorScheme: string = '#f59e0b'
): L.DivIcon {
  const backgroundPath = iconMode ? `images/icons/marker_${iconMode}.svg` : 'icons/marker.svg';

  if (!iconId) {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `<div class="marker-container"><img class="map-marker-background" src="${backgroundPath}" alt="Marker" /></div>`,
      iconSize: [26, 42],
      popupAnchor: [0, -36],
      iconAnchor: [13, 42],
      tooltipAnchor: [0, -20]
    });
  }

  let foregroundHtml = '';

  if (iconId.startsWith('fa-')) {
    foregroundHtml = `<div class="map-marker-foreground-wrapper"><i class="fas ${iconId} map-marker-foreground"></i></div>`;
  } else if (iconId.length > 2 && !iconId.startsWith('emoji:')) {
    // Image or named icon
    foregroundHtml = `<div class="map-marker-foreground-wrapper"><img class="map-marker-foreground" src="images/icons/${iconId}.png" onerror="this.style.display='none'" alt="${iconId}" /></div>`;
  } else if (iconId.startsWith('emoji:')) {
    const emoji = iconId.replace('emoji:', '');
    foregroundHtml = `<div class="map-marker-foreground-wrapper"><span class="map-marker-emoji">${emoji}</span></div>`;
  } else {
    // 1-2 char text or emoji directly
    foregroundHtml = `<div class="map-marker-foreground-wrapper"><span class="map-marker-text">${iconId}</span></div>`;
  }

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="marker-container" style="--marker-color: ${colorScheme}">
        <img class="map-marker-background" src="${backgroundPath}" alt="Marker" />
        ${foregroundHtml}
      </div>
    `,
    iconSize: [26, 42],
    popupAnchor: [0, -36],
    iconAnchor: [13, 42],
    tooltipAnchor: [0, -20]
  });
}
