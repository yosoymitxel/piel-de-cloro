
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { State } from '../js/State.js';
import { NPC } from '../js/NPC.js';
import { Conversation } from '../js/DialogueEngine.js';

describe('Fuel System and Refinements', () => {
    let gmm, gameMock, uiMock;

    beforeEach(() => {
        State.reset();
        // State.reset might not have 'fuel', so let's be safe
        State.fuel = 10;
        State.generator.power = 100;
        State.generator.isOn = true;

        uiMock = {
            showFeedback: jest.fn(),
            renderGeneratorRoom: jest.fn(),
            updateGeneratorNavStatus: jest.fn(),
            updateEnergyHUD: jest.fn(),
            updateInspectionTools: jest.fn(),
            updateSecurityNavStatus: jest.fn(),
            renderSecurityRoom: jest.fn(),
            clearAllNavStatuses: jest.fn(),
            renderNightScreen: jest.fn()
        };
        gameMock = {
            ui: uiMock,
            audio: {
                playSFXByKey: jest.fn(),
                playAmbientByKey: jest.fn(),
                stopSFX: jest.fn(),
                levels: { ambient: 0.5 }
            },
            events: {
                switchScreen: jest.fn(),
                navigateToMap: jest.fn()
            },
            updateHUD: jest.fn()
        };
        gmm = new GameMechanicsManager(gameMock);
    });

    test('Generator failure keeps 40% power', () => {
        State.generator.power = 80;
        gmm.triggerGeneratorFailure();
        expect(State.generator.isOn).toBe(false);
        expect(State.generator.power).toBe(32); // 80 * 0.4
    });

    test('Night resolution consumes fuel for better recharge', () => {
        State.fuel = 5;
        State.generator.power = 50;

        // Simular ejecución de hooks
        const hooks = gmm.nightResolutionHooks;
        let summary = "";
        hooks.forEach(hook => {
            summary += hook(State);
        });

        expect(State.fuel).toBe(3); // -2
        expect(State.generator.power).toBe(75); // 50 + 25
        expect(summary).toContain("Recarga nocturna completada (-2 combustible)");
    });

    test('Night resolution recharges minimally without fuel', () => {
        State.fuel = 0;
        const hooks = gmm.nightResolutionHooks;
        State.generator.power = 50;

        hooks.forEach(hook => hook(State));

        expect(State.generator.power).toBe(55); // Recharge 5 if fuel 0
    });

    test('DialogueEngine injects End Conversation button when only actions remain', () => {
        const mockNPC = new NPC();
        const mockSet = {
            id: 'test_pool',
            root: 'start',
            nodes: {
                'start': {
                    id: 'start',
                    text: 'Hello',
                    options: [
                        { id: 'scan', label: 'Scan', onclick: 'someAction' }
                    ]
                }
            }
        };

        const conv = new Conversation(mockNPC, mockSet);
        const node = conv.getCurrentNode();

        expect(node.options.length).toBe(2);
        expect(node.options[1].id).toBe('exit_conversation');
        expect(node.options[1].label).toBe('Terminar diálogo');
    });
});
