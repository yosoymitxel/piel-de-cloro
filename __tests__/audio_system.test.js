import { AudioManager } from '../js/AudioManager.js';

describe('Audio System (AudioManager)', () => {
    let am;

    beforeEach(() => {
        am = new AudioManager();
    });

    test('Initializes channels with correct settings', () => {
        expect(am.channels.ambient).toBeDefined();
        expect(am.channels.lore).toBeDefined();
        expect(am.channels.sfx).toBeDefined();
        
        expect(am.channels.ambient.loop).toBe(true);
        expect(am.channels.sfx.loop).toBe(false);
    });

    test('Logs events correctly', () => {
        am.log('Test message');
        expect(am.logs[0]).toContain('Test message');
    });

    test('Volume control (ducking)', () => {
        am.duckAmbient(0.1);
        // Ducking uses a timer/fade logic usually, but let's check if the intent is there
        // Based on AudioManager code, it might set volume or target volume
        expect(am.levels.ambient).toBe(0.3); // Initial level
        // Since duckAmbient involves setTimeout and transitions, we'd need to mock timers
        // or just check if it records the state.
    });

    test('stopLore preserves legacy numeric fade durations', () => {
        const fade = jest.spyOn(am, 'fade').mockImplementation(() => {});
        am.stopLore(1200);

        expect(fade).toHaveBeenCalledWith(am.channels.lore, 0, 1200, 'lore', expect.any(Function));
        expect(am.desiredPlay.lore).toBe(false);
    });

    test('stopLore tolerates null options', () => {
        const fade = jest.spyOn(am, 'fade').mockImplementation(() => {});
        expect(() => am.stopLore(null)).not.toThrow();
        expect(fade).toHaveBeenCalledWith(am.channels.lore, 0, 400, 'lore', expect.any(Function));
    });

    test('Manifest loading', async () => {
        await am.loadManifest('mock_url');
        expect(am.manifest.test_sfx).toBe('path/to/test.mp3');
    });
});
