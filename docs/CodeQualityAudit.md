# Auditoría de código: anti-slop y calidad de implementación

## Hallazgos corregidos en esta pasada

### 1. Test que simulaba el comportamiento en vez de comprobarlo
`generic_dialogue_items.test.js` asignaba manualmente `npc.clue` y `npc.mechanicHint` antes de afirmar que existían. Eso podía pasar aunque el constructor de `NPC` estuviera roto. Se añadió la opción de inyectar un conjunto de diálogo mediante `opts.dialogueSet` y el test ahora instancia un NPC real con ese conjunto y verifica los metadatos propagados.

### 2. Test de glitch probabilístico
La prueba de `DialogueEngine` dependía de que el azar produjera al menos un carácter corrupto. Una prueba automatizada no debe fallar ocasionalmente por azar; ahora fija `Math.random` durante ese test y restaura mocks antes de cada prueba.

### 3. Ausencia de ejecución reproducible en CI
No se encontró un workflow de GitHub Actions en la rama. Se añadió `.github/workflows/tests.yml` para instalar dependencias y ejecutar `npm test` en PRs y pushes a `main` o ramas `narrative/**`.

## Riesgos detectados que necesitan revisión separada

- `DialogueActions.js` mezcla acciones del juego con fallback directo a elementos DOM y mantiene alias duplicados para inspección. Hay que normalizarlo sin romper llamadas antiguas desde los pools.
- `NPC.js` concentra generación aleatoria, atributos, rasgos, datos de NPCs únicos y compatibilidad de diálogos. Conviene separar configuración de personajes y generadores puros, con tests para probabilidades y atributos.
- `Conversation._injectTemplate` mezcla sustitución de plantillas, registro de rumores y corrupción visual aleatoria. Son responsabilidades distintas y deberían poder probarse por separado.
- El sistema de diálogos registra uso dentro del constructor. Eso acopla creación de una conversación con persistencia del estado; debe verificarse que instancias de prueba, previews y reconstrucciones no consuman pools accidentalmente.
- `getCurrentNode` añade una salida dinámica, mientras `getNextDialogue` tiene lógica especial por índice y por ID. Esta duplicación es frágil; una futura refactorización debe compartir la misma función para construir opciones visibles y resolver opciones seleccionables.
- `generic_dialogue_items.test.js` reemplaza globalmente `DialogueData.pools` y parchea métodos de `State`; debe evitar contaminación entre tests y preferir spies/restauración explícita.
- `NPC.getDisplayName()` puede cambiar de resultado en cada llamada por azar. Como se usa durante la interpolación de diálogos, el nombre mostrado puede variar dentro de una misma conversación; decidir si el epíteto debe fijarse al crear el NPC.
- El riesgo de anomalía en `pickTrait` crece con el ciclo y puede alcanzar 100%; verificar si eso es intencional y consistente con el tutorial y la dificultad.
- El badge y los atributos fijos de NPCs de lore los identifican explícitamente como anomalías. Es una decisión de diseño visible, no solo un problema de redacción; debe resolverse junto al sistema de deducción y sus tests.

## Uso de “Ponytail”

En el código inspeccionado, `ponytail` aparece como un valor de estilo de pelo dentro de `NPC.generateVisualFeatures`. No hay evidencia suficiente en la rama de que “Ponytail” sea un framework o una herramienta de análisis de código. No se ha eliminado ese estilo visual. Si la referencia era a una skill externa llamada Ponytail, debe incorporarse como criterio una vez que esté disponible/verificada.

## Validación pendiente

La ejecución local no fue posible porque este entorno no puede resolver `github.com` y el repositorio no está montado localmente. El workflow agregado permitirá obtener el resultado real desde GitHub Actions si Actions está habilitado en el repositorio. Hasta ver ese resultado, no se debe afirmar que los tests pasan.
