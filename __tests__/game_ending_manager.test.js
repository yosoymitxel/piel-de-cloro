import { GameEndingManager } from '../js/GameEndingManager.js';
import { State } from '../js/State.js';

describe('GameEndingManager', () => {
    beforeEach(() => {
        State.reset();
        State.unlockedEndings = [];
    });

    test('only the first ending request can enqueue a final sequence', () => {
        const ui = {
            hideFeedback: jest.fn(),
            setNavLocked: jest.fn(),
            triggerFullscreenProtocol: jest.fn()
        };
        const orchestrator = {
            clear: jest.fn(),
            add: jest.fn()
        };
        const game = {
            ui,
            audio: { playSFXByKey: jest.fn(), stopAmbient: jest.fn() },
            orchestrator,
            events: { switchScreen: jest.fn() }
        };
        const endings = new GameEndingManager(game);

        expect(endings.triggerEnding('final_clean')).toBe(true);
        expect(endings.triggerEnding('final_corrupted')).toBe(false);

        expect(orchestrator.clear).toHaveBeenCalledTimes(1);
        expect(orchestrator.add).toHaveBeenCalledTimes(4);
        expect(State.unlockedEndings).toEqual(['final_clean']);
        expect(game.lastEndingId).toBe('final_clean');
    });
});
