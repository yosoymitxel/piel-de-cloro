
import { StatsManager } from '../js/StatsManager.js';

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

// Mock StatsPanelRenderer
class MockRenderer {
    updateUIRealtime = jest.fn();
    updateUINightly = jest.fn();
    updateNextRefreshLabel = jest.fn();
    bindRefreshAction = jest.fn();
    applyResponsiveBehavior = jest.fn();
}

describe('StatsManager', () => {
    let stats;
    let mockRenderer;

    beforeEach(() => {
        localStorage.clear();
        mockRenderer = new MockRenderer();
        stats = new StatsManager();
        stats.renderer = mockRenderer;
        stats.useMock = true; // Use mock responses for tests
    });

    test('loadCache returns default if empty', () => {
        const cache = stats.loadCache();
        expect(cache.realtime).toEqual({});
        expect(cache.nightly).toEqual({});
    });

    test('saveCache and loadCache work together', () => {
        stats.cache = { realtime: { ts: 100, data: { x: 1 } }, nightly: {} };
        stats.saveCache();
        const loaded = stats.loadCache();
        expect(loaded.realtime.data.x).toBe(1);
    });

    test('isFresh returns correct boolean based on TTL', () => {
        const now = Date.now();
        expect(stats.isFresh(now - 500, 1000)).toBe(true);
        expect(stats.isFresh(now - 1500, 1000)).toBe(false);
    });

    test('mockResponse returns structured data', () => {
        const rt = stats.mockResponse('/rt/counters');
        expect(rt).toHaveProperty('users');
        expect(rt).toHaveProperty('transactions');
        
        const nightly = stats.mockResponse('/nightly/metrics');
        expect(nightly).toHaveProperty('consolidated');
        expect(nightly).toHaveProperty('average');
    });

    test('updateRealtime uses cache if fresh', async () => {
        const data = { users: 10 };
        stats.cache.realtime = { ts: Date.now(), data };
        
        await stats.updateRealtime(false);
        
        expect(mockRenderer.updateUIRealtime).toHaveBeenCalledWith(data);
    });

    test('updateRealtime fetches if not fresh or forced', async () => {
        stats.cache.realtime = { ts: 0, data: {} };
        
        await stats.updateRealtime(false);
        
        expect(mockRenderer.updateUIRealtime).toHaveBeenCalled();
        expect(stats.cache.realtime.ts).toBeGreaterThan(0);
    });

    test('formatNumber uses Spanish locale', () => {
        expect(stats.formatNumber(1234)).toBe('1.234');
    });
});
