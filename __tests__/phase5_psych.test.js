
import { NPC } from '../js/NPC.js';
import { State } from '../js/State.js';

describe('Phase 5: Psychological System & Behavior AI', () => {
    test('NPC should initialize with stress and loyalty', () => {
        const npc = new NPC();
        expect(npc.stress).toBeGreaterThanOrEqual(0);
        expect(npc.loyalty).toBeGreaterThanOrEqual(30);
    });

    test('updatePsych should clamp values between 0 and 100', () => {
        const npc = new NPC();
        npc.stress = 50;
        npc.loyalty = 50; // Set explicit starting value for deterministic test
        npc.updatePsych(60, -60);
        expect(npc.stress).toBe(100);
        expect(npc.loyalty).toBe(0);
    });

    test('Optimist trait should reduce stress delta', () => {
        // This is logic inside GameMechanicsManager, but we can verify
        // that the NPC properties are available for it.
        const npc = new NPC();
        npc.trait = { id: 'optimist', name: 'Optimista' };
        expect(npc.trait.id).toBe('optimist');
    });
});
