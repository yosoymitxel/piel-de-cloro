import { DialogueActions } from '../js/DialogueActions.js';

describe('DialogueActions domain dispatch', () => {
    test('dispatches admit and reject directly through the game action API', () => {
        const handleDecision = jest.fn();
        const game = { actions: { handleDecision } };

        expect(DialogueActions.admit(game)).toBe(true);
        expect(DialogueActions.ignore(game)).toBe(true);
        expect(handleDecision.mock.calls).toEqual([['admit'], ['ignore']]);
    });

    test('does not click DOM buttons when no decision handler exists', () => {
        const click = jest.fn();
        document.body.innerHTML = '<button id="btn-admit"></button><button id="btn-ignore"></button>';
        document.getElementById('btn-admit').addEventListener('click', click);
        document.getElementById('btn-ignore').addEventListener('click', click);

        expect(DialogueActions.admit({})).toBe(false);
        expect(DialogueActions.ignore({})).toBe(false);
        expect(click).not.toHaveBeenCalled();
    });

    test('dispatches inspections through the shared game API', () => {
        const inspect = jest.fn();
        const game = { actions: { inspect } };

        DialogueActions.testPupils(game);
        DialogueActions.testThermo(game);
        DialogueActions.testPulse(game);
        DialogueActions.testUV(game);

        expect(inspect.mock.calls).toEqual([
            ['pupils'],
            ['thermometer'],
            ['pulse'],
            ['flashlight']
        ]);
    });
});
