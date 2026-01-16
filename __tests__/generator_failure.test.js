
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { State } from '../js/State.js';
import { NPC } from '../js/NPC.js';

describe('Generator Failure and Recovery', () => {
    let gmm, gameMock, uiMock;

    beforeEach(() => {
        State.reset();
        uiMock = {
            showFeedback: jest.fn(),
            renderGeneratorRoom: jest.fn(),
            updateGeneratorNavStatus: jest.fn(),
            updateEnergyHUD: jest.fn(),
            updateInspectionTools: jest.fn(),
            updateSecurityNavStatus: jest.fn(),
            renderSecurityRoom: jest.fn()
        };
        gameMock = {
            ui: uiMock,
            audio: { playSFXByKey: jest.fn() },
            updateHUD: jest.fn()
        };
        gmm = new GameMechanicsManager(gameMock);
    });

    test('Triggering failure sets scanCount to 99 and turns generator off', () => {
        State.generator.isOn = true;
        const npc = new NPC();
        State.currentNPC = npc;

        gmm.triggerGeneratorFailure();

        expect(State.generator.isOn).toBe(false);
        expect(npc.scanCount).toBe(99);
        expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("FALLO CRÍTICO"), "red", 5000);
    });

    test('Toggling ON grants emergency energy if scanCount was 0', () => {
        State.generator.isOn = false;
        State.generator.emergencyEnergyGranted = false;
        const npc = new NPC();
        npc.scanCount = 0;
        npc.dialogueStarted = false;
        State.currentNPC = npc;

        gmm.toggleGenerator(); // Turn ON

        expect(State.generator.isOn).toBe(true);
        expect(npc.scanCount).toBe(0); // Still 0, but emergencyEnergyGranted is true
        expect(State.generator.emergencyEnergyGranted).toBe(true);
        expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("ENERGÍA RESTAURADA"), "green", 4000);
    });

    test('Toggling ON does NOT grant extra energy if an action was already taken', () => {
        State.generator.isOn = false;
        State.generator.emergencyEnergyGranted = false;
        const npc = new NPC();
        npc.scanCount = 1; // Already performed a test before blackout
        State.currentNPC = npc;

        gmm.toggleGenerator();

        expect(State.generator.emergencyEnergyGranted).toBe(false);
        expect(uiMock.showFeedback).not.toHaveBeenCalledWith(expect.stringContaining("ENERGÍA RESTAURADA"), "green", 4000);
    });

    test('Toggling OFF disables inspections', () => {
        State.generator.isOn = true;
        const npc = new NPC();
        npc.scanCount = 0;
        State.currentNPC = npc;

        gmm.toggleGenerator(); // Turn OFF

        expect(State.generator.isOn).toBe(false);
        expect(npc.scanCount).toBe(99);
    });

    test('Recovery from blackout/restart lock', () => {
        State.generator.isOn = false;
        gmm.toggleGenerator();

        expect(State.generator.mode).toBe('save');
        expect(State.generator.power).toBe(100);
        expect(State.generator.restartLock).toBe(true);
    });
});
