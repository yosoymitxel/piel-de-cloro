
import { State } from '../js/State.js';
import { GameFlowManager } from '../js/game/GameFlowManager.js';
import { NPC } from '../js/NPC.js';

describe('GameFlowManager', () => {
    let flow;
    let mockGame;
    let mockUI;
    let mockAudio;

    beforeEach(() => {
        State.reset();
        
        mockUI = {
            showLore: jest.fn((id, cb) => cb && cb()),
            clearAllNavStatuses: jest.fn(),
            showScreen: jest.fn(),
            updateRunStats: jest.fn(),
            showFeedback: jest.fn(),
            hideFeedback: jest.fn(),
            setNavLocked: jest.fn(),
            renderDialogue: jest.fn(),
            renderNPC: jest.fn(),
            updateSecurityNavStatus: jest.fn()
        };

        mockAudio = {
            playAmbientByKey: jest.fn(),
            playSFXByKey: jest.fn(),
            stopAmbient: jest.fn(),
            levels: { ambient: 0.5 }
        };

        mockGame = {
            ui: mockUI,
            audio: mockAudio,
            generateInitialEntrants: jest.fn(),
            updateGenerator: jest.fn(),
            triggerEnding: jest.fn(),
            nextNPC: jest.fn(),
            attemptDayIntrusion: jest.fn(),
            updateHUD: jest.fn()
        };

        flow = new GameFlowManager(mockGame);
    });

    test('startGame resets state and initializes game', () => {
        flow.startGame();
        expect(mockUI.showLore).toHaveBeenCalledWith('initial', expect.any(Function));
        expect(mockUI.clearAllNavStatuses).toHaveBeenCalled();
        expect(mockAudio.playAmbientByKey).toHaveBeenCalled();
        expect(mockGame.generateInitialEntrants).toHaveBeenCalled();
    });

    test('restartDay clears current day state', () => {
        State.dayTime = 3;
        State.admittedNPCs = [new NPC()];
        
        flow.restartDay();
        
        expect(State.dayTime).toBe(1);
        expect(State.admittedNPCs).toHaveLength(0);
        expect(mockUI.showFeedback).toHaveBeenCalledWith("DÍA REINICIADO", "yellow");
    });

    test('nextTurn triggers ending on high paranoia', () => {
        const spy = jest.spyOn(flow, 'triggerEnding').mockImplementation(() => {});
        State.paranoia = 100;
        flow.nextTurn();
        expect(spy).toHaveBeenCalledWith('final_death_paranoia');
        spy.mockRestore();
    });

    test('nextTurn triggers ending on too many ignored NPCs', () => {
        const spy = jest.spyOn(flow, 'triggerEnding').mockImplementation(() => {});
        State.ignoredNPCs = new Array(15).fill({});
        flow.nextTurn();
        expect(spy).toHaveBeenCalledWith('final_abandonment');
        spy.mockRestore();
    });

    test('nextTurn starts night phase when day is over', () => {
        State.config.dayLength = 5;
        State.dayTime = 6;
        
        // Mock startNightPhase to check if it's called
        const spy = jest.spyOn(flow, 'startNightPhase').mockImplementation(() => {});
        
        flow.nextTurn();
        
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
});
