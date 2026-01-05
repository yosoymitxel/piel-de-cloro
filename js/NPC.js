import { DialogueData } from './DialogueData.js';

export class NPC {
    constructor(infectedChance = null) {
        // Default: ~40% infectados (Math.random() > 0.6)
        // Sesgo configurable: usar infectedChance como probabilidad directa
        this.isInfected = infectedChance != null ? (Math.random() < infectedChance) : (Math.random() > 0.6);
        this.name = this.generateName();
        this.attributes = this.generateAttributes(this.isInfected);
        this.visualFeatures = this.generateVisualFeatures(this.isInfected);
        this.personality = this.pickPersonality();
        this.dialogueTree = this.generateDialogueTree(this.isInfected, this.personality);
        
        // Track scans
        this.scanCount = 0;
        this.maxScans = 2;
        this.revealedStats = []; // Tracks which stats (temperature, pulse, etc) have been scanned
    }

    generateName() {
        const exoticPrefixes = ["ZOR","XEN","LYK","QIR","VYR","ZYL","KOR","MYR","NYX","AEG","NEX","VEX","LYR","ZEN","KAI","ORA","SOL","NOV","ARQ","SYL","THR"];
        const exoticSuffixes = ["TH","YN","KR","VN","ZR","YL","QR","MR","IX","OS","AR","ON","IS","OR","AX","UM","EL","AN","IR","OR"];
        const pick = arr => arr[Math.floor(Math.random() * arr.length)];
        const p1 = pick(exoticPrefixes);
        const p2 = pick(exoticPrefixes);
        const s1 = pick(exoticSuffixes);
        const s2 = pick(exoticSuffixes);
        const compound = Math.random() < 0.35;
        const mid = compound ? `${p1}-${p2}-${s1}` : `${p1}-${s1}`;
        const tail = Math.random() < 0.25 ? `-${s2}` : "";
        return `${mid}${tail}`;
    }

    generateAttributes(infected) {
        return {
            temperature: infected ? (32 + Math.random() * 2).toFixed(1) : (36.5 + Math.random() * 1).toFixed(1),
            pulse: infected ? Math.floor(Math.random() * 20) : Math.floor(60 + Math.random() * 40),
            skinTexture: infected ? (Math.random() > 0.5 ? 'dry' : 'normal') : 'normal',
            pupils: infected ? (Math.random() > 0.7 ? 'dilated' : 'normal') : 'normal'
        };
    }

    generateVisualFeatures(infected) {
        const hairStyles = ['bald', 'short', 'long', 'punk'];
        const accessories = ['none', 'glasses', 'mask', 'scar'];
        const eyeTypes = ['normal', 'narrow', 'big', 'tired'];
        const mouthTypes = ['smile', 'frown', 'open'];

        // Skin tones
        const skins = ['var(--avatar-skin-1)', 'var(--avatar-skin-2)', 'var(--avatar-skin-3)', 'var(--avatar-skin-4)', 'var(--avatar-skin-5)'];
        
        return {
            hair: hairStyles[Math.floor(Math.random() * hairStyles.length)],
            accessory: accessories[Math.floor(Math.random() * accessories.length)],
            eyeType: eyeTypes[Math.floor(Math.random() * eyeTypes.length)],
            mouthType: mouthTypes[Math.floor(Math.random() * mouthTypes.length)],
            skinColor: skins[Math.floor(Math.random() * skins.length)],
            glitchChance: infected ? 0.3 : 0.01
        };
    }

    pickPersonality() {
        return DialogueData.personalities[Math.floor(Math.random() * DialogueData.personalities.length)];
    }

    generateDialogueTree(infected, personality) {
        const t = DialogueData.dialogues[personality];
        
        // Helper to pick random response based on infection status
        const getResponse = (category) => {
            const cleanOpts = category.clean;
            const infectedOpts = category.infected;
            
            // If infected, 30% chance to slip up, otherwise use clean lines to blend in
            if (infected && Math.random() < 0.3) {
                return infectedOpts[Math.floor(Math.random() * infectedOpts.length)];
            }
            return cleanOpts[Math.floor(Math.random() * cleanOpts.length)];
        };

        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

        // Deep probe response
        const getDeepResponse = () => {
            if (infected && Math.random() < 0.4) {
                return pick(DialogueData.deep_probes.infected);
            }
            return pick(DialogueData.deep_probes.clean);
        };

        return {
            root: {
                text: getResponse(t.greeting),
                options: [
                    { label: t.q_status.q, next: 'status' },
                    { label: t.q_origin.q, next: 'origin' }
                ]
            },
            status: {
                text: getResponse(t.q_status),
                options: [
                    { label: "Insistir sobre salud", next: 'deep_health' },
                    { label: "Volver", next: 'root' }
                ]
            },
            origin: {
                text: getResponse(t.q_origin),
                options: [
                    { label: "Preguntar por detalles", next: 'deep_origin' },
                    { label: "Volver", next: 'root' }
                ]
            },
            deep_health: {
                text: getDeepResponse(),
                options: [{ label: "Terminar interrogatorio", next: 'end' }]
            },
            deep_origin: {
                text: getDeepResponse(),
                options: [{ label: "Terminar interrogatorio", next: 'end' }]
            },
            end: {
                text: "Esperando decisión...",
                options: [] 
            }
        };
    }
}
