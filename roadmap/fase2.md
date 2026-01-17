FASE 2: INMERSIÓN Y ATMÓSFERA
En esta fase, convertimos el entorno estático en un organismo vivo que reacciona al tiempo, al peligro y a la locura del protagonista.

2.1. Ciclo Atmosférico Dinámico (Día/Noche)
Problema: El paso de las horas no se refleja visualmente; la tensión no aumenta con la oscuridad.

Especificación Técnica:
Estados de Iluminación: Definir 4 estados en CSS aplicados al contenedor principal (#game-container):

.phase-dawn (Amanecer): Tonos azulados claros, brillo alto.

.phase-day (Día): Colores naturales, máxima visibilidad.

.phase-dusk (Atardecer): Tonos anaranjados/rojizos, sombras largas.

.phase-night (Noche): Tonos cian oscuros, viñeteado fuerte, baja visibilidad del NPC.

Lógica de Transición: En UIManager.js, crear una función que mapee el turno actual al estado visual:

Turno 1-2: Dawn | Turno 3-4: Day | Turno 5: Dusk | Turno Noche: Night.

Impacto en Gameplay: Durante la noche, el avatar del NPC debe tener un filtro brightness(0.4) a menos que el jugador use la "Lámpara" o el "Foco" (consumiendo energía).

2.2. Audio Feedback y Capas Ambientales
Problema: El sonido es genérico y no refuerza las acciones mecánicas.

Especificación Técnica:
Capas de Ambiente (Ambiance Loops):

Capa A (Generador): Un zumbido mecánico constante. Su pitch (velocidad/tono) sube si el modo es Overload y baja si es Save. Si la batería es <10%, el sonido debe ratear o entrecortarse.

Capa B (Exterior): Viento sordo o lluvia ácida que aumenta de volumen solo en la pantalla de "Entrada".

Mapeo de SFX Críticos:

refuel_glug: Sonido de líquido al cargar combustible.

power_down: Sonido de cortocircuito cuando un sistema (Lab/Luces) se apaga.

heartbeat_fast: Se activa automáticamente cuando la Paranoia > 70.

Priorización: Usar el AudioManager.js para asegurar que los sonidos de interfaz (clicks) no tapen a los sonidos de alerta (alarmas de batería).

2.3. Sistema de Glitches Reactivos (Sanity-Driven)
Problema: Los glitches no están vinculados al estado mental, perdiendo su impacto narrativo.

Especificación Técnica:
Filtros de Paranoia: Crear un pipeline de efectos visuales en CSS que se intensifiquen según State.stats.paranoia:

30-50%: Leve movimiento de "shake" en los textos de diálogo.

50-80%: Aparición de "chromatic aberration" (desfase de colores rojo/azul) en el avatar del NPC.

>80%: Inversión de colores momentánea (flashes) y cambio de nombres de los botones por palabras incoherentes por fracciones de segundo.

Eclipses Mentales: Cuando la cordura es mínima, el juego debe "mentir" al jugador (ej: mostrar que el generador tiene 50% cuando en realidad tiene 10%).

2.4. UI Diegética (Reloj y Medidores)
Problema: La hora y la energía se leen en texto plano tipo "debug".

Especificación Técnica:
El Reloj Analógico/Mecánico: Sustituir "Turno 3" por un icono de reloj de presión o una barra solar que se vacía.

Barras de Estado "Sucias": Las barras de energía y comida no deben ser rectángulos perfectos. Deben tener texturas de desgaste y parpadear cuando el valor baja de un umbral crítico.

📝 Checkpoint de Diseño (CSS Variable Setup)
Para facilitar el cambio de atmósfera, usa variables raíz en tu style.css:

CSS

:root {
  /* Valores por defecto (Día) */
  --chlorine-glow: #00ffcc;
  --bg-overlay: rgba(0, 0, 0, 0);
  --noise-opacity: 0.05;
}

body.phase-night {
  --chlorine-glow: #008866;
  --bg-overlay: rgba(0, 10, 20, 0.7);
  --noise-opacity: 0.15;
}

#npc-viewport {
  filter: brightness(var(--npc-brightness, 1));
  transition: filter 0.5s ease-in-out;
}