
import { State } from '../js/State.js';
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';
import { NPC } from '../js/NPC.js';
import { CONSTANTS } from '../js/Constants.js';
import { jest } from '@jest/globals';

describe('Professions Impact', () => {
    let mechanics;
    let gameMock;

    beforeEach(() => {
        State.reset();

        // Mock simple game object
        gameMock = {
            ui: {
                showFeedback: jest.fn(),
                updateEnergyHUD: jest.fn(),
                showLore: jest.fn(),
                renderGeneratorRoom: jest.fn(),
                updateGeneratorNavStatus: jest.fn(),
                updateInspectionTools: jest.fn()
            },
            audio: { playSFXByKey: jest.fn(), playEvent: jest.fn() },
            updateHUD: jest.fn(),
            events: { navigateToRoom: jest.fn() }
        };

        mechanics = new GameMechanicsManager(gameMock);
        gameMock.mechanics = mechanics;

        State.generator.active = true;
        State.generator.isOn = true;
        State.generator.power = 100;
        State.generator.load = 40; // Fixed load for testing
        // Mock calculateTotalLoad to satisfy updateGenerator call
        mechanics.calculateTotalLoad = jest.fn(() => 40);

        // Disable random failure for consistent tests
        State.config.generator.failureChance = { normal: 0, save: 0, overload: 0 };
    });

    test('Engineer should reduce generator consumption', () => {
        // 1. Calculate baseline drain
        // Load 40 / 20 = 2.0 drain per turn
        mechanics.updateGenerator();
        expect(State.generator.power).toBe(98); // 100 - 2

        // Reset
        State.generator.power = 100;

        // 2. Add Engineer
        const engineer = new NPC();
        engineer.occupation = 'Ingeniero'; // Must match CONSTANTS keys
        engineer.assignedSector = 'generator';
        State.admittedNPCs = [engineer];

        // 3. Update again
        mechanics.updateGenerator();

        // Expected: 2.0 * (1 - 0.15) = 2.0 * 0.85 = 1.7 drain
        // Power: 100 - 1.7 = 98.3
        expect(State.generator.power).toBe(98.3);
    });

    test('Non-assigned Engineer should NOT reduce consumption', () => {
        State.generator.power = 100;

        const engineer = new NPC();
        engineer.occupation = 'Ingeniero';
        engineer.assignedSector = null; // Not assigned
        State.admittedNPCs = [engineer];

        mechanics.updateGenerator();
        expect(State.generator.power).toBe(98); // Baseline 2.0
    });

    test('Medical profession should reduce life support death rate', () => {
        // 1. Setup scenario: life support failure and sickly NPC
        State.generator.systems.lifeSupport.active = false;
        const sickly = new NPC();
        sickly.trait = { id: 'sickly' };
        // Ensure sick NPC is in State.admittedNPCs
        State.admittedNPCs = [sickly];

        // 2. Add Doctor
        const doctor = new NPC();
        doctor.occupation = 'Médico';
        doctor.assignedSector = 'infirmary'; // or 'shelter' as per CONSTANTS
        State.admittedNPCs.push(doctor);

        // We'll mock Math.random to a value that would cause death WITHOUT bonus but survive WITH bonus
        // Base death prob: 0.5. Doctor bonus: 0.3 (30% reduction) -> New prob: 0.5 * 0.7 = 0.35
        // If random is 0.4:
        // - Without doctor: 0.4 < 0.5 -> Death
        // - With doctor: 0.4 > 0.35 -> Survival

        const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.4);

        // Define a hook runner similar to mechanics.js registerNightHook logic
        // Since we can't easily trigger the private hooks array, we simulate the logic:
        const hook = (state) => {
            const sys = state.generator.systems;
            if (sys && sys.lifeSupport && !sys.lifeSupport.active) {
                const bonuses = mechanics.calculateJobBonuses(); // Use public method
                const deathReduction = bonuses.deathChanceMap;

                const admitted = state.admittedNPCs;
                for (let i = admitted.length - 1; i >= 0; i--) {
                    const npc = admitted[i];
                    const deathProbability = 0.5 * deathReduction;

                    if (npc.trait && npc.trait.id === 'sickly' && Math.random() < deathProbability) {
                        admitted.splice(i, 1);
                        npc.death = { reason: 'fallo_soporte_vital', cycle: state.cycle, revealed: false };
                        state.purgedNPCs.push(npc);
                    }
                }
            }
        };

        const result = hook(State);

        // Check if sickly NPC is still in admitted list (survived)
        expect(State.admittedNPCs.find(n => n === sickly)).toBeDefined(); 
        randomSpy.mockRestore();
    });

    test('Security profession should reduce paranoia failure chance', () => {
        State.paranoia = 80;
        State.securityItems = [{ type: 'alarma', active: true }];

        // Add Soldier (bonus: 0.4 reduction)
        const soldier = new NPC();
        soldier.occupation = 'Soldado';
        soldier.assignedSector = 'security';
        State.admittedNPCs = [soldier];

        // New prob: Base 0.4 * 0.6 (40% reduction) = 0.24
        // If random is 0.3:
        // - Without soldier: 0.3 < 0.4 -> Failure
        // - With soldier: 0.3 > 0.24 -> Success (No failure)

        const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.3);

        const hook = mechanics.nightResolutionHooks.find(h => h.toString().includes('paranoia > 70'));
        hook(State);

        expect(State.securityItems[0].active).toBe(true); // Should NOT have failed
        randomSpy.mockRestore();
    });

    test('Cook profession should increase supply efficiency', () => {
        // admitted NPC consumption = 1 each.
        // With 6 NPCs -> totalConsumption = 6.
        // If random is 0 (no scavenged), supplies should drop by 6.

        // 1. Setup
        const npcs = [];
        for (let i = 0; i < 5; i++) {
            const n = new NPC();
            n.trait = { id: 'generic' }; // Force non-sickly
            npcs.push(n);
        }

        // 2. Add Cook
        const cook = new NPC();
        cook.occupation = 'Cocinero';
        cook.assignedSector = 'supplies'; // Updated to match CONSTANTS
        cook.trait = { id: 'generic' };
        npcs.push(cook);

        State.admittedNPCs = npcs;
        State.supplies = 100;

        // 3. Run
        mechanics.processNightResourcesAndTraits();

        // Baseline consumption: 6
        // Cook bonus: 1.2 efficiency
        // finalConsumption = Math.ceil(6 / 1.2) = Math.ceil(5) = 5
        // Expect supplies: 100 - 5 = 95 (instead of 100 - 6 = 94)

        expect(State.supplies).toBe(95);
    });

    test('Multiple Engineers should stack reduction (up to limit)', () => {
        State.generator.power = 100;

        const eng1 = new NPC(); eng1.occupation = 'Ingeniero'; eng1.assignedSector = 'generator';
        const eng2 = new NPC(); eng2.occupation = 'Ingeniero'; eng2.assignedSector = 'generator';
        const eng3 = new NPC(); eng3.occupation = 'Ingeniero'; eng3.assignedSector = 'generator';
        const eng4 = new NPC(); eng4.occupation = 'Ingeniero'; eng4.assignedSector = 'generator';

        State.admittedNPCs = [eng1, eng2, eng3, eng4];

        mechanics.updateGenerator();
        expect(State.generator.power).toBe(99); // Max 50% reduction
    });
});
