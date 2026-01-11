import { CONFIG, COLORS, UI_STRINGS } from './Constants.js';

export const State = {
    paranoia: 0,
    cycle: 1,
    dayTime: 1, // Current subject count in the day
    config: {
        maxShelterCapacity: CONFIG.MAX_SHELTER_CAPACITY,
        dayLength: CONFIG.DAY_LENGTH,
        difficulty: CONFIG.DIFFICULTY,
        dayAfterTestsDefault: CONFIG.DAY_AFTER_TESTS_DEFAULT,
        securityItemsMin: CONFIG.SECURITY_ITEMS_MIN,
        securityItemsMax: CONFIG.SECURITY_ITEMS_MAX,
        securityIntrusionProbability: CONFIG.SECURITY_INTRUSION_PROBABILITY,
        initialEntrantProbability: CONFIG.INITIAL_ENTRANT_PROBABILITY,
        initialEntrantMaxFraction: CONFIG.INITIAL_ENTRANT_MAX_FRACTION,
        dayIntrusionIntervalMin: CONFIG.DAY_INTRUSION_INTERVAL_MIN,
        dayIntrusionIntervalMax: CONFIG.DAY_INTRUSION_INTERVAL_MAX,
        dayIntrusionProbability: CONFIG.DAY_INTRUSION_PROBABILITY,
        dayIntrusionInfectedChance: CONFIG.DAY_INTRUSION_INFECTED_CHANCE,
        dayDeactivationProbability: CONFIG.DAY_DEACTIVATION_PROBABILITY,
        playerInfectedProbability: CONFIG.PLAYER_INFECTED_PROBABILITY,
        noInfectedGuardDeathChance: CONFIG.NO_INFECTED_GUARD_DEATH_CHANCE,
        generator: {
            consumption: CONFIG.GENERATOR.CONSUMPTION,
            failureChance: CONFIG.GENERATOR.FAILURE_CHANCE,
            breakdownChance: CONFIG.GENERATOR.BREAKDOWN_CHANCE
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
    dayAfter: { testsAvailable: 3 },
    // Dialogue/pool tracking and flags
    dialoguePoolsUsed: [], // array of pool ids used this run
    dialoguePoolsLastUsed: {}, // map poolId -> dialoguesCount when last used
    dialogueFlags: {},      // persistent flags set by conversation choices
    dialogueMemory: [],     // recorded events for rumor/flags
    unlockedEndings: [],    // persistent unlocked endings
    audioSettings: {
        master: 1.0,
        ambient: 0.3,
        lore: 0.25,
        sfx: 0.6
    },

    savePersistentData() {
        const data = {
            unlockedEndings: this.unlockedEndings,
            audioSettings: this.audioSettings
        };
        localStorage.setItem('ruta01_persistence', JSON.stringify(data));
    },

    loadPersistentData() {
        try {
            const data = JSON.parse(localStorage.getItem('ruta01_persistence'));
            if (data) {
                this.unlockedEndings = data.unlockedEndings ?? this.unlockedEndings;
                this.audioSettings = { ...this.audioSettings, ...data.audioSettings };
            }
        } catch (e) {
            console.warn('Error loading persistence:', e);
        }
    },

    unlockEnding(endingId) {
        if (!this.unlockedEndings.includes(endingId)) {
            this.unlockedEndings.push(endingId);
            this.savePersistentData();
        }
    },

    // Colores centralizados
    colors: COLORS,

    updateParanoia(amount) {
        this.paranoia = Math.max(0, Math.min(100, this.paranoia + amount));
        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('paranoia-updated', { detail: { value: this.paranoia } }));
        }
        return this.paranoia;
    },

    // Seguridad por run
    securityItems: [],
    nextIntrusionAt: null,
    playerInfected: false,

    // Track if we are in Night Phase
    isNight: false,
    dayClosed: false,
    dayEnded: false,
    endingTriggered: false,
    generatorCheckedThisTurn: false,
    nightPurgePerformed: false,
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
        emergencyEnergyGranted: false, // Flag para evitar explotación de energía gratis
        restartLock: false // Bloqueo tras reinicio
    },
    paused: false,
    gameLog: [], // Historial cronológico
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
        this.endingTriggered = false;
        this.generatorCheckedThisTurn = false;
        this.nightPurgePerformed = false;
        this.dialogueStarted = false;
        this.dayAfter = { testsAvailable: this.config.dayAfterTestsDefault };
        this.securityItems = this.generateSecurityItems();
        this.generator = { 
            isOn: true, 
            mode: 'normal', 
            power: CONFIG.GENERATOR.MAX_POWER, 
            blackoutUntil: 0, 
            overclockCooldown: false, 
            emergencyEnergyGranted: false, 
            maxModeCapacityReached: 2, 
            restartLock: false,
            overloadRiskTurns: 0
        };
        this.playerInfected = Math.random() < this.config.playerInfectedProbability;
        this.nextIntrusionAt = this.dayTime + this.randomIntrusionInterval();
        this.lastNight = { occurred: false, victims: 0, message: '' };

        // Reset dialogue trackers and flags
        this.dialoguePoolsUsed = [];
        this.dialoguePoolsLastUsed = {};
        this.dialogueFlags = {};
        this.dialogueMemory = [];
        this.gameLog = [];
        this.addLogEntry('system', UI_STRINGS.SYSTEM_INIT);
    },

    addLogEntry(type, text, meta = {}) {
        this.gameLog.push({
            cycle: this.cycle,
            dayTime: this.dayTime,
            type, // 'lore', 'system', 'note'
            text,
            timestamp: Date.now(),
            meta
        });
        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('log-added', { detail: { type } }));
        }
    },

    addAdmitted(npc) {
        npc.enterCycle ??= this.cycle;
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
        this.generator.overclockCooldown = false;
    },

    randomIntrusionInterval() {
        const { dayIntrusionIntervalMin: min, dayIntrusionIntervalMax: max } = this.config;
        return Math.floor(min + Math.random() * (max - min + 1));
    },
    
    rescheduleIntrusion() {
        this.nextIntrusionAt = this.dayTime + this.randomIntrusionInterval();
    },

    generateSecurityItems() {
        const types = ['alarma', 'puerta', 'ventana', 'tuberias'];
        const { securityItemsMin: min, securityItemsMax: max } = this.config;
        const count = Math.clamp?.(min, max, Math.floor(min + Math.random() * (max - min + 1))) ?? Math.max(min, Math.min(max, Math.floor(min + Math.random() * (max - min + 1))));
        const items = [];
        let alarmCount = 0;

        for (let i = 0; i < count; i++) {
            let t = types[Math.floor(Math.random() * types.length)];
            
            // Garantizar solo 1 alarma
            if (t === 'alarma' && alarmCount >= 1) {
                const otherTypes = types.filter(type => type !== 'alarma');
                t = otherTypes[Math.floor(Math.random() * otherTypes.length)];
            } else if (t === 'alarma') {
                alarmCount++;
            }

            const isInitActive = Math.random() > 0.5;
            if (t === 'alarma') items.push({ type: t, active: isInitActive });
            else items.push({ type: t, secured: isInitActive });
        }
        return items;
    },

    // Dialogue & flags helpers
    markDialogueUsed(id) {
        if (!this.dialoguePoolsUsed.includes(id)) this.dialoguePoolsUsed.push(id);
        // record last used logical time (dialoguesCount)
        this.dialoguePoolsLastUsed[id] = this.dialoguesCount ?? 0;
    },

    /**
     * Returns true if the pool was used within the last `window` dialogues
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
        this.dialogueMemory ??= [];
        this.dialogueMemory.push(entry);
        // Keep last 200
        if (this.dialogueMemory.length > 200) {
            this.dialogueMemory.splice(0, this.dialogueMemory.length - 200);
        }
    },

    recallDialogueHistory() {
        return this.dialogueMemory ?? [];
    },

    getRandomRumor() {
        const mem = this.dialogueMemory ?? [];
        if (!mem.length) return '';
        
        const entry = mem[Math.floor(Math.random() * mem.length)];
        const verbOptions = ['falleció', 'desapareció', 'mintió', 'fue visto', 'murió', 'cayó'];
        const verb = verbOptions[Math.floor(Math.random() * verbOptions.length)];
        
        const namedPool = [...this.purgedNPCs, ...this.departedNPCs].filter(n => n?.name);
        const prev = namedPool.length ? namedPool[Math.floor(Math.random() * namedPool.length)].name : (entry.npc ?? 'alguien');
        const whoMentioned = entry.npc ?? 'alguien';
        
        return UI_STRINGS.RUMOR_TEMPLATE(whoMentioned, prev, verb);
    },

    startNextDay() {
        this.cycle++;
        this.dayTime = 1;
        this.isNight = false;
        this.dayClosed = false;
        this.dayEnded = false;
        this.nightPurgePerformed = false;
        this.dayAfter = { testsAvailable: this.config.dayAfterTestsDefault };
        this.securityItems = this.generateSecurityItems();
        
        // Mantener el estado del generador
        this.generator.blackoutUntil = 0;
        this.generator.emergencyEnergyGranted = false;
        this.generator.restartLock = false;
        
        this.nextIntrusionAt = this.dayTime + this.randomIntrusionInterval();
        this.lastNight.occurred = true;
        this.addLogEntry('system', UI_STRINGS.NEW_CYCLE(this.cycle));
        
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
                const [npc] = this.admittedNPCs.splice(idx, 1);
                if (npc) {
                    npc.left = { cycle: this.cycle };
                    this.departedNPCs.push(npc);
                    leftNames.push(npc.name);
                }
            }
            
            const msg = actual === 1 
                ? UI_STRINGS.NIGHT_DEPARTURE_SINGLE(leftNames[0]) 
                : UI_STRINGS.NIGHT_DEPARTURE_MULTIPLE(actual);
                
            this.lastNight.message = this.lastNight.message 
                ? `${this.lastNight.message} ${msg}` 
                : msg;
        }
    },

    getIntrusionModifier() {
        let m = 1.0;
        if (!this.generator.isOn) m *= 1.35;
        if (this.generator.mode === 'save') m *= 0.9;
        if (this.generator.mode === 'overload') m *= 1.2;
        
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        if (this.generator.blackoutUntil && now < this.generator.blackoutUntil) {
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
