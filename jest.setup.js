// Polyfill minimal jest.fn() for environments where jest global is missing (ESM + certain runners)
if (typeof global.jest === 'undefined') {
    global.jest = {
        fn(impl) {
            const f = function (...args) {
                f.mock.calls.push(args);
                if (typeof f._impl === 'function') return f._impl.apply(this, args);
                return f._return;
            };
            f._isMockFunction = true;
            f.mock = { calls: [] };
            f.getMockName = () => f._name || 'mockFunction';
            f.mockName = (name) => { f._name = name; return f; };
            f.mockClear = () => { f.mock.calls = []; return f; };
            f.mockReset = () => { f.mock.calls = []; f._return = undefined; f._impl = undefined; return f; };
            f.mockReturnValue = (v) => { f._return = v; return f; };
            f.mockImplementation = (fnimpl) => { f._impl = fnimpl; return f; };
            f.mockResolvedValue = (v) => { f._impl = () => Promise.resolve(v); return f; };
            f.mockRejectedValue = (v) => { f._impl = () => Promise.reject(v); return f; };
            f.mockReturnThis = () => { f._impl = function() { return this; }; return f; };
            return f;
        },
        spyOn(obj, prop) {
            const original = obj[prop];
            const mock = this.fn(original);
            obj[prop] = mock;
            mock.mockRestore = () => { obj[prop] = original; };
            return mock;
        },
        clearAllMocks() {
            // No-op for polyfill unless we track all mocks
        },
        resetAllMocks() {
            // No-op for polyfill
        },
        restoreAllMocks() {
            // No-op for polyfill
        },
        useFakeTimers() {},
        useRealTimers() {},
        advanceTimersByTime() {},
        clearAllTimers() {},
        runAllTimers() {},
        runOnlyPendingTimers() {}
    };
}

// Global DOM and Browser Mocks
if (typeof global.window === 'undefined') {
    global.window = {
        requestAnimationFrame: (cb) => setTimeout(cb, 0),
        cancelAnimationFrame: (id) => clearTimeout(id),
        localStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {}
        },
        sessionStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {}
        },
        scrollTo: () => {},
        matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })
    };
    global.requestAnimationFrame = global.window.requestAnimationFrame;
    global.cancelAnimationFrame = global.window.cancelAnimationFrame;
    global.localStorage = global.window.localStorage;
}

if (typeof global.document === 'undefined') {
    global.document = {
        ready: (fn) => fn(),
        dispatchEvent: () => {},
        getElementById: () => ({ appendChild: () => {} }),
        createElement: () => ({
            getContext: () => ({
                fillRect: () => {},
                clearRect: () => {},
                drawImage: () => {},
                getImageData: () => ({ data: new Uint8ClampedArray(4) }),
                putImageData: () => {},
                beginPath: () => {},
                arc: () => {},
                fill: () => {}
            }),
            width: 100,
            height: 100
        })
    };
}

if (typeof global.Audio === 'undefined') {
    global.Audio = class {
        constructor() { this.volume = 1; this.loop = false; }
        play() { return Promise.resolve(); }
        pause() {}
        addEventListener() {}
        removeEventListener() {}
        load() {}
    };
}

// jQuery Mock
const createJQueryMock = () => {
    const elementMock = (selector) => ({
        on: jest.fn().mockReturnThis(),
        off: jest.fn().mockReturnThis(),
        click: jest.fn().mockReturnThis(),
        addClass: jest.fn().mockReturnThis(),
        removeClass: jest.fn().mockReturnThis(),
        toggleClass: jest.fn().mockReturnThis(),
        attr: jest.fn().mockImplementation((key) => {
            if (key === 'class') return 'mock-class';
            return 'mock-attr';
        }),
        prop: jest.fn().mockReturnThis(),
        val: jest.fn().mockReturnValue(''),
        text: jest.fn().mockReturnThis(),
        html: jest.fn().mockReturnThis(),
        empty: jest.fn().mockReturnThis(),
        append: jest.fn().mockReturnThis(),
        css: jest.fn().mockReturnThis(),
        find: jest.fn().mockReturnThis(),
        hide: jest.fn().mockReturnThis(),
        show: jest.fn().mockReturnThis(),
        fadeIn: jest.fn().mockReturnThis(),
        fadeOut: jest.fn().mockReturnThis(),
        ready: jest.fn().mockImplementation(fn => fn()),
        length: 1,
        [0]: { scrollHeight: 100, scrollTop: 0 }
    });

    const mock = jest.fn().mockImplementation(selector => elementMock(selector));
    
    mock.ready = jest.fn().mockImplementation(fn => fn());
    mock.ajax = jest.fn().mockResolvedValue({});
    mock.get = jest.fn().mockResolvedValue({});
    mock.post = jest.fn().mockResolvedValue({});
    return mock;
};

global.$ = createJQueryMock();
global.jQuery = global.$;

global.fetch = jest.fn().mockImplementation((url) => {
    // If it looks like a manifest or the test uses 'mock_url'
    if (url.includes('manifest') || url === 'mock_url') {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ "test_sfx": "path/to/test.mp3" })
        });
    }
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
    });
});

// Ensure Jest uses real timers so requestAnimationFrame/setTimeout used in UI tests run as expected
if (typeof jest !== 'undefined' && typeof jest.useRealTimers === 'function') {
    try { jest.useRealTimers(); } catch (e) { /* ignore */ }
}
