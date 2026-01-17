import { jest } from '@jest/globals';

// Use unstable_mockModule for ESM class mocking
jest.unstable_mockModule('../js/components/BaseComponent.js', () => ({
    BaseComponent: class {
        constructor(selector) { this.selector = selector; }
    }
}));

describe('Reactive Glitches (UIGlitchComponent)', () => {
    let UIGlitchComponent, State, $;
    let component;
    let mockUiManager;

    beforeAll(async () => {
        // Mock jQuery with support for addClass/removeClass/css/text
        $ = jest.fn(sel => {
            return {
                0: sel,
                length: 1,
                addClass: jest.fn().mockReturnThis(),
                removeClass: jest.fn().mockReturnThis(),
                css: jest.fn().mockReturnThis(),
                text: jest.fn().mockReturnThis(),
                append: jest.fn().mockReturnThis(),
                remove: jest.fn()
            };
        });
        global.$ = $;

        // Import module AFTER defining mock
        const mod = await import('../js/components/UIGlitchComponent.js');
        UIGlitchComponent = mod.UIGlitchComponent;
    });

    beforeEach(() => {
        mockUiManager = {
            elements: {
                cycle: $('cycle')
            }
        };
        component = new UIGlitchComponent(mockUiManager);
        State = {
            paranoia: 0,
            sanity: 100
        };
    });

    test('Should trigger hallucinations when sanity is low', () => {
        State.sanity = 20; // Low sanity
        component.triggerHallucinations = jest.fn();

        component.update(State);

        expect(component.triggerHallucinations).toHaveBeenCalled();
    });

    test('Should trigger hallucinations when paranoia is high', () => {
        State.paranoia = 80; // High paranoia
        component.triggerHallucinations = jest.fn();

        component.update(State);

        expect(component.triggerHallucinations).toHaveBeenCalled();
    });

    test('Should toggle body classes for global effects', () => {
        State.sanity = 10;
        State.paranoia = 90;

        // Spy on body AddClass
        const bodyMock = {
            addClass: jest.fn(),
            removeClass: jest.fn(),
            append: jest.fn()
        };
        $.mockImplementation(sel => {
            if (sel === 'body') return bodyMock;
            return {
                0: sel,
                length: 1,
                addClass: jest.fn(),
                removeClass: jest.fn(),
                css: jest.fn(),
                text: jest.fn(),
                append: jest.fn(),
                remove: jest.fn()
            };
        });

        component.update(State);

        expect(bodyMock.addClass).toHaveBeenCalledWith('sanity-shaken');
        expect(bodyMock.addClass).toHaveBeenCalledWith('paranoia-vision');
    });

    test('Glitch trigger logic (random)', () => {
        // Force random to 0 to ensure triggers
        jest.spyOn(Math, 'random').mockReturnValue(0);

        // Mock setTimeout
        jest.useFakeTimers();

        const intensity = 1.0;
        // Manually populate elements as update() does
        component.elements = {
            workstation: $('workstation'),
            console: $('console'),
            cycle: mockUiManager.elements.cycle
        };

        component.triggerHallucinations(intensity);

        // Expect element interactions
        // Cycle text update for glitch
        expect(mockUiManager.elements.cycle.text).toHaveBeenCalled();

        // Ghost append
        expect($).toHaveBeenCalledWith('body');

        jest.useRealTimers();
    });
});
