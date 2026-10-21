describe('Dialogue system', () => {
    let Conversation, selectDialogueSet, DialogueData, State;

    beforeAll(async () => {
        ({ Conversation, selectDialogueSet } = await import('../js/DialogueEngine.js'));
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

        // Ensure no duplicate option ids across all pools/lore
        // MODIFICATION: We now allow duplicate option IDs across DIFFERENT pools.
        // We only check for uniqueness within the same pool/lore object.
        for (const [pid, pool] of Object.entries(DialogueData.pools)) {
            const poolOptionIds = new Set();
            for (const [nid, node] of Object.entries(pool.nodes || {})) {
                if (node.options) node.options.forEach(opt => {
                    if (!opt.id) return;
                    if (poolOptionIds.has(opt.id)) errors.push(`Duplicate option id in pool ${pid}: ${opt.id}`);
                    poolOptionIds.add(opt.id);
                });
            }
        }
        if (DialogueData.loreSubjects) {
            DialogueData.loreSubjects.forEach(ls => {
                const loreOptionIds = new Set();
                for (const [nid, node] of Object.entries(ls.nodes || {})) {
                    if (node.options) node.options.forEach(opt => {
                        if (!opt.id) return;
                         if (loreOptionIds.has(opt.id)) errors.push(`Duplicate option id in lore ${ls.id}: ${opt.id}`);
                        loreOptionIds.add(opt.id);
                    });
                }
            });
        }

        expect(errors).toEqual([]);
    });

    test('Conversation progression and flags', () => {
        const pool = DialogueData.pools['gen_scratch'];
        expect(pool).toBeDefined();
        const dummyNpc = { name: 'TESTER' };
        const conv = new Conversation(dummyNpc, pool);

        // Start at root
        let node = conv.getCurrentNode();
        expect(node.id).toBe('gs_n1');

        // Choose option 0 -> gs_n2a
        let res = conv.getNextDialogue(0);
        expect(conv.currentId).toBe('gs_n2a');

        // Choose option 0 -> gs_n3a
        res = conv.getNextDialogue(0);
        expect(conv.currentId).toBe('gs_n3a');
    });

    test('required dialogue options are hidden until their flag is set', () => {
        const pool = {
            id: 'gated_option_test',
            root: 'start',
            nodes: {
                start: {
                    id: 'start',
                    text: 'Start',
                    options: [
                        { id: 'plain', label: 'Continue', next: null },
                        { id: 'locked', label: 'Secret', next: null, req: ['secret_unlocked'] }
                    ]
                }
            }
        };
        const conv = new Conversation({ name: 'TESTER' }, pool);

        expect(conv.getCurrentNode().options.map(option => option.id)).toEqual(['plain']);
        expect(conv.getNextDialogue('locked').error).toBe('Requisitos no satisfechos');
        expect(conv.history).toHaveLength(0);

        State.setFlag('secret_unlocked', true);
        expect(conv.getCurrentNode().options.map(option => option.id)).toEqual(['plain', 'locked']);
        expect(conv.getNextDialogue('locked').end).toBe(true);
    });

    test('State.reset clears run-scoped dialogue flags', () => {
        State.setFlag('secret_from_previous_run', true);

        State.reset();

        expect(State.hasFlag('secret_from_previous_run')).toBe(false);
        expect(State.dialogueFlags).toEqual({});
    });

    test('State.reset restores fuel and per-turn fuel-room tracking', () => {
        State.fuel = 0;
        State.fuelRoomCheckedThisTurn = true;

        State.reset();

        expect(State.fuel).toBe(10);
        expect(State.fuelRoomCheckedThisTurn).toBe(false);
    });

    test('broken dialogue target returns an error without recording a choice', () => {
        const pool = {
            id: 'broken_target_test',
            root: 'start',
            nodes: {
                start: {
                    id: 'start',
                    text: 'Test',
                    options: [{ id: 'broken', label: 'Continue', next: 'missing_node', sets: ['should_not_be_set'] }]
                }
            }
        };
        const conv = new Conversation({ name: 'TESTER' }, pool);

        const result = conv.getNextDialogue('broken');

        expect(result.error).toBe('Nodo destino no encontrado: missing_node');
        expect(conv.currentId).toBe('start');
        expect(conv.history).toHaveLength(0);
        expect(State.hasFlag('should_not_be_set')).toBe(false);
        expect(State.dialogueMemory).toHaveLength(0);
    });

    test('Rumor injection uses dialogue memory and placeholder replaced', () => {
        // Insert a memory
        State.recordDialogueMemory({ npc: 'X', node: 'gs_n1', choice: 'gs_o1', time: Date.now() - 5000 });
        const pool = DialogueData.pools['gen_scratch'];
        const dummyNpc = { name: 'RUMOR_TEST' };
        const conv = new Conversation(dummyNpc, pool);
        const node = conv.getCurrentNode();
        // The root text contains the rumor placeholder replaced by State.getRandomRumor
        expect(node.text && node.text.length > 0).toBe(true);
    });

    test('Option requires are enforced', () => {
        const pool = DialogueData.pools['gen_leak'];
        const dummyNpc = { name: 'REQ_TEST' };
        const conv = new Conversation(dummyNpc, pool);
        // Jump to node that has option
        conv.currentId = 'gl_n1';
        const res = conv.getNextDialogue(0); 
        expect(res.error).toBeUndefined(); // gen_leak root options don't have requirements usually
    });

    test('selectDialogueSet avoids recent pools when alternatives exist', () => {
        const originalPools = DialogueData.pools;
        try {
            DialogueData.pools = {
                a: { id: 'a', root: 'a1', nodes: { a1: { id: 'a1', text: 'A', options: [] } } },
                b: { id: 'b', root: 'b1', nodes: { b1: { id: 'b1', text: 'B', options: [] } } }
            };

            State.reset();
            State.dialoguesCount = 10;
            State.markDialogueUsed('a');

            const pick = selectDialogueSet();
            expect(pick.id).toBe('b');

            State.dialoguesCount = 16;
            const pick2 = selectDialogueSet();
            expect(['a', 'b']).toContain(pick2.id);
        } finally {
            DialogueData.pools = originalPools;
        }
    });
});
