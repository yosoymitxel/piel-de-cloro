import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { State } from '../js/State.js';

describe('Game Mechanics Manager', () => {
    let gmm, gameMock, uiMock, audioMock, endingsMock;

    beforeEach(() => {
        State.reset();
        
        uiMock = {
            showFeedback: jest.fn(),
            showMessage: jest.fn(),
            showLore: jest.fn(),
            renderGeneratorRoom: jest.fn(),
            renderNightScreen: jest.fn(),
            updateInspectionTools: jest.fn(),
            updateRunStats: jest.fn(),
            clearAllNavStatuses: jest.fn(),
            setNavItemStatus: jest.fn(),
            updateSecurityNavStatus: jest.fn(),
            renderSecurityRoom: jest.fn()
        };
        
        audioMock = {
            playSFXByKey: jest.fn(),
            playAmbientByKey: jest.fn(),
            levels: { ambient: 0.3 }
        };
        
        endingsMock = {
            triggerEnding: jest.fn()
        };
        
        gameMock = {
            ui: uiMock,
            audio: audioMock,
            endings: endingsMock,
            events: {
                switchScreen: jest.fn((screen, config) => {
                    if (config && config.renderFn) config.renderFn();
                })
            },
            updateHUD: jest.fn(),
            nextTurn: jest.fn()
        };

        gmm = new GameMechanicsManager(gameMock);
    });

    describe('Generator Mechanics', () => {
        test('triggerGeneratorFailure shuts down systems and logs error', () => {
            State.generator.isOn = true;
            State.securityItems = [{ type: 'puerta', secured: true }];
            
            gmm.triggerGeneratorFailure();
            
            expect(State.generator.isOn).toBe(false);
            expect(State.securityItems[0].secured).toBe(false);
            expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("FALLO CRÍTICO"), "red");
            expect(State.gameLog[State.gameLog.length - 1].text).toContain('FALLO CRÍTICO');
        });

        test('toggleGenerator turns it on and sets mode to save', () => {
            State.generator.isOn = false;
            gmm.toggleGenerator();
            
            expect(State.generator.isOn).toBe(true);
            expect(State.generator.mode).toBe('save');
            expect(State.generator.power).toBe(32);
            expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("MODO AHORRO"), "yellow");
        });

        test('emergency energy is granted when restarting with no activity', () => {
            State.generator.isOn = false;
            State.currentNPC = { scanCount: 0 };
            State.dialogueStarted = false;
            
            gmm.toggleGenerator();
            
            expect(State.currentNPC.scanCount).toBe(0);
            expect(State.generator.emergencyEnergyGranted).toBe(true);
            expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining("1 TEST DISPONIBLE"), "green");
        });
    });

    describe('Paranoia and Consequences', () => {
        test('calculatePurgeConsequences increases paranoia for humans', () => {
            const human = { name: 'Test', isInfected: false };
            const initialParanoia = State.paranoia;
            
            gmm.calculatePurgeConsequences(human);
            
            expect(State.paranoia).toBe(initialParanoia + 20);
            expect(uiMock.showMessage).toHaveBeenCalledWith(expect.stringContaining("PURGADO A UN HUMANO"), null, 'warning');
        });

        test('calculatePurgeConsequences decreases paranoia for infected', () => {
            const infected = { name: 'Test', isInfected: true };
            State.paranoia = 50;
            
            gmm.calculatePurgeConsequences(infected);
            
            expect(State.paranoia).toBe(45);
            expect(uiMock.showMessage).toHaveBeenCalledWith(expect.stringContaining("AMENAZA ELIMINADA"), null, 'normal');
        });
    });

    describe('Night Phase', () => {
        test('sleep with infected in shelter kills a civilian', () => {
            const human = { name: 'Civilian', isInfected: false };
            const infected = { name: 'Infected', isInfected: true };
            State.admittedNPCs = [human, infected];
            
            gmm.sleep();
            
            expect(State.purgedNPCs).toContain(human);
            expect(State.admittedNPCs).not.toContain(human);
            expect(State.lastNight.victims).toBe(1);
            expect(uiMock.showLore).toHaveBeenCalledWith('night_civil_death', expect.any(Function));
        });

        test('sleep with no refugees has high chance of player death', () => {
            // Mock Math.random to trigger death (0.92 chance)
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
            State.admittedNPCs = [];
            
            gmm.sleep();
            
            expect(endingsMock.triggerEnding).toHaveBeenCalledWith('night_player_death');
            spy.mockRestore();
        });

        test('tranquil night decreases paranoia', () => {
            const human = { name: 'Civilian', isInfected: false };
            State.admittedNPCs = [human];
            State.paranoia = 50;
            // Mock Math.random to avoid random death (0.05 + paranoia/250)
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0.99);
            
            // Trigger the callback of showLore
            uiMock.showLore.mockImplementation((key, cb) => cb());
            
            gmm.sleep();
            
            expect(State.paranoia).toBe(40); // 50 - 10
            expect(uiMock.showLore).toHaveBeenCalledWith('night_tranquil', expect.any(Function));
            spy.mockRestore();
        });
    });

    describe('Intrusions', () => {
        test('createIntrusion adds NPC to admitted and logs it', () => {
            State.securityItems = [{ type: 'puerta', secured: false }];
            const via = State.securityItems[0];
            
            gmm.createIntrusion(via, 'diurna');
            
            expect(State.admittedNPCs.length).toBe(1);
            expect(State.admittedNPCs[0].history[0].text).toContain('Intrusión detectada vía puerta');
            expect(State.gameLog[State.gameLog.length - 1].text).toContain('ALERTA: Intrusión detectada vía puerta');
        });
    });

    describe('Generator Mode and Capacity', () => {
        test('changeGeneratorMode increases mode up to capacity only if no action taken', () => {
            State.generator.isOn = true;
            State.generator.mode = 'save';
            State.generator.maxModeCapacityReached = 2; // Normal
            
            gmm.changeGeneratorMode(1); // To normal
            expect(State.generator.mode).toBe('normal');
            
            // Now set action taken to block further increase
            State.dialogueStarted = true;
            gmm.changeGeneratorMode(1); // Try to go to overload (cap 3)
            expect(State.generator.mode).toBe('normal'); // Blocked because maxModeCapacityReached is 2 and actionTaken is true
        });

        test('changeGeneratorMode allows increase if no action taken even if capacity reached', () => {
            State.generator.isOn = true;
            State.generator.mode = 'normal';
            State.generator.maxModeCapacityReached = 2; // Normal
            State.dialogueStarted = false; // No action taken
            
            gmm.changeGeneratorMode(1); // To overload
            expect(State.generator.mode).toBe('overload');
            expect(State.generator.maxModeCapacityReached).toBe(3);
        });

        test('updateGenerator has chance to trigger failure', () => {
            State.generator.isOn = true;
            State.generator.mode = 'normal';
            State.config.generator.failureChance = { normal: 1.0 }; // Force failure
            
            const spy = jest.spyOn(gmm, 'triggerGeneratorFailure');
            gmm.updateGenerator();
            
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });

        test('updateGenerator handles overload risk', () => {
            State.generator.isOn = true;
            State.generator.mode = 'overload';
            State.generator.overloadRiskTurns = 1;
            
            // Mock Math.random to trigger failure (0.25 chance)
            const spyRandom = jest.spyOn(Math, 'random').mockReturnValue(0.1);
            const spyFailure = jest.spyOn(gmm, 'triggerGeneratorFailure');
            
            gmm.updateGenerator();
            
            expect(spyFailure).toHaveBeenCalled();
            expect(State.generator.overloadRiskTurns).toBe(0);
            
            spyRandom.mockRestore();
            spyFailure.mockRestore();
        });
    });

    describe('State Transitions', () => {
        test('startNextDay increments cycle and handles departures', () => {
            const npc1 = { name: 'NPC 1', id: 1 };
            const npc2 = { name: 'NPC 2', id: 2 };
            State.admittedNPCs = [npc1, npc2];
            State.cycle = 1;
            
            // Mock Math.random to guarantee 1 departure
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0.1);
            
            gmm.startNextDay();
            
            expect(State.cycle).toBe(2);
            expect(State.admittedNPCs.length).toBeLessThan(2);
            expect(State.departedNPCs.length).toBeGreaterThan(0);
            expect(uiMock.updateRunStats).toHaveBeenCalled();
            spy.mockRestore();
        });
    });
});
