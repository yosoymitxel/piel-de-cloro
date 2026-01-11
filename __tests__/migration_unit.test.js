import { State } from '../js/State.js';
import { NPC } from '../js/NPC.js';
import { DialogueData } from '../js/DialogueData.js';

describe('Migration Unit Testing Suite', () => {
    
    describe('State.js Pure Logic', () => {
        beforeEach(() => {
            State.reset();
        });

        test('updateParanoia should stay within 0-100 bounds', () => {
            State.updateParanoia(50);
            expect(State.paranoia).toBe(50);
            
            State.updateParanoia(60);
            expect(State.paranoia).toBe(100);
            
            State.updateParanoia(-120);
            expect(State.paranoia).toBe(0);
        });

        test('Critical: dialoguePoolsUsed (usedDialogueIDs) should not allow duplicates', () => {
            const poolId = 'gen_scratch';
            
            State.markDialogueUsed(poolId);
            State.markDialogueUsed(poolId);
            State.markDialogueUsed(poolId);
            
            const count = State.dialoguePoolsUsed.filter(id => id === poolId).length;
            expect(count).toBe(1);
            expect(State.dialoguePoolsUsed.length).toBe(1);
        });

        test('isShelterFull should work correctly based on config', () => {
            State.config.maxShelterCapacity = 2;
            State.admittedNPCs = [{}, {}];
            expect(State.isShelterFull()).toBe(true);
            
            State.admittedNPCs = [{}];
            expect(State.isShelterFull()).toBe(false);
        });
    });

    describe('NPC.js Name Generator', () => {
        test('generateName should return a string with name and last name', () => {
            const npc = new NPC();
            const maleName = npc.generateName('male');
            const femaleName = npc.generateName('female');
            
            expect(typeof maleName).toBe('string');
            expect(maleName.split(' ').length).toBe(2);
            expect(typeof femaleName).toBe('string');
            expect(femaleName.split(' ').length).toBe(2);
        });

        test('NPC attributes should be within expected ranges (infected vs healthy)', () => {
            const healthyNPC = new NPC(0); // 0% chance of infection
            const infectedNPC = new NPC(1); // 100% chance of infection
            
            expect(healthyNPC.isInfected).toBe(false);
            expect(infectedNPC.isInfected).toBe(true);
            
            expect(parseFloat(healthyNPC.attributes.temperature)).toBeGreaterThanOrEqual(36.5);
            expect(parseFloat(healthyNPC.attributes.temperature)).toBeLessThanOrEqual(37.5);
            
            expect(parseFloat(infectedNPC.attributes.temperature)).toBeGreaterThanOrEqual(32.0);
            expect(parseFloat(infectedNPC.attributes.temperature)).toBeLessThanOrEqual(34.0);
            
            expect(healthyNPC.attributes.pulse).toBeGreaterThanOrEqual(60);
            expect(infectedNPC.attributes.pulse).toBeLessThanOrEqual(20);
        });
    });

    describe('DialogueData.js Integrity', () => {
        test('DialogueData should have personalities and pools', () => {
            expect(Array.isArray(DialogueData.personalities)).toBe(true);
            expect(typeof DialogueData.pools).toBe('object');
            expect(Object.keys(DialogueData.pools).length).toBeGreaterThan(0);
        });

        test('Each pool should have a valid root node', () => {
            Object.values(DialogueData.pools).forEach(pool => {
                expect(pool.root).toBeDefined();
                expect(pool.nodes[pool.root]).toBeDefined();
            });
        });
    });
});
