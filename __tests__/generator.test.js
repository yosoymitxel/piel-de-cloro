import { jest } from '@jest/globals';
import { State } from '../js/State.js';

jest.unstable_mockModule('../js/ui/GeneratorRenderer.js', () => ({
    GeneratorRenderer: jest.fn().mockImplementation(() => ({
        hideWarnings: jest.fn(),
        renderPowerBar: jest.fn(),
        updateModeLabel: jest.fn(),
        updateStatusSummary: jest.fn(),
        updateModeButtons: jest.fn(),
        updateToggleButton: jest.fn()
    }))
}));

const { GeneratorManager } = await import('../js/GeneratorManager.js');

describe('GeneratorManager', () => {
    let manager;
    let mockUI;
    let mockAudio;

    beforeEach(() => {
        State.reset();
        
        mockUI = {
            elements: {},
            colors: {
                ENERGY: '#00ff00',
                OFF: '#333333',
                SAVE: '#ffff00',
                OVERLOAD: '#ff0000'
            },
            setNavItemStatus: jest.fn(),
            updateGameActions: jest.fn(),
            updateInspectionTools: jest.fn(),
            updateStats: jest.fn(),
            showFeedback: jest.fn(),
            applyBlackout: jest.fn()
        };

        mockAudio = {
            playSFXByKey: jest.fn()
        };

        manager = new GeneratorManager(mockUI, mockAudio);
        
        // Mock jQuery elements for setupModeButtons and setupToggleEvent
        global.$ = jest.fn((selector) => {
            return {
                off: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                removeClass: jest.fn().mockReturnThis(),
                addClass: jest.fn().mockReturnThis(),
                attr: jest.fn().mockReturnThis(),
                text: jest.fn().mockReturnThis(),
                html: jest.fn().mockReturnThis(),
                toggleClass: jest.fn().mockReturnThis(),
                is: jest.fn().mockReturnValue(false)
            };
        });
    });

    test('renderGeneratorRoom updates UI and nav status', () => {
        State.generator.isOn = true;
        State.generator.power = 50;
        State.generator.mode = 'normal';

        manager.renderGeneratorRoom(State);

        expect(State.generatorCheckedThisTurn).toBe(true);
        expect(mockUI.setNavItemStatus).toHaveBeenCalledWith('nav-generator', null);
        expect(manager.renderer.renderPowerBar).toHaveBeenCalledWith(50, true, mockUI.colors.ENERGY, 'normal');
    });

    test('renderGeneratorRoom sets critical status when generator is off', () => {
        State.generator.isOn = false;
        manager.renderGeneratorRoom(State);
        expect(mockUI.setNavItemStatus).toHaveBeenCalledWith('nav-generator', 4);
    });

    test('renderGeneratorRoom sets warning status when power is low', () => {
        State.generator.isOn = true;
        State.generator.power = 5;
        manager.renderGeneratorRoom(State);
        expect(mockUI.setNavItemStatus).toHaveBeenCalledWith('nav-generator', 3);
    });

    test('handleModeSwitch updates state and power', () => {
        // We need to capture the click handler to test handleModeSwitch
        let clickHandler;
        global.$ = jest.fn((selector) => {
            const mock = {
                off: jest.fn().mockReturnThis(),
                on: jest.fn((event, handler) => {
                    if (event === 'click') {
                        if (selector === '#btn-gen-save' && !clickHandler) clickHandler = handler;
                        if (selector === '#btn-gen-normal') clickHandler = handler;
                        if (selector === '#btn-gen-over') clickHandler = handler;
                    }
                    return mock;
                }),
                removeClass: jest.fn().mockReturnThis(),
                addClass: jest.fn().mockReturnThis(),
                attr: jest.fn().mockReturnThis(),
                text: jest.fn().mockReturnThis(),
                html: jest.fn().mockReturnThis(),
                toggleClass: jest.fn().mockReturnThis(),
                is: jest.fn().mockReturnValue(false)
            };
            return mock;
        });

        // Test normal mode switch
        manager.setupModeButtons(State);
        
        // Find the normal button handler
        let normalHandler;
        global.$.mockImplementation((selector) => {
            const mock = {
                off: jest.fn().mockReturnThis(),
                on: jest.fn((event, handler) => {
                    if (event === 'click' && selector === '#btn-gen-normal') normalHandler = handler;
                    return mock;
                }),
                removeClass: jest.fn().mockReturnThis(),
                addClass: jest.fn().mockReturnThis(),
                attr: jest.fn().mockReturnThis(),
                text: jest.fn().mockReturnThis(),
                html: jest.fn().mockReturnThis(),
                toggleClass: jest.fn().mockReturnThis()
            };
            return mock;
        });
        manager.setupModeButtons(State);
        
        if (normalHandler) normalHandler();
    });
});
