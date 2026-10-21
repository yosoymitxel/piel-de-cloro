import { ScreenManager } from '../js/ScreenManager.js';

describe('ScreenManager transition ordering', () => {
    test('a stale delayed screen switch cannot overwrite the latest requested screen', async () => {
        const makeScreen = () => {
            const classes = new Set(['hidden']);
            return {
                classes,
                addClass: (name) => { name.split(/\s+/).forEach(c => classes.add(c)); },
                removeClass: (name) => { name.split(/\s+/).forEach(c => classes.delete(c)); }
            };
        };

        const screens = { night: makeScreen(), game: makeScreen() };
        const game = {
            screens,
            elements: {
                settingsBtn: { toggleClass: jest.fn() },
                sidebar: { toggleClass: jest.fn() },
                finalizeNoPurgeBtn: { toggleClass: jest.fn(), addClass: jest.fn(), text: jest.fn() }
            },
            cancelPurgeAnimation: jest.fn(),
            hideFeedback: jest.fn()
        };
        const manager = new ScreenManager(game);
        manager.updateSidebarActive = jest.fn();

        manager.showScreen('night', {});
        manager.showScreen('game', {});

        await new Promise(resolve => setTimeout(resolve, 180));

        expect(screens.game.classes.has('hidden')).toBe(false);
        expect(screens.night.classes.has('hidden')).toBe(true);
        expect(manager.lastScreen).toBe('game');
    });
});
