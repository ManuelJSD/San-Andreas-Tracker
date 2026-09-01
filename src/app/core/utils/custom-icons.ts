import * as L from 'leaflet';

/**
 * Generates a map marker DivIcon using inline SVG for the elongated teardrop
 * pin shape, with the icon embedded via <foreignObject> inside the SVG.
 *
 * Using <foreignObject> means the icon (FontAwesome <i>, emoji <span>, etc.)
 * is a descendant of the SVG — not a sibling — so there are zero z-index or
 * CSS stacking-context issues. The drop-shadow filter is applied on the <svg>
 * element itself via inline style (NOT on the parent div) to keep the parent
 * free of stacking contexts, which lets the .marker-pulse-ring sibling render.
 *
 * No <defs>/<filter> IDs inside the SVG: having id="pin-shadow" repeated
 * across 200+ markers causes DOM id collisions. CSS filter on the element is used.
 */
export function getCustomIcon(
  iconId: string | undefined = undefined,
  _iconMode: string | undefined = undefined,
  colorScheme: string = '#f59e0b'
): L.DivIcon {

  // --- Icon HTML (rendered inside <foreignObject>) ---
  let iconHtml = '';
  if (iconId) {
    if (iconId.startsWith('fa-')) {
      iconHtml = `<i class="fas ${iconId} mfo-icon-fa"></i>`;
    } else if (iconId.startsWith('emoji:')) {
      const emoji = iconId.replace('emoji:', '');
      iconHtml = `<span class="mfo-icon-emoji">${emoji}</span>`;
    } else if (iconId.length > 2) {
      iconHtml = `<img class="mfo-icon-img" src="images/icons/${iconId}.png" onerror="this.style.display='none'" alt="${iconId}" />`;
    } else {
      iconHtml = `<span class="mfo-icon-text">${iconId}</span>`;
    }
  }

  // foreignObject covers the inner circle area (cx=16 cy=15 r=8.5 in 32×50 viewBox)
  // Center: x=16 y=15 → foreignObject x=6 y=5 w=20 h=20
  const foreignObjectBlock = iconHtml ? `
      <foreignObject x="6" y="5" width="20" height="20">
        <div xmlns="http://www.w3.org/1999/xhtml" class="mfo-wrap">
          ${iconHtml}
        </div>
      </foreignObject>` : '';

  // Drop shadow applied inline on the <svg> — safe because it does NOT create
  // a stacking context on the parent div, so .marker-pulse-ring sibling is visible.
  const shadowStyle = `filter: drop-shadow(0 4px 10px ${colorScheme}99)`;

  const html = `
    <div class="marker-root" style="--mc: ${colorScheme}">
      <svg class="marker-pin-svg" viewBox="0 0 32 50"
           xmlns="http://www.w3.org/2000/svg"
           aria-hidden="true"
           style="${shadowStyle}">
        <!-- Elongated teardrop body -->
        <path class="marker-pin-body"
          d="M16 1.5 C8.82 1.5 3 7.32 3 14.5 C3 23 16 48.5 16 48.5 C16 48.5 29 23 29 14.5 C29 7.32 23.18 1.5 16 1.5 Z"
        />
        <!-- Inner circle backdrop for icon -->
        <circle class="marker-pin-inner" cx="16" cy="15" r="8.5"/>
        <!-- Specular highlight -->
        <ellipse class="marker-pin-shine" cx="11.5" cy="10.5" rx="4" ry="2.5"/>
        ${foreignObjectBlock}
      </svg>
      <span class="marker-pulse-ring" aria-hidden="true"></span>
    </div>`;

  return L.divIcon({
    className: 'custom-map-marker',
    html,
    iconSize: [32, 50],
    iconAnchor: [16, 50],
    popupAnchor: [0, -52],
    tooltipAnchor: [0, -30]
  });
}
