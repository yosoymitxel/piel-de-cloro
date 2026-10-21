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
});
