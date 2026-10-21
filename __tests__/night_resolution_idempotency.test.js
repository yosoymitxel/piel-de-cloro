import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { State } from '../js/State.js';

describe('Night resolution idempotency', () => {
    beforeEach(() => State.reset());

    test('a second sleep request cannot trigger a second ending in the same night', () => {
        const endings = { triggerEnding: jest.fn() };
        const game = {
            audio: { playSFXByKey: jest.fn() },
            endings
        };
        const mechanics = new GameMechanicsManager(game);
        mechanics.checkLoreNPCDanger = () => ({
            triggered: true,
            count: 1,
            loreNPC: { name: 'Sujeto de prueba' }
        });
        State.isNight = true;

        mechanics.sleep();
        mechanics.sleep();

        expect(endings.triggerEnding).toHaveBeenCalledTimes(1);
        expect(endings.triggerEnding).toHaveBeenCalledWith('final_lore_assimilation');
        expect(State.lastNight.resolutionStarted).toBe(true);
    });

    test('sleep requests outside the night phase are ignored', () => {
        const endings = { triggerEnding: jest.fn() };
        const game = { audio: { playSFXByKey: jest.fn() }, endings };
        const mechanics = new GameMechanicsManager(game);
        mechanics.checkLoreNPCDanger = jest.fn();
        State.isNight = false;

        mechanics.sleep();

        expect(mechanics.checkLoreNPCDanger).not.toHaveBeenCalled();
        expect(endings.triggerEnding).not.toHaveBeenCalled();
    });

    test('concurrent night phase requests schedule one transition and one intrusion pass', async () => {
        const game = {
            audio: {
                levels: { ambient: 0.3 },
                playAmbientByKey: jest.fn()
            },
            ui: {
                clearAllNavStatuses: jest.fn(),
                renderNightScreen: jest.fn()
            },
            events: {
                switchScreen: jest.fn(async (_screen, options) => options.renderFn())
            }
        };
        const mechanics = new GameMechanicsManager(game);
        mechanics.processIntrusions = jest.fn();

        const results = await Promise.all([
            mechanics.startNightPhase(),
            mechanics.startNightPhase()
        ]);

        expect(results.filter(Boolean)).toHaveLength(1);
        expect(game.events.switchScreen).toHaveBeenCalledTimes(1);
        expect(mechanics.processIntrusions).toHaveBeenCalledTimes(1);
        expect(game.ui.renderNightScreen).toHaveBeenCalledTimes(1);
        expect(State.lastNight.transitionStarted).toBe(true);
    });

    test('a terminal ending prevents the night transition from starting', async () => {
        State.endingTriggered = true;
        const game = {
            audio: { levels: { ambient: 0.3 }, playAmbientByKey: jest.fn() },
            ui: { clearAllNavStatuses: jest.fn(), renderNightScreen: jest.fn() },
            events: { switchScreen: jest.fn() }
        };
        const mechanics = new GameMechanicsManager(game);

        await expect(mechanics.startNightPhase()).resolves.toBe(false);
        expect(game.events.switchScreen).not.toHaveBeenCalled();
        expect(State.lastNight.transitionStarted).toBe(false);
    });


    test('a failed screen transition releases the guard for a retry', async () => {
        const switchScreen = jest.fn()
            .mockRejectedValueOnce(new Error('render failed'))
            .mockResolvedValueOnce(undefined);
        const game = {
            audio: {
                levels: { ambient: 0.3 },
                playAmbientByKey: jest.fn()
            },
            ui: {
                clearAllNavStatuses: jest.fn(),
                renderNightScreen: jest.fn()
            },
            events: { switchScreen }
        };
        const mechanics = new GameMechanicsManager(game);
        mechanics.processIntrusions = jest.fn();

        await expect(mechanics.startNightPhase()).rejects.toThrow('render failed');
        expect(State.lastNight.transitionStarted).toBe(false);
        await expect(mechanics.startNightPhase()).resolves.toBe(true);
        expect(switchScreen).toHaveBeenCalledTimes(2);
        expect(mechanics.processIntrusions).toHaveBeenCalledTimes(1);
    });

});
