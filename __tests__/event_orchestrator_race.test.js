import { EventOrchestrator } from '../js/EventOrchestrator.js';

function deferred() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}

describe('EventOrchestrator generation safety', () => {
    test('stale async cleanup cannot release a newer event after clear()', async () => {
        const first = deferred();
        const second = deferred();
        const audio = {
            duckAmbient: jest.fn(),
            unduckAmbient: jest.fn()
        };
        const orchestrator = new EventOrchestrator({ audio });

        orchestrator.add({
            id: 'old-ending-interrupted',
            type: 'sequence',
            execute: () => first.promise
        });
        expect(orchestrator.currentEvent.id).toBe('old-ending-interrupted');

        orchestrator.clear();
        orchestrator.add({
            id: 'new-ending',
            type: 'sequence',
            execute: () => second.promise
        });
        expect(orchestrator.currentEvent.id).toBe('new-ending');
        expect(orchestrator.isProcessing).toBe(true);

        first.resolve();
        await Promise.resolve();
        await Promise.resolve();

        // The old promise's finally block must not clear the new event or
        // restore ambient audio while the new sequence still owns the queue.
        expect(orchestrator.currentEvent.id).toBe('new-ending');
        expect(orchestrator.isProcessing).toBe(true);
        expect(audio.unduckAmbient).not.toHaveBeenCalled();

        second.resolve();
        await new Promise(resolve => setTimeout(resolve, 20));

        expect(orchestrator.currentEvent).toBeNull();
        expect(orchestrator.isProcessing).toBe(false);
        expect(audio.unduckAmbient).toHaveBeenCalledTimes(1);
    });
});
