
import { State } from './State.js';

export class RandomEventManager {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;

        this.events = [
            // POSITIVE EVENTS (70% of total)
            {
                id: 'moment_of_peace',
                name: 'Momento de Paz',
                description: 'El silencio absoluto te permite recuperar la compostura por un instante.',
                chance: 0.15,
                action: () => {
                    State.updateSanity(20);
                    State.updateParanoia(-15);
                },
                type: 'positive'
            },
            {
                id: 'supplies_found',
                name: 'Suministros Olvidados',
                description: 'Encuentras un paquete de raciones sellado en un conducto de ventilación.',
                chance: 0.15,
                action: () => {
                    State.updateSupplies(8);
                    State.updateSanity(8);
                },
                type: 'positive'
            },
            {
                id: 'generator_boost',
                name: 'Sobrecarga de Red',
                description: 'Un pico de energía externa ha cargado parcialmente el generador.',
                chance: 0.12,
                action: () => {
                    if (State.generator) {
                        State.generator.power = Math.min(100, State.generator.power + 25);
                    }
                },
                type: 'positive'
            },
            {
                id: 'clean_arrival',
                name: 'Refugiado Sano',
                description: 'El siguiente visitante muestra signos vitales completamente normales.',
                chance: 0.12,
                action: () => {
                    State.updateSanity(12);
                    State.updateParanoia(-10);
                },
                type: 'positive'
            },
            {
                id: 'equipment_fixed',
                name: 'Reparación Espontánea',
                description: 'Un sistema averiado se ha reiniciado solo. Todo funciona correctamente.',
                chance: 0.10,
                action: () => {
                    State.updateSanity(15);
                    if (State.generator) {
                        State.generator.power = Math.min(100, State.generator.power + 15);
                    }
                },
                type: 'positive'
            },
            {
                id: 'good_news',
                name: 'Transmisión Esperanzadora',
                description: 'La radio capta un mensaje: "Zona segura identificada al norte. Resistid."',
                chance: 0.10,
                action: () => {
                    State.updateSanity(18);
                    State.updateParanoia(-12);
                },
                type: 'positive'
            },
            {
                id: 'restful_moment',
                name: 'Descanso Mental',
                description: 'Logras concentrarte en tu respiración. La claridad mental regresa.',
                chance: 0.08,
                action: () => {
                    State.updateSanity(15);
                    State.updateParanoia(-8);
                },
                type: 'positive'
            },
            // NEGATIVE EVENTS (30% of total)
            {
                id: 'cloro_leak',
                name: 'Fuga de Cloro',
                description: 'Una tubería se ha roto en el sector B. El aire se vuelve denso y tóxico.',
                chance: 0.08,
                action: () => {
                    State.updateParanoia(12);
                    State.updateSanity(-8);
                },
                type: 'negative'
            },
            {
                id: 'radio_static',
                name: 'Señal Extraña',
                description: 'La radio capta una frecuencia desconocida. Voces familiares susurran tu nombre.',
                chance: 0.06,
                action: () => {
                    State.updateSanity(-12);
                },
                type: 'negative'
            },
            {
                id: 'shadow_movement',
                name: 'Movimiento en las Sombras',
                description: 'Algo cruza rápidamente frente a las cámaras. Demasiado rápido para identificarlo.',
                chance: 0.04,
                action: () => {
                    State.updateParanoia(10);
                    State.updateSanity(-5);
                },
                type: 'negative'
            }
        ];
    }

    triggerRandomEvent() {
        const roll = Math.random();
        // Solo ocurre un evento si el roll es bajo (ej. < 0.3)
        if (roll < 0.3) {
            const possibleEvents = this.events;
            const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];

            this.executeEvent(event);
            return event;
        }
        return null;
    }

    executeEvent(event) {
        event.action();

        if (this.ui) {
            const icon = event.type === 'positive' ? 'fa-circle-check text-safe' : 'fa-triangle-exclamation text-alert';
            const title = `EVENTO: ${event.name}`;
            const color = event.type === 'positive' ? 'safe' : 'warning';

            // Use showMessage modal explicitly (ensure it's not hidden/broken)
            if (this.ui.showMessage) {
                this.ui.showMessage(
                    `<div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2 font-bold text-lg justify-center">
                            <i class="fa-solid ${icon}"></i>
                            <span>${title}</span>
                        </div>
                        <p class="italic opacity-80">${event.description}</p>
                    </div>`,
                    null, // callback
                    color
                );
            }

            // Also log to Tutorial/Monitor for persistence
            if (this.ui.tutorialManager) {
                const tutType = event.type === 'positive' ? 'success' : 'warning';
                this.ui.tutorialManager.addMessage(`EVENTO: ${event.name}`, tutType);
            }
        }

        if (this.audio) {
            const sound = event.type === 'positive' ? 'ui_modal_open' : 'glitch_burst';
            this.audio.playSFXByKey(sound, { volume: 0.4 });
        }

        console.log(`Event triggered: ${event.id}`);
    }
}
