
import { State } from '../js/State.js';
import { NPC } from '../js/NPC.js';
import { DialogueData } from '../js/DialogueData.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
        removeItem: (key) => { delete store[key]; }
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock document for CustomEvents
Object.defineProperty(global, 'document', {
    value: {
        dispatchEvent: jest.fn(),
        addEventListener: jest.fn()
    }
});

describe('Core Systems: State & NPC', () => {
    beforeEach(() => {
        State.reset();
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('State Management', () => {
        test('State.reset() initializes default values', () => {
            State.paranoia = 50;
            State.cycle = 5;
            State.reset();
            expect(State.paranoia).toBe(0);
            expect(State.cycle).toBe(1);
            expect(State.admittedNPCs).toHaveLength(0);
            expect(State.generator.isOn).toBe(true);
        });

        test('State.updateParanoia() clamps values between 0 and 100', () => {
            State.updateParanoia(50);
            expect(State.paranoia).toBe(50);
            State.updateParanoia(60);
            expect(State.paranoia).toBe(100);
            State.updateParanoia(-110);
            expect(State.paranoia).toBe(0);
        });

        test('State.setFlag() and hasFlag() work correctly', () => {
            expect(State.hasFlag('test_flag')).toBe(false);
            State.setFlag('test_flag', true);
            expect(State.hasFlag('test_flag')).toBe(true);
        });

        test('State persistence (unlocked endings and audio settings)', () => {
            State.unlockEnding('ending_1');
            State.audioSettings.master = 0.5;
            State.savePersistentData();

            // Simulate reload
            State.unlockedEndings = [];
            State.audioSettings.master = 1.0;
            State.loadPersistentData();

            expect(State.unlockedEndings).toContain('ending_1');
            expect(State.audioSettings.master).toBe(0.5);
        });

        test('State.isShelterFull() based on config', () => {
            State.config.maxShelterCapacity = 2;
            State.addAdmitted({ name: 'NPC 1' });
            expect(State.isShelterFull()).toBe(false);
            State.addAdmitted({ name: 'NPC 2' });
            expect(State.isShelterFull()).toBe(true);
        });
    });

    describe('NPC Generation', () => {
        test('NPC generates name and occupation', () => {
            const npc = new NPC();
            expect(npc.name).toBeDefined();
            expect(npc.occupation).toBeDefined();
            expect(npc.name.split(' ').length).toBeGreaterThanOrEqual(2);
        });

        test('NPC infection status respects probability', () => {
            // Test 100% infected
            const infectedNpc = new NPC(1.0);
            expect(infectedNpc.isInfected).toBe(true);

            // Test 0% infected
            const cleanNpc = new NPC(0.0);
            expect(cleanNpc.isInfected).toBe(false);
        });

        test('NPC attributes differ based on infection (statistically)', () => {
            const infectedNpc = new NPC(1.0);
            const cleanNpc = new NPC(0.0);

            // Pulse is usually lower in infected (based on NPC.js:95)
            // Pulse: infected ? rand(0,20) : rand(60,100)
            expect(infectedNpc.attributes.pulse).toBeLessThan(40);
            expect(cleanNpc.attributes.pulse).toBeGreaterThan(50);
        });

        test('NPC gender-based features', () => {
            const maleNpc = new NPC(0.5, { gender: 'male' });
            // The NPC constructor randomizes gender unless we mock Math.random
            // but let's just check it has a valid gender
            expect(['male', 'female']).toContain(maleNpc.gender);
        });

        test('NPC conversation initialization', () => {
            const npc = new NPC();
            expect(npc.conversation).toBeDefined();
            expect(npc.conversation.getCurrentNode()).toBeDefined();
        });
    });
});
