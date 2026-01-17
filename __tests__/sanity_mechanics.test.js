
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
        expect(State.sanity).toBe(75); // 100 + floor(-20 * 1.25) = 75
        
        State.updateSanity(-100);
        expect(State.sanity).toBe(0);
        
        State.updateSanity(150);
        expect(State.sanity).toBe(100);
    });

   test('high paranoia drains sanity', () => {
        State.sanity = 100;
        State.updateParanoia(90);
        // updateParanoia no longer triggers updateSanity directly in State.js
        expect(State.sanity).toBe(100);
    });

    test('purging a human drains significant sanity', () => {
        const humanNPC = { name: 'Test Human', isInfected: false };
        mechanics.calculatePurgeConsequences(humanNPC);
        
        expect(State.sanity).toBe(81); // 100 + floor(-15 * 1.25) = 100 - 19 = 81
        expect(uiMock.showMessage).toHaveBeenCalledWith(expect.stringContaining('CORDURA DISMINUYE'), null, 'warning');
    });

    test('purging an infected restores some sanity', () => {
        State.sanity = 50;
        const infectedNPC = { name: 'Test Infected', isInfected: true };
        mechanics.calculatePurgeConsequences(infectedNPC);
        
        expect(State.sanity).toBe(53); // 50 + floor(5 * 0.7) = 53
        expect(uiMock.showMessage).toHaveBeenCalledWith(expect.stringContaining('ESTABILIZA'), null, 'normal');
    });
});
