/**
 * Centralized dialogue actions for the game.
 * These actions are triggered by dialogue options.
 */
export const DialogueActions = {
    ignore: () => document.getElementById('btn-ignore')?.click(),
    admit: () => document.getElementById('btn-admit')?.click(),
    testUV: () => window.game?.inspect('flashlight'),
    testThermo: () => window.game?.inspect('thermometer'),
    testPulse: () => window.game?.inspect('pulse'),
    testPupils: () => window.game?.inspect('pupils'),
    // Generic test action
    test: () => window.game?.inspect('flashlight')
};

// Also export as 'act' for compatibility with DialogueData and pools
export const act = DialogueActions;
