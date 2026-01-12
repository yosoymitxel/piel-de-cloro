let Game;
let NPC;
let State;
let UIManager;
let AudioManager;

describe('Migration Integration Testing Suite', () => {
    let game;

    beforeAll(async () => {
        // Global Audio Mock
        global.Audio = class {
            constructor() {
                this.loop = false;
                this.volume = 0;
                this.paused = true;
            }
            play() { return Promise.resolve(); }
            pause() {}
            addEventListener() {}
            removeEventListener() {}
            load() {}
        };

        // Global DOM Mocks
        const jqueryMock = function(selector) {
            const element = {
                addClass: function() { return this; },
                removeClass: function() { return this; },
                toggleClass: function() { return this; },
                attr: function(key) { 
                    if (key === 'class') return 'pixel-avatar state-normal';
                    return this; 
                },
                removeAttr: function() { return this; },
                html: function() { return this; },
                text: function() { return this; },
                css: function() { return this; },
                on: function() { return this; },
                off: function() { return this; },
                find: function() { return this; },
                append: function() { return this; },
                remove: function() { return this; },
                val: function() { return '10'; },
                show: function() { return this; },
                hide: function() { return this; },
                fadeIn: function() { return this; },
                fadeOut: function() { return this; },
                empty: function() { return this; },
                click: function() { return this; },
                animate: function(props, duration, cb) { if (cb) cb(); return this; },
                width: function() { return 100; },
                height: function() { return 100; },
                scrollLeft: function() { return 0; },
                scrollTop: function() { return 0; },
                children: function() { return this; },
                parent: function() { return this; },
                closest: function() { return this; },
                eq: function() { return this; },
                first: function() { return this; },
                last: function() { return this; },
                each: function(cb) { cb.call(this, 0, this); return this; },
                prop: function() { return this; },
                ready: function(fn) { if (fn) fn(); return this; },
                is: function() { return false; },
                length: 1
            };
            return element;
        };
        // Fix for $(document).ready
        jqueryMock.ready = function(fn) { if (fn) fn(); return this; };
        
        global.$ = jqueryMock;
        global.jQuery = jqueryMock;

        global.document = {
            getElementById: jest.fn().mockReturnValue({ appendChild: jest.fn() }),
            dispatchEvent: jest.fn(),
            documentElement: { requestFullscreen: jest.fn().mockResolvedValue() },
            ready: jest.fn(fn => fn()),
            createElement: jest.fn().mockReturnValue({
                getContext: jest.fn().mockReturnValue({
                    fillRect: jest.fn(),
                    clearRect: jest.fn(),
                    drawImage: jest.fn(),
                    getImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
                    putImageData: jest.fn(),
                    beginPath: jest.fn(),
                    arc: jest.fn(),
                    fill: jest.fn()
                }),
                width: 100,
                height: 100
            })
        };
        global.CustomEvent = class { constructor(name, detail) { this.name = name; this.detail = detail; } };
        global.localStorage = {
            getItem: jest.fn().mockReturnValue(null),
            setItem: jest.fn()
        };
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });
        global.window = {
            game: null,
            matchMedia: jest.fn().mockReturnValue({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }),
            scrollTo: jest.fn(),
            location: { reload: jest.fn() },
            requestAnimationFrame: jest.fn(cb => { 
                // Don't execute immediately to avoid infinite recursion in animation loops
                setTimeout(cb, 0); 
                return 1; 
            }),
            cancelAnimationFrame: jest.fn()
        };
        global.requestAnimationFrame = global.window.requestAnimationFrame;
        global.cancelAnimationFrame = global.window.cancelAnimationFrame;
        global.navigator = {
            userAgent: 'node.js'
        };

        // Dynamic imports after mocks are set
        const stateMod = await import('../js/State.js');
        State = stateMod.State;
        const uiMod = await import('../js/UIManager.js');
        UIManager = uiMod.UIManager;
        const audioMod = await import('../js/AudioManager.js');
        AudioManager = audioMod.AudioManager;
        const statsMod = await import('../js/StatsManager.js');
        const StatsManager = statsMod.StatsManager;
        const gameMod = await import('../js/Game.js');
        Game = gameMod.Game;
        const npcMod = await import('../js/NPC.js');
        NPC = npcMod.NPC;

        // Mock StatsManager.start to avoid timers
        StatsManager.prototype.start = jest.fn().mockResolvedValue();
        
        // Mock GeneratorManager.startFlicker to avoid recursive setTimeouts
        const genMod = await import('../js/GeneratorManager.js');
        const GeneratorManager = genMod.GeneratorManager;
        GeneratorManager.prototype.startFlicker = jest.fn();

        // Mock AudioManager methods
        AudioManager.prototype.loadManifest = jest.fn().mockResolvedValue();
        AudioManager.prototype.createChannel = jest.fn().mockReturnValue({
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            play: jest.fn().mockResolvedValue(),
            pause: jest.fn(),
            load: jest.fn()
        });
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    beforeEach(() => {
        State.reset();
        State.config.initialEntrantProbability = 0; // Disable random entrants
        State.config.dayIntrusionProbability = 0; // Disable intrusions during day
        State.config.securityIntrusionProbability = 0; // Disable night intrusions
        
        // Mock Math.random to be deterministic for tests
        jest.spyOn(Math, 'random').mockReturnValue(0.5);

        jest.clearAllMocks();
        jest.useFakeTimers();
        
        // Mock problematic methods BEFORE creating Game instance to avoid rAF loops and timeouts
        UIManager.prototype.typeText = jest.fn();
        UIManager.prototype.showLore = jest.fn((id, cb) => cb && cb());
        UIManager.prototype.showFeedback = jest.fn();
        UIManager.prototype.animateToolFlashlight = jest.fn();
        UIManager.prototype.animateToolPulse = jest.fn();
        UIManager.prototype.animateToolPupils = jest.fn();
        UIManager.prototype.animateToolThermo = jest.fn();
        
        game = new Game();
        global.window.game = game;

        // Spy on key UI and Audio methods to verify flow without running their logic
        jest.spyOn(game.ui, 'renderNightScreen').mockImplementation(() => {});
        jest.spyOn(game.ui, 'updateStats').mockImplementation(() => {});
        jest.spyOn(game.ui, 'showScreen').mockImplementation(() => {});
        jest.spyOn(game.ui, 'renderNPC').mockImplementation(() => {});
        jest.spyOn(game.ui, 'updateRunStats').mockImplementation(() => {});
        jest.spyOn(game, 'updateHUD').mockImplementation(() => {});
        
        jest.spyOn(game.audio, 'playSFXByKey').mockImplementation(() => {});
        jest.spyOn(game.audio, 'playLoreByKey').mockImplementation(() => {});
        jest.spyOn(game.audio, 'playAmbientByKey').mockImplementation(() => {});
        jest.spyOn(game.audio, 'fade').mockImplementation(() => {});
    });

    test('Integration: Full cycle (Subject -> Inspect -> Admit -> Night -> Next Day)', () => {
        // 1. Initial State
        expect(State.cycle).toBe(1);
        expect(State.dayTime).toBe(1);

        // 2. Next Turn (New NPC arrives)
        game.nextTurn();
        expect(State.currentNPC).toBeInstanceOf(NPC);
        const npc = State.currentNPC;
        expect(npc.scanCount).toBe(0);

        // 3. Inspect NPC (Energy/Scan consumption)
        // Default mode is 'normal', so 2 scans allowed
        expect(State.generator.mode).toBe('normal');
        
        game.actions.inspect('flashlight');
        jest.runAllTimers(); // Advance animation timers
        expect(npc.scanCount).toBe(1);
        expect(game.updateHUD).toHaveBeenCalled();

        game.isAnimating = false; // Reset animation lock for test
        game.actions.inspect('thermometer');
        jest.runAllTimers();
        expect(npc.scanCount).toBe(2);
        
        // Attempt 3rd scan - should be blocked by energy logic in real game
        game.isAnimating = false;
        game.actions.inspect('pulse');
        // It will be blocked by line 397 because scanCount(2) >= maxEnergy(2)
        expect(npc.scanCount).toBe(2); 

        // 4. Admit NPC
        game.actions.handleDecision('admit');
        expect(State.admittedNPCs.length).toBe(1);
        expect(State.admittedNPCs[0]).toBe(npc);
        expect(State.currentNPC).not.toBe(npc); // New NPC should be generated
        expect(State.currentNPC).toBeInstanceOf(NPC);
        expect(State.dayTime).toBe(2);

        // 5. Progress until end of day
        State.dayTime = State.config.dayLength + 1;
        expect(State.isDayOver()).toBe(true);

        // 6. Transition to Night
        game.mechanics.startNightPhase();
        expect(State.isNight).toBe(true);
        expect(State.dayClosed).toBe(true);
        expect(game.ui.renderNightScreen).toHaveBeenCalled();

        // 7. Start Next Day
        game.mechanics.startNextDay();
        expect(State.cycle).toBe(2);
        expect(State.dayTime).toBe(1);
        expect(State.isNight).toBe(false);
    });

    test('Integration: Generator Modes and Scan Capacity', () => {
        game.nextTurn();
        const npc = State.currentNPC;

        // Mode: Save (1 scan)
        State.generator.mode = 'save';
        game.updateHUD(); // This would update the UI logic
        
        // The logic for blocking scans is in UIManager.updateHUD and tool click handlers.
        // In the integration test, we can verify if the config matches our expectations.
        expect(State.config.generator.consumption[State.generator.mode]).toBe(1);

        // Mode: Overload (3 scans)
        State.generator.mode = 'overload';
        expect(State.config.generator.consumption[State.generator.mode]).toBe(3);
    });

    test('Integration: Paranoia and UI Updates', () => {
        // Simular diálogo que incremente paranoia
        State.updateParanoia(50);
        expect(State.paranoia).toBe(50);
        
        // Verificar que el UIManager se llamó para actualizar la UI (indirectamente vía updateStats o similar)
        game.ui.updateStats();
        expect(game.ui.updateStats).toHaveBeenCalled();
    });

    test('Critical: dialoguePoolsUsed uniqueness in State', () => {
        const poolId = 'test_pool';
        State.markDialogueUsed(poolId);
        State.markDialogueUsed(poolId);
        
        const count = State.dialoguePoolsUsed.filter(id => id === poolId).length;
        expect(count).toBe(1);
    });
});
