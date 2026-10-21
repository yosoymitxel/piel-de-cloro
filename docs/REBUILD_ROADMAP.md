# Reconstrucción integral de Piel de Cloro

Estado: trabajo activo en `narrative/rebuild-lore-dialogues`. Este documento es el contrato de trabajo y la lista de verificación; marcar una casilla exige evidencia en código o pruebas. No se modifica `main` ni se fusiona automáticamente.

## Objetivo de diseño

La referencia no es copiar literalmente otros juegos, sino trasladar lo que funciona en **No, I'm Not a Human** y **Papers, Please** al tono y mundo de Piel de Cloro:

- **Sospecha con evidencia incompleta:** observar, preguntar, comparar señales y decidir bajo incertidumbre; nunca resolver todo con un chequeo arbitrario.
- **Personajes memorables:** cada persona tiene una voz, objetivo, información parcial, contradicciones, vínculos y consecuencias. Evitar que los NPC sean dispensadores intercambiables de lore.
- **Decisiones costosas y legibles:** admitir, rechazar, purgar, investigar o gastar energía debe tener un coste claro y consecuencias a corto y largo plazo.
- **Presión sistémica que se cruza con la narrativa:** electricidad, comida, seguridad, salud mental, tiempo, personal y confianza deben competir por recursos limitados.
- **Rutina que cambia de significado:** la inspección y administración tienen variaciones y dilemas humanos; no convertirse en una lista repetitiva de tareas.
- **Consecuencias persistentes y finales ganados:** el juego recuerda decisiones y muestra sus efectos; ningún final importante existe solo como texto inalcanzable.
- **Ambigüedad justa:** el jugador puede equivocarse, pero debe poder explicar por qué tomó la decisión. Evitar azar opaco, pistas contradictorias por error y soluciones obvias.
- **Escritura económica y específica:** cada línea caracteriza, revela, presiona o altera una decisión. Recortar repetición, frases genéricas y exposición que el jugador ya conoce.

La auditoría visual mobile y los criterios anti-slop están definidos en [MOBILE_DESIGN_AUDIT.md](./MOBILE_DESIGN_AUDIT.md); los cambios responsive deben probarse con capturas reales y no deben alterar escritorio sin evidencia.

## Plan completo por prioridad

### P0 — Integridad del juego y regresiones
- [ ] Ejecutar y conservar el resultado de todos los tests y validadores desde el HEAD actual.
- [ ] Construir un mapa de estados/transiciones de una partida completa, desde inicio hasta final.
- [ ] Definir invariantes para recursos, tiempo, NPCs, flags, acciones, investigaciones, noches, purgas, expediciones y finales.
- [ ] Centralizar la resolución de turnos/días/noches: cada fase se ejecuta una sola vez por ciclo y en un orden explícito.
- [ ] Hacer idempotentes las acciones terminales y bloquear dobles clics/reentradas durante transiciones.
- [ ] Auditar todos los retornos tempranos para encontrar efectos que se saltan accidentalmente.
- [ ] Garantizar que un NPC esté en exactamente un estado/lugar coherente; limpiar referencias de listas al morir, irse, ser purgado o escapar.
- [ ] Unificar las transiciones de recursos: límites, costes, efectos y logs deben actualizarse en un solo punto.
- [ ] Comprobar reinicio completo de una partida: flags, intervalos, audio, modales, timers, NPCs, finales y UI.
- [ ] Probar rutas de error: energía insuficiente, generador apagado, laboratorio apagado, NPC inexistente, destino inválido, acción duplicada y estado corrupto.
- [ ] Integrar y verificar finales, incluida la ruta de cura, sin finales simultáneos ni rutas de victoria accidentales.

