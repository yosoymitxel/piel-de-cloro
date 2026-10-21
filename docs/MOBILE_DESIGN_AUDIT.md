# Criterios de diseño y auditoría mobile

Estado: aplicable a `narrative/rebuild-lore-dialogues`. Este documento adapta ideas de herramientas públicas de diseño de juegos y anti-slop UI; no instala sus scripts ni copia sus archivos ejecutables.

## Referencias de trabajo

- [GameDev Agent Skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills): elegir habilidades por disciplina y tarea; validar compatibilidad con el stack real antes de aplicar una receta.
- [Claude Code Game Studios — design-system](https://github.com/Donchitos/Claude-Code-Game-Studios/blob/main/.claude/skills/design-system/SKILL.md): diseñar reglas, estados, fórmulas, dependencias, casos límite y criterios de aceptación antes de implementar un sistema.
- [Ponytail](https://github.com/dietrichgebert/ponytail): revisar como referencia de flujo de trabajo; adoptar solo las partes verificadas que encajen con el repositorio.
- [Taste Skill](https://github.com/Leonxlnx/taste-skill): usar su enfoque de auditoría/rediseño y dirección visual para mejorar la interfaz móvil existente, no reemplazarla con una plantilla genérica.
- [Impeccable](https://github.com/pbakaus/impeccable): revisar tipografía, jerarquía, contraste, densidad, accesibilidad, responsive y patrones visuales repetidos; usar sus detectores como pistas, no como sustituto del criterio.
- [ChatGPTPlaywright](https://github.com/3mora2/ChatGPTPlaywright): referencia para inspección visual real con navegador. Las capturas y métricas del proyecto deben proceder de ejecuciones Playwright verificables, no de inferencias a partir del CSS.

## Principios visuales para Piel de Cloro

La identidad existente es una terminal retro de horror, no un dashboard SaaS. Conservar la estética de CRT/terminal, el lenguaje de color, los marcos industriales y la tensión visual. Eliminar slop significa corregir decisiones sin propósito, no borrar personalidad.

- No rediseñar escritorio por accidente: los cambios responsive deben vivir en reglas mobile acotadas salvo que exista un defecto compartido demostrado.
- No ocultar funciones esenciales para hacer que una captura parezca limpia.
- No usar tarjetas anidadas, degradados decorativos, iconos en mosaico ni radios grandes por defecto.
- Tipografía funcional: limitar tracking exagerado en textos largos; reservar la tipografía monoespaciada y el espaciado amplio para etiquetas de terminal.
- Jerarquía: una acción primaria por contexto; acciones destructivas claramente diferenciadas; consecuencias y costes visibles antes de confirmar.
- Movimiento: respetar `prefers-reduced-motion`; ninguna transición debe bloquear entrada o lectura.
- Interacción táctil: controles primarios con objetivo de al menos 44×44 CSS px, separación suficiente y estados focus/active visibles.
- Pantallas pequeñas: respetar safe areas, evitar scroll horizontal global, no recortar diálogos, permitir scroll vertical dentro de modales largos y no bloquear el cierre del modal fuera del área visible.
- Densidad: priorizar la tarea actual del jugador. En móvil, reorganizar el HUD en vez de reducir toda la interfaz de escritorio hasta volverla ilegible.
- Accesibilidad: contraste suficiente, controles con nombre accesible, foco visible, errores comprensibles y no depender solo del color para indicar infección, riesgo o resultado.

## Flujo de auditoría obligatorio

1. Establecer la línea base visual en escritorio y en viewports móviles de 320, 360, 390 y 430 px.
2. Ejecutar la ruta real: pantalla inicial → tutorial → primer día → paneles/modales clave → fin de turno/noche → reinicio.
3. Registrar errores de consola, scrollWidth, bounding boxes de controles, elementos fuera del viewport, elementos superpuestos y capturas.
4. Clasificar cada defecto por severidad (bloquea partida, oculta información, dificulta toque/lectura, cosmético) y corregir primero los de mayor impacto.
5. Revisar las capturas después de cada cambio; no dar por bueno un fix solo porque pasa una aserción de CSS.
6. Repetir la ruta de escritorio para detectar regresiones y correr pruebas unitarias, validador de diálogos y Playwright.
7. No marcar una pantalla como terminada si no existe evidencia de ejecución y una lista explícita de defectos pendientes.

## Criterios de aceptación mobile

- Sin overflow horizontal del documento en los viewports de prueba.
- Ninguna acción primaria/destructiva queda fuera de pantalla o debajo de un elemento fijo.
- Modales y diálogos caben en la altura disponible y pueden desplazarse.
- Los objetivos táctiles primarios miden al menos 44×44 CSS px.
- El HUD se lee sin zoom y sin reducir todo el juego a una miniatura.
- Tutorial y primer día pueden iniciarse sin errores JavaScript no controlados.
- Las capturas muestran la interfaz real tras estabilizar animaciones y texto, no solo el shell vacío.
- Escritorio conserva su comportamiento salvo que se documente un defecto compartido.

## Registro de defectos

Cada defecto encontrado debe incluir: viewport, pasos para reproducir, elemento afectado, resultado esperado/actual, captura, causa confirmada o hipótesis, cambio aplicado y prueba que lo protege. No presentar una hipótesis como causa raíz hasta comprobarla.
