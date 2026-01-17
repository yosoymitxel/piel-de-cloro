/**
 * Tests para el sistema de recarga de combustible (Fase 1.1 Roadmap)
 * Verifica: refuelGenerator(), bloqueo overload < 15%, forzado modo save
 */

import { State } from '../js/State.js';
import { GameMechanicsManager } from '../js/GameMechanicsManager.js';

describe('Sistema de Recarga de Combustible (Fase 1.1)', () => {
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
                renderGeneratorRoom: jest.fn(),
                renderFuelRoom: jest.fn(),
                updateEnergyHUD: jest.fn()
            },
            audio: {
                playSFXByKey: jest.fn()
            }
        };
        mechanics = new GameMechanicsManager(mockGame);
    });

    describe('refuelGenerator()', () => {
        test('debe recargar batería consumiendo 1 bidón de fuel', () => {
            State.fuel = 5;
            State.generator.power = 50;
            State.generator.mode = 'normal';
            const initialFuel = State.fuel;
            const initialPower = State.generator.power;

            const result = mechanics.refuelGenerator();

            expect(result).toBe(true);
            expect(State.fuel).toBe(initialFuel - 1);
            expect(State.generator.power).toBe(initialPower + 30);
        });

        test('debe bloquear recarga si está en modo overload', () => {
            State.fuel = 5;
            State.generator.mode = 'overload';

            const result = mechanics.refuelGenerator();

            expect(result).toBe(false);
            expect(mockGame.ui.showFeedback).toHaveBeenCalledWith(
                expect.stringContaining("PELIGRO"),
                "red",
                expect.any(Number)
            );
        });

        test('debe bloquear recarga si no hay combustible', () => {
            State.fuel = 0;
            State.generator.mode = 'normal';

            const result = mechanics.refuelGenerator();

            expect(result).toBe(false);
            expect(mockGame.ui.showFeedback).toHaveBeenCalledWith(
                expect.stringContaining("COMBUSTIBLE"),
                "red",
                expect.any(Number)
            );
        });

        test('debe bloquear recarga si batería está al máximo', () => {
            State.fuel = 5;
            State.generator.power = 100;
            State.generator.mode = 'normal';

            const result = mechanics.refuelGenerator();

            expect(result).toBe(false);
            expect(mockGame.ui.showFeedback).toHaveBeenCalledWith(
                expect.stringContaining("MÁXIMO"),
                "yellow",
                expect.any(Number)
            );
        });

        test('no debe superar 100% de batería', () => {
            State.fuel = 5;
            State.generator.power = 85;
            State.generator.mode = 'normal';

            mechanics.refuelGenerator();

            expect(State.generator.power).toBe(100);
        });
    });

    describe('Bloqueo de Overload por batería baja', () => {
        test('debe bloquear cambio a overload si batería < 15%', () => {
            State.generator.isOn = true;
            State.generator.power = 10;
            State.generator.mode = 'normal';
            State.generator.maxModeCapacityReached = 3; // Permitir overload desde perspectiva de progresión

            const result = mechanics.setGeneratorProtocol('overload');

            expect(result).toBe(false);
            expect(mockGame.ui.showFeedback).toHaveBeenCalledWith(
                expect.stringContaining("INSUFICIENTE"),
                "red",
                expect.any(Number)
            );
        });

        test('debe permitir overload si batería >= 15%', () => {
            State.generator.isOn = true;
            State.generator.power = 50;
            State.generator.mode = 'normal';
            State.generator.maxModeCapacityReached = 3;

            const result = mechanics.setGeneratorProtocol('overload');

            expect(result).toBe(true);
            expect(State.generator.mode).toBe('overload');
        });

        test('debe forzar modo save cuando batería cae bajo 15% en overload', () => {
            State.generator.isOn = true;
            State.generator.power = 14;
            State.generator.mode = 'overload';
            State.generator.capacity = 100;

            // Mock para que no drene batería completamente
            jest.spyOn(mechanics, 'calculateTotalLoad').mockReturnValue(10);

            mechanics.updateGenerator();

            expect(State.generator.mode).toBe('save');
            expect(mockGame.ui.showFeedback).toHaveBeenCalledWith(
                expect.stringContaining("AHORRO FORZADO"),
                "red",
                expect.any(Number)
            );
        });
    });
});
