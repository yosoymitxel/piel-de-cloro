import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { State } from '../js/State.js';

describe('New-day transition ordering', () => {
    beforeEach(() => State.reset());
    afterEach(() => jest.restoreAllMocks());

    test('duplicate continue-day calls share one cycle transition', async () => {
        let resolveScreen;
        const screenTransition = new Promise(resolve => {
            resolveScreen = resolve;
        });
        const game = {
            ui: {
                setNavItemStatus: jest.fn(),
                updateRunStats: jest.fn()
            },
            audio: {
                playAmbientByKey: jest.fn()
            },
            events: {
                switchScreen: jest.fn(() => screenTransition)
            },
            nextTurn: jest.fn(),
            randomEvents: null
        };
        const mechanics = new GameMechanicsManager(game);
        mechanics.updateTurnEndSystems = jest.fn();
        const startDaySpy = jest.spyOn(State, 'startNextDay');

        const first = mechanics.startNextDay();
        const duplicate = mechanics.startNextDay();
        expect(duplicate).toBe(first);

        await Promise.resolve();
        expect(startDaySpy).toHaveBeenCalledTimes(1);
        expect(game.events.switchScreen).toHaveBeenCalledTimes(1);
        expect(game.nextTurn).not.toHaveBeenCalled();

        resolveScreen(true);
        await Promise.all([first, duplicate]);

        expect(game.nextTurn).toHaveBeenCalledTimes(1);
        expect(mechanics.updateTurnEndSystems).toHaveBeenCalledTimes(1);
    });

    test('retries a superseded guard-screen request instead of stranding the new cycle', async () => {
        let resolveRetry;
        const retryTransition = new Promise(resolve => {
            resolveRetry = resolve;
        });
        const game = {
            ui: {
                setNavItemStatus: jest.fn(),
                updateRunStats: jest.fn()
            },
            audio: {
                playAmbientByKey: jest.fn()
            },
            events: {
                switchScreen: jest.fn()
                    .mockResolvedValueOnce(false)
                    .mockImplementationOnce(() => retryTransition)
            },
            nextTurn: jest.fn(),
            randomEvents: null
        };
        const mechanics = new GameMechanicsManager(game);
        mechanics.updateTurnEndSystems = jest.fn();

        const start = mechanics.startNextDay();
        await Promise.resolve();
        await Promise.resolve();

        expect(game.events.switchScreen).toHaveBeenCalledTimes(2);
        expect(game.nextTurn).not.toHaveBeenCalled();

        resolveRetry(true);
        await start;

        expect(game.nextTurn).toHaveBeenCalledTimes(1);
        expect(mechanics.updateTurnEndSystems).toHaveBeenCalledTimes(1);
    });

    test('does not advance turn logic until the guard screen is committed', async () => {
        let resolveScreen;
        const screenTransition = new Promise(resolve => {
            resolveScreen = resolve;
        });
        const game = {
            ui: {
                setNavItemStatus: jest.fn(),
                updateRunStats: jest.fn()
            },
            audio: {
                playAmbientByKey: jest.fn()
            },
            events: {
                switchScreen: jest.fn(() => screenTransition)
            },
            nextTurn: jest.fn(),
            randomEvents: null
        };
        const mechanics = new GameMechanicsManager(game);
        mechanics.updateTurnEndSystems = jest.fn();

        const start = mechanics.startNextDay();
        await Promise.resolve();

        expect(game.events.switchScreen).toHaveBeenCalledWith('game', {
            force: true,
            lockNav: false
        });
        expect(game.nextTurn).not.toHaveBeenCalled();
        expect(mechanics.updateTurnEndSystems).not.toHaveBeenCalled();

        resolveScreen(true);
        await start;

        expect(game.nextTurn).toHaveBeenCalledTimes(1);
        expect(mechanics.updateTurnEndSystems).toHaveBeenCalledTimes(1);
        expect(game.ui.updateRunStats).toHaveBeenCalledWith(State);
    });
});
