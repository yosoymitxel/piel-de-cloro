---
name: piel-de-cloro-anti-slop-review
description: Revisión editorial final de diálogos de terror para eliminar clichés, redundancia, exposición artificial y voces intercambiables.
---

# Anti-slop review — Piel de Cloro

Esta skill es un filtro de calidad, no una plantilla de estilo. No convertir todo el diálogo en frases cortas ni eliminar toda metáfora: revisar si cada recurso es específico, intencional y coherente con el personaje.

## Patrones a marcar

- Clichés genéricos: “algo peor está por venir”, “no estamos solos”, “la oscuridad nos observa”, salvo que tengan una función nueva y concreta.
- Misterio vacío: frases crípticas que no contienen un detalle interpretable.
- Exposición disfrazada: personajes que explican reglas o historia que ambos conocen.
- Eco del jugador: NPC que repite literalmente una acción o descubrimiento recién ocurrido.
- Voz uniforme: todos usan el mismo vocabulario, longitud de frase y tono solemne.
- Reacción desproporcionada: cada evento menor produce terror máximo, anulando la escalada.
- Redundancia: varias líneas cumplen exactamente la misma función.
- Falsa elección: texto promete una consecuencia que el código no implementa.
- Pista injusta: el juego exige deducir algo que ningún texto, evento o herramienta permite inferir.
- Revelación prematura: una línea confirma la identidad oculta sin respetar las reglas de inspección.

## Revisión por línea

Asignar una o más etiquetas:
`Cliche`, `Exposition`, `Redundant`, `VoiceDrift`, `TooCryptic`, `UnfairClue`, `PrematureReveal`, `MechanicalPromise`, `Strong`.

Por cada línea marcada, proponer:
- versión revisada;
- qué mejora;
- qué información conserva;
- qué riesgo narrativo o mecánico evita.

No inventar hechos de lore para “mejorar” una frase. Si falta contexto, marcar `NeedsContext` y dejarla pendiente.
