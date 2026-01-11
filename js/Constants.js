export const CONFIG = {
    MAX_SHELTER_CAPACITY: 10,
    DAY_LENGTH: 5, // Subjects per day
    DIFFICULTY: 'normal',
    DAY_AFTER_TESTS_DEFAULT: 3,
    
    // Security / intrusions
    SECURITY_ITEMS_MIN: 1,
    SECURITY_ITEMS_MAX: 5,
    SECURITY_INTRUSION_PROBABILITY: 0.25,
    
    // Initial entrants
    INITIAL_ENTRANT_PROBABILITY: 0.2,
    INITIAL_ENTRANT_MAX_FRACTION: 0.5,
    
    // Day intrusions
    DAY_INTRUSION_INTERVAL_MIN: 1,
    DAY_INTRUSION_INTERVAL_MAX: 3,
    DAY_INTRUSION_PROBABILITY: 0.8,
    DAY_INTRUSION_INFECTED_CHANCE: 0.65,
    DAY_DEACTIVATION_PROBABILITY: 0.9,
    
    // Player infection
    PLAYER_INFECTED_PROBABILITY: 0.15,
    
    // Night without infected: guard death chance
    NO_INFECTED_GUARD_DEATH_CHANCE: 0.05,
    
    // Generator
    GENERATOR: {
        CONSUMPTION: {
            SAVE: 1,    // Ahorro: 1 energía/turno
            NORMAL: 2,  // Normal: 2 energía/turno
            OVERLOAD: 3 // Sobrecarga: 3 energía/turno
        },
        FAILURE_CHANCE: {
            SAVE: 0.0,    // Ahorro: No se apaga
            NORMAL: 0.08, // Normal: Probabilidad estándar
            OVERLOAD: 0.2 // Sobrecarga: Alta probabilidad
        },
        BREAKDOWN_CHANCE: 0.1,
        MAX_POWER: 100
    }
};

export const COLORS = {
    CHLORINE: '#2d5a27',
    CHLORINE_LIGHT: '#a8d5a2',
    CHLORINE_SUTIL: '#3d7a36',
    CHLORINE_DARK: '#1b571b',
    ALERT: '#ff3333',
    SAFE: '#00FF00',
    WARNING: '#ffcc66',
    ENERGY: '#00FF00',
    SAVE: '#00ced1',
    OVERLOAD: '#ffaa00',
    OFF: '#333333',
    OFF_STATUS: '#ff2b2b'
};

export const UI_STRINGS = {
    SYSTEM_INIT: 'Sistema RUTA-01 inicializado. Ciclo 1.',
    NEW_CYCLE: (cycle) => `Inicio del Ciclo ${cycle}.`,
    NIGHT_DEPARTURE_SINGLE: (name) => `Durante la noche, ${name} abandonó la comuna.`,
    NIGHT_DEPARTURE_MULTIPLE: (count) => `Durante la noche, ${count} integrantes abandonaron la comuna.`,
    RUMOR_TEMPLATE: (who, target, verb) => `${who} comentaba que ${target} ${verb} en la oscuridad.`,
    LOG_RUMOR: (rumor) => `Rumor escuchado: "${rumor}"`
};

export const AUDIO_CHANNELS = {
    MASTER: 'master',
    AMBIENT: 'ambient',
    LORE: 'lore',
    SFX: 'sfx'
};

export const GAME_STATES = {
    MENU: 'menu',
    GAME: 'game',
    SHELTER: 'shelter',
    ROOM: 'room',
    MORGUE: 'morgue',
    GENERATOR: 'generator',
    LOG: 'log'
};

export const STATS_CONFIG = {
    REALTIME_TTL: 5000,
    NIGHTLY_TTL: 24 * 60 * 60 * 1000,
    POLL_INTERVAL: 5000,
    BASE_URL: '/api',
    USE_MOCK: true
};
