import { UIManager } from '../js/UIManager.js';
import { State } from '../js/State.js';
import { LoreData } from '../js/LoreData.js';

// Mock jQuery
global.$ = jest.fn((selector) => {
    if (typeof selector === 'string' && selector.startsWith('<')) {
        return {
            html: jest.fn().mockReturnThis(),
            append: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            off: jest.fn().mockReturnThis(),
            addClass: jest.fn().mockReturnThis(),
            removeClass: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis(),
            empty: jest.fn().mockReturnThis(),
            text: jest.fn().mockReturnThis(),
            attr: jest.fn().mockReturnThis(),
            data: jest.fn().mockReturnThis(),
            parent: jest.fn().mockReturnThis(),
            children: jest.fn().mockReturnThis(),
            first: jest.fn().mockReturnThis(),
            last: jest.fn().mockReturnThis(),
            css: jest.fn().mockReturnThis(),
            show: jest.fn().mockReturnThis(),
            hide: jest.fn().mockReturnThis(),
            length: 1
        };
    }
    return {
        html: jest.fn().mockReturnThis(),
        append: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        off: jest.fn().mockReturnThis(),
        addClass: jest.fn().mockReturnThis(),
        removeClass: jest.fn().mockReturnThis(),
        find: jest.fn().mockReturnThis(),
        empty: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        attr: jest.fn().mockReturnThis(),
        data: jest.fn().mockReturnThis(),
        parent: jest.fn().mockReturnThis(),
        children: jest.fn().mockReturnThis(),
        first: jest.fn().mockReturnThis(),
        last: jest.fn().mockReturnThis(),
        css: jest.fn().mockReturnThis(),
        show: jest.fn().mockReturnThis(),
        hide: jest.fn().mockReturnThis(),
        length: selector === '#modal-endings' || selector === '#endings-list' ? 1 : 0
    };
});

describe('Endings UI', () => {
    let ui;
    const audioMock = { playSFXByKey: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        State.reset();
        ui = new UIManager(audioMock);
    });

    test('showEndingsModal displays correct count and numeration', () => {
        // Mock unlocked endings
        State.unlockedEndings = ['final_clean', 'final_corrupted'];

        // Mock elements
        const listMock = { empty: jest.fn(), append: jest.fn() };
        const titleMock = { html: jest.fn() };
        const modalMock = { find: jest.fn().mockReturnValue(titleMock), removeClass: jest.fn().mockReturnThis(), addClass: jest.fn().mockReturnThis() };

        ui.elements.modalEndings = modalMock;
        ui.elements.endingsList = listMock;

        ui.showEndingsModal();

        // Check if count is in the title
        const allEndingsCount = Object.keys(LoreData).filter(key => key.startsWith('final_')).length;
        expect(titleMock.html).toHaveBeenCalledWith(expect.stringContaining(`(2/${allEndingsCount})`));

        // Check if cards are appended (should be 2)
        expect(listMock.append).toHaveBeenCalledTimes(2);

        // Check if numeration is present in the cards (1. and 2.)
        const calls = listMock.append.mock.calls;
        // The argument to append is a jQuery object created from a string
        // Since we mocked $, we can check the string passed to $ in UIManager.js

        // The first call should have "1. "
        // The second call should have "2. "
        // In our mock, $ is called with the HTML string.
        const firstCardHtml = global.$.mock.calls.find(call => typeof call[0] === 'string' && call[0].includes('1. '))[0];
        const secondCardHtml = global.$.mock.calls.find(call => typeof call[0] === 'string' && call[0].includes('2. '))[0];

        expect(firstCardHtml).toContain('1. ');
        expect(secondCardHtml).toContain('2. ');
    });

    test('showEndingsModal handles zero unlocked endings', () => {
        State.unlockedEndings = [];

        const listMock = { empty: jest.fn(), append: jest.fn() };
        const titleMock = { html: jest.fn() };
        const modalMock = { find: jest.fn().mockReturnValue(titleMock), removeClass: jest.fn().mockReturnThis(), addClass: jest.fn().mockReturnThis() };

        ui.elements.modalEndings = modalMock;
        ui.elements.endingsList = listMock;

        ui.showEndingsModal();

        expect(listMock.append).toHaveBeenCalledWith(expect.stringContaining('No se han recuperado archivos'));
    });
});
