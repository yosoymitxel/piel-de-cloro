import { jest } from '@jest/globals';

jest.unstable_mockModule('../js/ui/StatsPanelRenderer.js', () => ({
    StatsPanelRenderer: jest.fn().mockImplementation(() => ({
        updateUIRealtime: jest.fn(),
        updateUINightly: jest.fn(),
        updateNextRefreshLabel: jest.fn(),
        bindRefreshAction: jest.fn(),
        applyResponsiveBehavior: jest.fn()
    }))
}));

const { StatsManager } = await import('../js/StatsManager.js');

describe('StatsManager', () => {
    let manager;
    let mockRenderer;

    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = (function() {
            let store = {};
            return {
                getItem: jest.fn(key => store[key] || null),
                setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
                clear: jest.fn(() => { store = {}; })
            };
        })();
        Object.defineProperty(global, 'localStorage', { value: localStorageMock, configurable: true });

        // Mock fetch
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ some: 'data' })
        });

        manager = new StatsManager();
        mockRenderer = manager.renderer;
    });

    test('loadCache returns default if empty', () => {
        const cache = manager.loadCache();
        expect(cache).toEqual({ realtime: {}, nightly: {} });
    });

    test('isFresh returns correct boolean based on TTL', () => {
        const now = Date.now();
        const ttl = 1000;
        expect(manager.isFresh(now - 500, ttl)).toBe(true);
        expect(manager.isFresh(now - 1500, ttl)).toBe(false);
    });

    test('updateRealtime uses cache if fresh', async () => {
        const data = { users: 100 };
        manager.cache.realtime = { ts: Date.now(), data };
        
        await manager.updateRealtime(false);
        
        expect(global.fetch).not.toHaveBeenCalled();
        expect(mockRenderer.updateUIRealtime).toHaveBeenCalledWith(data);
    });

    test('updateRealtime fetches if force is true', async () => {
        manager.useMock = false;
        const data = { users: 100 };
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(data)
        });
        
        await manager.updateRealtime(true);
        
        expect(global.fetch).toHaveBeenCalled();
        expect(mockRenderer.updateUIRealtime).toHaveBeenCalledWith(data);
    });

    test('mockResponse generates deterministic data', () => {
        const res1 = manager.mockResponse('http://test.com/rt');
        const res2 = manager.mockResponse('http://test.com/rt');
        expect(res1).toEqual(res2);
    });

    test('formatNumber uses Intl.NumberFormat', () => {
        const num = 1234567.89;
        const formatted = manager.formatNumber(num);
        // We check if it contains a space or a dot depending on locale, 
        // but we just want to see if it's a string and roughly matches.
        expect(typeof formatted).toBe('string');
        expect(formatted).toMatch(/1[.,\s]234[.,\s]567/);
    });
});
