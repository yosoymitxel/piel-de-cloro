
import { State } from '../js/State.js';
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { NPC } from '../js/NPC.js';
import { CONSTANTS } from '../js/Constants.js';
import { jest } from '@jest/globals';

describe('Energy, Battery & Guard System', () => {
    let mechanics;
    let gameMock;
    let uiMock;
    let audioMock;

    beforeEach(() => {
        State.reset();

        uiMock = {
            showFeedback: jest.fn(),
            updateEnergyHUD: jest.fn(),
            renderGeneratorRoom: jest.fn(),
            updateGeneratorNavStatus: jest.fn(),
            renderGuardPanel: jest.fn(),
            updateInspectionTools: jest.fn(),
            renderAvatar: jest.fn(() => '<div>avatar</div>'),
            closeModal: jest.fn(),
            showMessage: jest.fn(),
            renderSecurityRoom: jest.fn(),
            updateSecurityNavStatus: jest.fn()
        };

        audioMock = {
            playSFXByKey: jest.fn()
        };

        gameMock = {
            ui: uiMock,
            audio: audioMock,
            updateHUD: jest.fn(), // Añadir esto
            events: {
                navigateToRoom: jest.fn()
            }
        };

        mechanics = new GameMechanicsManager(gameMock);
        // Monkey-patch mechanics into gameMock for circular deps if needed
        gameMock.mechanics = mechanics;

        // Ensure generator starts fresh
        State.generator.active = true;
        State.generator.power = 100;
        State.generator.load = 0;
        State.generator.capacity = 100;
    });

    test('Should calculate total load including systems and base consumption', () => {
        State.generator.isOn = true;
        State.generator.systems.security.active = true; // 15 (default load is 15 in State.js? No, test setup?)
        // Let's check test setup or assumptions.
        // In this test file, usually we mock or rely on defaults. 
        // State.js defaults: security: 15, lighting: 10, lifeSupport: 20, shelterLab: 25.
        // But here we might be mocking systems.
        
        // Setup specific systems for control
        State.generator.systems = {
            sys1: { active: true, load: 10 },
            sys2: { active: false, load: 20 },
            sys3: { active: true, load: 5 }
        };
        State.generator.baseConsumption = 5;
        State.generator.mode = 'normal'; // +10

        // Base 5 + Mode 10 + Sys1 10 + Sys3 5 = 30
        const load = mechanics.calculateTotalLoad();
        expect(load).toBe(30);
    });

    test('Should drain battery based on load when updating generator', () => {
        State.generator.load = 50; // Set explicit load
        State.generator.power = 100;

        // Mock calculateTotalLoad to return 50
        mechanics.calculateTotalLoad = jest.fn(() => 50);

        mechanics.updateGenerator();

        // Drain formula: load / 20 => 50 / 20 = 2.5
        expect(State.generator.power).toBe(97.5);
    });

    test('Should not drain battery if generator is OFF', () => {
        State.generator.isOn = false;
        State.generator.power = 100;
        mechanics.calculateTotalLoad = jest.fn(() => 50);

        mechanics.updateGenerator();
        expect(State.generator.power).toBe(100);
    });

    test('Should assign guard and log basic report', () => {
        const npc = { id: 'npc_1', name: 'Guardia 1', isInfected: false };
        State.admittedNPCs = [npc];
        
        // Use unified assignment system if available, else manual
        // The manager should handle it.
        mechanics.assignGuardToGenerator('npc_1');

        expect(State.generator.assignedGuardId).toBe('npc_1');
        expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining('GUARDIA ASIGNADO'), 'green');   
        
        // Logs moved to State.roomLogs.generator
        expect(State.roomLogs.generator.length).toBeGreaterThan(0);
    });

    test('Should reduce base consumption when guard is assigned', () => {
        State.generator.baseConsumption = 10;
        State.generator.systems = {};
        State.generator.mode = 'normal'; // +10
        State.generator.assignedGuardId = 'npc_1'; // Simulate assigned

        const load = mechanics.calculateTotalLoad();
        // Base 10 + Mode 10 - Guard 5 = 15
        expect(load).toBe(15);
    });

    test('Emergency charge should consume supplies and add battery', () => {
        State.supplies = 5;
        State.generator.power = 50;

        mechanics.manualEmergencyCharge();

        expect(State.supplies).toBe(2); // 5 - 3
        expect(State.generator.power).toBe(65); // 50 + 15
        expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining('CARGA DE EMERGENCIA'), 'green');
    });

    test('Emergency charge should fail if supplies are low', () => {
        State.supplies = 2;
        State.generator.power = 50;

        mechanics.manualEmergencyCharge();

        expect(State.supplies).toBe(2);
        expect(State.generator.power).toBe(50);
        expect(uiMock.showFeedback).toHaveBeenCalledWith(expect.stringContaining('INSUFICIENTES'), 'red');
    });

    test('Nightly recharge should restore battery', () => {
        State.generator.power = 50;
        State.admittedNPCs = [new NPC('Dummy')]; // Add dummy NPC to bypass early return
        // Mock UI showLore to immediately execute callback
        uiMock.showLore = jest.fn((id, cb) => cb && cb());

        mechanics.processNightResourcesAndTraits();

        // Base recharge 25 => 75
        expect(State.generator.power).toBe(75);
    });

    test('Guard sabotage (Infected) should drain extra battery', () => {
        const npc = { id: 'npc_inf', name: 'InfectedGuard', isInfected: true };
        State.admittedNPCs = [npc];
        State.generator.power = 50;
        State.generator.assignedGuardId = 'npc_inf';

        // Initial assignment shouldn't drain immediately or maybe it does? 
        // Logic says: if (!initial) drain. assignGuardToGenerator calls processGuardEffects(true) -> initial=true.
        mechanics.assignGuardToGenerator('npc_inf');
        expect(State.generator.power).toBe(50); 

        // Manually trigger effect (simulate turn update or periodic check)
        mechanics.processGuardEffects(false);

        // Should drain extra 2 units
        expect(State.generator.power).toBe(48);
        
        // Check logs in new location
        expect(State.roomLogs.generator[0].message).toMatch(/Bobina|Moscas|Estable|conducto|dial|carga|control/i); // Lies
    });
});
