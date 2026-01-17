
import { State } from '../js/State.js';
import { RandomEventManager } from '../js/RandomEventManager.js';

describe('Random Event Mechanics', () => {
    let eventManager;
    let uiMock;
    let audioMock;
    let gameMock;

    beforeEach(() => {
        State.reset();
        State.sanity = 100;
        State.paranoia = 0;
        State.generator = { power: 50, isOn: true, mode: 'normal' };

        uiMock = {
            showMessage: jest.fn(),
            updateStats: jest.fn()
        };

        audioMock = {
            playSFXByKey: jest.fn()
        };

        gameMock = {
            ui: uiMock,
            audio: audioMock
        };

        eventManager = new RandomEventManager(gameMock);
    });

    test('cloro_leak affects state correctly', () => {
        const event = eventManager.events.find(e => e.id === 'cloro_leak');
        State.paranoia = 0;
        State.sanity = 100;

        event.action();

        expect(State.paranoia).toBe(14); // 0 + (12 * 1.2) = 14
        expect(State.sanity).toBe(90); // 100 + (-8 * 1.25) = 90
    });

    test('generator_boost increases power', () => {
        const event = eventManager.events.find(e => e.id === 'generator_boost');
        event.action();

        expect(State.generator.power).toBe(75);
    });

    test('executeEvent calls UI and Audio', () => {
        const event = eventManager.events[0];
        eventManager.executeEvent(event);

        expect(uiMock.showMessage).toHaveBeenCalled();
        expect(audioMock.playSFXByKey).toHaveBeenCalled();
    });

    test('triggerRandomEvent follows probability', () => {
        // Mock Math.random to always trigger
        const spyRandom = jest.spyOn(Math, 'random').mockReturnValue(0.1);

        const event = eventManager.triggerRandomEvent();
        expect(event).not.toBeNull();
        expect(uiMock.showMessage).toHaveBeenCalled();

        spyRandom.mockRestore();
    });

    test('triggerRandomEvent can result in no event', () => {
        // Mock Math.random to never trigger (> 0.3)
        const spyRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);

        const event = eventManager.triggerRandomEvent();
        expect(event).toBeNull();
        expect(uiMock.showMessage).not.toHaveBeenCalled();

        spyRandom.mockRestore();
    });
});
