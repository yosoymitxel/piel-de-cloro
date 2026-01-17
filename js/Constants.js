/**
 * Constantes globales de configuración y equilibrio del juego.
 */
export const CONSTANTS = {
    VERSION: '0.2.7',
    VERSION_LABEL: 'PIEL DE CLORO - TERMINAL CORE',
    NAV_ITEMS: {
        GUARD: 'nav-guard',
        ROOM: 'nav-room',
        SHELTER: 'nav-shelter',
        MORGUE: 'nav-morgue',
        GENERATOR: 'nav-generator',
        DATABASE: 'nav-database',
        MAP: 'nav-map',
        LOG: 'btn-open-log'
    },
    SCREENS: {
        START: 'start',
        GAME: 'game',
        SHELTER: 'shelter',
        MORGUE: 'morgue',
        ROOM: 'room',
        GENERATOR: 'generator',
        DATABASE: 'database',
        SETTINGS: 'settings',
        LOG: 'log',
        MAP: 'map',
        EXPEDITION: 'expedition',
        NIGHT: 'night',
        MEDITATION: 'meditation',
        SUPPLIES_HUB: 'supplies-hub',
        FINAL_STATS: 'finalStats'
    },
    GAME: {
        MAX_IGNORED_BEFORE_ABANDONMENT: 15,
        PARANOIA_DEATH_THRESHOLD: 100,
        VHS_EFFECT_THRESHOLD: 70,
        MAX_ERROR_LOGS: 20
    },
    GENERATOR: {
        DEFAULT_MAX_CAPACITY: 2,
        SAVE_MODE_CAPACITY: 1,
        OVERLOAD_MODE_CAPACITY: 3,
        RESTART_POWER: 32,
        FAILURE_CHANCE_OVERLOAD: 0.25
    },
    SECURITY: {
        DEGRADATION_CHANCE_MODIFIER: 0.3
    },
    ROOM_CONFIG: {
        game: { method: 'navigateToGuard', label: 'PUESTO DE GUARDIA' },
        room: { method: 'navigateToRoom', label: 'HABITACIÓN' },
        shelter: { method: 'navigateToShelter', label: 'REFUGIO' },
        generator: { method: 'navigateToGenerator', label: 'GENERADOR' },
        supplies: { method: 'navigateToSuppliesHub', label: 'SUMINISTROS' },
        fuel: { method: 'navigateToFuelRoom', label: 'DEPÓSITO DE COMBUSTIBLE' },
        morgue: { method: 'navigateToMorgue', label: 'MORGUE' },
        database: { screen: 'database', label: 'ARCHIVOS' },
        meditation: { method: 'navigateToMeditation', label: 'SALA_DE_SUEÑO_Z' }
    },
    SECTOR_CONFIG: {
        generator: {
            name: 'GENERADOR',
            icon: 'fa-bolt',
            sabotageMsg: 'SABOTAJE: Fallo provocado en generador por {npc}.',
            feedback: '¡SABOTAJE EN EL GENERADOR!'
        },
        security: {
            name: 'SEGURIDAD',
            icon: 'fa-shield-halved',
            sabotageMsg: 'SABOTAJE: Seguridad comprometida vía {item} por {npc}.',
            feedback: '¡PUERTA ABIERTA DESDE DENTRO!'
        },
        supplies: {
            name: 'SUMINISTROS',
            icon: 'fa-box-open',
            sabotageMsg: 'SABOTAJE: Desaparición de {amount} suministros por {npc}.',
            feedback: '¡SUMINISTROS ROBADOS!'
        },
        fuel: {
            name: 'COMBUSTIBLE',
            icon: 'fa-gas-pump',
            sabotageMsg: 'SABOTAJE: Fuga de combustible provocada por {npc}.',
            feedback: '¡FUGA DE COMBUSTIBLE!'
        }
    }
};
