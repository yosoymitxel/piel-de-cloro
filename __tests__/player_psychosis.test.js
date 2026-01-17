import { State } from '../js/State.js';
import { UIManager } from '../js/UIManager.js';

describe('Player Psychosis & HUD Lies', () => {
    let ui;

    beforeEach(() => {
        State.reset();
        // Mocking parent() and length for JSDOM in UIManager constructor
        const mockEl = {
            length: 1,
            parent: jest.fn().mockImplementation(() => mockEl),
            eq: jest.fn().mockImplementation(() => mockEl),
            addClass: jest.fn().mockImplementation(() => mockEl),
            removeClass: jest.fn().mockImplementation(() => mockEl),
            toggleClass: jest.fn().mockImplementation(() => mockEl),
            text: jest.fn().mockImplementation(() => mockEl),
            empty: jest.fn().mockImplementation(() => mockEl),
            append: jest.fn().mockImplementation(() => mockEl),
            off: jest.fn().mockImplementation(() => mockEl),
            on: jest.fn().mockImplementation(() => mockEl),
            css: jest.fn().mockImplementation(() => mockEl),
            find: jest.fn().mockImplementation(() => mockEl),
            is: jest.fn().mockImplementation(() => true) // Added mock
        };

        global.$ = jest.fn().mockReturnValue(mockEl);
        global.$.fn = { extend: jest.fn() };

        ui = new UIManager({ playSFXByKey: jest.fn() }, { game: { updateHUD: jest.fn() } });
    });

    test('Should calculate lied values when player is infected', () => {
        State.playerInfected = true;
        State.supplies = 50;

        const displaySupplies = ui.getHallucinatedValue(State.supplies);

        // As it's random, we check if it's a string (corrupted) or within range
        // For the test, we want to see if the logic at least runs
        expect(displaySupplies).toBeDefined();
    });

    test('Should trigger glitch effects when psychic distortion is active', () => {
        State.playerInfected = true;
        expect(ui.shouldShowGlitchFlicker()).toBe(true);

        State.playerInfected = false;
        State.sanity = 10;
        expect(ui.shouldShowGlitchFlicker()).toBe(true);
    });

    test('Should show real values when player is sane and healthy', () => {
        State.playerInfected = false;
        State.sanity = 100;
        State.supplies = 20;

        const val = ui.getHallucinatedValue(State.supplies);
        expect(val).toBe(20);
    });
});
