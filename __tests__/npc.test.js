
import { NPC } from '../js/NPC.js';
import { State } from '../js/State.js';

describe('NPC', () => {
    beforeEach(() => {
        State.reset();
    });

    test('constructor sets infection status correctly based on probability', () => {
        const infected = new NPC(1.0);
        expect(infected.isInfected).toBe(true);

        const clean = new NPC(0.0);
        expect(clean.isInfected).toBe(false);
    });

    test('generateName returns a string with at least two words', () => {
        const npc = new NPC();
        const name = npc.name;
        expect(typeof name).toBe('string');
        expect(name.split(' ').length).toBeGreaterThanOrEqual(2);
    });

    test('generateAttributes produces different values for infected vs clean', () => {
        const infected = new NPC(1.0);
        const clean = new NPC(0.0);

        expect(Number(infected.attributes.temperature)).toBeLessThan(35);
        expect(Number(clean.attributes.temperature)).toBeGreaterThan(36);

        expect(infected.attributes.pulse).toBeLessThan(40);
        expect(clean.attributes.pulse).toBeGreaterThan(50);
    });

    test('getDisplayName returns name with epithet sometimes', () => {
        const npc = new NPC();
        const displayName = npc.getDisplayName();
        expect(displayName).toContain(npc.name);
    });

    test('pickPersonality returns a valid personality from DialogueData', () => {
        const npc = new NPC();
        expect(npc.personality).toBeDefined();
    });
});
