---
name: web-game-toolkit
description: Taller para hacer juegos web (HTML/JS sin build) con Claude Code, sacado de Zugzwang. Úsala al empezar o ampliar un juego web: temas pixel art dibujables a mano (PNG o claude-pxl), iconos en dos sets (vector y píxel) medidos e igualados, sonido grabado + sintetizado, música en bucle, registro central de contenido con comprobaciones, demos de movimiento, minijuegos con física, pruebas con Playwright en móvil y PC, y cómo gastar pocos tokens en todo eso.
---

# Taller de juegos web

Lo que funcionó en Zugzwang (roguelike de ajedrez, Preact + htm sin build), en recetas para repetir en otro juego. Los scripts son genéricos; el código de Zugzwang es la implementación de referencia cuando haga falta ver una entera.

## Principios

1. **Un solo sitio para cada cosa que crece.** Piezas, jefes, mutaciones, minijuegos, logros, mesas y temas se declaran en datos; pantallas, galería y demos los leen de ahí. Añadir un elemento debe tocar un archivo.
2. **Cada registro con su comprobación en Node.** Las comprobaciones deben avisar de lo que quedó a medias (pieza sin dibujo, logro que nadie otorga, minijuego sin pantalla, demo vacía). Mismo criterio para arte, sonido y minijuegos con lógica.
3. **El arte se edita en su fuente y un importador lo pasa al juego.** Nunca editar a mano el código generado.
4. **Dos versiones visuales conmutadas por CSS, no por JS.** Cuando sea viable, el juego pinta las dos (vector y píxel) y el selector muestra una: cambiar el tema no obliga a repintar nada.
5. **Probar en el navegador de verdad, en móvil y en PC, ratón y dedo**, antes de dar algo por hecho.

## Pixel art

- Cada tema tiene sus datos y dibujos en PNG o en un archivo `.px.js` de **claude-pxl**.
- Recorta el espacio vacío y centra por masa visual, no solo por caja. Igualar las rampas de color y revisar una hoja a 40 px y a 16 px.
- El modo píxel usa `image-rendering: pixelated`, contornos deliberados y formas consistentes.
- **Sin filtros para "pixelar" vectores**: se comen los trazos finos y ensucian. Dibuja la versión píxel.
- Dentro de variables CSS `url()` se resuelve desde la hoja de estilos: usa rutas relativas correctas.

## Iconos en dos sets

Vector 24×24 con silueta y recortes, y píxel 16×16 dibujado. Medir caja, tinta, centro y asimetría; revisar escala final. No asumir igualdad visual entre dos sets sin comparar.

## Audio

- Dos variantes por tema: audio grabado con licencia clara y audio sintetizado cuando aplique.
- Normalizar según la jerarquía del efecto: un clic no suena como una explosión.
- Música en bucle sin hueco audible, elegida por pantalla con fundido cruzado. Arranca con el primer gesto del usuario.

## Demos, galería y logros

- La demo de movimiento debe enseñar el alcance, no ser una decoración estática.
- Galería y logros comparten el agrupado; tocar un logro abre su ficha.

## Minijuegos

- Lógica pura y testeable en un módulo; pantalla aparte y entrada en el registro.
- Tiempo real: subpasos fijos, recortar `dt`, animar principalmente `transform`, usar pointer events y `setPointerCapture`.
- Táctil: arrastrar debe funcionar igual que ratón. No depender de `pointerenter`; medir destino con `elementFromPoint`.

## Pruebas de navegador

- Probar a 360×800 con táctil y a 1366×768 / 1920×912 con escritorio.
- Medir `getBoundingClientRect`, `getComputedStyle`, cargas de imágenes, errores de consola y recuento de nodos.
- Capturar el modo normal y píxel y **abrir las capturas reales**. No dar por verificado un arte ni un layout porque compila.
- Rendimiento: evitar efectos caros por pieza en pixel art, animaciones de fondo que sigan cuando la interfaz está inactiva y estilos con estado inicial implícito.

## Herramientas

| Herramienta | Uso |
|---|---|
| claude-pxl | Pixel art como código; `.px.js` → PNG y previews |
| Ponytail | Cambios mínimos, pruebas de lógica y revisión de los archivos afectados |
| anti-slop / taste review | Revisar patrones genéricos y decisiones visuales sin reemplazar intención por una plantilla |
| Playwright + Chromium | Pruebas reales en móvil y escritorio |

## Trabajo eficiente

- Una tarea principal por sesión.
- Archivo fuente para cada arte, comprobación automatizada y una línea de salida cuando todo pasa.
- Capturas recortadas a escala útil; medir el DOM antes de interpretar una captura.
- Leer archivos por tramos y evitar reexplorar archivos ya entendidos.
- No confundir “menos código” con quitar validaciones, accesibilidad, seguridad o manejo de errores.
