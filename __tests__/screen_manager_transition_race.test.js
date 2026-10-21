import { ScreenManager } from '../js/ScreenManager.js';

describe('ScreenManager transition ordering', () => {
    const makeScreen = () => {
        const classes = new Set(['hidden']);
        return {
            classes,
            addClass: (name) => { name.split(/\s+/).forEach(c => classes.add(c)); },
            removeClass: (name) => { name.split(/\s+/).forEach(c => classes.delete(c)); }
        };
    };

    const makeManager = () => {
        const screens = { night: makeScreen(), game: makeScreen() };
        const ui = {
            screens,
            elements: {
                settingsBtn: { toggleClass: jest.fn() },
                sidebar: { toggleClass: jest.fn() },
                finalizeNoPurgeBtn: { toggleClass: jest.fn(), addClass: jest.fn(), text: jest.fn() }
            },
            cancelPurgeAnimation: jest.fn(),
            hideFeedback: jest.fn()
        };
        const manager = new ScreenManager(ui);
        manager.updateSidebarActive = jest.fn();
        return { manager, screens };
    };

    test('a newer destination cancels the old request and resolves both callers', async () => {
        const { manager, screens } = makeManager();

        const staleTransition = manager.showScreen('night', {});
        const currentTransition = manager.showScreen('game', {});

        await expect(staleTransition).resolves.toBe(false);
        await expect(currentTransition).resolves.toBe(true);

        expect(screens.game.classes.has('hidden')).toBe(false);
        expect(screens.night.classes.has('hidden')).toBe(true);
        expect(manager.lastScreen).toBe('game');
    });

    test('a caller can await the actual screen commit', async () => {
        const { manager, screens } = makeManager();

        let committed = false;
        const transition = manager.showScreen('game', {}).then(result => {
            committed = true;
            return result;
        });

        expect(committed).toBe(false);
        await expect(transition).resolves.toBe(true);
        expect(committed).toBe(true);
        expect(screens.game.classes.has('hidden')).toBe(false);
    });
});
