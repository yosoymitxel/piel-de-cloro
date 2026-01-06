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
        noInfectedGuardDeathChance: 0.05
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
    // Seguridad por run
    securityItems: [],
    nextIntrusionAt: null,
    playerInfected: false,
    
    // Track if we are in Night Phase
    isNight: false,
    dayClosed: false,
    dayEnded: false,
    lastNight: {
        occurred: false,
        victims: 0,
        message: ''
    },
    
    generator: { isOn: true, mode: 'normal', power: 100, blackoutUntil: 0 },
    paused: false,

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
        this.dayAfter = { testsAvailable: this.config.dayAfterTestsDefault };
        this.securityItems = this.generateSecurityItems();
        this.generator = { isOn: true, mode: 'normal', power: 100, blackoutUntil: 0 };
        this.playerInfected = Math.random() < this.config.playerInfectedProbability;
        this.nextIntrusionAt = this.dayTime + this.randomIntrusionInterval();
        this.lastNight = { occurred: false, victims: 0, message: '' };
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
        this.generator = { isOn: true, mode: 'normal', power: 100, blackoutUntil: 0 };
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
