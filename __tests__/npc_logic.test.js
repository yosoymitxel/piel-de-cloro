import { NPC } from '../js/NPC.js';
import { State } from '../js/State.js';

describe('NPC Logic', () => {
    beforeEach(() => {
        State.reset();
    });

    test('NPC generation correctly assigns infection status', () => {
        const infectedNPC = new NPC(1.0); // 100% chance
        const humanNPC = new NPC(0.0); // 0% chance
        
        expect(infectedNPC.isInfected).toBe(true);
        expect(humanNPC.isInfected).toBe(false);
    });

    test('Infected NPCs have specific attribute ranges', () => {
        const infected = new NPC(1.0);
        const attrs = infected.attributes;
        
        // Temperature: 32 + Math.random() * 2
        expect(parseFloat(attrs.temperature)).toBeGreaterThanOrEqual(32);
        expect(parseFloat(attrs.temperature)).toBeLessThanOrEqual(34);
        
        // Pulse: Math.floor(Math.random() * 20)
        expect(attrs.pulse).toBeGreaterThanOrEqual(0);
        expect(attrs.pulse).toBeLessThanOrEqual(20);
    });

    test('Human NPCs have normal attribute ranges', () => {
        const human = new NPC(0.0);
        const attrs = human.attributes;
        
        // Temperature: 36.5 + Math.random() * 1
        expect(parseFloat(attrs.temperature)).toBeGreaterThanOrEqual(36.5);
        expect(parseFloat(attrs.temperature)).toBeLessThanOrEqual(37.5);
        
        // Pulse: Math.floor(60 + Math.random() * 40)
        expect(attrs.pulse).toBeGreaterThanOrEqual(60);
        expect(attrs.pulse).toBeLessThanOrEqual(100);
    });

    test('Epithets match infection or paranoia', () => {
        const infected = new NPC(1.0);
        const epithet = infected.getEpithet();
        const infectedEpithets = [
            'Se lo ve con la piel pálida', 
            'Ves que sus manos están sucias', 
            'Tiene un tic constante en el ojo',
            'Despide un olor metálico'
        ];
        expect(infectedEpithets).toContain(epithet);

        State.paranoia = 80;
        const human = new NPC(0.0);
        const paranoiaEpithet = human.getEpithet();
        const paranoiaEpithets = [
            'Ves que tiembla', 
            'No está haciendo contacto visual', 
            'Parece extremadamente nervioso', 
            'Suda ligeramente',
            'Habla entre dientes'
        ];
        expect(paranoiaEpithets).toContain(paranoiaEpithet);
    });

    test('Day after validation works correctly', () => {
        const npc = new NPC();
        npc.initDayAfterStatus();
        
        expect(npc.checkDayAfterValidation()).toBe(false);
        
        npc.dayAfter.dermis = true;
        npc.dayAfter.pupils = true;
        npc.dayAfter.temperature = true;
        npc.dayAfter.pulse = true;
        
        expect(npc.checkDayAfterValidation()).toBe(true);
        expect(npc.dayAfter.result).toBe(npc.isInfected ? 'infected' : 'clean');
    });
});
