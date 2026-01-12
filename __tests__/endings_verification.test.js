import { ScreenManager } from '../js/ScreenManager.js';
import { LoreData } from '../js/LoreData.js';

describe('Endings Verification and Final Stats', () => {
    let screenManager;
    let uiMock;
    let elementMocks = {};

    beforeEach(() => {
        // Reset mocks and tracking
        elementMocks = {};
        
        // Custom jQuery mock implementation to track calls per selector
        $.mockImplementation((selector) => {
            if (!elementMocks[selector]) {
                elementMocks[selector] = {
                    text: jest.fn().mockReturnThis(),
                    empty: jest.fn().mockReturnThis(),
                    append: jest.fn().mockReturnThis(),
                    addClass: jest.fn().mockReturnThis(),
                    removeClass: jest.fn().mockReturnThis(),
                    toggleClass: jest.fn().mockReturnThis(),
                    attr: jest.fn().mockReturnThis(),
                    on: jest.fn().mockReturnThis(),
                    show: jest.fn().mockReturnThis(),
                    hide: jest.fn().mockReturnThis(),
                    find: jest.fn().mockReturnThis(),
                    css: jest.fn().mockReturnThis(),
                    fadeIn: jest.fn().mockReturnThis(),
                    fadeOut: jest.fn().mockReturnThis(),
                };
            }
            return elementMocks[selector];
        });

        uiMock = {
            screens: {},
            elements: {
                settingsBtn: { toggleClass: jest.fn() },
                sidebar: { toggleClass: jest.fn() },
                finalizeNoPurgeBtn: { toggleClass: jest.fn(), text: jest.fn(), addClass: jest.fn() }
            },
            hideFeedback: jest.fn()
        };

        screenManager = new ScreenManager(uiMock);
    });

    const mockState = {
        admittedNPCs: [],
        ignoredNPCs: [],
        purgedNPCs: [],
        departedNPCs: [],
        infectedSeenCount: 0,
        paranoia: 0
    };

    test('final_clean shows correct stats and success message', () => {
        const state = {
            ...mockState,
            admittedNPCs: [{ id: 1, isInfected: false }, { id: 2, isInfected: false }],
            ignoredNPCs: [{ id: 3 }],
            purgedNPCs: [],
            departedNPCs: [],
            infectedSeenCount: 0,
            paranoia: 10
        };

        screenManager.renderFinalStats(state, 'final_clean');

        // Total processed: 2 admitted + 1 ignored = 3
        expect(elementMocks['#final-stat-total'].text).toHaveBeenCalledWith(3);
        expect(elementMocks['#final-stat-admitted'].text).toHaveBeenCalledWith(2);
        expect(elementMocks['#final-stat-purged'].text).toHaveBeenCalledWith(0);
        expect(elementMocks['#final-stat-leaked'].text).toHaveBeenCalledWith(0);
        expect(elementMocks['#final-stat-deaths'].text).toHaveBeenCalledWith(0);

        // Title and Outcome
        expect(elementMocks['#final-stat-ending-title'].text).toHaveBeenCalledWith(LoreData.final_clean.title);
        expect(elementMocks['#final-stat-outcome'].text).toHaveBeenCalledWith("ÉXITO OPERATIVO");
        expect(elementMocks['#final-stat-outcome'].addClass).toHaveBeenCalledWith('text-save');

        // Notes
        expect(elementMocks['#final-stat-notes'].append).toHaveBeenCalledWith(expect.stringContaining("PROTOCOLO DE CONTENCIÓN: ÉXITO TOTAL"));
    });

    test('final_corrupted shows correct stats and compromised message', () => {
        const state = {
            ...mockState,
            admittedNPCs: [{ id: 1, isInfected: true }, { id: 2, isInfected: false }],
            ignoredNPCs: [],
            purgedNPCs: [],
            departedNPCs: [],
            infectedSeenCount: 0,
            paranoia: 20
        };

        screenManager.renderFinalStats(state, 'final_corrupted');

        expect(elementMocks['#final-stat-leaked'].text).toHaveBeenCalledWith(1);
        expect(elementMocks['#final-stat-outcome'].text).toHaveBeenCalledWith("COMPROMETIDO");
        expect(elementMocks['#final-stat-outcome'].addClass).toHaveBeenCalledWith('text-warning');
        expect(elementMocks['#final-stat-notes'].append).toHaveBeenCalledWith(expect.stringContaining("ALERTA: Se han detectado 1 brechas biológicas"));
    });

    test('final_death_paranoia shows eliminated message and high paranoia warning', () => {
        const state = {
            ...mockState,
            admittedNPCs: [],
            ignoredNPCs: [],
            purgedNPCs: [{ id: 1, isInfected: false }], // 1 death
            departedNPCs: [],
            infectedSeenCount: 0,
            paranoia: 100
        };

        screenManager.renderFinalStats(state, 'final_death_paranoia');

        expect(elementMocks['#final-stat-deaths'].text).toHaveBeenCalledWith(1);
        expect(elementMocks['#final-stat-outcome'].text).toHaveBeenCalledWith("OPERATIVO ELIMINADO");
        expect(elementMocks['#final-stat-outcome'].addClass).toHaveBeenCalledWith('text-alert');
        expect(elementMocks['#final-stat-notes'].append).toHaveBeenCalledWith(expect.stringContaining("Bajas civiles confirmadas: 1"));
        expect(elementMocks['#final-stat-notes'].append).toHaveBeenCalledWith(expect.stringContaining("ADVERTENCIA: Niveles de estrés post-traumático críticos"));
    });

    test('final_abandonment shows eliminated message', () => {
        const state = {
            ...mockState,
            ignoredNPCs: new Array(15).fill({ id: 0 })
        };

        screenManager.renderFinalStats(state, 'final_abandonment');

        expect(elementMocks['#final-stat-total'].text).toHaveBeenCalledWith(15);
        expect(elementMocks['#final-stat-outcome'].text).toHaveBeenCalledWith("OPERATIVO ELIMINADO");
    });

    test('final_overload_death shows eliminated message', () => {
        screenManager.renderFinalStats(mockState, 'final_overload_death');
        expect(elementMocks['#final-stat-outcome'].text).toHaveBeenCalledWith("OPERATIVO ELIMINADO");
    });

    test('night_player_death shows eliminated message', () => {
        const state = {
            ...mockState,
            admittedNPCs: [],
            ignoredNPCs: [],
            purgedNPCs: [],
            departedNPCs: [],
            infectedSeenCount: 0,
            paranoia: 50
        };

        screenManager.renderFinalStats(state, 'night_player_death');

        expect(elementMocks['#final-stat-outcome'].text).toHaveBeenCalledWith("OPERATIVO ELIMINADO");
        expect(elementMocks['#final-stat-outcome'].addClass).toHaveBeenCalledWith('text-alert');
    });

    test('final_player_infected_escape shows compromised message', () => {
        const state = {
            ...mockState,
            admittedNPCs: [{ id: 1, isInfected: false }],
            ignoredNPCs: [],
            purgedNPCs: [],
            departedNPCs: [],
            infectedSeenCount: 0,
            paranoia: 40
        };

        screenManager.renderFinalStats(state, 'final_player_infected_escape');

        expect(elementMocks['#final-stat-outcome'].text).toHaveBeenCalledWith("COMPROMETIDO");
        expect(elementMocks['#final-stat-outcome'].addClass).toHaveBeenCalledWith('text-warning');
    });

    test('unknown ending shows mission failed message', () => {
        const state = mockState;
        screenManager.renderFinalStats(state, 'non_existent_ending');

        expect(elementMocks['#final-stat-outcome'].text).toHaveBeenCalledWith("MISIÓN FALLIDA");
        expect(elementMocks['#final-stat-outcome'].addClass).toHaveBeenCalledWith('text-alert');
    });

    test('all defined endings in LoreData have a title', () => {
        const endings = Object.keys(LoreData).filter(key => key.startsWith('final_') || key.startsWith('night_'));
        
        endings.forEach(endingId => {
            if (endingId === 'night_tranquil') return; // Not an ending screen
            
            screenManager.renderFinalStats(mockState, endingId);
            const expectedTitle = LoreData[endingId].title;
            expect(elementMocks['#final-stat-ending-title'].text).toHaveBeenCalledWith(expectedTitle);
        });
    });
});
