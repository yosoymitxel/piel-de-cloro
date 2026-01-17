🛠 FASE 1: ESTABILIZACIÓN Y NÚCLEO MECÁNICO
Esta fase se centra en eliminar las "variables fantasma" y asegurar que el juego responda con lógica y fluidez. Antes de añadir contenido visual, el motor debe ser sólido.

1.1. Unificación Energética (Sistema de Carga)
Problema: El combustible es un número estático y el generador se recarga "por arte de magia" o no tiene relación con el inventario.

Especificación Técnica:
Nueva Propiedad en State.js: fuelCans (bidones físicos) vs batteryLevel (0-100%).

Lógica de Consumo: Cada acción (uso de herramientas) resta -X% a la batería según el modo (Save: 2%, Normal: 5%, Overload: 10%).

Acción de Recarga: Crear una función refuelGenerator().

Gasto: 1 Bidón.

Ganancia: +30% de batería (ajustable).

Limitación: No se puede recargar si el generador está en modo Overload (riesgo de explosión/quemadura).

Restricción de Modos: * Si batteryLevel < 15%, el modo Overload se bloquea automáticamente y el generador pasa a Save de forma forzada.

1.2. Pacing de NPCs (Ritmo Narrativo)
Problema: Saturación de Lore en el primer día. El flujo es predecible (5 personas siempre).

Especificación Técnica:
Sistema de "Gateo" (Gating):

Añadir el atributo appearanceDay en la definición de NPCs en NPC.js.

En Game.js, al generar la cola del día, filtrar la lista de NPCs de Lore: if (currentDay >= npc.appearanceDay) { pool.push(npc) }.

Variabilidad de Turnos:

Sustituir la constante de 5 personas por una variable dinámica: let dailyCount = Math.floor(Math.random() * (max - min + 1) + min);.

Recomendado para el inicio: min: 3, max: 6.

Incertidumbre en UI: No mostrar "Sujeto 1 de 5". Mostrar "Sujeto actual: [Nombre]" y un indicador vago de "Gente esperando en la puerta" (Poca / Mucha).

1.3. Optimización de Rendimiento (Mobile & Tablet)
Problema: Lentitud en dispositivos táctiles por exceso de re-renderizado del DOM.

Especificación Técnica:
Renderizado Selectivo: En UIManager.js, crear un método updateStats() que solo actualice los elementos que cambiaron (ej. solo el texto de la batería), en lugar de re-dibujar todo el contenedor de estadísticas.

Caché de Elementos: No usar document.getElementById dentro de los loops de juego. Declarar los elementos una sola vez al inicio:

JavaScript

this.elements = {
    battery: document.getElementById('battery-val'),
    log: document.getElementById('game-log')
};
Event Delegation: En lugar de poner un addEventListener a cada botón de la lista de habitaciones, poner uno solo al contenedor padre y detectar el target.

1.4. Interconexión de Subsistemas
Problema: Apagar las luces o el laboratorio no tiene impacto real.

Especificación Técnica:
Sistema de Modificadores (Debuffs):

Luces Off: state.paranoiaPerTurn += 2; y aplicar un filtro CSS de oscuridad (brightness(0.3)) al avatar del NPC.

Laboratorio Off: Las herramientas de diagnóstico (Termómetro, UV) tienen un 30% de probabilidad de devolver "Error" o un valor aleatorio erróneo.

Seguridad Off: Si una intrusión ocurre de noche, la pérdida de suministros es doble.

📝 Checkpoint de Código (Estructura de Datos sugerida)
Para soportar esto, tu objeto State debería lucir así:

JavaScript

// State.js - Propuesta de estructura mejorada
export const State = {
    day: 1,
    battery: 100,
    fuelCans: 10,
    food: 20,
    powerMode: 'NORMAL', // SAVE, NORMAL, OVERLOAD
    systems: {
        lights: true,
        lab: true,
        security: true
    },
    stats: {
        paranoia: 0,
        sanity: 100
    },
    // ... resto de variables
}