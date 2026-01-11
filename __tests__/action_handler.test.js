
import { GameActionHandler } from '../js/game/GameActionHandler.js';
import { State } from '../js/State.js';

describe('GameActionHandler', () => {
    let handler;
    let mockGame;
    let mockUI;
    let mockAudio;
    let mockNPC;

    beforeEach(() => {
        State.reset();
        
        mockUI = {
            showFeedback: jest.fn(),
            updateHUD: jest.fn(),
            updateInspectionTools: jest.fn(),
            applyVHS: jest.fn(),
            animateToolThermometer: jest.fn(),
            animateToolFlashlight: jest.fn(),
            animateToolPupils: jest.fn(),
            animateToolPulse: jest.fn(),
            translateValue: jest.fn((key, val) => val),
            hideOmitOption: jest.fn(),
            showValidationGate: jest.fn(),
            showMessage: jest.fn(),
            openRelocationModal: jest.fn(),
            setNavLocked: jest.fn(),
            updateRunStats: jest.fn()
        };

        mockAudio = {
            playSFXByKey: jest.fn()
        };

        mockGame = {
            ui: mockUI,
            audio: mockAudio,
            isAnimating: false,
            updateHUD: jest.fn(),
            checkSecurityDegradation: jest.fn(),
            nextTurn: jest.fn(),
            openShelter: jest.fn(),
            sleep: jest.fn(),
            finishRun: jest.fn(),
            relocateShelter: jest.fn(),
            startNextDay: jest.fn()
        };

        handler = new GameActionHandler(mockGame);

        mockNPC = {
            name: 'Test NPC',
            scanCount: 0,
            revealedStats: [],
            attributes: {
                temperature: 36.5,
                skinTexture: 'normal',
                pupils: 'normal',
                pulse: 70
            },
            isInfected: false,
            initDayAfterStatus: jest.fn()
        };
        State.currentNPC = mockNPC;

        // Mock jQuery for confirmRelocation
        global.$ = jest.fn(() => ({
            addClass: jest.fn().mockReturnThis()
        }));
    });

    describe('inspect', () => {
        test('inspect does nothing if game is animating', () => {
            mockGame.isAnimating = true;
            handler.inspect('thermometer');
            expect(mockUI.showFeedback).not.toHaveBeenCalled();
        });

        test('inspect fails if generator is off', () => {
            State.generator.isOn = false;
            handler.inspect('thermometer');
            expect(mockUI.showFeedback).toHaveBeenCalledWith("GENERADOR APAGADO: ACCIÓN IMPOSIBLE", "red");
        });

        test('inspect fails if energy limit reached (normal mode)', () => {
            State.generator.mode = 'normal';
            mockNPC.scanCount = 2;
            handler.inspect('thermometer');
            expect(mockUI.showFeedback).toHaveBeenCalledWith("ENERGÍA INSUFICIENTE PARA ESTE TURNO", "yellow");
        });

        test('inspect fails if already tested', () => {
            mockNPC.revealedStats = ['temperature'];
            handler.inspect('thermometer');
            expect(mockUI.showFeedback).toHaveBeenCalledWith("TEST YA REALIZADO", "yellow");
        });

        test('thermometer inspection updates state and UI', (done) => {
            handler.inspect('thermometer');
            
            expect(mockGame.isAnimating).toBe(true);
            expect(mockNPC.scanCount).toBe(1);
            expect(mockNPC.revealedStats).toContain('temperature');
            expect(mockUI.animateToolThermometer).toHaveBeenCalledWith(36.5);
            expect(mockAudio.playSFXByKey).toHaveBeenCalledWith('tool_thermometer_beep', expect.anything());
            
            setTimeout(() => {
                expect(mockGame.isAnimating).toBe(false);
                done();
            }, 2300);
        });
    });

    describe('handleDecision', () => {
        test('admit decision adds NPC to admitted list', () => {
            mockNPC.scanCount = 1;
            handler.handleDecision('admit');
            expect(State.admittedNPCs).toContain(mockNPC);
            expect(mockGame.nextTurn).toHaveBeenCalled();
        });

        test('ignore decision adds NPC to ignored list and increases paranoia', () => {
            mockNPC.scanCount = 1;
            mockNPC.isInfected = true;
            const initialParanoia = State.paranoia;
            
            handler.handleDecision('ignore');
            
            expect(State.ignoredNPCs).toContain(mockNPC);
            expect(State.paranoia).toBe(initialParanoia + 10);
            expect(mockGame.nextTurn).toHaveBeenCalled();
        });

        test('shows validation gate if no action taken yet', () => {
            mockNPC.scanCount = 0;
            mockNPC.dialogueStarted = false;
            handler.handleDecision('admit');
            expect(mockUI.showValidationGate).toHaveBeenCalledWith(mockNPC);
            expect(mockGame.nextTurn).not.toHaveBeenCalled();
        });
    });

    describe('relocateShelter', () => {
        test('relocateShelter with no admitted NPCs confirms immediately', () => {
            State.admittedNPCs = [];
            const spy = jest.spyOn(handler, 'confirmRelocation').mockImplementation(() => {});
            handler.relocateShelter();
            expect(spy).toHaveBeenCalledWith([]);
        });

        test('relocateShelter with admitted NPCs opens modal', () => {
            const npc = { name: 'Refugee' };
            State.admittedNPCs = [npc];
            handler.relocateShelter();
            expect(mockUI.openRelocationModal).toHaveBeenCalledWith([npc], expect.any(Function));
        });
    });

    describe('confirmRelocation', () => {
        test('confirmRelocation updates state and decreases paranoia', () => {
            const npc1 = { name: 'Stay' };
            const npc2 = { name: 'Leave' };
            State.admittedNPCs = [npc1, npc2];
            State.paranoia = 50;
            
            handler.confirmRelocation([npc1]);
            
            expect(State.admittedNPCs).toEqual([npc1]);
            expect(State.departedNPCs).toContain(npc2);
            expect(State.paranoia).toBe(20);
            expect(mockUI.showMessage).toHaveBeenCalled();
        });
    });
});
