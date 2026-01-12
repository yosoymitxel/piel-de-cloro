import { GameActionHandler } from '../js/GameActionHandler.js';
import { State } from '../js/State.js';
import { NPC } from '../js/NPC.js';

describe('Game Action Handler', () => {
    let gah, gameMock, uiMock, audioMock, mechanicsMock;

    beforeEach(() => {
        State.reset();
        
        uiMock = {
            showFeedback: jest.fn(),
            showMessage: jest.fn(),
            updateInspectionTools: jest.fn(),
            updateRunStats: jest.fn(),
            translateValue: jest.fn((type, val) => val),
            applyVHS: jest.fn(),
            hideOmitOption: jest.fn(),
            showValidationGate: jest.fn(),
            closeModal: jest.fn(),
            openRelocationModal: jest.fn()
        };
        
        audioMock = {
            playSFXByKey: jest.fn()
        };
        
        mechanicsMock = {
            checkSecurityDegradation: jest.fn(),
            sleep: jest.fn(),
            finishRun: jest.fn(),
            continueDay: jest.fn()
        };
        
        gameMock = {
            ui: uiMock,
            audio: audioMock,
            mechanics: mechanicsMock,
            updateHUD: jest.fn(),
            nextTurn: jest.fn(),
            isAnimating: false
        };

        gah = new GameActionHandler(gameMock);
    });

    describe('Inspect Action', () => {
        test('inspect blocks if generator is off', () => {
            State.generator.isOn = false;
            State.currentNPC = new NPC();
            
            gah.inspect('thermometer');
            
            expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("GENERADOR APAGADO"), "red");
        });

        test('inspect blocks if energy limit reached', () => {
            State.generator.isOn = true;
            State.generator.mode = 'save';
            State.currentNPC = new NPC();
            State.currentNPC.scanCount = 1; // Limit for save mode
            
            gah.inspect('thermometer');
            
            expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("ENERGÍA INSUFICIENTE"), "yellow");
        });

        test('inspect reveals stat and increases scanCount', () => {
            State.generator.isOn = true;
            State.generator.mode = 'normal';
            State.currentNPC = new NPC();
            State.currentNPC.scanCount = 0;
            
            gah.inspect('thermometer');
            
            expect(State.currentNPC.scanCount).toBe(1);
            expect(State.currentNPC.revealedStats).toContain('temperature');
            expect(mechanicsMock.checkSecurityDegradation).toHaveBeenCalled();
            expect(gameMock.updateHUD).toHaveBeenCalled();
        });

        test('inspect blocks if stat already revealed', () => {
            State.generator.isOn = true;
            State.generator.mode = 'normal';
            State.currentNPC = new NPC();
            State.currentNPC.revealedStats = ['temperature'];
            
            gah.inspect('thermometer');
            
            expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("TEST YA REALIZADO"), "yellow");
        });
    });

    describe('Decision Handling', () => {
        test('handleDecision admit adds NPC to admitted', () => {
            const npc = new NPC();
            State.currentNPC = npc;
            npc.scanCount = 1; // Allow decision
            
            gah.handleDecision('admit');
            
            expect(State.admittedNPCs).toContain(npc);
            expect(gameMock.nextTurn).toHaveBeenCalled();
        });

        test('handleDecision ignore increases paranoia', () => {
            const npc = new NPC(false); // Human
            State.currentNPC = npc;
            npc.scanCount = 1;
            const initialParanoia = State.paranoia;
            
            gah.handleDecision('ignore');
            
            expect(State.ignoredNPCs).toContain(npc);
            expect(State.paranoia).toBe(initialParanoia + 5);
        });

        test('handleDecision blocks if no scan performed', () => {
            const npc = new NPC();
            State.currentNPC = npc;
            npc.scanCount = 0;
            
            gah.handleDecision('admit');
            
            expect(uiMock.showValidationGate).toHaveBeenCalled();
            expect(State.admittedNPCs).not.toContain(npc);
        });
    });
});
