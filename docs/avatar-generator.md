# Generador procedural de avatares NPC

## Objetivo
Generar retratos de terror analógico deterministas; una misma identidad conserva el mismo retrato. El módulo es puramente visual y no cambia el estado global, reglas de deducción ni resultados del juego.

## Integración
`js/avatar/AvatarGenerator.js` entrega SVG pixelado como data URI; `js/AvatarRenderer.js` lo inserta en cada ficha existente. Los retratos de NPC usan el mismo generador SVG y conservan los rasgos cosméticos conocidos; ClaudePXL sigue siendo una fuente editable de arte, no una dependencia de runtime. No sustituir el nodo de la ficha ni mutar estado para pintar un avatar.

## Identidad y seguridad narrativa
- Usar `npc.id` como semilla estable; no llamar `Math.random()` durante el render.
- Pasar únicamente rasgos cosméticos: peinado, forma del rostro, ropa, accesorio, ojos, boca, tono de piel y vello facial.
- Si `skinColor` llega como `var(--avatar-skin-1)` hasta `var(--avatar-skin-5)`, resolver el token a los valores originales de `css/avatars.css`. También se acepta un hexadecimal (`#rgb` o `#rrggbb`); el tono personalizado cambia la piel, no la paleta de ropa.
- **No usar `npc.isInfected` para elegir colores, marcas, ojos, sprite o cualquier detalle visible en el retrato normal.** La imagen no debe resolver la deducción de infección.
- Usar `loreId` solamente para asignar un retrato fijo ya aprobado para un personaje conocido.
- Las siluetas deben leerse a escala final, especialmente coleta (`ponytail`), mohawk y cabello largo. Evitar ruido decorativo sin causa.

## ClaudePXL
Editar las fuentes en `art/npcs.px.js`, generar PNGs con `npm run build:npc-art`, inspeccionar `assets/pixel/npcs/_preview` y ajustar la fuente si una forma se pierde. No editar PNGs generados a mano. Ver las referencias completas en `.claude/skills/pxl-pixel-art/`.

## Validación
Ejecutar `npm test`, `npm run build:npc-art` y Playwright sobre una ficha real en escritorio y móvil. Afirmar que un avatar se ve solo tras confirmar que se insertó `img.npc-pixel-portrait`, que `img.complete && img.naturalWidth > 0`, que su caja no está recortada y que la captura real fue inspeccionada.


## Laboratorio visual y código fuente

Abrí [`avatar-lab.html`](../avatar-lab.html) en el repositorio o en GitHub Pages para editar rasgos cosméticos, comparar las diez siluetas de pelo, cambiar las cinco paletas y copiar el SVG generado. La sección ClaudePXL muestra los PNG compilados; el archivo que se edita sigue siendo `art/npcs.px.js`.

No hace falta abrir Photoshop ni reemplazar imágenes a mano. Las muestras se generan desde código y los PNGs ClaudePXL se reconstruyen con `npm run build:npc-art`.
