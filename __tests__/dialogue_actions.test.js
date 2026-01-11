
import { DialogueActions, act } from '../js/DialogueActions.js';

describe('DialogueActions', () => {
    let mockGame;
    let mockBtnIgnore;
    let mockBtnAdmit;

    beforeEach(() => {
        mockBtnIgnore = { click: jest.fn() };
        mockBtnAdmit = { click: jest.fn() };
        
        // Mock document.getElementById
        global.document.getElementById = jest.fn((id) => {
            if (id === 'btn-ignore') return mockBtnIgnore;
            if (id === 'btn-admit') return mockBtnAdmit;
            return null;
        });

        mockGame = {
            inspect: jest.fn()
        };
        global.window.game = mockGame;
    });

    test('ignore calls click on btn-ignore', () => {
        DialogueActions.ignore();
        expect(mockBtnIgnore.click).toHaveBeenCalled();
    });

    test('admit calls click on btn-admit', () => {
        DialogueActions.admit();
        expect(mockBtnAdmit.click).toHaveBeenCalled();
    });

    test('testUV calls game.inspect with flashlight', () => {
        DialogueActions.testUV();
        expect(mockGame.inspect).toHaveBeenCalledWith('flashlight');
    });

    test('testThermo calls game.inspect with thermometer', () => {
        DialogueActions.testThermo();
        expect(mockGame.inspect).toHaveBeenCalledWith('thermometer');
    });

    test('testPulse calls game.inspect with pulse', () => {
        DialogueActions.testPulse();
        expect(mockGame.inspect).toHaveBeenCalledWith('pulse');
    });

    test('testPupils calls game.inspect with pupils', () => {
        DialogueActions.testPupils();
        expect(mockGame.inspect).toHaveBeenCalledWith('pupils');
    });

    test('act is an alias for DialogueActions', () => {
        expect(act).toBe(DialogueActions);
    });
});
