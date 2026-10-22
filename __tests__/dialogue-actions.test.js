import { DialogueActions } from '../js/DialogueActions.js';

describe('DialogueActions domain dispatch', () => {
    test('dispatches admit and reject directly through the game action API', () => {
        const handleDecision = jest.fn();
        const game = { actions: { handleDecision } };

        expect(DialogueActions.admit(game)).toBe(true);
        expect(DialogueActions.ignore(game)).toBe(true);
        expect(handleDecision.mock.calls).toEqual([['admit'], ['ignore']]);
    });

    test('does not query or click DOM buttons when no decision handler exists', () => {
        const previousDocument = globalThis.document;
        const getElementById = jest.fn();
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        globalThis.document = { getElementById };

        try {
            expect(DialogueActions.admit({})).toBe(false);
            expect(DialogueActions.ignore({})).toBe(false);
            expect(getElementById).not.toHaveBeenCalled();
        } finally {
            warn.mockRestore();
            if (previousDocument === undefined) delete globalThis.document;
            else globalThis.document = previousDocument;
        }
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