### P0 — Unificar sistemas duplicados o fragmentados
- [ ] **Generador:** una única API de dominio para encender/apagar, cambiar modo, activar/desactivar sistemas, calcular carga/capacidad/consumo, consumir energía, recargar y comprobar seguridad. Los botones/UI llaman esa API; no replican fórmulas.
- [ ] **Personal/NPC:** un único servicio para admisión, estado, asignación de habitación/puesto, asignación de trabajo, inspección, análisis, traslado, rechazo, purga, muerte, escape y salida. Las transiciones actualizan todas las listas, contadores, flags e historial.
- [ ] **Ciclo:** un único coordinador de fases para fin de turno, noche, comienzo de día, eventos y actualización de sistemas.
- [ ] **Recursos:** un solo camino de mutación para suministros, cordura, paranoia y energía, con validación, límites y registro del motivo.
- [ ] **Finales:** un solo árbitro de condiciones y una sola transición terminal.
- [ ] **Diálogos:** un solo contrato para requisitos, efectos, flags, historial, acciones y destinos; no aplicar efectos si la transición falla.
- [ ] **Eventos aleatorios:** separar selección, elegibilidad, aplicación y presentación; un evento no debe mutar estado dos veces por tener varios consumidores.
- [ ] **Audio:** un método por operación pública; opciones compatibles explícitas en lugar de métodos duplicados con firmas diferentes.
- [ ] **UI/modal:** una única función por operación, con cierre/limpieza consistente y sin duplicar listeners ni notificaciones.
- [ ] **Logs/notificaciones:** registrar una consecuencia en un único lugar y evitar mensajes duplicados cuando dos referencias apuntan al mismo servicio.

### P1 — Arquitectura y mantenibilidad
- [ ] Inventariar clases, dependencias, listeners, imports globales y quién modifica cada campo de `State`.
- [ ] Reducir `GameMechanicsManager` extrayendo módulos por dominio sin reescribir todo de golpe.
- [ ] Establecer límites claros entre dominio, coordinación de partida, UI/DOM, audio y datos narrativos.
- [ ] Mover reglas deterministas a funciones testeables sin DOM ni jQuery.
- [ ] Crear contratos para acciones y transiciones, con entradas validadas y resultados explícitos.
- [ ] Eliminar métodos duplicados, ramas muertas, aliases obsoletos, listeners duplicados y compatibilidad sin consumidores demostrados.
- [ ] Sustituir números mágicos por constantes nombradas con explicación de diseño.
- [ ] Evitar una migración masiva: mover una responsabilidad por vez, conservar IDs y ejecutar regresiones después de cada cambio.
- [ ] Incorporar checks automáticos de sintaxis, estructura, grafo narrativo y reglas de dominio a CI.

### P1 — Narrativa, personajes y diálogos
- [ ] Crear una ficha de personaje para cada NPC recurrente: deseo, miedo, secreto, voz, conocimiento, contradicciones y evolución.
- [ ] Crear una matriz de conocimiento: qué sabe cada personaje, cómo lo sabe y desde qué día puede decirlo.
- [ ] Trazar las rutas de diálogo, condiciones, flags, destinos y consecuencias; detectar nodos huérfanos, opciones imposibles y loops accidentales.
- [ ] Comprobar que cada opción de diálogo comunica una intención comprensible y consecuencias plausibles.
- [ ] Eliminar exposición repetida, respuestas intercambiables, moralina genérica, falsas elecciones y frases de relleno.
- [ ] Diferenciar voces por sintaxis, vocabulario, evasión, humor, hostilidad y nivel de información, no solo por etiquetas.
- [ ] Hacer que la evidencia sea triangulable: testimonios, conducta, objetos y sistemas pueden coincidir o contradecirse de forma intencional.
- [ ] Revisar cronología, causalidad, motivaciones, continuidad entre días y consecuencias de decisiones previas.
- [ ] Revisar el tono: horror psicológico y desconfianza sostenida, sin convertir todos los personajes en caricaturas ni cada escena en un giro dramático.
- [ ] Verificar todos los finales por alcanzabilidad real, requisitos claros y exclusividad de resolución.
- [ ] Escribir pruebas para rutas críticas de diálogo, no solo para comprobar que existe el texto.

### P1 — Experiencia móvil y accesibilidad
- [ ] Verificar el juego a 360×800, 390×844, tablet y escritorio.
- [ ] Probar la navegación lateral, desplazamiento de contenido, modales altos, formularios y diálogos largos con toque real.
- [ ] Corregir overflow horizontal, alturas rígidas, controles pequeños y elementos tapados por teclado virtual/áreas seguras.
- [ ] Verificar orientación vertical/horizontal y zoom del navegador.
- [ ] Añadir soporte de `prefers-reduced-motion` y foco visible/teclado donde corresponda.
- [ ] Verificar contraste, etiquetas accesibles, botones semánticos y que el color no sea la única señal.
- [ ] Probar Chrome Android y Safari iOS si los entornos están disponibles; si no, declarar exactamente qué queda sin verificar.
- [ ] No considerar móvil terminado solo por añadir media queries.

