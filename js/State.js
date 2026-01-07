export const State = {
    paranoia: 0,
    cycle: 1,
    dayTime: 1, // Current subject count in the day
    config: {
        maxShelterCapacity: 10,
        dayLength: 5, // Subjects per day
        difficulty: 'normal',
        dayAfterTestsDefault: 5,
        // Seguridad / intrusiones
        securityItemsMin: 1,
        securityItemsMax: 5,
        securityIntrusionProbability: 0.25,
        // Entradas aleatorias al iniciar la run
        initialEntrantProbability: 0.2,
        initialEntrantMaxFraction: 0.5,
        // Intrusiones diurnas
        dayIntrusionIntervalMin: 1,
        dayIntrusionIntervalMax: 3,
        dayIntrusionProbability: 0.8,
        dayIntrusionInfectedChance: 0.65,
        dayDeactivationProbability: 0.9,
        // Jugador infectado
        playerInfectedProbability: 0.15,
        // Noche sin infectados: prob de muerte del guardia
        noInfectedGuardDeathChance: 0.05,
        // Generador
        generator: {
            consumption: {
                save: 1,    // Ahorro: 1 energía/turno
                normal: 2,  // Normal: 2 energía/turno
                overload: 3 // Sobrecarga: 3 energía/turno
            },
            failureChance: {
                save: 0.0,    // Ahorro: No se apaga
                normal: 0.08, // Normal: Probabilidad estándar
                overload: 0.2 // Sobrecarga: Alta probabilidad
            },
            breakdownChance: 0.1
        }
    },
    admittedNPCs: [],
    purgedNPCs: [], // Shelter purges
    ignoredNPCs: [], // Just for stats
    departedNPCs: [],
    currentNPC: null,
    dialoguesCount: 0,
    verificationsCount: 0,
    infectedSeenCount: 0,
    interludesShown: 0,
    dayAfter: { testsAvailable: 5 },
    // Dialogue/pool tracking and flags
    dialoguePoolsUsed: [], // array of pool ids used this run
    dialoguePoolsLastUsed: {}, // map poolId -> dialoguesCount when last used
    dialogueFlags: {},      // persistent flags set by conversation choices
    dialogueMemory: [],     // recorded events for rumor/flags

    // Colores centralizados
    colors: {
        chlorine: '#2d5a27',
        chlorineLight: '#a8d5a2',
        chlorineSutil: '#3d7a36',
        alert: '#ff3333',
        safe: '#00FF00',
        warning: '#ffcc66',
        energy: '#00FF00',
        energyLow: '#7a1a1a',
        overload: '#ffaa00',
        off: '#ff2b2b'
    },

    // Seguridad por run
    securityItems: [],
    nextIntrusionAt: null,
    playerInfected: false,

    // Track if we are in Night Phase
    isNight: false,
    dayClosed: false,
    dayEnded: false,
    generatorCheckedThisTurn: false,
    lastNight: {
        occurred: false,
        victims: 0,
        message: ''
    },

    generator: {
        isOn: true,
        mode: 'normal',
        power: 100,
        blackoutUntil: 0,
        overclockCooldown: false,
        overloadRiskTurns: 0,
        maxModeCapacityReached: 2, // Por defecto Normal (2) al iniciar
        emergencyEnergyGranted: false // Flag para evitar explotación de energía gratis
    },
    paused: false,
    dialogueStarted: false,

    reset() {
        this.paranoia = 0;
        this.cycle = 1;
        this.dayTime = 1;
        this.admittedNPCs = [];
        this.purgedNPCs = [];
        this.ignoredNPCs = [];
        this.departedNPCs = [];
        this.currentNPC = null;
        this.dialoguesCount = 0;
        this.verificationsCount = 0;
        this.infectedSeenCount = 0;
        this.interludesShown = 0;
        this.isNight = false;
        this.dayClosed = false;
        this.dayEnded = false;
        this.generatorCheckedThisTurn = false;
        this.dialogueStarted = false;
        this.dayAfter = { testsAvailable: this.config.dayAfterTestsDefault };
        this.securityItems = this.generateSecurityItems();
        this.generator = { isOn: true, mode: 'normal', power: 100, blackoutUntil: 0, overclockCooldown: false, emergencyEnergyGranted: false };
        this.playerInfected = Math.random() < this.config.playerInfectedProbability;
        this.nextIntrusionAt = this.dayTime + this.randomIntrusionInterval();
        this.lastNight = { occurred: false, victims: 0, message: '' };

        // Reset dialogue trackers and flags
        this.dialoguePoolsUsed = [];
        this.dialoguePoolsLastUsed = {};
        this.dialogueFlags = {};
        this.dialogueMemory = [];
    },

    addAdmitted(npc) {
        if (!npc.enterCycle) npc.enterCycle = this.cycle;
        this.admittedNPCs.push(npc);
    },

    addPurged(npc) {
        // Remove from admitted if present
        const index = this.admittedNPCs.indexOf(npc);
        if (index > -1) {
            this.admittedNPCs.splice(index, 1);
        }
        npc.death = { reason: 'purga', cycle: this.cycle, revealed: false };
        this.purgedNPCs.push(npc);
    },

    isShelterFull() {
        return this.admittedNPCs.length >= this.config.maxShelterCapacity;
    },

    isDayOver() {
        return this.dayTime > this.config.dayLength;
    },

    nextSubject() {
        this.dayTime++;
        this.generatorCheckedThisTurn = false;
        this.dialogueStarted = false;
        if (this.generator.overclockCooldown) {
            this.generator.overclockCooldown = false;
        }
    },

    randomIntrusionInterval() {
        const min = this.config.dayIntrusionIntervalMin;
        const max = this.config.dayIntrusionIntervalMax;
        return Math.floor(min + Math.random() * (max - min + 1));
    },
    rescheduleIntrusion() {
        this.nextIntrusionAt = this.dayTime + this.randomIntrusionInterval();
    },

    generateSecurityItems() {
        const types = ['alarma', 'puerta', 'ventana', 'tuberias'];
        const min = this.config.securityItemsMin;
        const max = this.config.securityItemsMax;
        const count = Math.max(min, Math.min(max, Math.floor(min + Math.random() * (max - min + 1))));
        const items = [];
        for (let i = 0; i < count; i++) {
            const t = types[Math.floor(Math.random() * types.length)];
            if (t === 'alarma') items.push({ type: t, active: false });
            else items.push({ type: t, secured: false });
        }
        return items;
    },

    // Dialogue & flags helpers
    markDialogueUsed(id) {
        if (!this.dialoguePoolsUsed.includes(id)) this.dialoguePoolsUsed.push(id);
        // record last used logical time (dialoguesCount)
        this.dialoguePoolsLastUsed[id] = this.dialoguesCount || 0;
    },

    /**
     * Returns true if the pool was used within the last `window` dialogues
     * (uses `dialoguesCount` as logical time to avoid relying on wall-clock time in tests)
     */
    wasDialogueUsedRecently(id, window = 5) {
        const last = this.dialoguePoolsLastUsed[id];
        if (last === undefined) return false;
        return (this.dialoguesCount - last) < window;
    },

    isDialogueUsed(id) {
        return this.dialoguePoolsUsed.includes(id);
    },

    setFlag(key, value = true) {
        this.dialogueFlags[key] = value;
    },

    hasFlag(key) {
        return !!this.dialogueFlags[key];
    },

    recordDialogueMemory(entry) {
        if (!this.dialogueMemory) this.dialogueMemory = [];
        this.dialogueMemory.push(entry);
        // Keep last 200
        if (this.dialogueMemory.length > 200) this.dialogueMemory.splice(0, this.dialogueMemory.length - 200);
    },

    recallDialogueHistory() {
        return this.dialogueMemory || [];
    },

    getRandomRumor() {
        const mem = this.dialogueMemory || [];
        if (!mem.length) return '';
        // Build a human-friendly rumor using fragments; prefer entries with npc names
        const entry = mem[Math.floor(Math.random() * mem.length)];
        const verbOptions = ['falleció', 'desapareció', 'mintió', 'fue visto', 'murió', 'cayó'];
        const verb = verbOptions[Math.floor(Math.random() * verbOptions.length)];
        // pick a previous name if available (purged or departed)
        const namedPool = (this.purgedNPCs.concat(this.departedNPCs)).filter(n => n && n.name);
        const prev = namedPool.length ? namedPool[Math.floor(Math.random() * namedPool.length)].name : (entry.npc || 'alguien');
        const whoMentioned = entry.npc || 'alguien';
        return `${whoMentioned} comentaba que ${prev} ${verb} en la oscuridad.`;
    },

    ensureGeneratorItem() {
        const exists = this.securityItems.some(i => i.type === 'generador');
        if (!exists) {
            this.securityItems.unshift({ type: 'generador', isOn: true, mode: 'normal', power: 100 });
        }
    },

    startNextDay() {
        this.cycle++;
        this.dayTime = 1;
        this.isNight = false;
        this.dayClosed = false;
        this.dayEnded = false;
        this.dayAfter = { testsAvailable: this.config.dayAfterTestsDefault };
        this.securityItems = this.generateSecurityItems();
        this.generator = { isOn: true, mode: 'normal', power: 100, blackoutUntil: 0, emergencyEnergyGranted: false };
        this.nextIntrusionAt = this.dayTime + this.randomIntrusionInterval();
        this.lastNight.occurred = true;
        this.purgedNPCs.forEach(n => {
            if (n.death) n.death.revealed = true;
        });
        const canLeave = this.admittedNPCs.length;
        if (canLeave > 0) {
            const leaveCount = Math.max(1, Math.min(3, Math.floor(1 + Math.random() * 3)));
            const actual = Math.min(leaveCount, canLeave);
            const leftNames = [];
            for (let i = 0; i < actual; i++) {
                const idx = Math.floor(Math.random() * this.admittedNPCs.length);
                const npc = this.admittedNPCs.splice(idx, 1)[0];
                if (npc) {
                    npc.left = { cycle: this.cycle };
                    this.departedNPCs.push(npc);
                    leftNames.push(npc.name);
                }
            }
            const msg = actual === 1 ? `Durante la noche, ${leftNames[0]} abandonó la comuna.` : `Durante la noche, ${actual} integrantes abandonaron la comuna.`;
            this.lastNight.message = this.lastNight.message ? `${this.lastNight.message} ${msg}` : msg;
        }
    },

    getIntrusionModifier() {
        let m = 1.0;
        if (!this.generator.isOn) m *= 1.35;
        if (this.generator.mode === 'save') m *= 0.9;
        if (this.generator.mode === 'overload') m *= 1.2;
        if (this.generator.blackoutUntil && ((typeof performance !== 'undefined' ? performance.now() : Date.now()) < this.generator.blackoutUntil)) {
            m *= 1.5;
        }
        return m;
    },

    getGlitchModifier() {
        let g = 1.0;
        if (!this.generator.isOn) g *= 1.2;
        if (this.generator.mode === 'overload') g *= 1.4;
        return g;
    }
};
