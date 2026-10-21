
export class EventOrchestrator {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
        this.queue = [];
        this.isProcessing = false;
        this.currentEvent = null;
        this.generation = 0;
    }

    /**
     * Añade un evento a la cola de ejecución.
     * @param {Object} event Configuración del evento
     * @param {string} event.id Identificador único (opcional)
     * @param {string} event.type Tipo: 'modal', 'audio', 'sequence', 'action'
     * @param {number} event.priority Prioridad (10=Crítica, 5=Alta, 1=Normal)
     * @param {Function} event.execute Función que devuelve una Promesa. Debe resolverse cuando el evento termina visualmente.
     * @param {boolean} event.blocking Si es true, detiene el procesamiento hasta que termine.
     */
    add(event) {
        const defaults = {
            id: Date.now().toString(),
            type: 'action',
            priority: 1,
            blocking: true,
            execute: async () => {}
        };

        const newEvent = { ...defaults, ...event };

        // Insertar ordenado por prioridad
        this.queue.push(newEvent);
        this.queue.sort((a, b) => b.priority - a.priority);

        console.log(`[Orchestrator] Event added: ${newEvent.id} (Priority: ${newEvent.priority}). Queue size: ${this.queue.length}`);
        
        this.process();
    }

    async process() {
        if (this.isProcessing || this.queue.length === 0) return;

        const generation = this.generation;
        const event = this.queue.shift();
        this.isProcessing = true;
        this.currentEvent = event;

        console.log(`[Orchestrator] Processing: ${event.id}`);

        try {
            if (event.type === 'modal' || event.type === 'sequence') {
                if (this.audio) this.audio.duckAmbient(0.1, 300);
            }

            await event.execute();
        } catch (error) {
            console.error(`[Orchestrator] Error in event ${event.id}:`, error);
        } finally {
            // clear() invalidates the in-flight generation. A stale promise must
            // never clear or unduck a newer event that has already taken ownership.
            if (generation !== this.generation) return;

            if (event.type === 'modal' || event.type === 'sequence') {
                if (this.audio) this.audio.unduckAmbient(500);
            }

            if (this.currentEvent === event) this.currentEvent = null;
            this.isProcessing = false;

            setTimeout(() => {
                if (generation === this.generation) this.process();
            }, 10);
        }
    }

    /**
     * Clears queued work and invalidates cleanup from any in-flight event.
     * The running event cannot be forcibly cancelled unless its own executor
     * supports cancellation, but its eventual finally block cannot corrupt the
     * new queue's ownership state.
     */
    clear() {
        this.generation += 1;
        this.queue = [];
        this.isProcessing = false;
        this.currentEvent = null;
    }

    /**
     * Helper para crear un evento de Modal de Mensaje
     */
    createMessageEvent(text, type = 'normal', priority = 5) {
        return {
            id: `msg-${Date.now()}`,
            type: 'modal',
            priority: priority,
            execute: () => new Promise((resolve) => {
                this.ui.modalManager.showMessage(text, () => {
                    resolve();
                }, type);
            })
        };
    }

    /**
     * Helper para crear un evento de Lore
     */
    createLoreEvent(loreId, priority = 8) {
        return {
            id: `lore-${loreId}`,
            type: 'modal',
            priority: priority,
            execute: () => new Promise((resolve) => {
                // Asumimos que LoreManager tiene un método que acepta callback o devuelve promesa
                // Si no, tendremos que adaptarlo. Por ahora usamos un wrapper hipotético.
                if (this.game.modules.lore && this.game.modules.lore.showLore) {
                    this.game.modules.lore.showLore(loreId, () => {
                        resolve();
                    });
                } else {
                    resolve();
                }
            })
        };
    }
}
