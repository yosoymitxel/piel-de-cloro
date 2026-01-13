import { DialogueData } from './DialogueData.js';
import { selectDialogueSet, Conversation } from './DialogueEngine.js';
import { State } from './State.js';

export class NPC {
    constructor(infectedChance = null, opts = {}) {
        // Default: ~40% infectados (Math.random() > 0.6)
        // Sesgo configurable: usar infectedChance como probabilidad directa
        this.isInfected = infectedChance != null ? (Math.random() < infectedChance) : (Math.random() > 0.6);
        
        // Género aleatorio (influye en nombres y avatar)
        this.gender = Math.random() > 0.5 ? 'male' : 'female';
        
        this.name = this.generateName(this.gender);
        this.occupation = this.generateOccupation();
        this.attributes = this.generateAttributes(this.isInfected);
        this.visualFeatures = this.generateVisualFeatures(this.isInfected, this.gender);
        this.personality = this.pickPersonality();
        this.trait = this.pickTrait();
        this.isLore = opts.isLore || false;
        this.loreId = opts.loreId || null;

        // Assign a dialogue set using DialogueEngine
        const set = selectDialogueSet({ personality: this.personality, infected: this.isInfected, isLore: this.isLore, loreId: this.loreId });
        this.conversation = new Conversation(this, set);
        this.dialogueTree = this.conversation.getRawTreeForCompatibility();

        // Track scans
        this.scanCount = 0;
        this.maxScans = 2;
        this.revealedStats = []; // Tracks which stats (temperature, pulse, etc) have been scanned
        this.dayAfter = null; // Will be initialized if admitted
    }

    generateName(gender) {
        // Spanish-friendly names grouped by gender
        const names = {
            male: ['Ariel', 'Ciro', 'Bruno', 'Iker', 'Pablo', 'Enzo', 'Mateo', 'Julián', 'Luca', 'Adrián', 'Hugo', 'Leo', 'Marcos', 'Saúl', 'Óscar', 'Víctor', 'Iván', 'Erick', 'Dante', 'Axel'],
            female: ['Noa', 'Elo', 'Sofía', 'Luna', 'Mía', 'Emma', 'Valeria', 'Camila', 'Renata', 'Elena', 'Alba', 'Julia', 'Sara', 'Clara', 'Nora', 'Olivia', 'Maya', 'Inés', 'Zoe', 'Lola']
        };
        const lasts = ['Maro', 'Sierra', 'Vega', 'Luz', 'Rojas', 'Sol', 'Mora', 'Rivera', 'Ortega', 'Campos', 'Valle', 'Cruz', 'Rey', 'Luna', 'Blanco', 'Guerra', 'Santos', 'Pons', 'Vidal', 'Bosc'];
        
        const pick = arr => arr[Math.floor(Math.random() * arr.length)];
        return `${pick(names[gender])} ${pick(lasts)}`;
    }

    generateOccupation() {
        const jobs = [
            'Mantenimiento', 'Hidroponía', 'Seguridad', 'Médico', 'Ingeniero',
            'Civil', 'Recolector', 'Electricista', 'Cocinero', 'Transportista',
            'Desempleado', 'Mecánico', 'Minero', 'Filtrador', 'Cartógrafo',
            'Suturador', 'Operario', 'Analista', 'Vigía', 'Mensajero'
        ];
        return jobs[Math.floor(Math.random() * jobs.length)];
    }

    getEpithet() {
        // Dynamic epithet based on infection or global paranoia
        const infectedEpithets = [
            'Se lo ve con la piel pálida', 
            'Ves que sus manos están sucias', 
            'Tiene un tic constante en el ojo',
            'Despide un olor metálico'
        ];
        const paranoiaEpithets = [
            'Ves que tiembla', 
            'No está haciendo contacto visual', 
            'Parece extremadamente nervioso', 
            'Suda ligeramente',
            'Habla entre dientes'
        ];
        const neutralEpithets = [
            'Porta una ropa peculiar', 
            'Está sin refugio', 
            'Se encuentra de paso', 
            'Tiene la mirada perdida', 
            'Lleva un accesorio llamativo',
            'Parece cansado del viaje'
        ];

        if (this.isInfected) return infectedEpithets[Math.floor(Math.random() * infectedEpithets.length)];
        if (State.paranoia > 60) return paranoiaEpithets[Math.floor(Math.random() * paranoiaEpithets.length)];
        return neutralEpithets[Math.floor(Math.random() * neutralEpithets.length)];
    }

    getDisplayName() {
        const epithet = this.getEpithet();
        let displayName = this.name;
        if (epithet && Math.random() > 0.5) displayName += ` — ${epithet}`;
        return displayName;
    }

    generateAttributes(infected) {
        return {
            temperature: infected ? (32 + Math.random() * 2).toFixed(1) : (36.5 + Math.random() * 1).toFixed(1),
            pulse: infected ? Math.floor(Math.random() * 20) : Math.floor(60 + Math.random() * 40),
            skinTexture: infected ? (Math.random() > 0.5 ? 'dry' : 'normal') : 'normal',
            pupils: infected ? (Math.random() > 0.7 ? 'dilated' : 'normal') : 'normal'
        };
    }

