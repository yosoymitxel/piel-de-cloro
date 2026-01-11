// Polyfill minimal jest.fn() for environments where jest global is missing (ESM + certain runners)
if (typeof global.jest === 'undefined') {
    global.jest = {
        fn(implementation) {
            const f = function(...args) {
                f.mock.calls.push(args);
                if (typeof f._impl === 'function') return f._impl.apply(this, args);
                return f._returnValue;
            };
            f._isMockFunction = true;
            f.mock = { calls: [] };
            f._impl = implementation;
            f._returnValue = undefined;
            f.mockReturnValue = (val) => {
                f._returnValue = val;
                return f;
            };
            f.mockResolvedValue = (val) => {
                f._returnValue = Promise.resolve(val);
                return f;
            };
            f.mockRejectedValue = (val) => {
                f._returnValue = Promise.reject(val);
                return f;
            };
            f.mockImplementation = (impl) => {
                f._impl = impl;
                return f;
            };
            f.mockReturnThis = () => {
                f._impl = function() { return this; };
                return f;
            };
            f.mockClear = () => {
                f.mock.calls = [];
                return f;
            };
            f.mockReset = () => {
                f.mock.calls = [];
                f._impl = implementation;
                f._returnValue = undefined;
                return f;
            };
            f.getMockName = () => "jest.fn()";
            f.mockRestore = () => {
                f.mock.calls = [];
                f._impl = implementation;
                f._returnValue = undefined;
            };
            return f;
        },
        spyOn(obj, method) {
            const original = obj[method];
            const mock = this.fn(original.bind(obj));
            obj[method] = mock;
            mock.mockRestore = () => {
                obj[method] = original;
            };
            return mock;
        },
        clearAllMocks() {
            // No-op for the polyfill
        },
        useFakeTimers() {
            return this;
        },
        useRealTimers() {
            return this;
        },
        advanceTimersByTime(ms) {
            return this;
        }
    };
}

// Polyfill Intl.NumberFormat for Node environments without full ICU
// We force the polyfill if the output isn't what we expect in tests
const testFormat = new Intl.NumberFormat('es-ES').format(1234);
if (testFormat === '1234') {
    const originalIntl = global.Intl;
    global.Intl = {
        ...originalIntl,
        NumberFormat: function() {
            return {
                format: (num) => {
                    // Simple dot separator polyfill for Spanish/European style
                    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                }
            };
        }
    };
}

// Mock window and document if they don't exist (Node environment)
if (typeof window === 'undefined') {
    global.window = {
        location: { href: '' },
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        onerror: null,
        onunhandledrejection: null
    };
}

if (typeof document === 'undefined') {
    global.document = {
        getElementById: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        createElement: jest.fn(() => ({
            style: {},
            setAttribute: jest.fn(),
            appendChild: jest.fn()
        })),
        dispatchEvent: jest.fn(),
        addEventListener: jest.fn()
    };
}

// Mock localStorage if it doesn't exist (Node environment)
if (typeof localStorage === 'undefined') {
    global.localStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0
    };
}

// Mock jQuery ($)
function createJQueryMock() {
    const handlers = {};
    const mock = {
        on: jest.fn((event, selector, handler) => {
            if (typeof selector === 'function') {
                handler = selector;
                selector = null;
            }
            const key = selector ? `${selector}:${event}` : event;
            if (!handlers[key]) handlers[key] = [];
            handlers[key].push(handler);
            return mock;
        }),
        off: jest.fn((event, selector) => {
            const key = selector ? `${selector}:${event}` : event;
            delete handlers[key];
            return mock;
        }),
        trigger: jest.fn((event, data) => {
            if (handlers[event]) {
                handlers[event].forEach(h => h({ type: event, target: mock, currentTarget: mock }, data));
            }
            return mock;
        }),
        click: jest.fn((handler) => {
            if (typeof handler === 'function') {
                return mock.on('click', handler);
            }
            return mock.trigger('click');
        }),
        text: jest.fn().mockReturnThis(),
        html: jest.fn().mockReturnThis(),
        addClass: jest.fn().mockReturnThis(),
        removeClass: jest.fn().mockReturnThis(),
        attr: jest.fn().mockReturnThis(),
        val: jest.fn().mockReturnThis(),
        hide: jest.fn().mockReturnThis(),
        show: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnValue(false),
        find: jest.fn().mockReturnThis(),
        empty: jest.fn().mockReturnThis(),
        append: jest.fn().mockReturnThis(),
        prepend: jest.fn().mockReturnThis(),
        children: jest.fn().mockReturnThis(),
        last: jest.fn().mockReturnThis(),
        remove: jest.fn().mockReturnThis(),
        toggleClass: jest.fn().mockReturnThis(),
        hasClass: jest.fn().mockReturnValue(false)
    };
    return mock;
}
global.$ = jest.fn(() => createJQueryMock());

// Mock Audio
global.Audio = jest.fn(() => ({
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    volume: 0,
    src: '',
    loop: false,
    currentTime: 0,
    error: null,
    paused: true
}));

// Ensure Jest uses real timers so requestAnimationFrame/setTimeout used in UI tests run as expected
if (typeof jest !== 'undefined' && typeof jest.useRealTimers === 'function') {
    try { jest.useRealTimers(); } catch (e) { /* ignore */ }
}
