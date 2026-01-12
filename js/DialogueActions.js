/**
 * Centralized dialogue actions for the game.
 * These actions are triggered by dialogue options.
 */
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
    }
};

// Also export as 'act' for compatibility with DialogueData and pools
export const act = DialogueActions;
