
import { AudioManager } from '../js/AudioManager.js';

describe('AudioManager', () => {
    let audioManager;
    let mockAudio;

    beforeEach(() => {
        // Mock requestAnimationFrame
        global.requestAnimationFrame = jest.fn((cb) => {
            // Simulate completion immediately for simple fade tests
            cb(performance.now() + 1000); 
            return 1;
        });
        global.cancelAnimationFrame = jest.fn();

        audioManager = new AudioManager();
    });

    test('constructor initializes channels and master volume', () => {
        expect(audioManager.master).toBe(1.0);
        expect(audioManager.channels.ambient).toBeDefined();
        expect(audioManager.channels.lore).toBeDefined();
        expect(audioManager.channels.sfx).toBeDefined();
    });

    test('setMasterVolume updates all channels', () => {
        audioManager.setMasterVolume(0.5);
        expect(audioManager.master).toBe(0.5);
        expect(audioManager.channels.ambient.volume).toBe(audioManager.levels.ambient * 0.5);
    });

    test('playAmbient sets src and volume, and calls play', async () => {
        const src = 'test.mp3';
        audioManager.playAmbient(src, { volume: 0.5 });
        
        expect(audioManager.channels.ambient.src).toContain(src);
        expect(audioManager.levels.ambient).toBe(0.5);
        expect(audioManager.channels.ambient.play).toHaveBeenCalled();
    });

    test('duckAmbient reduces ambient volume', () => {
        audioManager.channels.ambient.volume = 0.5;
        audioManager.duckAmbient(0.1, 100);
        
        // After mock requestAnimationFrame runs the callback
        expect(audioManager.channels.ambient.volume).toBe(0.1);
    });

    test('playSFX interruptions', () => {
        const src1 = 'sfx1.mp3';
        const src2 = 'sfx2.mp3';
        
        audioManager.playSFX(src1, { priority: 1, lockMs: 1000 });
        expect(audioManager.channels.sfx.src).toContain(src1);
        
        // Should not interrupt if lower priority and within lock time
        audioManager.playSFX(src2, { priority: 0 });
        expect(audioManager.channels.sfx.src).toContain(src1);
        
        // Should interrupt if higher priority
        audioManager.playSFX(src2, { priority: 2 });
        expect(audioManager.channels.sfx.src).toContain(src2);
    });

    test('stopChannel pauses and fades out', () => {
        audioManager.channels.ambient.paused = false;
        audioManager.channels.ambient.volume = 0.5;
        
        audioManager.stopChannel('ambient', 100);
        
        expect(audioManager.channels.ambient.volume).toBe(0);
        expect(audioManager.channels.ambient.pause).toHaveBeenCalled();
    });
});
