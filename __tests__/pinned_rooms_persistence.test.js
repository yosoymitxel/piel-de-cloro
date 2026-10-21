import { State } from '../js/State.js';
import { GameEventManager } from '../js/GameEventManager.js';

describe('Pinned room persistence and navigation', () => {
    let originalLocalStorage;

    beforeEach(() => {
        State.reset();
        originalLocalStorage = global.localStorage;
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(null),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };
        if (global.window) global.window.localStorage = global.localStorage;
    });

    afterEach(() => {
        global.localStorage = originalLocalStorage;
        if (global.window) global.window.localStorage = originalLocalStorage;
    });

    test('loads only unique string room IDs and enforces the five-pin limit', () => {
        global.localStorage.getItem.mockReturnValue(JSON.stringify({
            pinnedRooms: ['generator', 'room', 'generator', '', null, 'shelter', 'morgue', 'database', 'security']
        }));

        State.loadPersistentData();

        expect(State.pinnedRooms).toEqual(['generator', 'room', 'shelter', 'morgue', 'database']);
    });

    test('saving a pin persists the change and refreshes navigation', () => {
        State.pinnedRooms = ['generator'];
        State.savePersistentData = jest.fn();
        const ui = {
            showFeedback: jest.fn(),
            renderPinnedRooms: jest.fn()
        };
        const manager = new GameEventManager({ ui, audio: {} });

        expect(manager.togglePinRoom('shelter')).toBe(true);

        expect(State.pinnedRooms).toEqual(['generator', 'shelter']);
        expect(State.savePersistentData).toHaveBeenCalledTimes(1);
        expect(ui.renderPinnedRooms).toHaveBeenCalledWith(State);
    });

    test('refuses a sixth pin without changing or persisting the list', () => {
        State.pinnedRooms = ['generator', 'shelter', 'room', 'morgue', 'database'];
        State.savePersistentData = jest.fn();
        const ui = {
            showFeedback: jest.fn(),
            renderPinnedRooms: jest.fn()
        };
        const manager = new GameEventManager({ ui, audio: {} });

        expect(manager.togglePinRoom('security')).toBe(false);

        expect(State.pinnedRooms).toHaveLength(5);
        expect(State.pinnedRooms).not.toContain('security');
        expect(State.savePersistentData).not.toHaveBeenCalled();
        expect(ui.renderPinnedRooms).not.toHaveBeenCalled();
    });
});