    generateVisualFeatures(infected, gender) {
        // Expanded styles
        const hairStyles = {
            male: ['bald', 'short', 'punk', 'mohawk', 'shaved', 'wild'],
            female: ['short', 'long', 'punk', 'bob', 'ponytail', 'bun', 'wild']
        };
        const accessories = ['none', 'glasses', 'mask', 'scar', 'patch', 'earring', 'hood'];
        const eyeTypes = ['normal', 'narrow', 'big', 'tired', 'squint'];
        const mouthTypes = ['smile', 'frown', 'open', 'tight', 'crooked'];
        const facialHair = gender === 'male' ? ['none', 'beard', 'stubble', 'mustache'] : ['none'];
        const clothesStyles = ['worker', 'civilian', 'scavenger', 'suit', 'rags'];

        // Skin tones
        const skins = ['var(--avatar-skin-1)', 'var(--avatar-skin-2)', 'var(--avatar-skin-3)', 'var(--avatar-skin-4)', 'var(--avatar-skin-5)'];

        const pick = arr => arr[Math.floor(Math.random() * arr.length)];

        // Glitch chance increases with paranoia and infection
        const baseGlitch = infected ? 0.3 : 0.01;
        const paranoiaModifier = (typeof State !== 'undefined') ? (State.paranoia / 200) : 0;

        return {
            gender: gender,
            hair: pick(hairStyles[gender]),
            facialHair: pick(facialHair),
            clothes: pick(clothesStyles),
            accessory: pick(accessories),
            eyeType: pick(eyeTypes),
            mouthType: pick(mouthTypes),
            skinColor: pick(skins),
            glitchChance: baseGlitch + paranoiaModifier
        };
    }

    pickPersonality() {
        const types = [
            'nervous', 'aggressive', 'stoic', 'confused', 
            'fanatic', 'paranoid', 'obsessive', 'manic', 
            'sick', 'body_horror'
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    pickTrait() {
        const traits = [
            { id: 'scavenger', name: 'Recolector', description: 'Puede encontrar suministros extra (1-5) durante la noche.' },
            { id: 'optimist', name: 'Optimista', description: 'Reduce la paranoia colectiva en un 10% cada noche.' },
            { id: 'paranoid', name: 'Paranoico', description: 'Aumenta la paranoia colectiva en un 5% cada noche.' },
            { id: 'sickly', name: 'Enfermizo', description: 'Consume el doble de suministros.' },
            { id: 'tough', name: 'Resistente', description: 'Más difícil de eliminar en eventos nocturnos.' },
            { id: 'none', name: 'Ninguno', description: 'No tiene rasgos especiales.' }
        ];
        // 70% chance of having a trait
        if (Math.random() > 0.7) return traits.find(t => t.id === 'none');
        return traits[Math.floor(Math.random() * (traits.length - 1))];
    }

    generateDialogueTree(infected, personality) {
        // If DialogueData doesn't have deeper dialogue templates, return a simple safe tree
        const t = (DialogueData.dialogues && DialogueData.dialogues[personality]) ? DialogueData.dialogues[personality] : null;

        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const getResponse = (category) => {
            if (!category) return "...";
            const cleanOpts = category.clean || [];
            const infectedOpts = category.infected || [];
            if (infected && Math.random() < 0.3 && infectedOpts.length) return pick(infectedOpts);
            if (cleanOpts.length) return pick(cleanOpts);
            return "...";
        };

        const getDeepResponse = () => {
            if (DialogueData.deep_probes) {
                if (infected && DialogueData.deep_probes.infected && Math.random() < 0.4) return pick(DialogueData.deep_probes.infected);
                if (DialogueData.deep_probes.clean) return pick(DialogueData.deep_probes.clean);
            }
            return "...";
        };

        return {
            root: { text: getResponse(t && t.greeting), options: [{ label: 'Estado', next: 'status' }, { label: 'Origen', next: 'origin' }] },
            status: { text: getResponse(t && t.q_status), options: [{ label: 'Insistir sobre salud', next: 'deep_health' }, { label: 'Volver', next: 'root' }] },
            origin: { text: getResponse(t && t.q_origin), options: [{ label: 'Preguntar por detalles', next: 'deep_origin' }, { label: 'Volver', next: 'root' }] },
            deep_health: { text: getDeepResponse(), options: [{ label: 'Terminar interrogatorio', next: 'end' }] },
            deep_origin: { text: getDeepResponse(), options: [{ label: 'Terminar interrogatorio', next: 'end' }] },
            end: { text: 'Esperando decisión...', options: [] }
        };
    }

    initDayAfterStatus() {
        this.dayAfter = {
            dermis: false,
            pupils: false,
            temperature: false,
            pulse: false,
            usedNightTests: 0,
            validated: false,
            result: null // 'clean' | 'infected'
        };
    }

    checkDayAfterValidation() {
        if (!this.dayAfter) return false;
        const complete = this.dayAfter.dermis && this.dayAfter.pupils && this.dayAfter.temperature && this.dayAfter.pulse;
        this.dayAfter.validated = complete;
        if (complete) {
            this.dayAfter.result = this.isInfected ? 'infected' : 'clean';
        }
        return complete;
    }
}