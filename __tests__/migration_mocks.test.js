/**
 * Mocks de Migración y Validación de Estructura Modular
 * Este archivo simula la implementación de los nuevos módulos en 'migrable/'
 * para asegurar que la lógica de negocio sea compatible con un entorno desacoplado.
 */

import { NPC } from '../js/NPC.js';
import { State } from '../js/State.js';

// Simulación de un ActionHandler desacoplado (como el que está en migrable/core_logic/)
class MockActionHandler {
    constructor(dependencies) {
        this.audio = dependencies.audio;
        this.ui = dependencies.ui;
        this.state = dependencies.state;
    }

    handleAdmit(npc) {
        if (this.state.admittedNPCs.length < this.state.config.maxShelterCapacity) {
            this.state.admittedNPCs.push(npc);
            this.audio.playSFX('admit_ok');
            this.ui.refresh();
            return true;
        }
        return false;
    }
}

describe('Migration Mocks: Modular Compatibility', () => {
    let mockAudio, mockUI, handler;

    beforeEach(() => {
        State.reset();
        mockAudio = { playSFX: jest.fn() };
        mockUI = { refresh: jest.fn() };
        
        handler = new MockActionHandler({
            audio: mockAudio,
            ui: mockUI,
            state: State
        });
    });

    test('MockActionHandler should work without global window.game', () => {
        const npc = new NPC(0); // Healthy
        const result = handler.handleAdmit(npc);
        
        expect(result).toBe(true);
        expect(State.admittedNPCs.length).toBe(1);
        expect(mockAudio.playSFX).toHaveBeenCalledWith('admit_ok');
        expect(mockUI.refresh).toHaveBeenCalled();
    });

    test('MockActionHandler should respect State limits', () => {
        State.config.maxShelterCapacity = 1;
        handler.handleAdmit(new NPC(0));
        
        const secondAdmit = handler.handleAdmit(new NPC(0));
        expect(secondAdmit).toBe(false);
        expect(State.admittedNPCs.length).toBe(1);
    });
});
