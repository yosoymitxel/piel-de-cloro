
import { NPC } from '../js/NPC.js';
import { State } from '../js/State.js';
import { DialogueActions } from '../js/DialogueActions.js';
import { DialogueData } from '../js/DialogueData.js';
import { gen_pools_1 } from '../js/dialogue_pools/generic/gen_pools_1.js';

// Mock DialogueData.pools to include our new pool, just in case it's not loaded in test env
DialogueData.pools = { ...gen_pools_1 };

describe('Generic Dialogue Features', () => {
    test('NPC inherits clue and mechanic hint from its selected dialogue pool', () => {
        const giftSet = gen_pools_1.gen_gift;
        const npc = new NPC(null, { dialogueSet: giftSet });

        expect(npc.clue).toBe(giftSet.clue);
        expect(npc.mechanicHint).toBe(giftSet.mechanicHint);
        expect(npc.conversation.set).toBe(giftSet);
    });

    test('DialogueActions.giveSupplies should update State', () => {
        State.supplies = 10;
        // Mock addLogEntry
        State.addLogEntry = jest.fn();
        State.updateSupplies = (amount) => { State.supplies += amount; }; // Minimal mock if real method fails in test env

        DialogueActions.giveSupplies();
        expect(State.supplies).toBe(12);
        expect(State.addLogEntry).toHaveBeenCalledWith(expect.stringMatching(/success/), expect.stringMatching(/2 suministros/), expect.any(Object));
    });
});
