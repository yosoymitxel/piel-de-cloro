import { State } from '../js/State.js';
import { NPC } from '../js/NPC.js';
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { LoreManager } from '../js/LoreManager.js';
import { LoreData } from '../js/LoreData.js';
import { ModalManager } from '../js/ModalManager.js';

describe('Lore Danger System Deep Tests', () => {
    let gameMock, uiMock, audioMock, endingsMock, chainable;

    beforeEach(() => {
        State.reset();
        State.admittedNPCs = [];

        // Stub jQuery for LoreManager and ModalManager
        chainable = {
            removeClass: jest.fn().mockReturnThis(),
            addClass: jest.fn().mockReturnThis(),
            attr: jest.fn().mockReturnThis(),
            text: jest.fn().mockReturnThis(),
            html: jest.fn().mockReturnThis(),
            off: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            empty: jest.fn().mockReturnThis(),
            append: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis(),
            children: jest.fn().mockReturnThis(),
            not: jest.fn().mockReturnThis(),
            remove: jest.fn().mockReturnThis(),
            parent: jest.fn().mockReturnThis(),
            show: jest.fn().mockReturnThis(),
            hide: jest.fn().mockReturnThis(),
            fadeIn: jest.fn().mockReturnThis(),
            fadeOut: jest.fn().mockReturnThis(),
            css: jest.fn().mockReturnThis(),
            animate: jest.fn().mockReturnThis(),
            stop: jest.fn().mockReturnThis(),
            length: 1,
            val: jest.fn().mockReturnThis()
        };
        global.$ = jest.fn().mockReturnValue(chainable);

        uiMock = {
            showLore: jest.fn(),
            showScreen: jest.fn(),
            setNavItemStatus: jest.fn(),
            timings: { loreFadeOut: 500 },
            elements: {
                modal: chainable,
                modalStats: chainable,
                modalStatsContent: chainable,
                modalName: chainable,
                modalTrait: chainable,
                modalStatus: chainable,
                modalLog: chainable,
                modalPurgeBtn: chainable,
                modalTests: chainable,
                modalError: chainable,
                msgModal: chainable,
                msgContent: chainable,
                confirmModal: chainable,
                confirmContent: chainable
            },
            renderAvatar: jest.fn().mockReturnValue({
                append: jest.fn(),
                addClass: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                css: jest.fn().mockReturnThis()
            }),
            clearModalError: jest.fn(),
            translateValue: jest.fn().mockImplementation((key, val) => val),
            showMessage: jest.fn(),
            updateRunStats: jest.fn(),
            showFeedback: jest.fn()
        };

        audioMock = {
            playSFXByKey: jest.fn(),
            playLoreByKey: jest.fn(),
            duckAmbient: jest.fn(),
            stopLore: jest.fn(),
            playAmbientByKey: jest.fn(),
            levels: { ambient: 0.5 }
        };

        endingsMock = {
            triggerEnding: jest.fn(),
            loreNPCName: null
        };

        gameMock = {
            ui: uiMock,
            audio: audioMock,
            endings: endingsMock,
            updateHUD: jest.fn()
        };
    });

    describe('NPC Metadata and Lore Identification', () => {
        test('Lore subjects gain the "ANOMALÍA" badge and correct uniqueType', () => {
            const loreNPC = new NPC(null, { isLore: true });

            expect(loreNPC.uniqueType).toBe('lore');
            expect(loreNPC.uniqueBadge).toBeDefined();
            expect(loreNPC.uniqueBadge.label).toBe('ANOMALÍA');
            expect(loreNPC.uniqueBadge.color).toBe('alert');
            expect(loreNPC.uniqueBadge.icon).toBe('fa-skull-crossbones');
        });

        test('Normal subjects do not have uniqueType or uniqueBadge', () => {
            const normalNPC = new NPC(null, { isLore: false });

            expect(normalNPC.uniqueType).toBeNull();
            expect(normalNPC.uniqueBadge).toBeNull();
        });
    });

    describe('Danger Probabilities (checkLoreNPCDanger)', () => {
        let gmm;
        beforeEach(() => {
            gmm = new GameMechanicsManager(gameMock);
        });

        test('Death is triggered with 80% probability for a lore NPC', () => {
            const loreNPC = new NPC(null, { isLore: true });
            State.admittedNPCs = [loreNPC];

            // Mock Math.random to return 0.79 (just below 0.8)
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0.79);

            const result = gmm.checkLoreNPCDanger();

            expect(result.triggered).toBe(true);
            expect(result.loreNPC).toBe(loreNPC);
            expect(result.count).toBe(1);

            spy.mockRestore();
        });

        test('Survival occurs with 20% probability and increments streak', () => {
            const loreNPC = new NPC(null, { isLore: true });
            State.admittedNPCs = [loreNPC];

            // Mock Math.random to return 0.81 (just above 0.8)
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0.81);

            const result = gmm.checkLoreNPCDanger();

            expect(result.triggered).toBe(false);
            expect(result.survived).toBe(true);
            expect(State.loreSurvivalStreak).toBe(1);

            spy.mockRestore();
        });

        test('Multiple lore NPCs increase death probability (collector ending trigger)', () => {
            const lore1 = new NPC(null, { isLore: true });
            const lore2 = new NPC(null, { isLore: true });
            State.admittedNPCs = [lore1, lore2];

            // Trigger death with the first one
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0.1);
            const result = gmm.checkLoreNPCDanger();

            expect(result.triggered).toBe(true);
            expect(result.count).toBe(2);

            spy.mockRestore();
        });
    });

    describe('LoreManager Content Processing', () => {
        let lm;
        beforeEach(() => {
            lm = new LoreManager(uiMock, audioMock);
            uiMock.game = gameMock;
        });

        test('{loreName} replacement in content', () => {
            LoreData.test_lore = {
                title: 'Test',
                content: 'Hello {loreName}',
                type: 'normal'
            };

            lm.showLore('test_lore', null, { loreName: 'Vargas' });

            expect(chainable.html).toHaveBeenCalledWith(expect.stringContaining('Hello Vargas'));
        });

        test('Newline conversion to <br> tags', () => {
            LoreData.test_nl = {
                title: 'Test',
                content: 'Line 1\nLine 2',
                type: 'normal'
            };

            lm.showLore('test_nl');

            expect(chainable.html).toHaveBeenCalledWith(expect.stringContaining('Line 1<br>Line 2'));
        });
    });

    describe('Sleep Integration', () => {
        let gmm;
        beforeEach(() => {
            gmm = new GameMechanicsManager(gameMock);
        });

        test('Sleep triggers final_lore_assimilation when 1 lore NPC kills player', () => {
            const loreNPC = new NPC(null, { isLore: true });
            loreNPC.name = 'Target';
            State.admittedNPCs = [loreNPC];

            jest.spyOn(Math, 'random').mockReturnValue(0.1); // Force death

            gmm.sleep();

            expect(endingsMock.triggerEnding).toHaveBeenCalledWith('final_lore_assimilation');
            expect(endingsMock.loreNPCName).toBe('Target');
        });

        test('Sleep triggers final_lore_collector when surviving with 2+ lore NPCs', () => {
            const lore1 = new NPC(null, { isLore: true });
            const lore2 = new NPC(null, { isLore: true });
            State.admittedNPCs = [lore1, lore2];

            jest.spyOn(Math, 'random').mockReturnValue(0.1); // Force death on first one

            gmm.sleep();

            expect(endingsMock.triggerEnding).toHaveBeenCalledWith('final_lore_collector');
        });
    });

    describe('Modal Warnings', () => {
        let mm;
        beforeEach(() => {
            mm = new ModalManager(uiMock, audioMock);
        });

        test('Lore NPC shows danger warning in modal', () => {
            const loreNPC = new NPC(null, { isLore: true });

            mm.openModal(loreNPC);

            // The warning section is created via $(html) and then appended
            // So we check jQuery constructor calls
            const jqueryCalls = global.$.mock.calls;
            const hasWarning = jqueryCalls.some(args => args[0] && typeof args[0] === 'string' && args[0].includes('ADVERTENCIA DE ANOMAL\u00cdA'));
            const hasProb = jqueryCalls.some(args => args[0] && typeof args[0] === 'string' && args[0].includes('80% LETAL'));

            expect(hasWarning).toBe(true);
            expect(hasProb).toBe(true);
        });

        test('Normal NPC does not show danger warning in modal', () => {
            const normalNPC = new NPC(null, { isLore: false });

            mm.openModal(normalNPC);

            const jqueryCalls = global.$.mock.calls;
            const hasWarning = jqueryCalls.some(args => args[0] && typeof args[0] === 'string' && args[0].includes('ADVERTENCIA DE ANOMAL\u00cdA'));
            expect(hasWarning).toBe(false);
        });
    });
});
