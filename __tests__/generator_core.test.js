import { State } from '../js/State.js';
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';

describe('Generator Core Overhaul Tests', () => {
    let mechanics;
    let mockGame;

    beforeEach(() => {
        State.reset();
        mockGame = {
            updateHUD: jest.fn(),
            ui: {
                showFeedback: jest.fn(),
                updateGeneratorNavStatus: jest.fn(),
                updateSecurityNavStatus: jest.fn(),
                updateGameActions: jest.fn(),
                updateInspectionTools: jest.fn(),
                updateStats: jest.fn(),
                renderGeneratorRoom: jest.fn()
            },
            audio: {
                playSFXByKey: jest.fn()
            }
        };
        mechanics = new GameMechanicsManager(mockGame);
    });

    test('calculateTotalLoad sums base consumption and active systems', () => {
        State.generator.isOn = true;
        State.generator.baseConsumption = 10;
        State.generator.mode = 'normal'; // +10
        State.generator.bloodTestCountdown = 0;
        State.paranoia = 0;
        State.sanity = 100;

        State.generator.systems.security.active = true;   // 15
        State.generator.systems.lighting.active = true;   // 10
        State.generator.systems.lifeSupport.active = false; // 20 (off)
        State.generator.systems.shelterLab.active = false;  // 25 (off)

        const total = mechanics.calculateTotalLoad();

        // 10 (base) + 10 (mode) + 15 (sec) + 10 (light) = 45
        expect(total).toBe(45);
    });

    test('calculateTotalLoad includes blood test spikes', () => {
        State.generator.isOn = true;
        State.generator.baseConsumption = 10;
        State.generator.mode = 'normal'; // +10
        State.generator.bloodTestCountdown = 2; // Spike of 45
        State.paranoia = 0;
        State.sanity = 100;

        // All systems off to isolate spike
        Object.values(State.generator.systems).forEach(s => s.active = false);

        const total = mechanics.calculateTotalLoad();

        // 10 (base) + 10 (mode) + 45 (spike) = 65
        expect(total).toBe(65);
    });

    test('calculateTotalLoad handles high paranoia stress', () => {
        State.generator.isOn = true;
        State.generator.baseConsumption = 10;
        State.generator.mode = 'normal'; // +10
        State.paranoia = 90; // +5 stress
        State.sanity = 100;
        State.generator.bloodTestCountdown = 0;

        Object.values(State.generator.systems).forEach(s => s.active = false);

        const total = mechanics.calculateTotalLoad();

        // 10 (base) + 10 (mode) + 5 (paranoia) = 25
        expect(total).toBe(25);
    });

    test('updateGenerator decreases stability on overload', () => {
        State.generator.isOn = true;
        State.generator.capacity = 100;
        State.generator.load = 150; // 50% overload
        State.generator.stability = 100;

        // Mock calculateTotalLoad to return our fixed load
        jest.spyOn(mechanics, 'calculateTotalLoad').mockReturnValue(150);

        mechanics.updateGenerator();

        expect(State.generator.stability).toBeLessThan(100);
        expect(State.generator.overloadTimer).toBe(1);
    });

    test('updateGenerator increases stability on safe load', () => {
        State.generator.isOn = true;
        State.generator.capacity = 100;
        State.generator.load = 40;
        State.generator.stability = 80;

        jest.spyOn(mechanics, 'calculateTotalLoad').mockReturnValue(40);

        mechanics.updateGenerator();

        expect(State.generator.stability).toBe(81);
        expect(State.generator.overloadTimer).toBe(0);
    });

    test('triggerGeneratorFailure resets systems and cuts power', () => {
        State.generator.isOn = true;
        State.generator.stability = 20;

        mechanics.triggerGeneratorFailure();

        expect(State.generator.isOn).toBe(false);
        expect(State.generator.load).toBe(0);
        expect(mockGame.ui.showFeedback).toHaveBeenCalledWith(expect.stringContaining('FALLO CRÍTICO'), 'red', 5000);
    });

    test('overload risk increases with low stability', () => {
        State.generator.isOn = true;
        State.generator.capacity = 100;
        State.generator.load = 120;
        State.generator.stability = 10;

        jest.spyOn(mechanics, 'calculateTotalLoad').mockReturnValue(120);
        jest.spyOn(Math, 'random').mockImplementation((() => {
            let count = 0;
            return () => {
                count++;
                if (count === 1) return 0.001; // Trigger failure in stability check
                return 0.5;
            };
        })());

        mechanics.updateGenerator();

        expect(State.generator.isOn).toBe(false);
        jest.restoreAllMocks();
    });
});
