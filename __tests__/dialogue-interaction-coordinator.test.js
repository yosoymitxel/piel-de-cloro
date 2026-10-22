import { DialogueInteractionCoordinator } from '../js/DialogueInteractionCoordinator.js';
import { State } from '../js/State.js';

describe('DialogueInteractionCoordinator', () => {
    beforeEach(() => State.reset());

    test('rejects invalid choices before running side effects', () => {
        const sideEffect = jest.fn();
        const npc = {
            conversation: {
                getCurrentNode: () => ({ options: [{ id: 'valid', label: 'Valid' }] }),
                validateChoice: () => ({ error: 'Opción inválida' }),
                getNextDialogue: () => { throw new Error('No debe intentar una transición inválida'); }
            }
        };

        const result = DialogueInteractionCoordinator.choose({
            npc,
            choice: 0,
            onSecurityCheck: sideEffect,
            onEvidence: sideEffect
        });

        expect(result.error).toBe('Opción inválida');
        expect(sideEffect).not.toHaveBeenCalled();
    });

    test('runs option side effects only after the choice validates', () => {
        const calls = [];
        const npc = {
            conversation: {
                getCurrentNode: () => ({
                    options: [{
                        id: 'inspect',
                        label: 'Examinar pupilas',
                        log: { text: 'Reflejo pupilar anómalo', icon: 'fa-eye' },
                        onclick: () => calls.push('action')
                    }]
                }),
                validateChoice: () => ({ option: { id: 'inspect', label: 'Examinar pupilas', log: { text: 'Reflejo pupilar anómalo', icon: 'fa-eye' }, onclick: () => calls.push('action') } }),
                getNextDialogue: () => {
                    calls.push('transition');
                    return { end: true, id: 'inspect' };
                }
            }
        };
        State.currentNPC = npc;

        const result = DialogueInteractionCoordinator.choose({
            npc,
            choice: 0,
            onSecurityCheck: () => calls.push('security'),
            onEvidence: () => calls.push('evidence')
        });

        expect(result.error).toBeUndefined();
        expect(calls).toEqual(['security', 'evidence', 'action', 'transition']);
        expect(result.interrupted).toBe(false);
    });

    test('reports when an accepted action changes the active NPC', () => {
        const npc = {
            conversation: {
                getCurrentNode: () => ({
                    options: [{ id: 'reject', label: 'Rechazar', onclick: () => { State.currentNPC = null; } }]
                }),
                validateChoice: () => ({ option: { id: 'reject', label: 'Rechazar', onclick: () => { State.currentNPC = null; } } }),
                getNextDialogue: () => { throw new Error('No debe avanzar después de salir del encuentro'); }
            }
        };
        State.currentNPC = npc;

        const result = DialogueInteractionCoordinator.choose({ npc, choice: 0 });

        expect(result.interrupted).toBe(true);
    });
});
