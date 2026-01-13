import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { State } from '../js/State.js';
import { NPC } from '../js/NPC.js';

// Mock localStorage at the top level
const store = {};
const localStorageMock = {
    getItem: jest.fn(key => (key in store ? store[key] : null)),
    setItem: jest.fn((key, value) => { 
        store[key] = value; 
    }),
    clear: jest.fn(() => { for (let key in store) delete store[key]; }),
    removeItem: jest.fn(key => { delete store[key]; })
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Advanced Mechanics and State Persistence', () => {
    let gmm, gameMock, uiMock, audioMock;

    beforeEach(() => {
        State.reset();
        localStorage.clear();
        jest.clearAllMocks();

        uiMock = {
            showFeedback: jest.fn(),
            showMessage: jest.fn(),
            renderSecurityRoom: jest.fn(),
            updateSecurityNavStatus: jest.fn(),
            setNavItemStatus: jest.fn()
        };
        
        audioMock = {
            playSFXByKey: jest.fn(),
            playAmbientByKey: jest.fn(),
            levels: { ambient: 0.3 }
        };
        
        gameMock = {
            ui: uiMock,
            audio: audioMock,
            updateHUD: jest.fn()
        };

        gmm = new GameMechanicsManager(gameMock);
    });

    describe('Security Degradation', () => {
        test('checkSecurityDegradation can deactivate a secured item', () => {
            State.securityItems = [
                { type: 'puerta', secured: true }
            ];
            State.config.dayDeactivationProbability = 1.0; // Force chance calculation to be high
            
            // Mock Math.random to trigger degradation (first for probability, second for target)
            const spyRandom = jest.spyOn(Math, 'random').mockReturnValue(0.0);
            
            gmm.checkSecurityDegradation();
            
            // The door should be deactivated
            expect(State.securityItems[0].secured).toBe(false);
            expect(uiMock.updateSecurityNavStatus).toHaveBeenCalled();
            
            spyRandom.mockRestore();
        });

        test('shutdownSecuritySystem deactivates everything', () => {
            State.securityItems = [
                { type: 'puerta', secured: true },
                { type: 'ventana', secured: true },
                { type: 'alarma', active: true }
            ];
            
            gmm.shutdownSecuritySystem();
            
            State.securityItems.forEach(item => {
                if (item.type === 'alarma') expect(item.active).toBe(false);
                else expect(item.secured).toBe(false);
            });
            expect(uiMock.updateSecurityNavStatus).toHaveBeenCalled();
        });
    });

    describe('State Persistence', () => {
        test('savePersistentData and loadPersistentData work correctly', () => {
            State.unlockedEndings = ['ending_1', 'ending_2'];
            State.audioSettings.master = 0.5;
            State.audioSettings.muted.sfx = true;
            
            State.savePersistentData();
            
            expect(localStorage.setItem).toHaveBeenCalled();
            const lastCall = localStorage.setItem.mock.calls[0];
            expect(lastCall[0]).toBe('ruta01_persistence');
            expect(lastCall[1]).toContain('ending_1');
            
            // Reset state and load
            State.unlockedEndings = [];
            State.audioSettings.master = 1.0;
            State.audioSettings.muted.sfx = false;
            
            State.loadPersistentData();
            
            expect(State.unlockedEndings).toContain('ending_1');
            expect(State.unlockedEndings).toContain('ending_2');
            expect(State.audioSettings.master).toBe(0.5);
            expect(State.audioSettings.muted.sfx).toBe(true);
        });

        test('unlockEnding saves data', () => {
            State.unlockedEndings = [];
            const spySave = jest.spyOn(State, 'savePersistentData');
            
            State.unlockEnding('new_ending');
            
            expect(State.unlockedEndings).toContain('new_ending');
            expect(spySave).toHaveBeenCalled();
            spySave.mockRestore();
        });
    });

    describe('NPC Intrusion and History', () => {
        test('createIntrusion records correct history message', () => {
            State.cycle = 5;
            State.dayTime = 3;
            State.securityItems = []; // No alarms
            const via = { type: 'ventana' };
            
            gmm.createIntrusion(via, 'diurna');
            
            const intrudedNPC = State.admittedNPCs[0];
            expect(intrudedNPC.history[0].text).toContain('detectada vía ventana');
            expect(intrudedNPC.history[0].text).toContain('Ciclo 5');
            expect(intrudedNPC.history[0].text).toContain('3:00');
            expect(intrudedNPC.purgeLockedUntil).toBe(6);
        });

        test('createIntrusion handles alarm notification', () => {
            State.securityItems = [{ type: 'alarma', active: true }];
            const via = { type: 'puerta' };
            
            gmm.createIntrusion(via, 'diurna');
            
            const intrudedNPC = State.admittedNPCs[0];
            expect(intrudedNPC.history[0].text).toContain('notificada por alarma');
            expect(State.securityItems[0].active).toBe(false); // Alarm should deactivate after triggering
        });
    });

    describe('Paranoia Security Failure', () => {
        test('processNightResourcesAndTraits handles security failure with correct labels', () => {
            State.paranoia = 80;
            State.admittedNPCs = [{ name: 'Test NPC', traits: [], trait: { id: 'none' } }];
            
            // Test door
            State.securityItems = [{ type: 'puerta', secured: true }];
            let count = 0;
            let spyRandom = jest.spyOn(Math, 'random').mockImplementation(() => {
                count++;
                if (count === 1) return 0.1; // trigger
                return 0.0; // target
            });
            let summary = gmm.processNightResourcesAndTraits();
            expect(summary).toContain('fallo en: PUERTA');
            spyRandom.mockRestore();

            // Test alarm
            State.securityItems = [{ type: 'alarma', active: true }];
            count = 0;
            spyRandom = jest.spyOn(Math, 'random').mockImplementation(() => {
                count++;
                if (count === 1) return 0.1;
                return 0.0;
            });
            summary = gmm.processNightResourcesAndTraits();
            expect(summary).toContain('fallo en: ALARMA');
            spyRandom.mockRestore();

            // Test tuberias
            State.securityItems = [{ type: 'tuberias', secured: true }];
            count = 0;
            spyRandom = jest.spyOn(Math, 'random').mockImplementation(() => {
                count++;
                if (count === 1) return 0.1;
                return 0.0;
            });
            summary = gmm.processNightResourcesAndTraits();
            expect(summary).toContain('fallo en: TUBERÍAS');
            spyRandom.mockRestore();
        });
    });
});
