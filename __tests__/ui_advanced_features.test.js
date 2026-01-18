import { jest } from '@jest/globals';
import { State } from '../js/State.js';
import { UIManager } from '../js/UIManager.js';
import { GameEventManager } from '../js/GameEventManager.js';

describe('Advanced UI & Navigation Features', () => {
    let ui, gem;
    let mockAudio;

    beforeEach(() => {
        State.reset();

        // Setup complex jQuery mock for mirrored components
        global.__fakeDOM = {};
        global.$ = (key) => {
            if (!global.__fakeDOM[key]) {
                global.__fakeDOM[key] = {
                    _selector: key,
                    length: 1,
                    empty: jest.fn(function () { return this; }),
                    append: jest.fn(function () { return this; }),
                    html: jest.fn(function () { return this; }),
                    text: jest.fn(function () { return this; }),
                    addClass: jest.fn(function () { return this; }),
                    removeClass: jest.fn(function () { return this; }),
                    toggleClass: jest.fn(function () { return this; }),
                    css: jest.fn(function () { return this; }),
                    on: jest.fn(function () { return this; }),
                    off: jest.fn(function () { return this; }),
                    find: jest.fn(function () { return this; }),
                    parent: jest.fn(function () { return this; }),
                    attr: jest.fn(function () { return ''; }),
                    removeAttr: jest.fn(function () { return this; }),
                    hide: jest.fn(function () { return this; }),
                    show: jest.fn(function () { return this; }),
                    stop: jest.fn(function () { return this; }),
                    fadeOut: jest.fn(function (d, cb) { if (cb) cb(); return this; }),
                    fadeIn: jest.fn(function (d, cb) { if (cb) cb(); return this; }),
                    prop: jest.fn(function () { return this; }),
                    eq: jest.fn(function () { return this; }),
                    is: jest.fn(function (sel) {
                        if (sel === ':visible' && this._selector === '#screen-start') return false;
                        return true;
                    })
                };
            }
            return global.__fakeDOM[key];
        };

        mockAudio = {
            playSFXByKey: jest.fn(),
            stopAllSFX: jest.fn(),
            getUrl: jest.fn(k => k)
        };

        ui = new UIManager({ audio: mockAudio });
        gem = new GameEventManager({ ui, audio: mockAudio });
    });

    test('Mirrored HUD stats should reach multiple elements via class selector', () => {
        // Mocking StatsManager updateRunStats which is called by updateRunStats
        const spyUpdate = jest.spyOn(ui.statsManager, 'updateRunStats');

        State.paranoia = 50;
        ui.updateRunStats(State);

        // The statsManager should have been called
        expect(spyUpdate).toHaveBeenCalled();
    });

    test('Sidebar Pins should render based on state', () => {
        const pinContainer = $('.pinned-nav-btn'); // This should match pins
        ui.renderPinnedRooms(State);

        // Should have called jQuery append/html for pinning
        expect(global.__fakeDOM['#sidebar-pinned-rooms'].append).toHaveBeenCalled();
    });

    test('navigateToMap should support force option via GameEventManager', async () => {
        const switchSpy = jest.spyOn(gem, 'switchScreen');

        // Locking navigation
        State.navLocked = true;

        // Normal navigation should fail
        let result = await gem.navigateToMap();
        expect(result).toBe(false);

        // Forced navigation should succeed
        result = await gem.navigateToMap({ force: true });
        expect(result).toBe(true);
        expect(switchSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ force: true }));
    });
});
