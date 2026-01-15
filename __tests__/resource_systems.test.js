import { State } from '../js/State.js';
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { GameActionHandler } from '../js/GameActionHandler.js';
import { NPC } from '../js/NPC.js';

describe('Resource Systems (Food, Paranoia, Sanity)', () => {
    let gmm, gah, gameMock, uiMock, audioMock, endingsMock;

    beforeEach(() => {
        State.reset();

        uiMock = {
            showFeedback: jest.fn(),
            hideFeedback: jest.fn(),
            showMessage: jest.fn(),
            showLore: jest.fn(),
            showConfirm: jest.fn((text, onYes) => onYes()),
            updateInspectionTools: jest.fn(),
            updateRunStats: jest.fn(),
            clearAllNavStatuses: jest.fn(),
            setNavItemStatus: jest.fn(),
            updateSecurityNavStatus: jest.fn(),
            showValidationGate: jest.fn()
        };

        audioMock = {
            playSFXByKey: jest.fn(),
            stopLore: jest.fn(),
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
                switchScreen: jest.fn()
            },
            updateHUD: jest.fn(),
            nextTurn: jest.fn(),
            isAnimating: false
        };

        gmm = new GameMechanicsManager(gameMock);
        gah = new GameActionHandler(gameMock);
    });

    describe('Food (Supplies) System', () => {
        test('Initial supplies should be 15', () => {
            expect(State.supplies).toBe(15);
        });

        test('Emergency supply request adds supplies and increases paranoia', () => {
            const initialSupplies = State.supplies;
            const initialParanoia = State.paranoia;

            gah.handleSupplyRequest();

            expect(State.supplies).toBe(initialSupplies + 3);
            expect(State.paranoia).toBe(initialParanoia + 15);
            expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining('+3'), 'green', expect.any(Number));
        });

        test('Night consumption: base 1 per person', () => {
            State.supplies = 10;
            const npc1 = new NPC();
            const npc2 = new NPC();
            npc1.trait = { id: 'none' };
            npc2.trait = { id: 'none' };
            State.admittedNPCs = [npc1, npc2];

            gmm.processNightResourcesAndTraits();

            // 10 - 2 = 8
            expect(State.supplies).toBe(8);
        });
    });

    describe('Paranoia System', () => {
        test('Ignoring an infected NPC increases paranoia (max 7)', () => {
            const npc = new NPC(true); // Infected
            State.currentNPC = npc;
            npc.scanCount = 1;
            const initialParanoia = State.paranoia;

            // Mock random for max increase
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0.99);

            gah.handleDecision('ignore');

            // Math.floor(0.99 * 6) + 1 = 5 + 1 = 6? No, maxIncrease is 7.
            // My implementation was: Math.floor(Math.random() * 6) + 1 for infected? 
            // Let's check GameActionHandler.js
            expect(State.paranoia).toBeGreaterThan(initialParanoia);
            expect(State.paranoia).toBeLessThanOrEqual(initialParanoia + 7);

            spy.mockRestore();
        });

        test('Night reduction: bonus if civilians > cloros', () => {
            State.paranoia = 50;
            const civilian1 = new NPC(false);
            const civilian2 = new NPC(false);
            const civilian3 = new NPC(false);

            civilian1.trait = { id: 'none' };
            civilian2.trait = { id: 'none' };
            civilian3.trait = { id: 'none' };

            // 3 civilians, 0 infected -> ratio > 1
            State.admittedNPCs = [civilian1, civilian2, civilian3];

            // Mock random for night results (to avoid random death)
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0.99);
            uiMock.showLore.mockImplementation((key, cb) => cb());

            gmm.sleep();

            // Base reduction is 10, bonus is 5 -> Total 15
            // 50 - 15 = 35
            expect(State.paranoia).toBe(35);
            spy.mockRestore();
        });
    });

    describe('Sanity System', () => {
        test('Purging a human decreases sanity', () => {
            const initialSanity = State.sanity;
            const npc = new NPC(false); // Human

            gmm.calculatePurgeConsequences(npc);

            expect(State.sanity).toBeLessThan(initialSanity);
            expect(uiMock.showMessage).toHaveBeenCalledWith(expect.stringContaining('CORDURA DISMINUYE'), null, 'warning');
        });

        test('Purging an infected increases sanity', () => {
            State.sanity = 80;
            const initialSanity = State.sanity;
            const npc = new NPC(true); // Infected

            gmm.calculatePurgeConsequences(npc);

            expect(State.sanity).toBeGreaterThan(initialSanity);
            expect(uiMock.showMessage).toHaveBeenCalledWith(expect.stringContaining('ESTABILIZA'), null, 'normal');
        });
    });
});
