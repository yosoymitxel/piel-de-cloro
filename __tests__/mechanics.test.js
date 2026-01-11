
import { State } from '../js/State.js';
import { GameMechanicsManager } from '../js/game/GameMechanicsManager.js';
import { NPC } from '../js/NPC.js';

describe('GameMechanicsManager', () => {
    let mechanics;
    let mockGame;
    let mockUI;
    let mockAudio;

    beforeEach(() => {
        State.reset();
        
        mockUI = {
            showFeedback: jest.fn(),
            showMessage: jest.fn(),
            renderGeneratorRoom: jest.fn(),
            renderSecurityRoom: jest.fn(),
            updateInspectionTools: jest.fn(),
            updateSecurityNavStatus: jest.fn(),
            setNavItemStatus: jest.fn(),
            updateHUD: jest.fn(),
            showLore: jest.fn((id, cb) => cb && cb()),
            showScreen: jest.fn(),
            updateRunStats: jest.fn()
        };

        mockAudio = {
            playSFXByKey: jest.fn(),
            playAmbientByKey: jest.fn(),
            levels: { ambient: 0.5 }
        };

        mockGame = {
            ui: mockUI,
            audio: mockAudio,
            updateHUD: jest.fn(),
            triggerEnding: jest.fn(),
            nextTurn: jest.fn()
        };

        mechanics = new GameMechanicsManager(mockGame);
    });

    describe('Generator Mechanics', () => {
        test('toggleGenerator turns it on/off and applies mode save', () => {
            // Start state is ON
            expect(State.generator.isOn).toBe(true);
            
            mechanics.toggleGenerator();
            expect(State.generator.isOn).toBe(false);
            expect(mockAudio.playSFXByKey).toHaveBeenCalledWith('generator_stop', expect.anything());

            mechanics.toggleGenerator();
            expect(State.generator.isOn).toBe(true);
            expect(State.generator.mode).toBe('save');
            expect(mockAudio.playSFXByKey).toHaveBeenCalledWith('generator_start', expect.anything());
        });

        test('triggerGeneratorFailure shuts down systems', () => {
            mechanics.triggerGeneratorFailure();
            expect(State.generator.isOn).toBe(false);
            expect(mockUI.showFeedback).toHaveBeenCalledWith(expect.stringContaining("FALLO CRÍTICO"), "red");
        });
    });

    describe('Security & Intrusions', () => {
        test('shutdownSecuritySystem deactivates all items', () => {
            State.securityItems = [
                { type: 'alarma', active: true },
                { type: 'puerta', secured: true }
            ];
            mechanics.shutdownSecuritySystem();
            expect(State.securityItems[0].active).toBe(false);
            expect(State.securityItems[1].secured).toBe(false);
        });

        test('createIntrusion adds an NPC to admitted list', () => {
            const via = { type: 'puerta' };
            mechanics.createIntrusion(via, 'diurna');
            expect(State.admittedNPCs).toHaveLength(1);
            expect(State.admittedNPCs[0].purgeLockedUntil).toBe(State.cycle + 1);
        });
    });

    describe('Night Phase (Sleep)', () => {
        test('sleep with no one in shelter triggers player death ending', () => {
            State.admittedNPCs = [];
            // Math.random needs to be low for death (< 0.92)
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
            
            mechanics.sleep();
            
            expect(mockGame.triggerEnding).toHaveBeenCalledWith('night_player_death');
            spy.mockRestore();
        });

        test('sleep with infected in shelter kills a civilian', () => {
            const infected = new NPC(1.0);
            const civilian = new NPC(0.0);
            State.addAdmitted(infected);
            State.addAdmitted(civilian);
            
            // Mock startNextDay to avoid random departures during this test
            const startNextDaySpy = jest.spyOn(State, 'startNextDay').mockImplementation(() => {
                State.lastNight.occurred = true;
                State.cycle++;
            });
            // Also mock random to avoid guard death
            const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.99);
            
            mechanics.sleep();
            
            expect(State.admittedNPCs).toHaveLength(1); // Only infected remains
            expect(State.purgedNPCs).toHaveLength(1); // Civilian is purged/dead
            expect(State.lastNight.victims).toBe(1);
            expect(mockUI.showLore).toHaveBeenCalledWith('night_civil_death', expect.anything());

            startNextDaySpy.mockRestore();
            randomSpy.mockRestore();
        });

        test('sleep with only clean NPCs reduces paranoia', () => {
            const civilian = new NPC(0.0);
            State.addAdmitted(civilian);
            State.paranoia = 50;
            
            // Mock random to avoid random death
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0.99);
            
            // Ensure showLore calls the callback
            mockUI.showLore.mockImplementation((id, cb) => {
                if (cb) cb();
            });
            
            mechanics.sleep();
            
            expect(State.paranoia).toBe(40);
            expect(mockUI.showLore).toHaveBeenCalledWith('night_tranquil', expect.anything());
            spy.mockRestore();
        });
    });

    describe('Game Over / Endings', () => {
        test('finishRun prevents escape if shelter is not full', () => {
            State.config.maxShelterCapacity = 10;
            State.admittedNPCs = new Array(5).fill({});
            
            mechanics.finishRun();
            
            expect(mockUI.showFeedback).toHaveBeenCalledWith(expect.stringContaining("SISTEMA BLOQUEADO"), "alert");
            expect(mockGame.triggerEnding).not.toHaveBeenCalled();
        });

        test('finishRun triggers clean ending if all NPCs are clean', () => {
            State.config.maxShelterCapacity = 2;
            State.addAdmitted(new NPC(0.0));
            State.addAdmitted(new NPC(0.0));
            State.generator.isOn = true;
            State.playerInfected = false; // Ensure player is not infected
            
            // Mock random to avoid paranoia death
            jest.spyOn(Math, 'random').mockReturnValue(0.99);
            
            mechanics.finishRun();
            
            expect(mockUI.showLore).toHaveBeenCalledWith('pre_final', expect.anything());
            // The callback inside showLore would trigger 'final_clean'
            // Since we mocked showLore to call the callback immediately:
            expect(mockGame.triggerEnding).toHaveBeenCalledWith('final_clean');
        });
    });
});
