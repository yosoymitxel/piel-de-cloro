
import { ErrorSystem } from '../js/ErrorSystem.js';

describe('ErrorSystem', () => {
    let errorSystem;

    beforeEach(() => {
        // Clear global handlers before each test
        window.onerror = null;
        window.onunhandledrejection = null;
        errorSystem = new ErrorSystem();
    });

    test('initializes global handlers', () => {
        expect(window.onerror).toBeDefined();
        expect(window.onunhandledrejection).toBeDefined();
    });

    test('logError adds error to list and updates UI', () => {
        const error = {
            message: 'Test error',
            source: 'test.js',
            lineno: 10,
            timestamp: '12:00:00'
        };
        errorSystem.logError(error);
        expect(errorSystem.errors).toContain(error);
        expect(global.$).toHaveBeenCalledWith('#error-log-content');
    });

    test('formatStack simplifies stack trace', () => {
        const stack = "Error: test\n    at Object.<anonymous> (test.js:1:1)\n    at Module._compile (module.js:1:1)\n    at Object.Module._extensions..js (module.js:1:1)";
        const formatted = errorSystem.formatStack(stack);
        const lines = formatted.split('\n');
        expect(lines.length).toBeLessThanOrEqual(3);
    });

    test('global onerror triggers logError', () => {
        const spy = jest.spyOn(errorSystem, 'logError');
        window.onerror('Test message', 'test.js', 1, 1, new Error('Test'));
        expect(spy).toHaveBeenCalled();
    });
});
