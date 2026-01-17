
import { State } from '../js/State.js';
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { NPC } from '../js/NPC.js';
import { jest } from '@jest/globals';

describe('Starvation Mechanics (Phase 3.3)', () => {
    let mechanics;
    let mockUI;

    beforeEach(() => {
        State.reset();
        mockUI = {
            showFeedback: jest.fn(),
            updateHUD: jest.fn(),
            applyVHS: jest.fn()
        };
        const mockAudio = { playSFXByKey: jest.fn(), playAmbientByKey: jest.fn() };
        mechanics = new GameMechanicsManager({ ui: mockUI, audio: mockAudio });
    });

    test('Should trigger cannibalism when supplies are 0 and roll < 0.2', () => {
        State.supplies = 0;
        const n1 = new NPC(); n1.name = "Victim";
        const n2 = new NPC(); n2.name = "Survivor 1";
        const n3 = new NPC(); n3.name = "Survivor 2";
        State.admittedNPCs = [n1, n2, n3];

        jest.spyOn(Math, 'random').mockReturnValue(0.05); // Cannibalism roll

        const result = mechanics.handleStarvation(State.admittedNPCs);

        expect(result).toContain('sacrificado');
        expect(State.admittedNPCs.length).toBe(2);
        expect(State.purgedNPCs.length).toBe(1);
        expect(State.purgedNPCs[0].death.reason).toBe('canibalismo');
        expect(State.supplies).toBe(5); // Consistently gain 5 food
        expect(mockUI.applyVHS).toHaveBeenCalled();
    });

    test('Should trigger desertion when supplies are 0 and 0.2 <= roll < 0.5', () => {
        State.supplies = 0;
        const n1 = new NPC(); n1.name = "Runaway";
        const n2 = new NPC(); n2.name = "Stay 1";
        State.admittedNPCs = [n1, n2];

        jest.spyOn(Math, 'random').mockReturnValue(0.3); // Desertion roll

        const result = mechanics.handleStarvation(State.admittedNPCs);

        expect(result).toContain('huido');
        expect(State.admittedNPCs.length).toBeLessThan(2);
        expect(State.departedNPCs.length).toBeGreaterThan(0);
    });

    test('Should trigger riots when supplies are 0 and roll >= 0.5', () => {
        State.supplies = 0;
        State.generator.stability = 100;
        const n1 = new NPC();
        State.admittedNPCs = [n1];

        jest.spyOn(Math, 'random').mockReturnValue(0.7); // Riots roll

        const result = mechanics.handleStarvation(State.admittedNPCs);

        expect(result).toContain('pelea');
        expect(State.generator.stability).toBeLessThan(100);
        expect(State.paranoia).toBeGreaterThan(0);
    });
});
