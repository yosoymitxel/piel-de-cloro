import { State } from '../js/State.js';
import { LoreData } from '../js/LoreData.js';

describe('Find a Cure: progress state and ending content', () => {
    beforeEach(() => {
        State.reset();
    });

    test('a new run resets cure sample progress', () => {
        expect(State.cureProgress).toBe(0);
    });

    test('the cure ending has the expected Spanish copy and save classification', () => {
        expect(LoreData.final_cure).toBeDefined();
        expect(LoreData.final_cure.title).toBe('Cura Sintetizada');
        expect(LoreData.final_cure.content).toContain('muestras viables');
        expect(LoreData.final_cure.type).toBe('save');
    });
});
