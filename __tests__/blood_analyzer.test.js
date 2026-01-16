import { State } from '../js/State.js';
import { GameActionHandler } from '../js/GameActionHandler.js';
import { NPC } from '../js/NPC.js';

describe('Blood Analyzer (Hemoglobina)', () => {
    let gah, gameMock, uiMock, audioMock;

    beforeEach(() => {
        State.reset();
        State.generator.isOn = true;
        if (State.generator.systems) State.generator.systems.shelterLab.active = true;

        uiMock = {
            showFeedback: jest.fn(),
            updateHUD: jest.fn(),
            updateInspectionTools: jest.fn(),
            updateEnergyHUD: jest.fn()
        };

        audioMock = {
            playSFXByKey: jest.fn()
        };

        gameMock = {
            ui: uiMock,
            audio: audioMock,
            updateHUD: jest.fn(),
            isAnimating: false
        };

        gah = new GameActionHandler(gameMock);
    });

    test('Should block blood test if energy mode is save', () => {
        State.generator.mode = 'save';
        State.currentNPC = new NPC();

        const result = gah.validateBloodTest();
        expect(result.allowed).toBe(false);
        expect(result.code).toBe('MODE_RESTRICTED');
    });

    test('Should start blood test and set countdown', () => {
        State.generator.mode = 'normal';
        const npc = new NPC();
        State.currentNPC = npc;

        gah.startBloodTest(npc);

        expect(State.generator.bloodTestCountdown).toBe(2);
        expect(State.generator.bloodTestId).toBe(npc.id || npc.name);
        expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("ANÁLISIS INICIADO"), "yellow", 4000);
        expect(uiMock.updateEnergyHUD).toHaveBeenCalled();
    });

    test('Should increase paranoia by 15 when starting test', () => {
        const initialParanoia = State.paranoia;
        State.generator.mode = 'normal';
        const npc = new NPC();
        State.currentNPC = npc;

        gah.startBloodTest(npc);

        expect(State.paranoia).toBe(initialParanoia + 15);
    });
});
