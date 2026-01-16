import { LoreManager } from '../js/LoreManager.js';
import { LoreData } from '../js/LoreData.js';
import { State } from '../js/State.js';

describe('Lore and Endings System', () => {
    let lm, uiMock, audioMock;

    beforeEach(() => {
        uiMock = {
            showScreen: jest.fn(),
            setNavItemStatus: jest.fn(),
            timings: { loreFadeOut: 500 }
        };
        audioMock = {
            playLoreByKey: jest.fn(),
            playSFXByKey: jest.fn(),
            duckAmbient: jest.fn(),
            stopLore: jest.fn(),
            unduckAmbient: jest.fn(),
            getUrl: jest.fn(k => k),
            channels: { lore: { src: '' } }
        };

        lm = new LoreManager(uiMock, audioMock);
    });

    test('showLore displays correct data for a known type', () => {
        lm.showLore('initial');

        expect(uiMock.showScreen).toHaveBeenCalledWith('lore');
        expect(audioMock.playLoreByKey).toHaveBeenCalledWith('lore_intro_track', expect.any(Object));
        // Verify title was set
        expect($).toHaveBeenCalledWith('#lore-screen-title');
    });

    test('showLore handles intermediate variants (randomized)', () => {
        lm.showLore('intermediate');

        expect(uiMock.showScreen).toHaveBeenCalledWith('lore');
        expect($).toHaveBeenCalledWith('#lore-screen-content');
    });

    test('Ending unlocking logic in State', () => {
        State.unlockedEndings = [];
        State.unlockEnding('final_clean');

        expect(State.unlockedEndings).toContain('final_clean');
        // Second unlock should not duplicate
        State.unlockEnding('final_clean');
        expect(State.unlockedEndings.length).toBe(1);
    });

    test('All endings are accounted for in LoreData', () => {
        const finalEndings = Object.keys(LoreData).filter(key => key.startsWith('final_'));
        expect(finalEndings.length).toBeGreaterThan(5); // Ensure we have a significant number of endings
        expect(finalEndings).toContain('final_clean');
        expect(finalEndings).toContain('final_corrupted');
    });

    test('Danger type lore adds specific classes', () => {
        lm.showLore('night_civil_death');

        expect($).toHaveBeenCalledWith('#lore-screen-title');
        expect($).toHaveBeenCalledWith('#screen-lore .lore-panel');
    });
});
