import { State } from '../js/State.js';
import { LoreData } from '../js/LoreData.js';

describe('Find a Cure: current implementation contract', () => {
    beforeEach(() => {
        State.reset();
    });

    test('cure progress is initialized to zero', () => {
        expect(State.cureProgress).toBe(0);
    });

    test('the cure ending is defined and has player-facing copy', () => {
        expect(LoreData.final_cure).toBeDefined();
        expect(LoreData.final_cure.title).toBe('Cura Sintetizada');
        expect(LoreData.final_cure.content).toContain('muestras viables');
        expect(LoreData.final_cure.type).toBe('save');
    });
});
