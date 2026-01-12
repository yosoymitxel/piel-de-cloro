import { selectDialogueSet, Conversation } from '../js/DialogueEngine.js';
import { DialogueData } from '../js/DialogueData.js';
import { State } from '../js/State.js';

describe('Dialogue Uniqueness and Repetition', () => {
    beforeEach(() => {
        State.reset();
        // Clear pools tracking specifically if reset doesn't do it all
        State.dialoguePoolsUsed = [];
        State.dialoguePoolsLastUsed = {};
        State.dialoguesCount = 0;
    });

    test('Should prioritize unused pools until all matching candidates are exhausted', () => {
        // We'll use a personality that has multiple pools
        const personality = 'nervous';
        const candidates = Object.values(DialogueData.pools).filter(p => 
            (p.tags || []).includes(personality) || (p.tags || []).includes('generic')
        );
        
        const totalCandidates = candidates.length;
        expect(totalCandidates).toBeGreaterThan(1);

        const pickedIds = new Set();

        // Pick as many as there are candidates
        for (let i = 0; i < totalCandidates; i++) {
            const pick = selectDialogueSet({ personality });
            
            // Simulating Conversation constructor logic which marks it as used
            State.dialoguesCount++;
            State.markDialogueUsed(pick.id);
            
            expect(pickedIds.has(pick.id)).toBe(false);
            pickedIds.add(pick.id);
        }

        expect(pickedIds.size).toBe(totalCandidates);
    });

    test('Should respect the fresh window after all pools have been used', () => {
        // Use a small set of pools for this test to make it faster/predictable
        const originalPools = DialogueData.pools;
        const mockPools = {
            p1: { id: 'p1', tags: ['test'], root: 'r', nodes: { r: { id: 'r', text: 'T1', options: [] } } },
            p2: { id: 'p2', tags: ['test'], root: 'r', nodes: { r: { id: 'r', text: 'T2', options: [] } } },
            p3: { id: 'p3', tags: ['test'], root: 'r', nodes: { r: { id: 'r', text: 'T3', options: [] } } },
            p4: { id: 'p4', tags: ['test'], root: 'r', nodes: { r: { id: 'r', text: 'T4', options: [] } } },
            p5: { id: 'p5', tags: ['test'], root: 'r', nodes: { r: { id: 'r', text: 'T5', options: [] } } },
            p6: { id: 'p6', tags: ['test'], root: 'r', nodes: { r: { id: 'r', text: 'T6', options: [] } } }
        };
        
        DialogueData.pools = mockPools;
        const personality = 'test';
        const freshWindow = 5;

        // 1. Use all 6 pools once
        const sequence = [];
        for (let i = 0; i < 6; i++) {
            const pick = selectDialogueSet({ personality });
            sequence.push(pick.id);
            State.dialoguesCount++;
            State.markDialogueUsed(pick.id);
        }
        
        // All 6 should be unique
        expect(new Set(sequence).size).toBe(6);

        // 2. Now all are "used". The next pick should NOT be any of the last 5 used (fresh window)
        // dialoguesCount is now 6. 
        // p1 was used at count 1. 6 - 1 = 5. Since (6-1) < 5 is false, p1 is technically NOT fresh?
        // Wait, wasDialogueUsedRecently logic: (State.dialoguesCount - last) < window
        // If count=6, and p1 was used at count 1: 6 - 1 = 5. 5 < 5 is false. So p1 is available.
        // If count=6, and p2 was used at count 2: 6 - 2 = 4. 4 < 5 is true. So p2 is fresh (avoid).
        
        const nextPick = selectDialogueSet({ personality });
        // Only p1 should be available if window is 5 and we have 6 pools
        expect(nextPick.id).toBe(sequence[0]);

        // 3. Advance one more
        State.dialoguesCount++;
        State.markDialogueUsed(nextPick.id); // nextPick is sequence[0] (p1), used at count 7
        
        // Now count is 7.
        // p2 was used at 2: 7 - 2 = 5. 5 < 5 is false. p2 is available.
        // p3 was used at 3: 7 - 3 = 4. 4 < 5 is true. p3 is fresh.
        const pickAfter = selectDialogueSet({ personality });
        expect(pickAfter.id).toBe(sequence[1]);

        DialogueData.pools = originalPools;
    });

    test('Lore subjects should also prioritize unused ones', () => {
        const totalLore = DialogueData.loreSubjects.length;
        const pickedLoreIds = new Set();

        for (let i = 0; i < totalLore; i++) {
            const pick = selectDialogueSet({ isLore: true });
            State.dialoguesCount++;
            State.markDialogueUsed(pick.id);
            
            expect(pickedLoreIds.has(pick.id)).toBe(false);
            pickedLoreIds.add(pick.id);
        }

        expect(pickedLoreIds.size).toBe(totalLore);
    });
});
