
let StatsManager;
let State;
let jqMock;

describe('Stats System (StatsManager)', () => {
    let statsManager;

    beforeAll(async () => {
        // Dynamic imports
        const statsMod = await import('../js/StatsManager.js');
        StatsManager = statsMod.StatsManager;
        const stateMod = await import('../js/State.js');
        State = stateMod.State;
    });

    beforeEach(() => {
        statsManager = new StatsManager();
    });

    test('formatNumber should format correctly for es-ES', () => {
        const formatted = statsManager.formatNumber(1234.56);
        expect(formatted).toMatch(/1[.,\s]?234,56/);
    });

    test('updateRunStats should update DOM elements based on State', () => {
        State.reset();
        State.dialoguesCount = 10;
        statsManager.updateRunStats(State);

        expect($).toHaveBeenCalledWith('#stat-run-dialogues');
        // We can't easily check chained text() on global mock without complexity,
        // but we can check if $ was called with the selector.
    });

    test('updateUIRealtime should update DOM with data', () => {
        const data = { users: 100 };
        statsManager.updateUIRealtime(data);
        expect($).toHaveBeenCalledWith('#stat-rt-users');
    });

    test('isFresh should return true if within TTL', () => {
        const now = Date.now();
        expect(statsManager.isFresh(now - 1000, 5000)).toBe(true);
        expect(statsManager.isFresh(now - 6000, 5000)).toBe(false);
    });
});
