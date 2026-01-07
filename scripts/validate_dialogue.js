import { DialogueData } from '../js/DialogueData.js';

function validate() {
    const errors = [];
    const seenPoolIds = new Set();

    if (!DialogueData.pools || typeof DialogueData.pools !== 'object') {
        console.error('No pools defined');
        process.exit(1);
    }

    for (const [pid, pool] of Object.entries(DialogueData.pools)) {
        if (seenPoolIds.has(pool.id)) errors.push(`Pool id duplicated: ${pool.id}`);
        seenPoolIds.add(pool.id);
        if (!pool.nodes || !pool.root) {
            errors.push(`Pool ${pool.id} missing nodes/root`);
            continue;
        }
        for (const [nid, node] of Object.entries(pool.nodes)) {
            if (node.id !== nid) errors.push(`Node id mismatch in pool ${pool.id}: ${nid} vs ${node.id}`);
            if (node.options && node.options.length) {
                node.options.forEach(opt => {
                    if (opt.next && !pool.nodes[opt.next]) {
                        errors.push(`Pool ${pool.id} node ${nid} option ${opt.id} -> next missing: ${opt.next}`);
                    }
                });
            }
        }
    }

    // Lore subjects
    if (DialogueData.loreSubjects && DialogueData.loreSubjects.length) {
        const seenLoreIds = new Set();
        DialogueData.loreSubjects.forEach(ls => {
            if (seenLoreIds.has(ls.id)) errors.push(`Lore id duplicated: ${ls.id}`);
            seenLoreIds.add(ls.id);
            if (!ls.nodes || !ls.root) errors.push(`Lore ${ls.id} missing nodes/root`);
            for (const [nid, node] of Object.entries(ls.nodes || {})) {
                if (node.options && node.options.length) node.options.forEach(opt => {
                    if (opt.next && !ls.nodes[opt.next]) errors.push(`Lore ${ls.id} node ${nid} option ${opt.id} -> next missing: ${opt.next}`);
                });
            }
        });
    }

    if (errors.length) {
        console.error('Validation failed with following errors:\n');
        errors.forEach(e => console.error('- ' + e));
        process.exit(2);
    }
    console.log('DialogueData validation OK.');
}

validate();
