import { NPC } from '../js/NPC.js';
import { State } from '../js/State.js';

describe('NPC Generation System', () => {
    
    test('NPC attributes are coherent with infection state (Infected)', () => {
        // Create 100 infected NPCs and check ranges
        for (let i = 0; i < 100; i++) {
            const npc = new NPC(1.0); // 100% chance
            expect(npc.isInfected).toBe(true);
            
            const temp = parseFloat(npc.attributes.temperature);
            const pulse = npc.attributes.pulse;
            
            // Check infected ranges defined in NPC.js
            // temperature: 32 + Math.random() * 2
            expect(temp).toBeGreaterThanOrEqual(32);
            expect(temp).toBeLessThanOrEqual(34);
            
            // pulse: Math.floor(Math.random() * 20)
            expect(pulse).toBeGreaterThanOrEqual(0);
            expect(pulse).toBeLessThanOrEqual(20);
        }
    });

    test('NPC attributes are coherent with infection state (Human)', () => {
        // Create 100 human NPCs and check ranges
        for (let i = 0; i < 100; i++) {
            const npc = new NPC(0.0); // 0% chance
            expect(npc.isInfected).toBe(false);
            
            const temp = parseFloat(npc.attributes.temperature);
            const pulse = npc.attributes.pulse;
            
            // Check human ranges defined in NPC.js
            // temperature: 36.5 + Math.random() * 1
            expect(temp).toBeGreaterThanOrEqual(36.5);
            expect(temp).toBeLessThanOrEqual(37.5);
            
            // pulse: Math.floor(60 + Math.random() * 40)
            expect(pulse).toBeGreaterThanOrEqual(60);
            expect(pulse).toBeLessThanOrEqual(100);
            
            expect(npc.attributes.skinTexture).toBe('normal');
            expect(npc.attributes.pupils).toBe('normal');
        }
    });

    test('NPC name and occupation generation', () => {
        const npc = new NPC();
        // Support UTF-8 characters in names
        expect(npc.name).toMatch(/^[A-Z\u00C0-\u00DD][a-z\u00DF-\u00FF]+ [A-Z\u00C0-\u00DD][a-z\u00DF-\u00FF]+/);
        expect(typeof npc.occupation).toBe('string');
        expect(npc.occupation.length).toBeGreaterThan(0);
    });

    test('NPC epithet matches infection or paranoia', () => {
        // Reset state for test
        State.paranoia = 0;
        
        const infectedNpc = new NPC(1.0);
        const epithet = infectedNpc.getEpithet();
        const infectedEpithets = [
            'Se lo ve con la piel pálida', 
            'Ves que sus manos están sucias', 
            'Tiene un tic constante en el ojo',
            'Despide un olor metálico'
        ];
        expect(infectedEpithets).toContain(epithet);
        
        State.paranoia = 80;
        const humanNpc = new NPC(0.0);
        const pEpithet = humanNpc.getEpithet();
        const paranoiaEpithets = [
            'Ves que tiembla', 
            'No está haciendo contacto visual', 
            'Parece extremadamente nervioso', 
            'Suda ligeramente',
            'Habla entre dientes'
        ];
        expect(paranoiaEpithets).toContain(pEpithet);
    });
});
