import { State } from './State.js';

/**
 * Conversation engine
 * - Conversation holds current node id, history and can progress with getNextDialogue(choiceID)
 * - selectDialogueSet picks an unused pool for generic NPCs or returns a lore subject
 */
export function selectDialogueSet({ personality = null, infected = false, isLore = false, loreId = null } = {}) {
    // Prefer lore subjects if requested
    if (isLore) {
        if (loreId) {
            const found = DialogueData.loreSubjects.find(s => s.id === loreId);
            if (found) return found;
        }
        // Otherwise pick first unused lore subject
        const avail = DialogueData.loreSubjects.filter(s => !State.isDialogueUsed(s.id));
        return avail.length ? avail[Math.floor(Math.random() * avail.length)] : DialogueData.loreSubjects[0];
    }

    // Generic pools: pick by personality tag (if any) and unused first
    let candidates = Object.values(DialogueData.pools);
    if (personality) {
        const filtered = candidates.filter(p => (p.tags || []).includes(personality) || (p.tags || []).includes('generic'));
        // Fallback: Si el filtro nos deja sin opciones, volvemos a usar todos los candidatos para asegurar que haya diálogo
        if (filtered.length > 0) {
            candidates = filtered;
        }
    }
    // prefer unused ones
    const unused = candidates.filter(p => !State.isDialogueUsed(p.id));
    const pick = unused.length ? unused[Math.floor(Math.random() * unused.length)] : candidates[Math.floor(Math.random() * candidates.length)];
    return pick;
}

export class Conversation {
    constructor(npc, dialogueSet) {
        this.npc = npc;
        this.set = dialogueSet;
        this.currentId = dialogueSet.root;
        this.history = [];
        // Mark as used immediately to prevent reuse in run until all are exhausted
        State.markDialogueUsed(dialogueSet.id);
    }

    getRawTreeForCompatibility() {
        // Return a shallow mapping for compatibility if needed
        const obj = {};
        Object.values(this.set.nodes).forEach(n => obj[n.id] = n);
        return obj;
    }

    _injectTemplate(text) {
        if (!text) return '';
        // Simple templating: replace {generatorStatus} {paranoia} {npcName} {prevChoiceLabel}
        let out = text.replace(/\{npcName\}/g, this.npc.getDisplayName ? this.npc.getDisplayName() : this.npc.name);
        out = out.replace(/\{paranoia\}/g, `${State.paranoia}%`);
        const genStatus = (!State.generator || !State.generator.isOn) ? 'apagado' : (State.generator.power < 20 ? 'inestable' : 'estable');
        out = out.replace(/\{generatorStatus\}/g, genStatus);
        // prevChoiceLabel from history
        const last = this.history.length ? this.history[this.history.length - 1] : null;
        out = out.replace(/\{prevChoiceLabel\}/g, last ? (last.choiceLabel || '') : '');

        // Rumor injection (from global dialogue memory)
        try {
            const rumor = (typeof State.getRandomRumor === 'function') ? State.getRandomRumor() : '';
            out = out.replace(/\{rumor\}/g, rumor);
        } catch (e) {
            // ignore
        }

        // Apply madness/glitch modifier if paranoia high
        if (State.paranoia > 65 || State.getGlitchModifier && State.getGlitchModifier() > 1.2) {
            // degrade text visually a bit
            out = out.split('').map((c, i) => (Math.random() < 0.03 ? '�' : c)).join('');
        }
        return out;
    }

    getCurrentNode() {
        const node = this.set.nodes[this.currentId];
        if (!node) return null;
        const text = this._injectTemplate(node.text);
        const options = (node.options || []).map(o => ({
            id: o.id,
            label: o.label,
            next: o.next,
            requires: o.requires || [],
            sets: o.sets || [],
            audio: o.audio || null,
            cssClass: o.cssClass || ''
        }));
        return { id: node.id, text, options, audio: node.audio || null, meta: node.meta || {} };
    }

    /**
     * choice can be choiceID (string) or index (number)
     */
    getNextDialogue(choice) {
        const node = this.set.nodes[this.currentId];
        if (!node) return { error: 'Nodo no encontrado' };
        let opt = null;
        if (typeof choice === 'number') {
            opt = (node.options || [])[choice];
        } else {
            opt = (node.options || []).find(o => o.id === choice);
        }
        if (!opt) return { error: 'Opción inválida' };

        // Validate requires
        if (opt.requires) {
            for (const r of opt.requires) {
                if (!State.hasFlag(r)) return { error: 'Requisitos no satisfechos' };
            }
        }

        // Apply sets (flags)
        if (opt.sets) {
            for (const s of opt.sets) {
                State.setFlag(s, true);
            }
        }

        // Record history entry
        this.history.push({ node: node.id, choiceId: opt.id, choiceLabel: opt.label });
        State.recordDialogueMemory({ npc: this.npc.name, node: node.id, choice: opt.id, time: Date.now() });

        // Audio trigger
        const audio = opt.audio || node.onChooseAudio || node.audio || null;

        // Next node
        if (!opt.next) {
            // End of branch
            this.currentId = null;
            return { end: true, audio, message: opt.resultText || null };
        }
        this.currentId = opt.next;
        const nextNodeRaw = this.set.nodes[this.currentId];
        const text = this._injectTemplate(nextNodeRaw.text);
        return { node: { id: nextNodeRaw.id, text, options: (nextNodeRaw.options || []).map(o => ({ id: o.id, label: o.label })) }, audio };
    }
}

// Import DialogueData dynamically to avoid circular import issues (State imports DialogueEngine indirectly)
import { DialogueData } from './DialogueData.js';

export default Conversation;
