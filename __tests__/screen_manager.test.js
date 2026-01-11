import { jest } from '@jest/globals';
import { ScreenManager } from '../js/ScreenManager.js';
import { State } from '../js/State.js';

describe('ScreenManager', () => {
    let manager;
    let mockUI;
    let mockScreens;
    let mockElements;

    beforeEach(() => {
        State.reset();
        
        mockScreens = {
            game: { addClass: jest.fn().mockReturnThis(), removeClass: jest.fn().mockReturnThis() },
            start: { addClass: jest.fn().mockReturnThis(), removeClass: jest.fn().mockReturnThis() },
            shelter: { addClass: jest.fn().mockReturnThis(), removeClass: jest.fn().mockReturnThis() },
            morgue: { addClass: jest.fn().mockReturnThis(), removeClass: jest.fn().mockReturnThis() },
            night: { addClass: jest.fn().mockReturnThis(), removeClass: jest.fn().mockReturnThis() }
        };

        mockElements = {
            settingsBtn: { toggleClass: jest.fn().mockReturnThis() },
            sidebar: { toggleClass: jest.fn().mockReturnThis() },
            finalizeNoPurgeBtn: { 
                toggleClass: jest.fn().mockReturnThis(), 
                addClass: jest.fn().mockReturnThis(),
                text: jest.fn().mockReturnThis()
            }
        };

        mockUI = {
            screens: mockScreens,
            elements: mockElements,
            hideFeedback: jest.fn()
        };

        manager = new ScreenManager(mockUI);
    });

    test('showScreen hides all screens and shows the requested one', () => {
        manager.showScreen('game', State);

        Object.values(mockScreens).forEach(s => {
            expect(s.addClass).toHaveBeenCalledWith('hidden');
        });
        expect(mockScreens.game.removeClass).toHaveBeenCalledWith('hidden');
    });

    test('showScreen toggles settings button based on screen', () => {
        manager.showScreen('start', State);
        expect(mockElements.settingsBtn.toggleClass).toHaveBeenCalledWith('hidden', false);

        manager.showScreen('game', State);
        expect(mockElements.settingsBtn.toggleClass).toHaveBeenCalledWith('hidden', true);
    });

    test('showScreen toggles sidebar visibility', () => {
        manager.showScreen('game', State);
        expect(mockElements.sidebar.toggleClass).toHaveBeenCalledWith('hidden', false);

        manager.showScreen('start', State);
        expect(mockElements.sidebar.toggleClass).toHaveBeenCalledWith('hidden', true);
    });

    test('showScreen handles shelter special buttons', () => {
        // Mock state for transition phase
        State.isDayOver = () => true;
        State.isNight = false;

        manager.showScreen('shelter', State);
        expect(mockElements.finalizeNoPurgeBtn.toggleClass).toHaveBeenCalledWith('hidden', false);
        expect(mockElements.finalizeNoPurgeBtn.text).toHaveBeenCalledWith('FINALIZAR TURNO SIN PURGAR');

        // Mock state for night management
        State.isNight = true;
        manager.showScreen('shelter', State);
        expect(mockElements.finalizeNoPurgeBtn.text).toHaveBeenCalledWith('VOLVER AL PROTOCOLO NOCTURNO');
    });

    test('showScreen renders morgue when active', () => {
        const spy = jest.spyOn(manager, 'renderMorgue').mockImplementation(() => {});
        manager.showScreen('morgue', State);
        expect(spy).toHaveBeenCalledWith(State);
    });

    test('showScreen updates night shelter status', () => {
        State.admittedNPCs = [{}, {}];
        State.config.maxShelterCapacity = 10;
        State.paranoia = 45;

        manager.showScreen('night', State);

        // We check if global jQuery was called for the status elements
        expect(global.$).toHaveBeenCalledWith('#night-shelter-status');
        expect(global.$).toHaveBeenCalledWith('#night-paranoia-status');
    });
});
