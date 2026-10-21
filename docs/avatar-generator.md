# Generador procedural de avatares NPC

## Objetivo
Generar retratos de terror analógico deterministas; una misma identidad conserva el mismo retrato. El módulo es puramente visual y no cambia el estado global, reglas de deducción ni resultados del juego.

## Integración
`js/avatar/AvatarGenerator.js` entrega SVG pixelado como data URI; `js/AvatarRenderer.js` lo inserta en cada ficha existente. NPCs de lore pueden usar sprites PNG hechos con ClaudePXL, con retrato procedural como alternativa si falta un recurso. No sustituir el nodo de la ficha ni mutar estado para pintar un avatar.

## Identidad y seguridad narrativa
- Usar `npc.id` como semilla estable; no llamar `Math.random()` durante el render.
- Pasar únicamente rasgos cosméticos ya existentes: peinado, ropa, accesorio, ojos, boca, tono de piel y vello facial.
- **No usar `npc.isInfected` para elegir colores, marcas, ojos, sprite o cualquier detalle visible en el retrato normal.** La imagen no debe resolver la deducción de infección.
- Usar `loreId` solamente para asignar un retrato fijo ya aprobado para un personaje conocido.
- Las siluetas deben leerse a escala final, especialmente coleta (`ponytail`), mohawk y cabello largo. Evitar ruido decorativo sin causa.

## ClaudePXL
Editar las fuentes en `art/npcs.px.js`, generar PNGs con `npm run build:npc-art`, inspeccionar `assets/pixel/npcs/_preview` y ajustar la fuente si una forma se pierde. No editar PNGs generados a mano. Ver las referencias completas en `.claude/skills/pxl-pixel-art/`.

## Validación
Ejecutar `npm test`, `npm run build:npc-art` y Playwright sobre una ficha real en escritorio y móvil. Afirmar que un avatar se ve solo tras confirmar que se insertó `img.npc-pixel-portrait`, que `img.complete && img.naturalWidth > 0`, que su caja no está recortada y que la captura real fue inspeccionada.
