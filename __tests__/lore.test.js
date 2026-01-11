
import { LoreManager } from '../js/LoreManager.js';
import { State } from '../js/State.js';

describe('LoreManager', () => {
    let loreManager;
    let mockUI;
    let mockAudio;

    beforeEach(() => {
        State.reset();
        mockUI = {
            showScreen: jest.fn(),
            timings: { loreFadeOut: 500 }
        };
        mockAudio = {
            playLoreByKey: jest.fn(),
            playSFXByKey: jest.fn(),
            duckAmbient: jest.fn(),
            unduckAmbient: jest.fn(),
            stopLore: jest.fn()
        };
        loreManager = new LoreManager(mockUI, mockAudio);
    });

    test('getIconForKind returns correct icons', () => {
        expect(loreManager.getIconForKind('radio')).toBe('fa-tower-broadcast');
        expect(loreManager.getIconForKind('vista')).toBe('fa-eye');
        expect(loreManager.getIconForKind('oido')).toBe('fa-ear-listen');
        expect(loreManager.getIconForKind('registro')).toBe('fa-book-open');
        expect(loreManager.getIconForKind('unknown')).toBe('fa-book-open');
    });

    test('getLabelForKind returns correct labels', () => {
        expect(loreManager.getLabelForKind('radio')).toBe('RADIO');
        expect(loreManager.getLabelForKind('vista')).toBe('VISTO');
        expect(loreManager.getLabelForKind('oido')).toBe('ESCUCHADO');
        expect(loreManager.getLabelForKind('registro')).toBe('REGISTRO');
        expect(loreManager.getLabelForKind('unknown')).toBe('REGISTRO');
    });

    test('showLore calls UI and Audio methods for normal lore', () => {
        const onClose = jest.fn();
        loreManager.showLore('initial', onClose);

        expect(mockUI.showScreen).toHaveBeenCalledWith('lore');
        expect(mockAudio.playLoreByKey).toHaveBeenCalledWith('lore_intro_track', expect.any(Object));
        expect(mockAudio.duckAmbient).toHaveBeenCalled();
        
        // Simulate clicking continue
        const continueBtn = loreManager.elements.continueBtn;
        continueBtn.click();
        
        expect(mockAudio.stopLore).toHaveBeenCalled();
        expect(mockAudio.unduckAmbient).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    test('showLore handles intermediate lore variants', () => {
        const htmlSpy = jest.fn();
        loreManager.elements.content.html = htmlSpy;

        loreManager.showLore('intermediate');

        expect(mockUI.showScreen).toHaveBeenCalledWith('lore');
        expect(mockAudio.playLoreByKey).toHaveBeenCalled(); 
        expect(mockAudio.duckAmbient).toHaveBeenCalled();
        
        expect(htmlSpy).toHaveBeenCalledWith(expect.stringContaining('fa-solid'));
    });

    test('showLore handles danger lore styling', () => {
        const hasClassSpy = jest.fn().mockReturnValue(true);
        loreManager.elements.title.hasClass = hasClassSpy;
        loreManager.elements.panel.hasClass = hasClassSpy;

        loreManager.showLore('night_civil_death');
        
        expect(loreManager.elements.title.hasClass('text-alert')).toBe(true);
        expect(loreManager.elements.panel.hasClass('lore-danger')).toBe(true);
        expect(mockAudio.playSFXByKey).toHaveBeenCalledWith('glitch_burst', expect.any(Object));
    });

    test('showLore handles calm lore styling', () => {
        const hasClassSpy = jest.fn().mockReturnValue(true);
        loreManager.elements.panel.hasClass = hasClassSpy;

        loreManager.showLore('night_tranquil');
        
        expect(loreManager.elements.panel.hasClass('lore-calm')).toBe(true);
    });

    test('showLore returns early if lore type does not exist', () => {
        loreManager.showLore('non_existent');
        expect(mockUI.showScreen).not.toHaveBeenCalled();
    });
});