### P2 — Rendimiento y recursos
- [ ] Medir arranque, carga de assets, listeners, intervalos, tamaño del DOM y coste de cada cambio de turno.
- [ ] Localizar repintados forzados, consultas DOM repetidas, recreación de listas completas y animaciones simultáneas.
- [ ] Evitar intervalos y listeners duplicados al reiniciar o cambiar de pantalla.
- [ ] Comprobar el ciclo de vida de audio, imágenes, timers y modales.
- [ ] Optimizar imágenes y recursos solo después de medir; no degradar arte/sonido por micro-optimizaciones.
- [ ] Auditar dependencias y scripts cargados; retirar una dependencia únicamente tras verificar todos sus consumidores.
- [ ] Definir presupuestos y una comprobación reproducible para regresiones de rendimiento.

### P2 — Tooling, documentación y entrega
- [ ] Mantener CI con instalación reproducible mediante lockfile.
- [ ] Añadir validadores de diálogo, estructura, referencias de acciones y reglas críticas.
- [ ] Añadir tests de integración y, si el repositorio permite instalar/configurar el navegador, pruebas end-to-end de escritorio/móvil.
- [ ] Mantener una bitácora de cambios: problema, causa raíz, archivos, prueba, resultado y limitaciones.
- [ ] Mantener un registro de riesgos abiertos y no declarar trabajo hecho sin evidencia.
- [ ] Revisar el diff completo antes de cerrar; no fusionar ni modificar `main` sin instrucción explícita.

## Aristas y riesgos que hay que resolver

1. **Reglas duplicadas en varios puntos:** un botón puede aplicar una fórmula distinta de un evento nocturno o de un evento aleatorio.
2. **Orden de resolución:** un NPC puede morir, escapar o cambiar de estado entre la validación de una acción y su aplicación.
3. **Reentradas:** doble toque, animación o callbacks pueden disparar dos veces análisis, purga, consumo, transición o final.
4. **Estado global mutable:** cualquier manager puede modificar cualquier dato; los tests aislados pueden ocultar interferencias.
5. **Reset incompleto:** quedan flags, intervalos, audio, listeners, referencias de NPC o clases CSS de una partida anterior.
6. **Listas de NPC inconsistentes:** la misma persona aparece en refugio, morgue, expedición o seguridad al mismo tiempo; o no aparece en ninguna.
7. **Asignaciones obsoletas:** un trabajo o habitación sigue referenciando a alguien que ya no puede trabajar o ya no está dentro.
8. **Generador y carga:** carga mayor que capacidad, modos inválidos, sistemas apagados que siguen consumiendo, energía negativa o efectos que no se revierten.
9. **Laboratorio/cura:** análisis que no exige laboratorio activo, muestras duplicadas, progresos que persisten tras reinicio o final no alcanzable.
10. **RNG y tests frágiles:** los tests dependen del orden de llamadas a `Math.random` o fallan por aleatoriedad no controlada.
11. **Diálogos rotos:** requisitos con nombres inconsistentes (`req`/`requires`), destinos inexistentes, callbacks no registrados, flags que nunca se activan.
12. **Continuidad narrativa:** personajes conocen datos que no presenciaron, cambian de postura sin causa o contradicen escenas anteriores por error.
13. **Falsa agencia:** opciones que parecen cambiar algo pero llevan al mismo estado sin señalización intencional.
14. **Pistas injustas:** el jugador no tiene evidencia suficiente, o una pista determinante aparece solo por azar.
15. **UI y dominio acoplados:** una función de interfaz decide reglas o un manager de reglas manipula HTML directamente.
16. **DOM con propiedad ambigua:** jQuery y React pueden modificar el mismo subárbol y pisarse.
17. **Compatibilidad móvil falsa:** el layout se apila pero las pantallas quedan sin espacio, los modales no scrollean o la navegación tapa contenido.
18. **Ciclo de vida de listeners/timers:** handlers se registran varias veces y los intervalos sobreviven a pantallas o partidas.
19. **Audio duplicado o desincronizado:** firmas homónimas, fades concurrentes, canales que siguen sonando después de un final.
20. **Performance prematura:** optimizar sin mediciones puede añadir complejidad y no mejorar el rendimiento.
21. **Cambios demasiado grandes:** una refactorización amplia dificulta encontrar regresiones; dividir por contrato y comportamiento.
22. **CI incompleta:** suite verde no equivale a e2e, accesibilidad, rendimiento ni compatibilidad real.
23. **Dependencias/entorno:** scripts CDN, APIs del navegador o paquetes pueden comportarse distinto sin red, en móvil o en CI.
24. **Datos heredados:** conservar IDs evita romper referencias, pero puede mantener inconsistencias que hay que migrar con un plan.
25. **Descripciones desactualizadas:** tests/documentación pueden decir que una mecánica no existe después de integrarla, o declarar terminada una ruta sin probarla.
26. **Cambios de balance involuntarios:** arreglar lógica puede cambiar dificultad, ritmo o tasa de supervivencia; comprobar que la consecuencia es intencional.
27. **Contenido repetitivo generado:** variaciones superficiales de texto no equivalen a personajes distintos ni a decisiones significativas.
28. **Finales contradictorios:** dos sistemas disparan finales distintos en el mismo ciclo o una transición vuelve a abrir controles.
29. **Estado al purgar/matar:** muestra, evidencia, asignación, pertenencias y estadísticas deben tener reglas explícitas sobre qué se conserva.
30. **Alcance del trabajo:** no prometer compatibilidad de navegador o experiencia completa si no se ejecutó en ese entorno.

