import { State } from './State.js';

/**
 * Owns the side effects of a player choice at the inspection post.
 * The conversation engine validates and commits the graph transition first;
 * only accepted choices may trigger logs, sounds, security checks or actions.
 */
export class DialogueInteractionCoordinator {
    static choose({ npc, choice, game = null, audio = null, onEvidence = null, onSecurityCheck = null } = {}) {
        if (!npc?.conversation) return { error: 'No hay una conversación activa.' };

        const node = npc.conversation.getCurrentNode();
        if (!node || !Array.isArray(node.options)) return { error: 'No hay opciones disponibles.' };

        const option = node.options[choice];
        if (!option) return { error: 'Opción inválida' };

        // Validation and transition must happen before any external side effect.
        const response = npc.conversation.getNextDialogue(choice);
        if (response.error) return { error: response.error };

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

        if (typeof option.onclick === 'function') {
            try {
                option.onclick(game || (typeof window !== 'undefined' ? window.game : null));
            } catch (error) {
                console.warn('Dialogue action failed:', error);
            }
        }

        return {
            option,
            response,
            interrupted: State.currentNPC !== npc
        };
    }
}
