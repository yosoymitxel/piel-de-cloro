# Auditoría de diseño de niveles — Piel de Cloro

## Modelo de nivel

El juego no usa niveles tradicionales: el nivel funcional es el ciclo de supervivencia (día → admisión/inspección → asignación y recursos → noche → consecuencias). Por eso la progresión debe evaluarse como una secuencia de decisiones y estados, no como una lista de escenas.

## Problemas que deben medirse antes de retocar números

1. **Curva de información:** el jugador necesita observar, formular hipótesis y contrastar; no debería recibir un diagnóstico definitivo por un solo rasgo visual o por la etiqueta de un NPC.
2. **Curva de presión:** cada día debe introducir una presión nueva o complicar una anterior. Aumentar todas las probabilidades a la vez convierte la progresión en inflación de dificultad, no en aprendizaje.
3. **Presupuesto de decisiones:** inspecciones, energía, combustible, suministros y tiempo deben competir entre sí. Una herramienta sin coste o una decisión sin consecuencia es decoración.
4. **Lectura causal:** al amanecer, el juego debe explicar qué cambió y por qué (recurso, estado psicológico, sabotaje, infección o decisión anterior).
5. **Recuperación:** tras una noche mala debe existir una vía de recuperación parcial; sin ella, los errores tempranos se convierten en una espiral inevitable.
6. **Personajes memorables:** los NPC deben diferenciarse por conducta, evidencia y objetivo; no solo por una frase perturbadora o por un retrato distinto.

## Arco recomendado para una partida

| Tramo | Función dramática | Presión dominante | Qué aprende el jugador |
|---|---|---|---|
| Ciclos 1–2 | Orientación y falsa seguridad | Recursos bajos, señales ambiguas | Inspeccionar, comparar y registrar |
| Ciclos 3–4 | Primeras contradicciones | Testimonios incompatibles y desgaste | Separar observación de interpretación |
| Ciclos 5–7 | Compromisos | Costes de admitir/rechazar, tareas y confianza | Priorizar con información incompleta |
| Ciclos 8+ | Consecuencias acumuladas | Recursos, paranoia y relaciones | Reconocer patrones sin confiar en una sola pista |

Esta tabla es una pauta de diseño, no un cambio automático de probabilidades. Antes de alterar valores globales, deben añadirse pruebas de simulación de partidas.

## Checklist para cada ciclo

- ¿Qué decisión nueva o más difícil aparece hoy?
- ¿Qué evidencia puede observarse, y qué parte es rumor o hipótesis?
- ¿Qué recurso se sacrifica y qué se obtiene a cambio?
- ¿Qué decisión anterior cambia este ciclo?
- ¿Qué consecuencia verá el jugador al amanecer?
- ¿Hay al menos dos estrategias razonables, no una opción correcta disfrazada?
- ¿Puede el jugador explicar por qué perdió, aunque no esté de acuerdo con el resultado?

## Criterios de aceptación

- Los rasgos de NPC no revelan por sí solos el estado real.
- Los eventos aleatorios tienen peso limitado y no anulan decisiones anteriores sin aviso.
- Cada sistema de recursos tiene una señal de coste y una de beneficio.
- Los NPC únicos aportan información nueva sin explicar el canon entero.
- Las probabilidades de peligro están acotadas y cubiertas por pruebas en ciclos tempranos, medios y tardíos.
- Las secuencias principales se prueban tanto con elecciones conservadoras como agresivas.

## Orden de implementación

1. Instrumentar el ciclo y resumir recursos/decisiones por día.
2. Verificar límites y escalado de riesgo (en especial rasgos catastróficos y NPC de lore).
3. Añadir pruebas de simulación reproducibles para 1–2, 5–7 y 10+ ciclos.
4. Ajustar la curva de presión usando resultados; no mover cinco sistemas a la vez.
5. Hacer pruebas de navegador en móvil y escritorio para inspección, admisión, mapa y resolución nocturna.
