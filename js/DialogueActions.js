import { State } from './State.js';

const resolveGame = (game) => game || (typeof window !== 'undefined' ? window.game : null);

const dispatchDecision = (decision, game) => {
    const runtime = resolveGame(game);
    if (typeof runtime?.actions?.handleDecision !== 'function') {
        console.warn(`Dialogue decision "${decision}" ignored: game action handler is unavailable.`);
        return false;
    }
    runtime.actions.handleDecision(decision);
    return true;
};

const dispatchInspection = (tool, game) => {
    const runtime = resolveGame(game);
    if (typeof runtime?.actions?.inspect === 'function') {
        runtime.actions.inspect(tool);
        return true;
    }
    if (typeof runtime?.inspect === 'function') {
        runtime.inspect(tool);
        return true;
    }
    console.warn(`Dialogue inspection "${tool}" ignored: inspection handler is unavailable.`);
    return false;
};

/**
 * Dialogue actions are domain commands. They must not simulate user clicks or
 * depend on DOM button IDs, so the same actions can be reused by other screens.
 */
export const DialogueActions = {
    ignore: (game) => dispatchDecision('ignore', game),
    admit: (game) => dispatchDecision('admit', game),
    testUV: (game) => dispatchInspection('flashlight', game),
    testThermo: (game) => dispatchInspection('thermometer', game),
    testPulse: (game) => dispatchInspection('pulse', game),
    testPupils: (game) => dispatchInspection('pupils', game),
    test: (game) => dispatchInspection('flashlight', game),
    giveSupplies: (game) => {
        const amount = 2;
        if (typeof State.updateSupplies !== 'function') return false;
        State.updateSupplies(amount);
        State.addLogEntry('success', `Obtenido: ${amount} suministros`, { icon: 'fa-box-open' });
        return true;
    },
    giveFuel: (game) => {
        const amount = 1;
        if (typeof State.updateFuel !== 'function') return false;
        State.updateFuel(amount);
        State.addLogEntry('success', `Obtenido: ${amount} combustible`, { icon: 'fa-gas-pump' });
        return true;
    },
    giveLoreItem: (game, itemId, label = 'Nota Recuperada') => {
        State.addLogEntry('lore', `OBJETO: Has obtenido "${label}".`, { icon: 'fa-file-lines' });
        if (itemId) State.setFlag(`has_item_${itemId}`, true);
        return true;
    },
    unlockRumor: (game, text) => {
        State.addLogEntry('rumor', text);
        return true;
    }
};

export const act = DialogueActions;
