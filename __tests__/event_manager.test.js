
import { GameEventManager } from '../js/game/GameEventManager.js';
import { State } from '../js/State.js';

describe('GameEventManager', () => {
    let manager;
    let mockGame;
    let mockUI;
    let mockAudio;
    let eventHandlers = {};

    beforeEach(() => {
        State.reset();
        
        mockUI = {
            showScreen: jest.fn(),
            showMessage: jest.fn(),
            showConfirm: jest.fn()
        };

        mockAudio = {
            unlock: jest.fn(),
            playSFXByKey: jest.fn(),
            setMasterVolume: jest.fn(),
            setChannelLevel: jest.fn(),
            getLogString: jest.fn().mockReturnValue('audio logs'),
            validateManifest: jest.fn().mockResolvedValue('manifest report'),
            master: 1.0,
            levels: { ambient: 0.5, lore: 0.5, sfx: 1.0 }
        };

        mockGame = {
            ui: mockUI,
            audio: mockAudio,
            startGame: jest.fn(),
            toggleFullscreen: jest.fn(),
            openRoom: jest.fn(),
            openShelter: jest.fn(),
            openMorgue: jest.fn(),
            openGenerator: jest.fn(),
            openLog: jest.fn(),
            toggleMorgueStats: jest.fn(),
            restartDay: jest.fn(),
            restartGame: jest.fn(),
            handleDecision: jest.fn(),
            inspect: jest.fn(),
            syncAudioPersistence: jest.fn(),
            startNightPhase: jest.fn(),
            confirmRelocation: jest.fn()
        };

        manager = new GameEventManager(mockGame);
        eventHandlers = {};

        // Mock jQuery
        const jQueryMock = (selector) => {
            const mockObj = {
                addClass: jest.fn().mockReturnThis(),
                removeClass: jest.fn().mockReturnThis(),
                on: jest.fn(function(event, subSelector, handler) {
                    if (typeof subSelector === 'function') {
                        // case: .on('click', handler)
                        eventHandlers[`${selector}:${event}`] = subSelector;
                    } else {
                        // case: .on('click', '#sub', handler)
                        eventHandlers[`${selector}:${subSelector}:${event}`] = handler;
                    }
                    return this;
                }),
                val: jest.fn().mockReturnValue('50'),
                prop: jest.fn().mockReturnThis(),
                is: jest.fn().mockReturnValue(false),
                trigger: jest.fn(function(event) {
                    if (eventHandlers[`${selector}:${event}`]) {
                        eventHandlers[`${selector}:${event}`].call(this);
                    }
                    return this;
                })
            };
            return mockObj;
        };
        global.$ = jest.fn(jQueryMock);

        // Ensure jQuery mock handles $(document)
        const docOnMock = jest.fn((event, subSelector, handler) => {
            if (typeof subSelector === 'function') {
                eventHandlers[`document:${event}`] = subSelector;
            } else {
                eventHandlers[`document:${subSelector}:${event}`] = handler;
            }
        });
        
        global.document.on = docOnMock;

        global.$ = jest.fn((selector) => {
            if (selector === global.document || selector === 'document') {
                return {
                    on: docOnMock
                };
            }
            return jQueryMock(selector);
        });
    });

    test('bindAll attaches event handlers', () => {
        manager.bindAll();
        expect(global.$).toHaveBeenCalled();
        expect(global.document.on).toHaveBeenCalled();
    });

    test('start game button triggers game start', () => {
        manager.bindAll();
        const startBtnHandler = eventHandlers['#btn-start-game:click'];
        startBtnHandler();
        
        expect(mockAudio.unlock).toHaveBeenCalled();
        expect(mockGame.startGame).toHaveBeenCalled();
    });

    test('settings toggle updates UI with state values', () => {
        State.config.maxShelterCapacity = 10;
        manager.bindAll();
        const settingsBtnHandler = eventHandlers['#btn-settings-toggle:click'];
        settingsBtnHandler();
        
        expect(mockUI.showScreen).toHaveBeenCalledWith('settings');
    });

    test('navigation buttons call game methods', () => {
        manager.bindAll();
        
        eventHandlers['#nav-room:click']();
        expect(mockGame.openRoom).toHaveBeenCalled();
        
        eventHandlers['#nav-shelter:click']();
        expect(mockGame.openShelter).toHaveBeenCalled();
        
        eventHandlers['#nav-generator:click']();
        expect(mockGame.openGenerator).toHaveBeenCalled();
    });

    test('pause button updates UI state', () => {
        manager.bindAll();
        eventHandlers['#btn-pause:click']();
        
        expect(State.paused).toBe(true);
    });

    test('delegated game decisions trigger game logic', () => {
        State.paused = false;
        manager.bindAll();
        
        const admitHandler = eventHandlers['document:#btn-admit:click'];
        expect(admitHandler).toBeDefined();
        
        admitHandler();
        expect(mockGame.handleDecision).toHaveBeenCalledWith('admit');
        
        const ignoreHandler = eventHandlers['document:#btn-ignore:click'];
        expect(ignoreHandler).toBeDefined();
        ignoreHandler();
        expect(mockGame.handleDecision).toHaveBeenCalledWith('ignore');
    });

    test('delegated tool inspection triggers game logic', () => {
        State.paused = false;
        manager.bindAll();
        
        const thermoHandler = eventHandlers['#inspection-tools-container:#tool-thermo:click'];
        expect(thermoHandler).toBeDefined();
        thermoHandler();
        expect(mockGame.inspect).toHaveBeenCalledWith('thermometer');
    });
});
