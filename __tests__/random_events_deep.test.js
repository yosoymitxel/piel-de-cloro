
import { RandomEventManager } from '../js/RandomEventManager.js';
import { State } from '../js/State.js';

describe('RandomEventManager', () => {
    let rem, gameMock, uiMock;

    beforeEach(() => {
        State.reset();
        uiMock = {
            showMessage: jest.fn()
        };
        gameMock = {
            ui: uiMock,
            audio: { playSFXByKey: jest.fn() }
        };
        rem = new RandomEventManager(gameMock);
    });

    test('triggerRandomEvent triggers an event if roll is low', () => {
        // Mock random: first roll 0.1 (< 0.3 triggers event), second roll 0 to pick first event (moment_of_peace)
        let count = 0;
        Math.random = () => {
            count++;
            if (count === 1) return 0.1;
            return 0;
        };

        const event = rem.triggerRandomEvent();

        expect(event).toBeDefined();
        expect(event.id).toBe('moment_of_peace'); // First event is now moment_of_peace
        expect(State.paranoia).toBe(0); // 0 - 15 = -15, clamped to 0
        expect(State.sanity).toBe(100); // Already at 100, can't go higher
        expect(uiMock.showMessage).toHaveBeenCalled();
    });

    test('triggerRandomEvent does nothing if roll is high', () => {
        Math.random = () => 0.9;
        const event = rem.triggerRandomEvent();
        expect(event).toBeNull();
    });

    test('cloro_leak affects paranoia and sanity', () => {
        const event = rem.events.find(e => e.id === 'cloro_leak');
        State.paranoia = 0;
        State.sanity = 100;

        rem.executeEvent(event);

        expect(State.paranoia).toBe(14); // 0 + (12 * 1.2) = 14
        expect(State.sanity).toBe(90); // 100 + (-8 * 1.25) = 90
    });

    test('generator_boost increases generator power if generator exists', () => {
        const event = rem.events.find(e => e.id === 'generator_boost');
        State.generator.power = 50;

        rem.executeEvent(event);

        expect(State.generator.power).toBe(75);
    });

    test('moment_of_peace improves sanity and paranoia', () => {
        const event = rem.events.find(e => e.id === 'moment_of_peace');
        State.sanity = 50;
        State.paranoia = 50;

        rem.executeEvent(event);

        expect(State.sanity).toBe(64); // 50 + (20 * 0.7) = 64
        expect(State.paranoia).toBe(36); // 50 + floor(-15 * 0.9) = 50 - 14 = 36
    });
});
