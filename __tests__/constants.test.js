
import { CONFIG, COLORS, UI_STRINGS, AUDIO_CHANNELS, GAME_STATES, STATS_CONFIG } from '../js/Constants.js';

describe('Constants', () => {
    test('CONFIG has required properties', () => {
        expect(CONFIG.MAX_SHELTER_CAPACITY).toBeDefined();
        expect(CONFIG.DAY_LENGTH).toBeDefined();
        expect(CONFIG.GENERATOR).toBeDefined();
        expect(CONFIG.GENERATOR.CONSUMPTION).toBeDefined();
    });

    test('COLORS are valid hex or CSS colors', () => {
        Object.values(COLORS).forEach(color => {
            expect(color).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgba?\(.*\)$|^[a-z]+$/);
        });
    });

    test('UI_STRINGS functions work correctly', () => {
        expect(UI_STRINGS.NEW_CYCLE(5)).toContain('5');
        expect(UI_STRINGS.NIGHT_DEPARTURE_SINGLE('John')).toContain('John');
        expect(UI_STRINGS.NIGHT_DEPARTURE_MULTIPLE(3)).toContain('3');
        expect(UI_STRINGS.RUMOR_TEMPLATE('A', 'B', 'C')).toContain('A');
        expect(UI_STRINGS.RUMOR_TEMPLATE('A', 'B', 'C')).toContain('B');
        expect(UI_STRINGS.RUMOR_TEMPLATE('A', 'B', 'C')).toContain('C');
    });

    test('AUDIO_CHANNELS, GAME_STATES, STATS_CONFIG are defined', () => {
        expect(Object.keys(AUDIO_CHANNELS).length).toBeGreaterThan(0);
        expect(Object.keys(GAME_STATES).length).toBeGreaterThan(0);
        expect(STATS_CONFIG.BASE_URL).toBeDefined();
    });
});
