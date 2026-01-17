
import { State } from '../js/State.js';
import { GameActionHandler } from '../js/GameActionHandler.js';
import { NPC } from '../js/NPC.js';
import { CONSTANTS } from '../js/Constants.js';
import { DialogueData } from '../js/DialogueData.js';
import { jest } from '@jest/globals';

describe('Lore Gamification (Phase 3.2)', () => {
    let handler;
    let gameMock;

    beforeEach(() => {
        State.reset();

        // Mock simple game object
        gameMock = {
            ui: {
                showFeedback: jest.fn(),
                updateInspectionTools: jest.fn(),
                hideFeedback: jest.fn(),
                showMessage: jest.fn(),
                applyVHS: jest.fn(),
                hideOmitOption: jest.fn(),
                translateValue: jest.fn((key, val) => val)
            },
            audio: { playSFXByKey: jest.fn() },
            orchestrator: {
                add: jest.fn((task) => task.execute()) // Execute immediately
            },
            updateHUD: jest.fn(),
            mechanics: { checkSecurityDegradation: jest.fn() },
            isAnimating: false
        };

        handler = new GameActionHandler(gameMock);

        // Ensure we have lore subjects
        DialogueData.loreSubjects = [{
            id: 'lore_test',
            unique: true,
            tags: ['lore'],
            clue: 'Pista de prueba',
            mechanicHint: 'Hint de prueba',
            root: 'root',
            nodes: { 'root': { id: 'root', text: 'txt', options: [] } }
        }];
        State.cycle = 1;
    });

    test('Scanning a Lore NPC should reveal clue when threshold is hit', async () => {
        jest.useFakeTimers();

        // 1. Setup Lore NPC
        const loreNPC = new NPC(null, { isLore: true, loreId: 'lore_test' });
        State.currentNPC = loreNPC;
        State.generator.isOn = true;
        State.generator.power = 100;
        State.generator.mode = 'normal';

        // First scan
        handler.inspect('thermometer');
        jest.runAllTimers(); // Finish animation
        gameMock.isAnimating = false;

        expect(loreNPC.scanCount).toBe(1);
        expect(loreNPC.loreClueRevealed).toBe(false);

        // Second scan (hitting threshold)
        loreNPC.revealedStats = [];
        handler.inspect('flashlight');

        // Threshold check happens at the end of inspect execute block
        // which triggers a 500ms timeout for reveal
        jest.advanceTimersByTime(100); // Trigger inspect completion
        jest.advanceTimersByTime(600); // Trigger lore reveal

        expect(loreNPC.scanCount).toBe(2);
        expect(loreNPC.loreClueRevealed).toBe(true);
        expect(gameMock.ui.showMessage).toHaveBeenCalledWith(
            expect.stringContaining('Pista de prueba'),
            null,
            'info'
        );

        jest.useRealTimers();
    });
});
