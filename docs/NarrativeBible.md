# Biblia narrativa de trabajo — Piel de Cloro

Este documento fija reglas para la siguiente reescritura. No sustituye el canon que ya esté implementado; cualquier contradicción con código o diálogos existentes se registra como pregunta abierta y no se resuelve inventando una explicación.

## Premisa dramática

El jugador no es un héroe omnisciente: es una persona con autoridad limitada que decide quién entra en un refugio cuya seguridad depende de instrumentos imperfectos, recursos escasos y testimonios incompletos. El conflicto central no es "adivinar quién es el monstruo", sino decidir cuánto riesgo es aceptable cuando las pruebas pueden fallar y el rechazo también puede matar.

## Contrato con el jugador

1. Una pista no equivale automáticamente a un diagnóstico.
2. Toda herramienta debe producir información interpretable y coherente con su función documentada.
3. Un personaje puede mentir, equivocarse, ocultar o no saber; el texto debe permitir distinguir esas posibilidades a posteriori.
4. El juego no debe castigar al jugador por una regla que nunca le comunicó, salvo que esa incertidumbre sea explícitamente parte del desafío y existan indicios justos.
5. La descripción narrativa no puede contradecir el resultado mecánico de una inspección.
6. Las opciones de diálogo deben responder a algo que el jugador pudo observar u oír. Las respuestas deben pagar la pregunta con información, reacción, negativa o consecuencia.
7. El horror debe alterar la interpretación de una pista, una relación o una decisión. La acumulación de fluidos, carne y metáforas no basta por sí sola.

## Voz de los cuatro personajes de lore

### Archivista
- Piensa en fechas, formularios, versiones, omisiones y responsabilidad de registro.
- Su culpa aparece en lo que corrigió, borró o dejó sin firmar; no en discursos abstractos sobre tinta y memoria.
- Distingue lo que vio de lo que le contaron, aunque no siempre admita esa distinción al principio.

### Colmena
- No explica su naturaleza en un monólogo ordenado.
- Las voces se contradicen, se corrigen, recuerdan experiencias ajenas o usan pronombres incompatibles.
- La rareza debe surgir de la conversación y de sus errores, no de decir repetidamente "somos muchos".

### Kael
- Se expresa mediante sistemas, fallos, secuencias y consecuencias prácticas.
- Puede ser preciso sobre el fallo y estar equivocado sobre su causa.
- El cuerpo fusionado con la estación se muestra con detalles observables y límites claros, no con metáforas intercambiables.

### Paciente Cero
- Usa lenguaje clínico para reducir su responsabilidad, no para convertirse en villano teatral.
- Separa observación, hipótesis y conclusión; sus contradicciones deben revelar incentivos o límites de conocimiento.
- Una revelación importante debe costarle algo: control, credibilidad, una coartada o la posibilidad de ser admitido.

## Taxonomía de información

Marcar cada hecho narrativo durante la auditoría como una de estas clases:
- **Observación:** algo visible o audible para el jugador.
- **Medición:** resultado de una herramienta; debe concordar con el motor.
- **Testimonio:** lo afirma un personaje, sin garantía de verdad.
- **Rumor:** procede de terceros o de la memoria social.
- **Hipótesis:** explicación provisional de un personaje.
- **Canon confirmado:** dato que el juego valida por más de una vía o por una fuente autoritativa.

No redactar un rumor como si fuera una medición. No usar una medición como prueba absoluta si el propio diseño establece interferencias, alucinaciones o falsos positivos.

## Reglas para diálogos genéricos

- Cada pool necesita una premisa conductual reconocible y al menos dos interpretaciones plausibles hasta que haya una prueba.
- No diagnosticar al sujeto en la descripción si la inspección aún debe hacerlo.
- Evitar que cada personaje describa el síntoma con la misma voz poética.
- Las etiquetas internas para el jugador deben ser instrucciones operativas neutrales, no diagnósticos concluyentes que revelen la respuesta.
- Los rumores deben tener fuente o contexto; no usar una frase impactante como sustituto de una conexión causal.
- El contenido sexual o corporal explícito solo se mantiene cuando cumple una función narrativa específica; no se usa como intensificador automático del horror.
- No convertir una sola señal física en evidencia infalible si el mundo permite enfermedad, trauma, frío, contaminación o error instrumental.

## Lista de verificación por escena

- ¿Qué quiere el personaje en este intercambio?
- ¿Qué intenta conseguir del jugador?
- ¿Qué sabe con certeza y qué solo sospecha?
- ¿Qué dato nuevo aporta la escena?
- ¿Qué decisión futura cambia o prepara?
- ¿La opción del jugador está justificada por el contexto?
- ¿La respuesta distingue evidencia de opinión?
- ¿La escena mantiene la incertidumbre sin ocultar reglas arbitrariamente?
- ¿Hay una metáfora que repite otra sin añadir significado?
- ¿El texto describe algo que el motor no puede mostrar o comprobar?
- ¿Se conservan IDs, rutas, flags, acciones y logs si solo se edita texto?

## Estado y límites de esta pasada

Se han ajustado los tres primeros campos `text` de cada uno de los doce pools genéricos para reducir diagnóstico prematuro, grandilocuencia y sexualización gratuita, y para dar al jugador observaciones más concretas. Esto **no equivale a una revisión completa de todos los nodos**: el resto de los textos de esos pools sigue pendiente de revisión línea por línea, al igual que las opciones, los logs de evidencia, las herramientas, la cronología y el balance de los NPCs de lore.

No integrar cambios sin ejecutar las pruebas del proyecto y revisar las rutas en el juego.
