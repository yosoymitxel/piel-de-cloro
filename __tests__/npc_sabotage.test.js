import { State } from '../js/State.js';
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { NPC } from '../js/NPC.js';

describe('NPC Sabotage & Sector Assignment', () => {
    let mechanics;

    beforeEach(() => {
        State.reset();
        const mockAudio = { playSFXByKey: jest.fn(), stopLore: jest.fn() };
        const mockUI = { showFeedback: jest.fn(), updateHUD: jest.fn() };
        mechanics = new GameMechanicsManager({ ui: mockUI, audio: mockAudio });
        mechanics.game = { 
            updateHUD: jest.fn(),
            assignments: {
                assign: jest.fn((id, s) => {
                    // Simple mock for test
                    const n = State.admittedNPCs.find(x => x.id === id);
                    if (n) {
                        // Update new structure
                        if (!State.assignments[s]) State.assignments[s] = { slots: 1, occupants: [] };
                        State.assignments[s].occupants.push(id);
                        
                        // Update legacy structure (if needed by other parts of test)
                        if (!State.sectorAssignments[s]) State.sectorAssignments[s] = [];
                        State.sectorAssignments[s].push(id);
                        
                        n.assignedSector = s;
                    }
                }),
                updateShifts: jest.fn()
            }
        };
    });

    test('Should assign NPC to a sector', () => {
        const npc = new NPC();
        State.admittedNPCs.push(npc);
        mechanics.assignNPCToSector(npc, 'generator');
        expect(npc.assignedSector).toBe('generator');
        expect(State.sectorAssignments.generator).toContain(npc.id);
    });

    test('Should trigger sabotage event if infected NPC is assigned to a sector', () => {
        const infectedNpc = new NPC(1.0); // 100% infected
        infectedNpc.id = 'saboteur';
        State.admittedNPCs.push(infectedNpc);
        mechanics.assignNPCToSector(infectedNpc, 'security');

        // Mocking random to ensure sabotage
        jest.spyOn(Math, 'random').mockReturnValue(0.01);

        const sabotageTriggered = mechanics.processSectorSabotages();
        expect(sabotageTriggered).toBe(true);
        // Security sabotage might open a door
        expect(State.securityItems.some(item => item.secured === false)).toBe(true);
    });

    test('Clean NPCs should not sabotage', () => {
        const cleanNpc = new NPC(0.0); // 100% healthy
        cleanNpc.id = 'clean';
        State.admittedNPCs.push(cleanNpc);
        mechanics.assignNPCToSector(cleanNpc, 'generator');

        const sabotageTriggered = mechanics.processSectorSabotages();
        expect(sabotageTriggered).toBe(false);
    });
});
