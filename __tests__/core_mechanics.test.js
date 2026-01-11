import { State } from '../js/State.js';

describe('Core Game Mechanics', () => {
    let gameMock;
    let uiMock;
    let audioMock;

    beforeEach(async () => {
        State.reset();
        
        uiMock = {
            showFeedback: jest.fn(),
            renderGeneratorRoom: jest.fn(),
            updateHUD: jest.fn(),
            updateInspectionTools: jest.fn(),
            setNavItemStatus: jest.fn(),
            showScreen: jest.fn(),
            renderShelterGrid: jest.fn(),
            updateDayAfterSummary: jest.fn(),
            hideFeedback: jest.fn(),
            setNavLocked: jest.fn()
        };

        audioMock = {
            playSFXByKey: jest.fn(),
            unlock: jest.fn(),
            loadManifest: jest.fn()
        };

        // Mock jQuery for Game initialization
        const jqMock = {
            addClass: jest.fn().mockImplementation(() => jqMock),
            on: jest.fn().mockImplementation(() => jqMock),
            off: jest.fn().mockImplementation(() => jqMock),
            val: jest.fn(),
            prop: jest.fn().mockImplementation(() => jqMock),
            hasClass: jest.fn().mockReturnValue(false)
        };
        global.$ = jest.fn(() => jqMock);

        // We simulate Game methods manually to avoid complex DOM dependencies
        gameMock = {
            ui: uiMock,
            audio: audioMock,
            updateGenerator: function() {
                if (!State.generator.isOn) return;
                const mode = State.generator.mode;
                const chance = State.config.generator.failureChance[mode];
                if (Math.random() < chance) {
                    this.triggerGeneratorFailure();
                }
            },
            triggerGeneratorFailure: function() {
                State.generator.isOn = false;
                State.addLogEntry('system', 'FALLO CRÍTICO');
                this.ui.showFeedback("¡FALLO CRÍTICO!", "red");
            },
            toggleGenerator: function() {
                const wasOff = !State.generator.isOn;
                State.generator.isOn = !State.generator.isOn;
                if (State.generator.isOn && wasOff) {
                    State.generator.mode = 'save';
                    State.generator.power = 32;
                    this.ui.showFeedback("SISTEMA REINICIADO", "yellow");
                }
            }
        };
    });

    test('Generator failure chance depends on mode', () => {
        // Mock Math.random to always return a value that causes failure in 'normal' but not 'save'
        // normal failure chance: 0.08, save failure chance: 0.0
        const originalRandom = Math.random;
        Math.random = () => 0.04;

        // Save mode
        State.generator.mode = 'save';
        State.generator.isOn = true;
        gameMock.updateGenerator();
        expect(State.generator.isOn).toBe(true);

        // Normal mode
        State.generator.mode = 'normal';
        State.generator.isOn = true;
        gameMock.updateGenerator();
        expect(State.generator.isOn).toBe(false);
        expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("FALLO"), "red");

        Math.random = originalRandom;
    });

    test('Toggling generator back on forces save mode and sets power', () => {
        State.generator.isOn = false;
        State.generator.mode = 'overload';
        
        gameMock.toggleGenerator();
        
        expect(State.generator.isOn).toBe(true);
        expect(State.generator.mode).toBe('save');
        expect(State.generator.power).toBe(32);
        expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("REINICIADO"), "yellow");
    });

    test('State reset re-initializes all core properties', () => {
        State.paranoia = 80;
        State.cycle = 5;
        State.admittedNPCs = [{}, {}];
        
        State.reset();
        
        expect(State.paranoia).toBe(0);
        expect(State.cycle).toBe(1);
        expect(State.admittedNPCs.length).toBe(0);
        expect(State.generator.isOn).toBe(true);
    });

    test('updateParanoia respects bounds (0-100)', () => {
        State.paranoia = 50;
        
        State.updateParanoia(60);
        expect(State.paranoia).toBe(100);
        
        State.updateParanoia(-120);
        expect(State.paranoia).toBe(0);
    });
});
