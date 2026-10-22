import { State } from './State.js';

/**
 * Coordinates a dialogue choice with its game effects.
 * Validation is side-effect-free; the selected action runs while the encounter
 * is still active, and only then does the conversation commit its transition.
 */
export class DialogueInteractionCoordinator {
    static choose({ npc, choice, game = null, audio = null, onEvidence = null, onSecurityCheck = null } = {}) {
        if (!npc?.conversation) return { error: 'No hay una conversación activa.' };

        const validation = npc.conversation.validateChoice(choice);
        if (validation.error) return { error: validation.error };
        const option = validation.option;
        npc.dialogueStarted = true;

        // No effects run until the engine confirms that this exact choice is valid.
        try {
            onSecurityCheck?.();
        } catch (error) {
            console.warn('Dialogue security check failed:', error);
        }

        if (option.log) {
            try {
                onEvidence?.(option.log);
            } catch (error) {
                console.warn('Dialogue evidence logging failed:', error);
            }
        }

        if (option.audio && audio && !option.audio.startsWith('lore_')) {
            audio.playSFXByKey(option.audio, { volume: 0.6 });
        }

        // Inspections and admit/reject actions need the active NPC/encounter.
        if (typeof option.onclick === 'function') {
            try {
                option.onclick(game || (typeof window !== 'undefined' ? window.game : null));
            } catch (error) {
                console.warn('Dialogue action failed:', error);
            }
        }

        // Admit/reject may leave the encounter immediately. Do not advance a
        // conversation whose NPC is no longer active.
        if (State.currentNPC !== npc) {
            return { option, interrupted: true };
        }

        const response = npc.conversation.getNextDialogue(choice);
        if (response.error) return { error: response.error };

        return { option, response, interrupted: false };
    }
}
