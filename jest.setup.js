// Polyfill minimal jest.fn() for environments where jest global is missing (ESM + certain runners)
if (typeof global.jest === 'undefined') {
    global.jest = {
        fn(impl) {
            const f = function (...args) {
                f.mock.calls.push(args);
                if (typeof f._impl === 'function') return f._impl(...args);
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
            return f;
        }
    };
}

// Ensure Jest uses real timers so requestAnimationFrame/setTimeout used in UI tests run as expected
if (typeof jest !== 'undefined' && typeof jest.useRealTimers === 'function') {
    try { jest.useRealTimers(); } catch (e) { /* ignore */ }
}
