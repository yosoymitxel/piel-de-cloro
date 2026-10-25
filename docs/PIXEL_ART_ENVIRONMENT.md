# Capa ambiental de pixel art

Esta capa añade utilería raster PNG de tamaño nativo para la versión Vanilla JS/React de Piel de Cloro. No copia la UI del prototipo Phaser ni modifica el estado, el motor de diálogos, las reglas, los recursos o el flujo de las pantallas.

## Integración

- Los retratos de personajes existentes generados con ClaudePXL se conservan en `assets/pixel/npcs/sprites/`.
- Los nuevos PNG ambientales viven en `assets/pixel/environment/`.
- `css/PixelArtEnvironment.css` se carga después de las hojas existentes para aplicar el acabado de pixel grid al DOM real.
- Las imágenes son PNG RGBA con coordenadas enteras y dimensiones pequeñas; se escalan con `image-rendering: pixelated`, no se convierten en SVG.
- No se alteran IDs, texto, botones, eventos, estado de juego ni reglas de inspección.

## Validación

`__tests__/pixel_art_environment.test.js` valida la firma PNG, las dimensiones registradas y todas las rutas CSS. La validación visual se completa con las capturas reales de Playwright generadas por el workflow del repositorio para escritorio y móvil. Que pase el test de rutas no sustituye esa inspección.
