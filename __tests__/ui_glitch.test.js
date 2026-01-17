
import { UIGlitchComponent } from '../js/components/UIGlitchComponent.js';

describe('UIGlitchComponent', () => {
    let glitch;
    let uiMock;
    let mockElement;

    beforeEach(() => {
        // Mock DOM elements using a simple object that spies on jQuery methods
        mockElement = {
            addClass: jest.fn(),
            removeClass: jest.fn(),
            css: jest.fn(),
            text: jest.fn().mockReturnValue('CYCLE 1'),
            append: jest.fn(),
            remove: jest.fn()
        };

        // Mock jQuery $
        global.$ = jest.fn((selector) => {
            if (selector && selector.startsWith && selector.startsWith('<div')) {
                 return mockElement; // For creating new elements
            }
            return mockElement; // For selecting existing elements
        });

        uiMock = {
            elements: {
                cycle: mockElement
            }
        };

        glitch = new UIGlitchComponent(uiMock);
    });

    test('should trigger hallucinations when paranoia is high', () => {
        const state = { paranoia: 100, sanity: 100 };
        
        // Mock random to force triggers
        Math.random = jest.fn(() => 0.001);

        glitch.update(state);

        expect(mockElement.addClass).toHaveBeenCalledWith('glitch-border-red');
        expect(mockElement.css).toHaveBeenCalledWith('transform', expect.stringContaining('translate'));
        expect(mockElement.text).toHaveBeenCalledWith(expect.stringContaining('ERROR'));
    });

    test('should NOT trigger hallucinations when paranoia is low', () => {
        const state = { paranoia: 0, sanity: 100 };
        
        glitch.update(state);

        expect(mockElement.addClass).not.toHaveBeenCalled();
        expect(mockElement.css).not.toHaveBeenCalled();
    });

    test('should trigger hallucinations when sanity is low', () => {
        const state = { paranoia: 0, sanity: 0 };
        
        Math.random = jest.fn(() => 0.001);

        glitch.update(state);

        expect(mockElement.addClass).toHaveBeenCalledWith('glitch-border-red');
    });
});
