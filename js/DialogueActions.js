/**
 * Centralized dialogue actions for the game.
 * These actions are triggered by dialogue options.
 */
import { State } from './State.js';

export const DialogueActions = {
    ignore: (game) => {
        const g = game || window.game;
        if (g && g.actions) g.actions.handleDecision('ignore');
        else document.getElementById('btn-ignore')?.click();
    },
    admit: (game) => {
        const g = game || window.game;
        if (g && g.actions) g.actions.handleDecision('admit');
        else document.getElementById('btn-admit')?.click();
    },
    testUV: (game) => {
        const g = game || window.game;
        if (g && g.actions) g.actions.inspect('flashlight');
        else window.game?.inspect('flashlight');
    },
    testThermo: (game) => {
        const g = game || window.game;
        if (g && g.actions) g.actions.inspect('thermometer');
        else window.game?.inspect('thermometer');
    },
    testPulse: (game) => {
        const g = game || window.game;
        if (g && g.actions) g.actions.inspect('pulse');
        else window.game?.inspect('pulse');
    },
    testPupils: (game) => {
        const g = game || window.game;
        if (g && g.actions) g.actions.inspect('pupils');
        else window.game?.inspect('pupils');
    },
    test: (game) => {
        const g = game || window.game;
        if (g && g.actions) g.actions.inspect('flashlight');
        else window.game?.inspect('flashlight');
    },
    giveSupplies: (game) => {
        const g = game || window.game;
        // Assuming updateSupplies exists in State
        const amount = 2; // Fixed amount for now, could be dynamic
        // We need to access State directly, assuming it's available globally or we import it.
        // Actually DialogueActions usually don't import State directly to avoid cycles?
        // Let's rely on Game to expose a method or access State via global if needed.
        if (typeof State !== 'undefined' && State.updateSupplies) {
            State.updateSupplies(amount);
            State.addLogEntry('success', `Obtenido: ${amount} suministros`, { icon: 'fa-box-open' });
        }
    },
    giveFuel: (game) => {
        // Similar for fuel
        const amount = 1;
        if (typeof State !== 'undefined' && State.updateFuel) {
            State.updateFuel(amount);
            State.addLogEntry('success', `Obtenido: ${amount} combustible`, { icon: 'fa-gas-pump' });
        }
    },
    giveLoreItem: (game, itemId, label = "Nota Recuperada") => {
        if (typeof State !== 'undefined') {
            State.addLogEntry('lore', `OBJETO: Has obtenido "${label}".`, { icon: 'fa-file-lines' });
            // Unlock lore entry or ending based on itemId if needed
            if (itemId) State.setFlag(`has_item_${itemId}`, true);
        }
    },
    unlockRumor: (game, text) => {
        if (typeof State !== 'undefined') {
            State.addLogEntry('rumor', text);
        }
    }
};

// Also export as 'act' for compatibility with DialogueData and pools
export const act = DialogueActions;
