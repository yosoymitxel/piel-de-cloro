import { GeneratorManager } from '../js/GeneratorManager.js';
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { State } from '../js/State.js';
import { NPC } from '../js/NPC.js';

describe('Generator System Flow', () => {
    let uiMock, audioMock, gm, mechanics;

    beforeEach(() => {
        State.reset();
        uiMock = {
            elements: {
                genWarningGame: $('#gen-warning-game'),
                genWarningShelter: $('#gen-warning-shelter'),
                genWarningPanel: $('#gen-warning-panel'),
                generatorPowerBar: $('#generator-power-bar'),
                generatorModeLabel: $('#generator-mode-label')
            },
            colors: { energy: '#fff', off: '#333', save: '#0f0', overload: '#f00' },
            setNavItemStatus: jest.fn(),
            updateGeneratorNavStatus: jest.fn(),
            updateEnergyHUD: jest.fn(),
            updateGameActions: jest.fn(),
            updateInspectionTools: jest.fn(),
            updateStats: jest.fn(),
            showFeedback: jest.fn(),
            renderGeneratorRoom: jest.fn()
        };
        audioMock = { playSFXByKey: jest.fn() };
        gm = new GeneratorManager(uiMock, audioMock);
        mechanics = new GameMechanicsManager({
            ui: uiMock,
            audio: audioMock,
            updateHUD: jest.fn()
        });

        gm.renderSystemsGrid = jest.fn();
        gm.renderGuardPanel = jest.fn();
        gm.updateToggleButton = jest.fn();
        gm.updateStatusSummary = jest.fn();
        gm.setupToggleEvent = jest.fn();
        gm.setupModeButtons = jest.fn();
    });

    test('domain rules allow lowering after an action but reject raising', () => {
        State.generator.mode = 'overload';
        State.currentNPC = new NPC();
        State.currentNPC.scanCount = 1;

        expect(mechanics.setGeneratorProtocol('normal')).toBe(true);
        expect(State.generator.mode).toBe('normal');

        State.nextSubject(); // The mode-change lock resets; the current NPC action is still recorded.
        expect(mechanics.setGeneratorProtocol('overload')).toBe(false);
        expect(State.generator.mode).toBe('normal');
    });

    test('a second mode change is rejected until the next subject', () => {
        State.currentNPC = new NPC();
        State.currentNPC.scanCount = 0;

        expect(mechanics.setGeneratorProtocol('save')).toBe(true);
        expect(State.generator.modeChangedThisTurn).toBe(true);
        expect(mechanics.setGeneratorProtocol('overload')).toBe(false);
        expect(State.generator.mode).toBe('save');

        State.nextSubject();
        expect(State.generator.modeChangedThisTurn).toBe(false);
        expect(mechanics.setGeneratorProtocol('overload')).toBe(true);
        expect(State.generator.mode).toBe('overload');
    });

    test('low battery rejects overload without mutating the selected mode', () => {
        State.generator.mode = 'normal';
        State.generator.power = 10;

        expect(mechanics.setGeneratorProtocol('overload')).toBe(false);
        expect(State.generator.mode).toBe('normal');
    });

    test('renderGeneratorRoom updates UI based on generator state', () => {
        const state = {
            generator: { isOn: false, power: 0, mode: 'save', systems: {} },
            generatorCheckedThisTurn: false,
            paranoia: 10,
            cycle: 1,
            dayTime: 1,
            config: { dayLength: 5 },
            currentNPC: null,
            assignments: {}
        };

        gm.renderGeneratorRoom(state);

        expect(state.generatorCheckedThisTurn).toBe(true);
        expect(uiMock.updateGeneratorNavStatus).toHaveBeenCalled();
    });
});
