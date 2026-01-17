
export class EventOrchestrator {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
        this.queue = [];
        this.isProcessing = false;
        this.currentEvent = null;
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
        if (this.isProcessing) return;
        if (this.queue.length === 0) return;

        this.isProcessing = true;
        this.currentEvent = this.queue.shift();

        console.log(`[Orchestrator] Processing: ${this.currentEvent.id}`);

        try {
            // Gestión de Audio automática según tipo
            if (this.currentEvent.type === 'modal' || this.currentEvent.type === 'sequence') {
                // Bajar volumen ambiental para foco
                if (this.audio) this.audio.duckAmbient(0.1, 300);
            }

            // Ejecutar y esperar
            await this.currentEvent.execute();

        } catch (error) {
            console.error(`[Orchestrator] Error in event ${this.currentEvent ? this.currentEvent.id : 'unknown'}:`, error);
        } finally {
            // Restaurar estado
            if (this.currentEvent && (this.currentEvent.type === 'modal' || this.currentEvent.type === 'sequence')) {
                if (this.audio) this.audio.unduckAmbient(500);
            }

            this.currentEvent = null;
            this.isProcessing = false;
            
            // Siguiente tick para evitar recursión profunda y permitir renderizado
            setTimeout(() => this.process(), 10);
        }
    }

    /**
     * Limpia la cola de eventos (útil al reiniciar juego o cambiar escena crítica)
     */
    clear() {
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
