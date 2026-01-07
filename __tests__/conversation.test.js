describe('Dialogue system', () => {
    let Conversation, DialogueData, State;

    beforeAll(async () => {
        ({ Conversation } = await import('../js/DialogueEngine.js'));
        ({ DialogueData } = await import('../js/DialogueData.js'));
        ({ State } = await import('../js/State.js'));
    });

    beforeEach(() => {
        State.reset();
    });

    test('DialogueData references are valid (pools and lore)', () => {
        const errors = [];
        for (const [pid, pool] of Object.entries(DialogueData.pools)) {
            if (!pool.nodes || !pool.root) errors.push(`Pool ${pid} missing nodes/root`);
            for (const [nid, node] of Object.entries(pool.nodes || {})) {
                if (node.options && node.options.length) node.options.forEach(opt => {
                    if (opt.next && !pool.nodes[opt.next]) errors.push(`Pool ${pid} node ${nid} option ${opt.id} -> next missing: ${opt.next}`);
                });
            }
        }
        if (DialogueData.loreSubjects) {
            DialogueData.loreSubjects.forEach(ls => {
                if (!ls.nodes || !ls.root) errors.push(`Lore ${ls.id} missing nodes/root`);
                for (const [nid, node] of Object.entries(ls.nodes || {})) {
                    if (node.options && node.options.length) node.options.forEach(opt => {
                        if (opt.next && !ls.nodes[opt.next]) errors.push(`Lore ${ls.id} node ${nid} option ${opt.id} -> next missing: ${opt.next}`);
                    });
                }
            });
        }
        expect(errors).toEqual([]);
    });

    test('Conversation progression and flags', () => {
        const pool = DialogueData.pools['generic_01'];
        expect(pool).toBeDefined();
        const dummyNpc = { name: 'TESTER' };
        const conv = new Conversation(dummyNpc, pool);

        // Start at root
        let node = conv.getCurrentNode();
        expect(node.id).toBe('g1_n1');

        // Choose option 0 -> g1_n2a, sets asked_health
        let res = conv.getNextDialogue(0);
        expect(State.hasFlag('asked_health')).toBe(true);
        expect(conv.currentId).toBe('g1_n2a');

        // Choose option 0 -> g1_n3a
        res = conv.getNextDialogue(0);
        expect(conv.currentId).toBe('g1_n3a');

        // Choose option 0 -> g1_n4a
        res = conv.getNextDialogue(0);
        expect(conv.currentId).toBe('g1_n4a');

        // No further options -> getCurrentNode should exist but options length 0
        node = conv.getCurrentNode();
        expect(node.options.length).toBe(0);
    });

    test('Rumor injection uses dialogue memory and placeholder replaced', () => {
        // Insert a memory
        State.recordDialogueMemory({ npc: 'X', node: 'g1_n1', choice: 'g1_o1', time: Date.now() - 5000 });
        const pool = DialogueData.pools['generic_01'];
        const dummyNpc = { name: 'RUMOR_TEST' };
        const conv = new Conversation(dummyNpc, pool);
        const node = conv.getCurrentNode();
        // The root text contains the rumor placeholder replaced by State.getRandomRumor
        expect(node.text && node.text.length > 0).toBe(true);
        // It should include a human-friendly phrase (no technical refs)
        expect(!/g\d?_n\d+/i.test(node.text)).toBe(true);
    });

    test('Option requires are enforced', () => {
        const pool = DialogueData.pools['generic_02'];
        const dummyNpc = { name: 'REQ_TEST' };
        const conv = new Conversation(dummyNpc, pool);
        // Jump to node that has option requiring 'noted_voice'
        conv.currentId = 'g2_n4a';
        const res = conv.getNextDialogue(0); // first option requires noted_voice
        expect(res.error).toBeDefined();
        // If we set the flag, it should proceed
        State.setFlag('noted_voice', true);
        const res2 = conv.getNextDialogue(0);
        expect(res2.error).toBeUndefined();
        expect(conv.currentId).toBe('g2_n5a');
    });
});
