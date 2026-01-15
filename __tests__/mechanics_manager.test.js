
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { State } from '../js/State.js';
import { NPC } from '../js/NPC.js';

describe('GameMechanicsManager', () => {
    let gmm, gameMock, uiMock, audioMock;
    const originalRandom = Math.random;

    beforeEach(() => {
        jest.clearAllMocks();
        State.reset();
        Math.random = originalRandom;

        // Minimal $ stub
        global.$ = jest.fn((sel) => ({
            is: jest.fn().mockReturnValue(false),
            removeClass: jest.fn().mockReturnThis(),
            addClass: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis(),
            length: 1
        }));

        uiMock = {
            showFeedback: jest.fn(),
            showMessage: jest.fn(),
            showLore: jest.fn((id, cb) => cb && cb()),
            updateHUD: jest.fn(),
            renderGeneratorRoom: jest.fn(),
            renderSecurityRoom: jest.fn(),
            updateGeneratorNavStatus: jest.fn(),
            updateSecurityNavStatus: jest.fn(),
            updateInspectionTools: jest.fn(),
            clearAllNavStatuses: jest.fn(),
            setNavItemStatus: jest.fn(),
            renderNightScreen: jest.fn(),
            updateRunStats: jest.fn(),
            updateDayAfterSummary: jest.fn()
        };

        audioMock = {
            playSFXByKey: jest.fn(),
            playAmbientByKey: jest.fn(),
            levels: { ambient: 0.5 }
        };

        gameMock = {
            ui: uiMock,
            audio: audioMock,
            events: {
                switchScreen: jest.fn((screen, cfg) => {
                    if (cfg && cfg.renderFn) cfg.renderFn();
                }),
                navigateToRoom: jest.fn(),
                navigateToShelter: jest.fn()
            },
            endings: {
                triggerEnding: jest.fn()
            },
            updateHUD: jest.fn(),
            nextTurn: jest.fn(),
            restartGame: jest.fn()
        };

        gmm = new GameMechanicsManager(gameMock);
    });

    afterAll(() => {
        Math.random = originalRandom;
    });

    describe('Generator Logic', () => {
        test('triggerGeneratorFailure updates state and UI', () => {
            State.generator.isOn = true;
            const npc = new NPC();
            State.currentNPC = npc;

            gmm.triggerGeneratorFailure();

            expect(State.generator.isOn).toBe(false);
            expect(npc.scanCount).toBe(99);
            expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("FALLO CRÍTICO"), "red", expect.any(Number));
        });

        test('toggleGenerator turns on and applies ahorro mode', () => {
            State.generator.isOn = false;
            gmm.toggleGenerator();

            expect(State.generator.isOn).toBe(true);
            expect(State.generator.mode).toBe('save');
            expect(audioMock.playSFXByKey).toHaveBeenCalledWith('generator_start', expect.any(Object));
        });

        test('toggleGenerator turns off and disipates energy', () => {
            State.generator.isOn = true;
            const npc = new NPC();
            State.currentNPC = npc;

            gmm.toggleGenerator();

            expect(State.generator.isOn).toBe(false);
            expect(npc.scanCount).toBe(99);
            expect(audioMock.playSFXByKey).toHaveBeenCalledWith('generator_stop', expect.any(Object));
        });
    });

    describe('Purge Consequences', () => {
        test('purging human increases paranoia and decreases sanity', () => {
            const npc = new NPC();
            npc.isInfected = false;
            State.paranoia = 10;
            State.sanity = 100;

            gmm.calculatePurgeConsequences(npc);

            expect(State.paranoia).toBeGreaterThan(10);
            expect(State.sanity).toBeLessThan(100);
            expect(uiMock.showMessage).toHaveBeenCalledWith(expect.stringContaining("HUMANO"), null, 'warning');
        });

        test('purging infected decreases paranoia and increases sanity', () => {
            const npc = new NPC();
            npc.isInfected = true;
            State.paranoia = 50;
            State.sanity = 50;

            gmm.calculatePurgeConsequences(npc);

            expect(State.paranoia).toBeLessThan(50);
            expect(State.sanity).toBeGreaterThan(50);
            expect(uiMock.showMessage).toHaveBeenCalledWith(expect.stringContaining("AMENAZA ELIMINADA"), null, 'normal');
        });
    });

    describe('Night Resolution Deep Logic', () => {
        test('scavenger trait increases supplies at night', () => {
            const npc = new NPC();
            npc.trait = { id: 'scavenger', name: 'Scavenger' };
            State.admittedNPCs = [npc];
            State.supplies = 10;

            Math.random = () => 0.1;

            gmm.processNightResourcesAndTraits();
            // Consumption 1, found 1. 10 + 1 - 1 = 10.
            expect(State.supplies).toBe(10);
        });

        test('sickly trait consumes double supplies', () => {
            const npc = new NPC();
            npc.trait = { id: 'sickly', name: 'Sickly' };
            State.admittedNPCs = [npc];
            State.supplies = 10;

            gmm.processNightResourcesAndTraits();

            expect(State.supplies).toBe(8);
        });

        test('optimist trait reduces paranoia', () => {
            const npc = new NPC();
            npc.trait = { id: 'optimist', name: 'Optimist' };
            State.admittedNPCs = [npc];
            State.paranoia = 50;

            gmm.processNightResourcesAndTraits();

            expect(State.paranoia).toBe(40);
        });

        test('starvation leads to death if supplies reach 0', () => {
            const npc = new NPC();
            State.admittedNPCs = [npc];
            State.supplies = 0;

            Math.random = () => 0.01; // Trigger starvation

            gmm.processNightResourcesAndTraits();

            expect(State.admittedNPCs.length).toBe(0);
            expect(State.purgedNPCs.length).toBe(1);
            expect(State.purgedNPCs[0].death.reason).toBe('inanición');
        });
    });

    describe('Decision Flow', () => {
        test('finishRun blocks if shelter not full', () => {
            State.admittedNPCs = [new NPC()];
            State.config.maxShelterCapacity = 5;

            gmm.finishRun();

            expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("SISTEMA BLOQUEADO"), "alert", 4000);
            expect(gameMock.endings.triggerEnding).not.toHaveBeenCalled();
        });

        test('finishRun triggers final_clean if all safe', () => {
            Math.random = () => 0.99; // Avoid paranoia death

            State.admittedNPCs = [new NPC(), new NPC(), new NPC(), new NPC(), new NPC()];
            State.config.maxShelterCapacity = 5;
            State.admittedNPCs.forEach(n => n.isInfected = false);
            State.playerInfected = false;
            State.generator.isOn = true;
            State.paranoia = 0;

            gmm.finishRun();

            expect(uiMock.showLore).toHaveBeenCalledWith('pre_final', expect.any(Function));
            expect(gameMock.endings.triggerEnding).toHaveBeenCalledWith('final_clean');
        });
    });
});
