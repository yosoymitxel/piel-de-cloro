# Capa ambiental de pixel art

Esta capa añade utilería raster PNG de tamaño nativo para la versión Vanilla JS/React de Piel de Cloro. No copia la UI del prototipo Phaser ni modifica el estado, el motor de diálogos, las reglas, los recursos o el flujo de las pantallas.

## Integración

- Los retratos de personajes existentes generados con ClaudePXL se conservan; esta carpeta solo contiene entorno y utilería.
- Los PNG ambientales viven en `assets/pixel/environment/` y usan una cuadrícula de píxeles dura, paleta industrial oscura y acentos verde cloro/óxido.
- `css/PixelArtEnvironment.css` se carga al final y estiliza IDs/clases que existen en el DOM o en los componentes React de la aplicación original.
- Los fondos son decoración: no sustituyen la capa de NPC, el estado, los IDs, los textos, los botones, los eventos ni el sistema de inspección.
- El HUD móvil se compacta mediante una regla limitada a 381–700 px; no oculta los seis indicadores activos, salvo el indicador de combustible que ya se oculta en el diseño móvil original.

## Validación

`__tests__/pixel_art_environment.test.js` comprueba las dimensiones declaradas, la firma PNG, CRC de cada chunk, descompresión del flujo de píxeles RGBA, todas las rutas CSS y que los selectores de inicio/final coincidan con los componentes originales.

Playwright genera capturas reales en los workflows existentes. La suite E2E todavía tiene dos fallos de lógica preexistentes en las pruebas `migration_integration` y `npc_logic`; esos fallos se observaban en `main` antes de esta capa visual. Las pruebas de navegador también detectaron un HUD móvil de seis indicadores que se partía en dos filas; la regla específica para pixel art corrige ese caso y queda pendiente confirmar la ejecución del nuevo workflow.

Esta es una capa ambiental inicial, no un rediseño de arte completo: falta revisión manual de todos los estados, atlas de tiles y animaciones de ambiente.
