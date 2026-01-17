📋 PROYECTO: PIEL DE CLORO - REFACTOR & EXPANSIÓN v2.0
🎯 Objetivo General
Transformar la gestión de recursos aislada en un ecosistema interconectado, mejorar la inmersión audiovisual (Day/Night, Glitches) y preparar la arquitectura de datos para sistemas complejos (Mapas Procedimentales y NPCs con Memoria), optimizando el rendimiento para dispositivos móviles.

FASE 1: NÚCLEO MECÁNICO Y ESTABILIDAD (La Base)
Objetivo: Que las reglas del juego tengan sentido y el código sea eficiente.

1.1. Unificación Energética (Generador + Combustible)
Problema: El combustible y la batería no están vinculados físicamente.

Solución:

Convertir fuel en un recurso consumible para recargar battery (Acción manual: "Recargar").

Bloquear modos del generador (Overload) si la batería es < 20%.

Archivo clave: GeneratorManager.js, State.js.

1.2. Pacing y Spawning (Ritmo de Juego)
Problema: Personajes de Lore salen el día 1; flujo de llegada estático (siempre 5).

Solución:

Implementar minDaysToSpawn en NPC.js para personajes Lore (Bloqueo de 3 días).

Aleatorizar la cola de llegada por ciclo (ej: Math.random entre 3 y 6 sujetos).

Archivo clave: Game.js, NPC.js.

1.3. Optimización de Rendimiento (Mobile First)
Problema: Lag en tablets/móviles.

Solución:

Reducir manipulación directa del DOM. Usar documentFragment para actualizaciones masivas en UI.

Limpieza de listeners y objetos al cambiar de turno (Garbage Collection).

Archivo clave: UIManager.js.

FASE 2: INMERSIÓN Y ATMÓSFERA (El "Game Juice")
Objetivo: Que el jugador sienta el horror y el paso del tiempo.

2.1. Ciclo Visual Día/Noche
Problema: El tiempo es solo un número.

Solución:

Implementar clases CSS en el body (.phase-morning, .phase-night, .phase-eclipse).

Cambiar paleta de colores/iluminación del fondo y UI reactiva al horario.

Archivo clave: UIManager.js, style.css.

2.2. Audio Coherente y Jerárquico
Problema: Sonidos genéricos y repetitivos.

Solución:

Mapeo de SFX únicos para acciones pesadas (Palanca generador, Inyección, Puerta pesada).

Capas de ambiente (Loop de generador que varía el pitch según la carga).

Archivo clave: AudioManager.js.

2.3. Sistema de Glitches Reactivos
Problema: Glitches aleatorios sin peso mecánico.

Solución:

Vincular intensidad del filtro CSS/Canvas a variables paranoia y sanity.

A mayor locura, más distorsión en textos y avatares.

FASE 3: PROFUNDIDAD SISTÉMICA (La Gestión)
Objetivo: Darle uso a las mecánicas olvidadas (Profesiones, Log, Suministros).

3.1. Gestión de Talento (Profesiones & Rasgos)
Problema: Las profesiones son texto muerto.

Solución:

Sistema de "Asignación": Enviar al Ingeniero al Generador = -10% consumo. Enviar Médico a Enfermería = Menos probabilidad de infección.

Hacer visibles los rasgos en la ficha del sujeto.

Archivo clave: State.js (nuevo módulo StaffManager.js).

3.2. Consecuencias de Suministros
Problema: Quedarse sin comida no mata.

Solución:

Eventos de "Crisis Nocturna": Si food == 0 -> Probabilidad de muerte de civil o canibalismo (aumenta horror).

Archivo clave: Game.js (Lógica de transición de noche).

3.3. Log Jerárquico y Rumores
Problema: Log plano y difícil de leer.

Solución:

Rediseñar el Log con íconos y colores por categoría (💀 Muerte, ⚠️ Alerta, 💬 Rumor).

Guardar pistas de diálogos en una pestaña "Rumores".

FASE 4: ARQUITECTURA ESCALABLE (El Futuro)
Objetivo: Preparar el terreno para los Mapas Procedimentales sin romper todo hoy.

4.1. Estructura de Datos para Refugios Dinámicos (La Antesala)
No haremos el render 2D aún, pero cambiaremos cómo se guardan los datos para que sea compatible mañana.

Cambio de Modelo de Datos:

Actual: rooms: ['Generador', 'Cocina'] (Lista simple).

Nuevo Modelo (Propuesto):

JavaScript

class Shelter {
    constructor() {
        this.grid = { width: 5, height: 5 }; // Tamaño del plano
        this.rooms = [
            { id: 'gen_01', type: 'GENERATOR', x: 0, y: 0, status: 'active', bonus: 1.0 },
            { id: 'kitch_01', type: 'KITCHEN', x: 1, y: 0, status: 'damaged', bonus: 0.5 }
        ];
    }
}
Beneficio: El juego seguirá mostrando la lista (UI actual), pero por detrás ya estarás manejando coordenadas y tipos. Cuando quieras hacer el mapa visual, los datos ya estarán listos.