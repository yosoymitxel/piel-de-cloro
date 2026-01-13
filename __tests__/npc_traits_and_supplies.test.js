import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { State } from '../js/State.js';
import { NPC } from '../js/NPC.js';

describe('NPC Traits and Supplies Mechanics', () => {
    let gmm, gameMock, uiMock, audioMock, endingsMock;

    beforeEach(() => {
        State.reset();
        
        uiMock = {
            showFeedback: jest.fn(),
            showMessage: jest.fn(),
            showLore: jest.fn(),
            renderGeneratorRoom: jest.fn(),
            renderNightScreen: jest.fn(),
            updateInspectionTools: jest.fn(),
            updateRunStats: jest.fn(),
            clearAllNavStatuses: jest.fn(),
            setNavItemStatus: jest.fn(),
            updateSecurityNavStatus: jest.fn(),
            renderSecurityRoom: jest.fn()
        };
        
        audioMock = {
            playSFXByKey: jest.fn(),
            playAmbientByKey: jest.fn(),
            levels: { ambient: 0.3 }
        };
        
        endingsMock = {
            triggerEnding: jest.fn()
        };
        
        gameMock = {
            ui: uiMock,
            audio: audioMock,
            endings: endingsMock,
            events: {
                switchScreen: jest.fn((screen, config) => {
                    if (config && config.renderFn) config.renderFn();
                })
            },
            updateHUD: jest.fn(),
            nextTurn: jest.fn()
        };

        gmm = new GameMechanicsManager(gameMock);
    });

    describe('NPC Trait Generation', () => {
        test('NPCs should have traits (including "none")', () => {
            const npc = new NPC();
            expect(npc.trait).toBeDefined();
            expect(npc.trait.id).toBeDefined();
            expect(npc.trait.name).toBeDefined();
            expect(npc.trait.description).toBeDefined();
        });

        test('Trait distribution should include various types', () => {
            const traitsFound = new Set();
            for (let i = 0; i < 200; i++) {
                const npc = new NPC();
                traitsFound.add(npc.trait.id);
            }
            expect(traitsFound.has('none')).toBe(true);
            expect(traitsFound.size).toBeGreaterThan(1);
        });
    });

    describe('Night Phase Resource Processing', () => {
        test('Base consumption: 1 supply per NPC', () => {
            State.supplies = 10;
            const npc1 = new NPC();
            npc1.trait = { id: 'none' };
            const npc2 = new NPC();
            npc2.trait = { id: 'none' };
            
            State.admittedNPCs = [npc1, npc2];
            
            gmm.processNightResourcesAndTraits();
            
            // 10 - 2 = 8
            expect(State.supplies).toBe(8);
        });

        test('Sickly trait consumes 2 supplies', () => {
            State.supplies = 10;
            const npc = new NPC();
            npc.trait = { id: 'sickly' };
            
            State.admittedNPCs = [npc];
            
            gmm.processNightResourcesAndTraits();
            
            // 10 - 2 = 8
            expect(State.supplies).toBe(8);
        });

        test('Scavenger trait can find supplies', () => {
            const npc = new NPC();
            npc.trait = { id: 'scavenger' };
            State.admittedNPCs = [npc];
            State.supplies = 10;

            let callCount = 0;
            const spy = jest.spyOn(Math, 'random').mockImplementation(() => {
                callCount++;
                if (callCount === 1) return 0.1; // Trait check (< 0.4)
                if (callCount === 2) return 0.5; // Amount found (Math.floor(0.5 * 5) + 1 = 3)
                return 0.9;
            });

            gmm.processNightResourcesAndTraits();
            
            // 10 - 1 (consumption) + 3 (found) = 12
            expect(State.supplies).toBe(12);

            spy.mockRestore();
        });

        test('Optimist trait reduces paranoia', () => {
            State.paranoia = 50;
            const npc = new NPC();
            npc.trait = { id: 'optimist' };
            State.admittedNPCs = [npc];
            
            gmm.processNightResourcesAndTraits();
            
            expect(State.paranoia).toBe(40);
        });

        test('Paranoid trait increases paranoia', () => {
            State.paranoia = 20;
            const npc = new NPC();
            npc.trait = { id: 'paranoid' };
            State.admittedNPCs = [npc];
            
            gmm.processNightResourcesAndTraits();
            
            expect(State.paranoia).toBe(25);
        });

        test('Running out of supplies decreases sanity', () => {
            State.supplies = 1;
            State.sanity = 50;
            const npc = new NPC();
            npc.trait = { id: 'none' };
            State.admittedNPCs = [npc];
            
            gmm.processNightResourcesAndTraits();
            
            // 1 - 1 = 0 supplies.
            expect(State.supplies).toBe(0);
            expect(State.sanity).toBe(35); // 50 - 15
        });

        test('Starvation death chance when supplies are 0', () => {
            const spy = jest.spyOn(Math, 'random')
                .mockReturnValue(0.05); // Starvation check (< 0.1)

            State.supplies = 0;
            const npc = new NPC();
            npc.name = "Victim";
            npc.trait = { id: 'none' };
            State.admittedNPCs = [npc];
            
            const summary = gmm.processNightResourcesAndTraits();
            
            expect(State.admittedNPCs.length).toBe(0);
            expect(State.purgedNPCs.length).toBe(1);
            expect(State.purgedNPCs[0].death.reason).toBe('inanición');
            expect(summary).toContain('Victim ha muerto por falta de recursos');

            spy.mockRestore();
        });
    });

    describe('Night Resolution with Traits', () => {
        test('Tough trait prevents being the first victim of infected', () => {
            const infected = new NPC(1.0);
            infected.isInfected = true;
            
            const toughCivilian = new NPC(0.0);
            toughCivilian.trait = { id: 'tough' };
            toughCivilian.isInfected = false;
            toughCivilian.name = "Tough Guy";

            const normalCivilian = new NPC(0.0);
            normalCivilian.trait = { id: 'none' };
            normalCivilian.isInfected = false;
            normalCivilian.name = "Normal Guy";

            State.admittedNPCs = [infected, toughCivilian, normalCivilian];
            
            gmm.sleep();
            
            // Normal guy should be dead, tough guy should be alive
            expect(State.admittedNPCs).toContain(toughCivilian);
            expect(State.purgedNPCs[0].name).toBe("Normal Guy");
        });
    });
});
