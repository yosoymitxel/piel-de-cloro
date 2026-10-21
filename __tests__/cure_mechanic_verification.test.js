import { State } from '../js/State.js';
import { LoreData } from '../js/LoreData.js';

describe('Find a Cure: metadata only, gameplay integration pending', () => {
    beforeEach(() => {
        State.reset();
    });

    test('State exposes a zeroed cure-progress placeholder, not proof of a working mechanic', () => {
        expect(State.cureProgress).toBe(0);
    });

    test('the cure ending has copy, but this test does not claim it is reachable in gameplay', () => {
        expect(LoreData.final_cure).toBeDefined();
        expect(LoreData.final_cure.title).toBe('Cura Sintetizada');
        expect(LoreData.final_cure.content).toContain('muestras viables');
        expect(LoreData.final_cure.type).toBe('save');
    });
});
