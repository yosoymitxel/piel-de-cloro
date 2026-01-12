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

    // Generic pools: pick by personality tag (if any)
    let candidates = Object.values(DialogueData.pools);
    if (personality) {
        const filtered = candidates.filter(p => (p.tags || []).includes(personality) || (p.tags || []).includes('generic'));
        // Fallback: Si el filtro nos deja sin opciones, volvemos a usar todos los candidatos para asegurar que haya diálogo
        if (filtered.length > 0) {
            candidates = filtered;
        }
    }

    // Prefer pools that haven't been used in the last N dialogues to reduce perceived repetition
    const freshWindow = 5; // configurable window size (dialogues)
    const fresh = candidates.filter(p => !State.wasDialogueUsedRecently(p.id, freshWindow));
    if (fresh.length) {
        // Prefer unused among fresh ones if possible
        const unusedFresh = fresh.filter(p => !State.isDialogueUsed(p.id));
        const pickFrom = unusedFresh.length ? unusedFresh : fresh;
        return pickFrom[Math.floor(Math.random() * pickFrom.length)];
    }

    // fallback: prefer unused ones
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
        this.loggedNodes = new Set(); // Evitar duplicados en el log
        // Count this dialogue start (logical time) and mark as used immediately to prevent reuse
        State.dialoguesCount = (State.dialoguesCount || 0) + 1;
        State.markDialogueUsed(dialogueSet.id);
    }

    getRawTreeForCompatibility() {
        // Return a shallow mapping for compatibility if needed
        const obj = {};
        Object.values(this.set.nodes).forEach(n => obj[n.id] = n);
        return obj;
    }

    _injectTemplate(text, nodeId) {
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
        if (out.includes('{rumor}')) {
            out = out.replace(/\{rumor\}/g, () => {
                const r = (typeof State.getRandomRumor === 'function') ? State.getRandomRumor() : '';
                // Log rumor if not logged for this node
                if (nodeId && !this.loggedNodes.has(nodeId + '_rumor')) {
                    State.addLogEntry('note', `Rumor escuchado: "${r}"`);
                    this.loggedNodes.add(nodeId + '_rumor');
                }
                return r;
            });
        }

        // Apply madness/glitch modifier if paranoia high
        if (State.paranoia > 30 || (State.getGlitchModifier && State.getGlitchModifier() > 1.0)) {
            // Intensidad gradual: de 0.05 a 0.4 según paranoia (30-100)
            const baseIntensity = Math.min(0.4, (State.paranoia - 20) / 180); 
            const glitchedChars = ['$', '#', '@', '&', '%', '!', '?', '¿', '¡', '·', '=', '+', ':', ';', '0', '1'];
            
            const words = out.split(' ');
            out = words.map(word => {
                // Solo glitcheamos palabras de cierta longitud para mantener legibilidad mínima
                if (word.length <= 1) return word;

                // Probabilidad de glitchear esta palabra específica
                const wordGlitchChance = baseIntensity * 0.8;
                
                if (Math.random() < wordGlitchChance) {
                    return word.split('').map(c => {
                        // Glitchear caracteres individuales con una probabilidad menor
                        // para que la palabra sea "reconocible" pero corrupta
                        if (Math.random() < baseIntensity * 0.6) {
                            return glitchedChars[Math.floor(Math.random() * glitchedChars.length)];
                        }
                        return c;
                    }).join('');
                }
                return word;
            }).join(' ');
        }
        return out;
    }

    getCurrentNode() {
        const node = this.set.nodes[this.currentId];
        if (!node) return null;
        const text = this._injectTemplate(node.text, node.id);
        let options = (node.options || []).map(o => ({
            id: o.id,
            label: o.label,
            next: o.next,
            requires: o.requires || [],
            sets: o.sets || [],
            audio: o.audio || null,
            cssClass: o.cssClass || '',
            onclick: o.onclick || null,
            log: o.log || null
        }));

        // Auto-inject "Entendido" if terminal node has no options
        if (options.length === 0) {
            options.push({
                id: 'auto_end',
                label: 'Entendido',
                next: null,
                requires: [],
                sets: [],
                audio: null,
                cssClass: '',
                onclick: null,
                log: null
            });
        }

        return { id: node.id, text, options, audio: node.audio || null, meta: node.meta || {} };
    }

    /**
     * choice can be choiceID (string) or index (number)
     */
    getNextDialogue(choice) {
        const node = this.set.nodes[this.currentId];
        if (!node) return { error: 'Nodo no encontrado' };
        
        let opt = null;
        const nodeOptions = node.options || [];

        if (typeof choice === 'number') {
            if (nodeOptions.length === 0 && choice === 0) {
                opt = { id: 'auto_end', label: 'Entendido', next: null };
            } else {
                opt = nodeOptions[choice];
            }
        } else {
            opt = nodeOptions.find(o => o.id === choice);
            if (!opt && choice === 'auto_end' && nodeOptions.length === 0) {
                opt = { id: 'auto_end', label: 'Entendido', next: null };
            }
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
        const text = this._injectTemplate(nextNodeRaw.text, nextNodeRaw.id);
        return { node: { id: nextNodeRaw.id, text, options: (nextNodeRaw.options || []).map(o => ({ id: o.id, label: o.label })) }, audio };
    }
}

// Import DialogueData dynamically to avoid circular import issues (State imports DialogueEngine indirectly)
import { DialogueData } from './DialogueData.js';

export default Conversation;
