import { CONSTANTS } from './Constants.js';

export const State = {
    paranoia: 0,
    sanity: 100,
    supplies: 15, // Suministros iniciales
    fuel: 10,     // Combustible inicial
    cycle: 1,
    dayTime: 1, // Current subject count in the day
    fuelRoomCheckedThisTurn: false,
    config: {
        maxShelterCapacity: 10,
        dayLength: 5, // Subjects per day
        difficulty: 'normal',
        dayAfterTestsDefault: 3,
        // Configuración Inicial (Dev/Difficulty)
        initialSupplies: 15,
        initialParanoia: 0,
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
        sfx: 0.6,
        muted: { ambient: false, lore: false, sfx: false }
    },
    pinnedRooms: ['generator', 'shelter', 'room'], // Salas pineadas por defecto: Generador, Refugio, Vigilancia
    shelter: {
        id: 'alpha-01',
        name: 'REFUGIO ALPHA-01',
        maxCapacity: 10,
        rooms: ['game', 'room', 'shelter', 'generator', 'supplies', 'fuel', 'morgue', 'database', 'meditation'],
        security: {
            minItems: 1,
            maxItems: 5,
            types: ['alarma', 'puerta', 'ventana', 'tuberias']
        },
        config: {
            securityIntrusionProbability: 0.25,
            initialEntrantProbability: 0.2,
            initialEntrantMaxFraction: 0.5,
            dayIntrusionIntervalMin: 1,
            dayIntrusionIntervalMax: 3,
            dayIntrusionProbability: 0.8,
            dayIntrusionInfectedChance: 0.65,
            dayDeactivationProbability: 0.9,
            playerInfectedProbability: 0.15
        }
    },

    savePersistentData() {
        const data = {
            unlockedEndings: this.unlockedEndings,
            audioSettings: this.audioSettings
        };
        const serialized = JSON.stringify(data);
        localStorage.setItem('ruta01_persistence', serialized);
    },

    loadPersistentData() {
        try {
            const raw = localStorage.getItem('ruta01_persistence');
            if (raw === null || raw === undefined || raw === 'undefined') return;
            const data = JSON.parse(raw);
            if (data) {
                if (data.unlockedEndings) this.unlockedEndings = data.unlockedEndings;
                if (data.audioSettings) {
                    this.audioSettings = data.audioSettings;
                    // Asegurar que muted existe para retrocompatibilidad
                    if (!this.audioSettings.muted) {
                        this.audioSettings.muted = { ambient: false, lore: false, sfx: false };
                    }
                }
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
    colors: {
        chlorine: '#2d5a27',
        chlorineLight: '#a8d5a2',
        chlorineSutil: '#3d7a36',
        chlorineDark: '#1b571b',
        alert: '#ff3333',
        critical: '#ff0000', // Added
        safe: '#00FF00',
        terminalGreen: '#00ff41', // Added
        warning: '#ffcc66', // Used for mid-level alerts
        orange: '#ff8c00', // Added
        yellow: '#e2e254', // Added
        textGreen: '#aaffaa', // Added
        textRed: '#ffaaaa', // Added
        textGray: '#cccccc', // Added
        energy: '#00FF00',
        save: '#00ced1',
        overload: '#ffaa00',
        off: '#333333',
        offStatus: '#ff2b2b',
        blood: '#a83232', // Added
        bgDark: '#0a0a0a', // Added
        bgBlack: '#050505' // Added
    },

    updateParanoia(amount) {
        // Aumentar dificultad: Si se gana paranoia (amount > 0), se gana un 20% más.
        // Si se reduce paranoia (amount < 0), se reduce un 10% menos.
        const modifier = amount > 0 ? 1.2 : 0.9;
        const finalAmount = Math.floor(amount * modifier);
        this.paranoia = Math.max(0, Math.min(100, this.paranoia + finalAmount));

        // La paranoia alta ya no drena la cordura directamente de forma lineal
        // sino que aumenta la dificultad de mantenerla (se gestiona en GameMechanicsManager)

        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('paranoia-updated', { detail: { value: this.paranoia } }));
        }
        return this.paranoia;
    },

    updateSanity(amount) {
        // Aumentar dificultad: Si se pierde cordura (amount < 0), se pierde un 25% más.
        // Si se gana cordura (amount > 0), se gana solo el 70% (antes 80%).
        const modifier = amount < 0 ? 1.25 : 0.7;
        const finalAmount = Math.floor(amount * modifier);
        this.sanity = Math.max(0, Math.min(100, this.sanity + finalAmount));

        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('sanity-updated', { detail: { value: this.sanity } }));
        }
        return this.sanity;
    },

    updateSupplies(amount) {
        this.supplies = Math.max(0, this.supplies + amount);
        return this.supplies;
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
    navLocked: true,
    lastNight: {
        occurred: false,
        victims: 0,
        message: ''
    },
    generator: {
        isOn: true,
        mode: 'normal',           // Compatibility: 'save', 'normal', 'overload'
        power: 100,               // Compatibility: 0-100
        capacity: 100,           // Capacidad total nominal
        load: 0,                // Carga actual (calculada dinámicamente)
        baseConsumption: 5,     // Consumo mínimo pasivo
        stability: 100,         // Salud del núcleo (0-100)
        overloadTimer: 0,       // Turnos consecutivos en sobrecarga
        systems: {
            security: { load: 15, active: true, label: 'Seguridad' },
            lighting: { load: 10, active: true, label: 'Iluminación' },
            lifeSupport: { load: 20, active: true, label: 'Soporte Vital' },
            shelterLab: { load: 25, active: false, label: 'Laboratorio' }
        },
        // Flags de control y legacy compatibility
        blackoutUntil: 0,
        restartLock: false,
        bloodTestId: null,
        bloodTestCountdown: 0,
        emergencyEnergyGranted: false,
        maxModeCapacityReached: 2, // Start with Normal
        assignedGuardId: null,      // NPC assigned as guard
        guardShiftLogs: []          // Information provided by the guard
    },
    // Nueva estructura centralizada de asignaciones
    assignments: {
        generator: { slots: 1, occupants: [] },
        security: { slots: 1, occupants: [] },
        supplies: { slots: 1, occupants: [] },
        fuel: { slots: 1, occupants: [] }
    },
    // Deprecated: sectorAssignments (se eliminará tras migración)
    
    paused: false,
    debug: true, // Cambiar a false para producción
    gameLog: [], // Historial cronológico
    dialogueStarted: false,

    reset() {
        this.paranoia = this.config.initialParanoia || 0;
        this.sanity = 100;
        this.supplies = this.config.initialSupplies || 15;
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
        this.navLocked = false;
        this.dialogueStarted = false;
        this.paused = false;
        this.dayAfter = { testsAvailable: this.config.dayAfterTestsDefault };
        this.securityItems = this.generateSecurityItems();
        this.generator = {
            isOn: true,
            mode: 'normal',
            power: 100,
            capacity: 100,
            load: 0,
            baseConsumption: 5,
            stability: 100,
            overloadTimer: 0,
            systems: {
                security: { load: 15, active: true, label: 'Seguridad' },
                lighting: { load: 10, active: true, label: 'Iluminación' },
                lifeSupport: { load: 20, active: true, label: 'Soporte Vital' },
                shelterLab: { load: 25, active: false, label: 'Laboratorio' }
            },
            blackoutUntil: 0,
            restartLock: false,
            bloodTestId: null,
            bloodTestCountdown: 0,
            emergencyEnergyGranted: false,
            maxModeCapacityReached: 2,
            assignedGuardId: null,
            guardShiftLogs: []
        };
        this.playerInfected = Math.random() < this.config.playerInfectedProbability;
        this.nextIntrusionAt = this.dayTime + this.randomIntrusionInterval();
        this.lastNight = { occurred: false, victims: 0, message: '' };

        // Reset dialogue trackers and flags
        this.dialoguePoolsUsed = [];
        this.dialoguePoolsLastUsed = {};
        this.gameLog = [];
        this.dialogueMemory = [];
        
        // Reset Assignments (Dynamic based on CONSTANTS.SECTOR_CONFIG)
        this.assignments = {};
        this.roomLogs = {};
        
        if (CONSTANTS.SECTOR_CONFIG) {
            Object.keys(CONSTANTS.SECTOR_CONFIG).forEach(sectorId => {
                const config = CONSTANTS.SECTOR_CONFIG[sectorId];
                this.assignments[sectorId] = { 
                    slots: config.slots || 1, 
                    occupants: [] 
                };
                this.roomLogs[sectorId] = [];
            });
        } else {
             // Fallback if config missing
            this.assignments = {
                generator: { slots: 1, occupants: [] },
                security: { slots: 1, occupants: [] },
                supplies: { slots: 1, occupants: [] },
                fuel: { slots: 1, occupants: [] }
            };
            this.roomLogs = { generator: [], security: [], supplies: [], fuel: [] };
        }

        // Legacy support during migration (proxies to new system if needed, or just kept empty)
        this.sectorAssignments = {};
        this.addLogEntry('system', 'Sistema RUTA-01 inicializado. Ciclo 1.');

        // NO RESETEAR: unlockedEndings ni audioSettings ya que son persistentes
    },

    addLogEntry(type, text, meta = {}) {
        this.gameLog.push({
            cycle: this.cycle,
            dayTime: this.dayTime,
            type, // 'lore', 'system', 'note', 'evidence'
            text,
            timestamp: Date.now(),
            meta,
            isNew: true // Para animaciones en la UI
        });
        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('log-added', { detail: { type } }));
        }
    },

    addSectorLog(sector, message, npcName = 'SISTEMA') {
        if (!this.roomLogs) this.roomLogs = {};
        if (!this.roomLogs[sector]) this.roomLogs[sector] = [];
        
        const time = this.isNight ? 'NOCT' : `${this.dayTime}:00`;
        
        this.roomLogs[sector].push({
            timestamp: time,
            npcName: npcName,
            message: message,
            type: npcName === 'SISTEMA' ? 'system' : 'normal'
        });
        
        if (this.roomLogs[sector].length > 20) this.roomLogs[sector].shift();
        
        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('sector-log-added', { detail: { sector } }));
        }
    },

    addAdmitted(npc) {
        if (!npc.enterCycle) npc.enterCycle = this.cycle;
        this.admittedNPCs.push(npc);
    },

    addPurged(npc) {
        // Prevent duplicates
        if (this.purgedNPCs.includes(npc)) return;

        // Remove from admitted if present
        const index = this.admittedNPCs.indexOf(npc);
        if (index > -1) {
            this.admittedNPCs.splice(index, 1);
        }
        
        // Remove from assignments (logging included)
        this._unassignFromAll(npc);

        npc.death = { reason: 'purga', cycle: this.cycle, revealed: false };
        this.purgedNPCs.push(npc);
    },

    _unassignFromAll(npc) {
        if (!this.assignments) return;
        Object.keys(this.assignments).forEach(sector => {
            const idx = this.assignments[sector].occupants.indexOf(npc.id);
            if (idx > -1) {
                this.assignments[sector].occupants.splice(idx, 1);
                this.addSectorLog(sector, `Personal perdido: ${npc.name} ha dejado el puesto.`, npc.name);
            }
        });
        if (this.generator && this.generator.assignedGuardId === npc.id) {
            this.generator.assignedGuardId = null;
        }
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
        const sec = this.shelter.security;
        const types = sec.types || ['alarma', 'puerta', 'ventana', 'tuberias'];
        const min = sec.minItems || 1;
        const max = sec.maxItems || 5;
        const count = Math.max(min, Math.min(max, Math.floor(min + Math.random() * (max - min + 1))));
        const items = [];
        let alarmCount = 0;

        for (let i = 0; i < count; i++) {
            let t = types[Math.floor(Math.random() * types.length)];

            // Garantizar solo 1 alarma
            if (t === 'alarma') {
                if (alarmCount >= 1) {
                    // Si ya hay una alarma, elegir otro tipo aleatorio que no sea alarma
                    const otherTypes = types.filter(type => type !== 'alarma');
                    t = otherTypes[Math.floor(Math.random() * otherTypes.length)];
                } else {
                    alarmCount++;
                }
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

    // --- Sistema de Logs por niveles ---
    log(...args) {
        if (this.debug) {
            const time = new Date().toLocaleTimeString();
            console.log(`[LOG ${time}]`, ...args);
        }
    },
    warn(...args) {
        // Warnings always show in tests/dev usually, but can gate with debug if preferred
        // For this user request: "sistema de errores a nivel console.error, log y warning"
        const time = new Date().toLocaleTimeString();
        console.warn(`[WARN ${time}]`, ...args);
    },
    error(...args) {
        const time = new Date().toLocaleTimeString();
        console.error(`[ERR ${time}]`, ...args);
    },

    getRandomRumor() {
        // 1. Lore-specific rumors based on flags
        if (this.hasFlag('known_mother') && Math.random() > 0.7) {
             return "Dicen que la Madre duerme bajo el hielo... y que sueña con nosotros.";
        }
        if (this.hasFlag('known_heartbeat') && Math.random() > 0.7) {
             return "Algunos oyen latidos en las tuberías por la noche. Como un corazón gigante.";
        }
        if (this.hasFlag('known_deep_well') && Math.random() > 0.7) {
             return "El Pozo Profundo no tiene fondo. Lo que cae allí, nunca deja de caer.";
        }
        if (this.hasFlag('known_kystra') && Math.random() > 0.7) {
             return "Kystra no desapareció. Se convirtió en parte de la estación.";
        }
        if (this.hasFlag('rumour_sector_zero') && Math.random() > 0.7) {
             return "Hay un Sector 0. Un núcleo original. Dicen que allí el tiempo no pasa.";
        }
        if (this.hasFlag('rumour_white_silence') && Math.random() > 0.7) {
             return "El Silencio Blanco... una frecuencia que anula el ruido de la Colmena. ¿Mito o realidad?";
        }

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

    startNextDay() {
        this.cycle++;
        this.dayTime = 1;
        this.isNight = false;
        this.dayClosed = false;
        this.dayEnded = false;
        this.nightPurgePerformed = false;
        this.dayAfter = { testsAvailable: this.config.dayAfterTestsDefault };
        this.securityItems = this.generateSecurityItems();

        // Mantener el estado del generador (encendido/apagado) pero resetear flags temporales
        this.generator.blackoutUntil = 0;
        this.generator.emergencyEnergyGranted = false;
        this.generator.restartLock = false;

        this.nextIntrusionAt = this.dayTime + this.randomIntrusionInterval();
        this.lastNight.occurred = true;
        this.addLogEntry('system', `Inicio del Ciclo ${this.cycle}.`);

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
                    this._unassignFromAll(npc);
                }
            }
            const msg = actual === 1 ? `Durante la noche, ${leftNames[0]} abandonó la comuna.` : `Durante la noche, ${actual} integrantes abandonaron la comuna.`;
            this.lastNight.message = this.lastNight.message ? `${this.lastNight.message} ${msg}` : msg;
        }
    },

    update(deltaTime) {
        // Logic for time-based updates (timers, cooldowns)
        if (this.generator.blackoutUntil > 0) {
             // Logic related to blackout timer is currently handled by timestamp checks
             // but could be moved here for cleaner state management
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