## Skills, herramientas y referencias que se usarán

### Skills disponibles en el contexto/repositorio
- **`web-game-toolkit`** (si está disponible en los archivos de skills proporcionados): guía de estructura de juego, datos centralizados, lógica separada de DOM y validación de viewport. Aplicar solo sus recetas relevantes al género.
- **`pxl-pixel-art`**: solo para producir/validar arte pixelado; no usarla para justificar arquitectura o escritura narrativa.
- **Skills de diálogo/escritura/narrativa** de los archivos suministrados, si su contenido está disponible: usarlas para voz, subtexto, consistencia y edición, sin aceptar texto generado sin revisión.
- **Skills de game design / narrativa interactiva** disponibles en el paquete original: usar las que tengan instrucciones verificables y aplicables; no inventar nombres ni asumir que están instaladas. Registrar las efectivamente consultadas en la bitácora.

### Herramientas del repositorio
- **Jest**: pruebas unitarias y de integración para invariantes y transiciones.
- **Validadores Node.js**: grafo de diálogos, callbacks/acciones y declaraciones duplicadas.
- **GitHub Actions**: repetir instalación reproducible, validadores y tests en cada cambio.
- **Browser automation (Playwright u otra herramienta ya disponible)**: añadir solo si se confirma compatibilidad con el entorno y puede instalarse; usar para viewport, navegación, modales y flujo de partida.
- **Git/GitHub branch y PR**: cambios pequeños, diff revisable y sin tocar `main`.
- **Profiler/DevTools del navegador**: medir rendimiento y verificar desbordamientos; las capturas por sí solas no sustituyen la interacción.
- **Lectura de archivos, búsqueda de símbolos y análisis de referencias**: mapear consumidores antes de borrar o renombrar APIs.

### Referencias de diseño
- **No, I'm Not a Human**: incertidumbre, lectura de personas, historias individuales memorables y decisiones que dejan una duda moral.
- **Papers, Please**: reglas legibles, presión de recursos/tiempo, verificación de evidencia y consecuencias acumulativas.
- **Piel de Cloro** conserva identidad propia: horror psicológico, aislamiento, sospecha y decisiones humanas. La meta no es convertirlo en un clon ni en un simulador administrativo repetitivo.

### Protocolo de uso
1. Leer la skill real antes de aplicarla; no inferir su contenido por el nombre.
2. Identificar el comportamiento roto y su consumidor.
3. Escribir una prueba que falle por la causa correcta.
4. Corregir la causa, no tapar el síntoma con fallback silencioso.
5. Ejecutar validador y suite relevante; comprobar CI.
6. Revisar efectos laterales en sistemas conectados.
7. Actualizar esta hoja con evidencia y riesgos pendientes.

## Criterios de cierre global

El trabajo no se considera completo hasta que: (a) los flujos críticos tienen pruebas de integración; (b) generador, personal, recursos, ciclo, diálogos y finales tienen reglas centralizadas; (c) los duplicados y transiciones inconsistentes detectados están eliminados o documentados; (d) el grafo narrativo pasa validación y sus rutas críticas son alcanzables; (e) la interfaz se prueba con interacción real en tamaños móviles y escritorio; (f) el rendimiento se mide antes/después; y (g) CI queda verde en el HEAD final. Las limitaciones de navegador que no puedan probarse se declaran, no se esconden.


