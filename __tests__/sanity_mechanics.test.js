
import { State } from '../js/State.js';
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';

describe('Sanity Mechanics', () => {
    let mechanics;
    let uiMock;
    let audioMock;
    let gameMock;

    beforeEach(() => {
        State.sanity = 100;
        State.paranoia = 0;
        
        uiMock = {
            showMessage: jest.fn(),
            updateStats: jest.fn(),
            updateGameActions: jest.fn(),
            updateInspectionTools: jest.fn()
        };
        
        audioMock = {
            playSFXByKey: jest.fn(),
            playAmbientByKey: jest.fn()
        };

        gameMock = {
            ui: uiMock,
            audio: audioMock,
            updateHUD: jest.fn(),
            endings: { triggerEnding: jest.fn() }
        };

        mechanics = new GameMechanicsManager(gameMock);
    });

    test('updateSanity modifies state within bounds', () => {
        State.updateSanity(-20);
        expect(State.sanity).toBe(80);
        
        State.updateSanity(-100);
        expect(State.sanity).toBe(0);
        
        State.updateSanity(150);
        expect(State.sanity).toBe(100);
    });

    test('high paranoia drains sanity', () => {
        State.updateParanoia(90);
        // updateParanoia triggers updateSanity(-1)
        expect(State.sanity).toBe(99);
    });

    test('purging a human drains significant sanity', () => {
        const humanNPC = { name: 'Test Human', isInfected: false };
        mechanics.calculatePurgeConsequences(humanNPC);
        
        expect(State.sanity).toBe(85); // 100 - 15
        expect(uiMock.showMessage).toHaveBeenCalledWith(expect.stringContaining('CORDURA DISMINUYE'), null, 'warning');
    });

    test('purging an infected restores some sanity', () => {
        State.sanity = 50;
        const infectedNPC = { name: 'Test Infected', isInfected: true };
        mechanics.calculatePurgeConsequences(infectedNPC);
        
        expect(State.sanity).toBe(55); // 50 + 5
        expect(uiMock.showMessage).toHaveBeenCalledWith(expect.stringContaining('ESTABILIZA'), null, 'normal');
    });
});
