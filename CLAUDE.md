# Piel de Cloro — mapa de trabajo

## Reglas de cambio
- Leer el flujo real antes de editar: fuente de datos → lógica → renderizado → CSS → tests.
- No declarar arreglado un bug por tener el workflow verde; probar el HTML efectivo y la versión publicada en Playwright.
- Para cambios de arte, usar ClaudePXL desde `.claude/skills/pxl-pixel-art/SKILL.md` y leer la referencia completa en `reference.md`; construir, abrir el preview real y corregirlo.
- Para cambios pequeños, usar el criterio Ponytail: reutilizar lo existente y evitar abstracciones/dependencias nuevas si no hacen falta. Consultar `.claude/skills/ponytail/SKILL.md` y ejecutar la revisión relevante antes de cerrar.
- En retratos ordinarios, nunca derivar el arte de `npc.isInfected` ni mostrar información de infección oculta. El retrato es cosmético; las inspecciones son la fuente de evidencia.
- Mantener retratos deterministas durante una partida. No usar `Math.random()` durante renderizado.
- Los diálogos usan las skills `game-narrative`, `dialogue-intent` y `anti-slop-review`; conservar IDs, triggers, estructura de datos y consecuencias.
- No refactorizar narrativas enteras en un lote sin inventario, comparativa de texto y pruebas.
- Antes de merge: pruebas unitarias, Playwright desktop y móvil, inspección de capturas de las escenas tocadas y comprobación de rutas de assets en la publicación.

## Mapa rápido
- Render de NPC: `js/AvatarRenderer.js`
- Generación procedural de retrato: `js/avatar/AvatarGenerator.js`
- Arte de personajes fijo en código: `art/npcs.px.js`
- Build de PNGs ClaudePXL: `tools/build-npc-pixel-art.mjs`
- Estilos de retratos: `css/avatars.css`
- Pruebas de avatares: `__tests__/avatar_system.test.js`, `__tests__/avatar_generator.test.js`
- Browser tests: `e2e/`
- Comandos: `npm test`, `npm run build:npc-art`, `npm run test:e2e`
