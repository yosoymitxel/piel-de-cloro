# Plan de reconstrucción técnica y de producto

Estado: diagnóstico inicial; no representa una auditoría exhaustiva ni certifica compatibilidad móvil.

## Criterios de salida

Una fase no se considera terminada solo porque los tests unitarios pasen. Debe tener pruebas reproducibles, reglas documentadas y una comprobación de regresión adecuada al riesgo.

1. **Integridad del juego:** una sola resolución por acción; recursos, NPCs, turnos, flags y finales no pueden contradecirse.
2. **Separación de responsabilidades:** lógica de dominio independiente del DOM, audio y renderizado.
3. **Contenido coherente:** datos narrativos declarativos, referencias verificadas y validación automática de nodos, acciones, condiciones y destinos.
4. **Experiencia móvil:** uso real a 360×800 con interacción táctil, además de escritorio; ningún desbordamiento horizontal ni control crítico inaccesible.
5. **Rendimiento:** medir coste de arranque, tamaño del DOM, animaciones, repintados y dependencias antes de optimizar.
6. **Calidad narrativa:** voz diferenciada, causalidad entre escenas, información dosificada y decisiones que cambien algo verificable.

## Diagnóstico confirmado en el repositorio

- `index.html` tiene aproximadamente 121 KB y concentra gran parte del esqueleto de pantallas; declara decenas de etiquetas `script`, además de dependencias externas y CSS distribuido en muchas hojas.
- El proyecto mezcla jQuery/DOM imperativo con componentes React montados desde un bootstrap propio. Eso no es automáticamente incorrecto, pero los límites de propiedad del DOM y del estado deben ser explícitos.
- `State.js` es un estado global mutable consumido por múltiples gestores. Es una fuente importante de acoplamiento y hace difícil razonar sobre quién puede cambiar cada dato.
- `GameMechanicsManager.js` tiene cerca de 1.900 líneas y combina numerosas áreas: generador, purgas, noche, recursos, intrusiones, expediciones, sabotaje y análisis. Necesita división por dominio, no más métodos apilados.
- `package.json` solo define Jest y el generador de pixel art; no hay un flujo de build/lint ni un test de navegador configurado en los scripts.
- `css/style.css` tiene media queries, pero su presencia no demuestra una experiencia móvil correcta. No se encontró una prueba de viewport/táctil en la configuración actual.
- El final `final_cure` está definido como texto, pero no se encontró una ruta jugable comprobada que acumule las muestras, valide la síntesis y active ese final. La existencia del texto no debe presentarse como mecánica implementada.
- El repositorio contiene muchas suites unitarias, pero no se debe inferir cobertura de navegador, compatibilidad móvil o coherencia completa de una partida a partir de su número.

## Orden de trabajo

### Fase 0 — Congelar y medir el estado actual
- Ejecutar la suite en el commit exacto y conservar el resultado.
- Enumerar entradas, dependencias, eventos globales, mutaciones de State y puntos de entrada de cada mecánica.
- Hacer un mapa de flujos de una partida: inicio, admisión, investigación, recursos, noche, muerte/expulsión, final.
- Capturar la interfaz en 360×800 táctil y escritorio; registrar overflow, botones, modales y desplazamiento.
- No hacer un rediseño masivo antes de tener esa línea base.

### Fase 1 — Corregir reglas antes de reorganizar archivos
- Escribir invariantes: límites de recursos, pertenencia única de NPCs a listas, una sola resolución nocturna por ciclo, transiciones válidas y finales mutuamente coherentes.
- Añadir pruebas de integración para una partida completa y para casos de fallo.
- Implementar la cura como flujo real o marcarla explícitamente como contenido no disponible hasta hacerlo.
- Evitar pruebas que solo comprueben que existen metadatos o texto.

### Fase 2 — Separar dominio de interfaz
- Extraer funciones puras de cálculo y transición de estado.
- Mover reglas del generador, noche, recursos, intrusiones y expediciones a módulos de dominio separados.
- Centralizar acciones y validar cada acción contra el estado actual antes de mutarlo.
- Definir una capa de presentación que lea el estado y no sea responsable de decidir reglas.
- Migrar por comportamiento, conservando compatibilidad temporal solo donde haya llamadas reales que la necesiten.

### Fase 3 — Contenido y narrativa como datos comprobables
- Mantener IDs estables durante la migración para no romper referencias.
- Añadir validador para nodos huérfanos, destinos inexistentes, flags sin uso, acciones no registradas, requisitos imposibles y opciones inalcanzables.
- Separar voz, exposición y función mecánica; cada NPC debe revelar información que solo ese NPC pueda aportar.
- Revisar continuidad temporal, motivaciones, conocimiento de personajes y consecuencias de decisiones.
- Reducir texto genérico solo después de definir qué sabe cada personaje y cuándo puede decirlo.

### Fase 4 — Interfaz móvil y accesibilidad
- Establecer breakpoints explícitos y una navegación móvil usable sin depender de la sidebar de escritorio.
- Probar targets táctiles, áreas seguras, teclado virtual, scroll de modales, orientación y textos largos.
- Reducir o desactivar animaciones costosas cuando corresponda; respetar `prefers-reduced-motion`.
- Probar Safari móvil/Chrome Android cuando sea posible, además de Chromium de escritorio.
- Usar medidas de DOM y capturas de regresión; no declarar móvil resuelto por inspección del CSS.

### Fase 5 — Rendimiento y limpieza
- Medir el coste real antes de optimizar; no sustituir tecnologías por moda.
- Eliminar dependencias o aliases solo cuando no haya consumidores.
- Reducir listeners duplicados, renders/reflows evitables y trabajo repetido por turno.
- Añadir checks cortos y reproducibles a CI para reglas, datos narrativos y flujos de dominio.

## Restricciones de la migración

- Trabajar en `narrative/rebuild-lore-dialogues`; no tocar `main` ni fusionar automáticamente.
- Hacer cambios pequeños, agrupados por comportamiento, con tests antes/después.
- Mantener IDs de diálogo, acciones y flags hasta que sus consumidores se hayan migrado.
- No afirmar que el juego está arreglado basándose solo en tests unitarios.
- La reescritura de texto no sustituye una reparación de mecánicas, arquitectura ni interfaz.

## Uso de la skill `web-game-toolkit`

Se aplican sus principios relevantes: una sola fuente para datos que crecen, validadores automáticos, lógica de juego testeable sin DOM y pruebas reales con viewport móvil/táctil y escritorio. Las recetas específicas de otros géneros (piezas, tableros, física o temas de pixel art) no se aplican automáticamente a este juego.


## Progreso de la reconstrucción (2026-10-21)

- [x] El protocolo del generador rechaza modos desconocidos sin mutar el estado.
- [x] La resolución nocturna y la recarga no se omiten cuando no hay NPCs admitidos.
- [x] Los resultados de laboratorio emiten una sola notificación.
- [x] El análisis biológico exige que el laboratorio esté encendido.
- [x] Cinco análisis positivos completados de sujetos distintos registran hasta cinco muestras viables; la salida limpia con las cinco muestras activa `final_cure`.
- [x] Las solicitudes repetidas de finalización no encolan una segunda secuencia de final.
- [x] Se añadió un layout táctil para pantallas de hasta 640 px con navegación desplazable y panel principal flexible.

**No se marca como terminado:** la experiencia móvil requiere validación visual e interactiva real en 360×800 y otros tamaños; la arquitectura sigue acoplada al estado global y al DOM; todavía hace falta una pasada de continuidad narrativa y pruebas de integración de los ciclos completos. Los tests automatizados no sustituyen esas verificaciones.
