
import { State } from './State.js';

export class RandomEventManager {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
        
        this.events = [
            {
                id: 'cloro_leak',
                name: 'Fuga de Cloro',
                description: 'Una tubería se ha roto en el sector B. El aire se vuelve denso y tóxico.',
                chance: 0.15,
                action: () => {
                    State.updateParanoia(15);
                    State.updateSanity(-10);
                },
                type: 'negative'
            },
            {
                id: 'radio_static',
                name: 'Señal Extraña',
                description: 'La radio capta una frecuencia desconocida. Voces familiares susurran tu nombre.',
                chance: 0.1,
                action: () => {
                    State.updateSanity(-15);
                },
                type: 'negative'
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
                id: 'moment_of_peace',
                name: 'Momento de Paz',
                description: 'El silencio absoluto te permite recuperar la compostura por un instante.',
                chance: 0.08,
                action: () => {
                    State.updateSanity(20);
                    State.updateParanoia(-10);
                },
                type: 'positive'
            },
            {
                id: 'supplies_found',
                name: 'Suministros Olvidados',
                description: 'Encuentras un paquete de raciones sellado en un conducto de ventilación.',
                chance: 0.1,
                action: () => {
                    State.updateSanity(10);
                },
                type: 'positive'
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
            
            this.ui.showMessage(
                `<div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2 font-bold text-lg">
                        <i class="fa-solid ${icon}"></i>
                        <span>${title}</span>
                    </div>
                    <p class="italic opacity-80">${event.description}</p>
                </div>`,
                null,
                color
            );
        }

        if (this.audio) {
            const sound = event.type === 'positive' ? 'ui_modal_open' : 'glitch_burst';
            this.audio.playSFXByKey(sound, { volume: 0.4 });
        }

        console.log(`Event triggered: ${event.id}`);
    }
}
