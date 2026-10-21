---
name: piel-de-cloro-game-narrative
description: Audita y mejora narrativa interactiva, diálogos de NPCs, deducción y terror analógico en Piel de Cloro sin revelar información oculta ni modificar las mecánicas.
---

# Piel de Cloro — Game Narrative

## Contexto del juego

Piel de Cloro es un juego de terror analógico, gestión de recursos y deducción social en un búnker postapocalíptico. El jugador inspecciona solicitantes, decide quién entra, gestiona energía y suministros, y afronta la fase nocturna. La infección puede imitar a los humanos; el interrogatorio debe ofrecer indicios, no sustituir las herramientas de inspección.

## Objetivo editorial

Hacer que cada NPC parezca una persona con intereses, límites y una versión parcial de los hechos. El terror debe surgir de detalles concretos, contradicciones, silencios y consecuencias, no de que todos hablen como narradores siniestros.

## Reglas obligatorias

1. No revelar explícitamente si un NPC está infectado cuando esa información debe descubrirse con herramientas o deducción.
2. No cambiar valores, condiciones, estados, IDs, claves, triggers, probabilidades ni resultados mecánicos al editar texto.
3. No añadir ramas, variables de relación o flags de estado sin aprobación explícita.
4. No hacer que todos los personajes hablen con la misma voz: cada uno necesita vocabulario, ritmo, estrategia y temas que evita.
5. No explicar al jugador lo que acaba de ver o hacer.
6. Una línea reactiva debe aportar información nueva, carácter, tensión o consecuencia. Si solo repite el evento, proponer eliminarla.
7. Las pistas ambiguas deben admitir al menos una interpretación alternativa plausible; una mentira no debe ser prueba automática de infección.
8. Mantener el lore confirmado. Separar los hechos del mundo, los rumores y las hipótesis de personajes.
9. Evitar el “slop de terror”: frases grandilocuentes, metáforas oscuras repetidas, susurros constantes, elipsis artificiales y personajes que dicen cosas crípticas sin motivo.
10. Preservar el formato de datos y las APIs actuales del proyecto.

## Método

### Pasada A — Inventario
- Encontrar todas las fuentes de diálogo, preguntas, respuestas, barks, eventos, notas y transmisiones.
- Identificar quién habla, cuándo aparece el texto y qué condición lo activa.
- Registrar IDs, estructura, claves y referencias entrantes.

### Pasada B — Diagnóstico
Para cada línea, evaluar voz, función dramática, naturalidad oral, novedad informativa, subtexto, coherencia con el lore, riesgo de revelar la solución, redundancia y legibilidad en pantalla.

Clasificar: `conservar`, `corregir`, `recortar`, `duplicada`, `contradictoria`, `revela demasiado`, `requiere contexto`.

### Pasada C — Reescritura
- Mantener intención y consecuencias del texto original.
- Cambiar solo la cadena de texto, salvo aprobación explícita.
- Ofrecer la versión original y la propuesta en una tabla de cambios.
- Explicar en una frase el motivo de cada cambio importante.
- No reemplazar todo el lote automáticamente: permitir revisión humana.

### Pasada D — Validación
- Comparar las claves antes y después.
- Confirmar que no se eliminaron IDs ni cambiaron triggers.
- Buscar duplicados literales y casi duplicados.
- Ejecutar `npm test`.
- Revisar en navegador las escenas y pantallas afectadas.
