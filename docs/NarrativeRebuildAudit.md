# Auditoría narrativa inicial — Piel de Cloro

## Alcance

Primera pasada sobre los cuatro NPCs únicos de lore y revisión de los documentos del sistema. Esta auditoría no afirma que la obra esté arreglada: identifica decisiones estructurales que deben resolverse antes de una reescritura completa.

## Diagnóstico

### 1. El misterio se anuncia antes de que el jugador pueda investigarlo

Los NPCs de lore reciben el badge `ANOMALÍA` automáticamente. La documentación también los define como no humanos y les atribuye una probabilidad de muerte del 80% al admitirlos. Esto contradice la fantasía central de inspeccionar a cada persona, comparar señales y asumir la responsabilidad de decidir quién entra.

**Decisión necesaria:** determinar si los NPCs de lore son encuentros especiales claramente anunciados o si deben poder confundirse con supervivientes normales hasta reunir pruebas. No ocultar el badge sin revisar UI, tutoriales, pruebas y balance.

### 2. Las pistas no distinguen suficientemente entre evidencia, rumor e interpretación

Los personajes presentan afirmaciones extraordinarias como verdades definitivas, mientras las descripciones mecánicas también hablan con certeza. El jugador necesita poder separar:
- observación verificable;
- testimonio de un personaje;
- rumor de terceros;
- hipótesis del personaje;
- dato confirmado por una herramienta.

**Criterio:** cada revelación importante debe tener procedencia y, cuando corresponda, una forma de corroboración o contradicción.

### 3. Las voces originales comparten la misma voz poética

Tinta, silencio, carne, agua, memoria, abismo y ciclo aparecen como metáforas recurrentes en personajes que deberían pensar de formas distintas. El resultado suena a un único narrador repartido entre cuatro cuerpos.

**Nueva guía de voz:**
- **Archivista:** fechas, omisiones, versiones incompatibles y culpa por haber registrado mal.
- **Colmena:** interrupciones, recuerdos ajenos y desacuerdos entre voces; evitar que explique su propia cosmología.
- **Kael:** sistemas, sensores, causalidad incierta y lenguaje práctico; horror a través de fallos observables.
- **Paciente Cero:** precisión clínica, eufemismos profesionales y responsabilidad por decisiones concretas; no monólogos de villano.

### 4. Las opciones y las respuestas deben encajar literalmente

Algunas opciones preguntan por elementos que el texto precedente no introduce con claridad. Cada ruta debe justificar la pregunta del jugador y pagarla con una respuesta, una pista nueva o una negativa caracterizadora. Los nodos de retorno no deben usarse como sustituto de una reacción.

### 5. La exposición está demasiado concentrada

Los NPCs únicos explican conceptos centrales en pocos turnos: origen del organismo, Madre, Colmena, Pozo, Sector 0 y posible cura. Eso reduce la curiosidad y hace que los misterios compitan entre sí.

**Criterio:** un nodo debe cumplir una función dominante. Introducir como máximo una revelación central por intercambio; el resto puede quedar como detalle verificable, contradicción o pregunta abierta.

### 6. El horror necesita consecuencias concretas

Una imagen desagradable no equivale a una pista. Las escenas deben cambiar la lectura de una persona, un sistema o un hecho anterior. Si una anomalía corporal no permite inferir nada, no altera una decisión y no caracteriza al NPC, es candidata a eliminarse.

## Plan de trabajo

1. **Voces y diálogo:** reescritura inicial de 20 textos en los cuatro NPCs únicos, preservando IDs, rutas, flags, acciones y mecánicas.
2. **Pools genéricos:** auditar los doce archivos por voz, repetición, lógica de pistas, contenido sexual gratuito, claridad de síntomas y coherencia entre diálogo y herramientas.
3. **Mapa de revelaciones:** construir una matriz de hechos, fuentes, contradicciones y día de aparición para evitar que el lore se contradiga o se revele demasiado pronto.
4. **Integración mecánica:** revisar el badge automático y el riesgo nocturno fijo con pruebas de UI, deducción y balance antes de cambiarlos.
5. **Validación:** comprobar referencias a nodos, opciones, flags, acciones y ejecutar la suite de tests disponible.

## Estado de esta rama

- Reescritura inicial de 20 nodos de lore.
- Sin cambios intencionales en IDs, opciones, condiciones, flags, acciones ni probabilidades.
- La suite de tests no se ha ejecutado en este entorno; no integrar hasta validar.
- Los pools genéricos y el balance general siguen pendientes.