## Reconstrucción sistémica adicional (2026-10-21)

- [x] Introducida una API central para mutaciones de energía y combustible: `setGeneratorPower`, `updateGeneratorPower`, `updateFuel`.
- [x] Eventos aleatorios y acciones del gestor de mecánicas enrutan recargas/consumos por esa API.
- [x] Admisión de NPCs idempotente: no admite duplicados ni sujetos con estado terminal.
- [x] Añadidos métodos compartidos para retirar, registrar muerte y registrar salida de NPCs; migradas las rutas nocturnas, inanición, intrusión y expediciones identificadas.
- [x] Añadidas pruebas de invariantes de recursos y ciclo de vida de NPCs.
- [x] Documentado el conjunto de herramientas y referencias de skills verificadas en `docs/REBUILD_TOOLKIT.md`.

**Pendiente de CI:** validar los últimos cambios de recursos y ciclo de vida en la suite completa antes de dar por estable esta fase.

**Pendiente estructural importante:** todavía hay duplicación de configuración del generador entre la inicialización de `State`, `State.reset()` y `Game`; se debe consolidar con una sola fábrica/configuración compartida después de revisar las dependencias y tests. También falta probar la partida completa en navegador y móvil.


### P1 — Revisión visual y mobile-first (sin degradar escritorio)
- [ ] Tratar escritorio como baseline de regresión: no rediseñar ni alterar su composición salvo que una prueba revele un defecto real.
- [ ] Auditar el flujo móvil real en 320, 360, 390, 412 y 768 px; capturar pantalla de título, tutorial, primer día, diálogo, inspección, generador, laboratorio, expedición, modal de confirmación y final.
- [ ] Comprobar visualmente cada estado con navegador real mediante Playwright: no basta con compilar ni con medir overflow horizontal.
- [ ] Priorizar ergonomía táctil: objetivos de toque cómodos, acciones principales accesibles con pulgar, navegación que no tape contenido, scroll dentro de modales y controles que no dependan de hover.
- [ ] Eliminar conflictos de CSS heredado y reglas `!important` que rompan estados como `hidden`; preferir estilos por componente y estados explícitos.
- [ ] Definir tokens visuales reutilizables (espaciado, tipografía, contraste, bordes, foco, superficies y movimiento) conservando la identidad de terminal/horror; no convertirlo en un dashboard SaaS genérico.
- [ ] Hacer una pasada antislop con criterios explícitos: sin gradientes decorativos gratuitos, tarjetas anidadas por defecto, iconos decorativos repetidos, microtexto ilegible, animaciones sin función ni exceso de mayúsculas sin jerarquía.
- [ ] Revisar legibilidad, contraste, foco visible, teclado, reduced-motion, zoom y textos largos en español.
- [ ] Capturar comparativas antes/después y revisar las imágenes de escritorio y móvil antes de dar por cerrada cada pantalla.
- [ ] No introducir dependencias o instalar skills ejecutables a ciegas: adaptar sus criterios al repo, revisar scripts y fijar versiones cuando se incorpore tooling.

#### Referencias de trabajo (criterios, no copia literal)
- `gamedev-skills/awesome-gamedev-agent-skills`: elegir prácticas por tarea y motor; este proyecto es JavaScript web, por lo que las skills de Unity/Godot no se aplican automáticamente.
- `Donchitos/Claude-Code-Game-Studios`: documentar sistemas y dependencias antes de rediseñar; no generar GDDs ceremoniales que no reflejen el código.
- `dietrichgebert/ponytail`: cambios pequeños, concretos y verificables; evitar refactors masivos sin prueba de comportamiento.
- `Leonxlnx/taste-skill`: dirección visual intencional y diferenciada; usarlo como crítica contra la interfaz genérica, no como permiso para rediseñar todo.
- `pbakaus/impeccable`: auditoría, adaptación, legibilidad, jerarquía y revisión visual iterativa; aplicar sus anti-patrones con el contexto de un juego de horror/gestión.

**Regla de aceptación:** una corrección móvil solo se considera terminada si pasa pruebas automatizadas y se inspecciona la captura del estado real en móvil. Una captura de título o un test de ancho no certifica toda la interfaz.
