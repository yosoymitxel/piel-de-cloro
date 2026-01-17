/**
 * Constantes globales de configuración y equilibrio del juego.
 */
export const CONSTANTS = {
    // Lugares de trabajo válidos
    ASSIGNMENTS: {
        GENERATOR: 'generator',
        INFIRMARY: 'infirmary',
        KITCHEN: 'kitchen',
        SECURITY: 'security',
        NONE: null
    },

    // Definición de Efectos de Profesiones
    JOB_EFFECTS: {
        'Ingeniero': { target: 'generator', effect: 'consumption_reduction', value: 0.15, assignment: 'generator' },
        'Electricista': { target: 'generator', effect: 'consumption_reduction', value: 0.10, assignment: 'generator' }, // Versión menor del ingeniero
        'Médico': { target: 'infirmary', effect: 'death_reduction', value: 0.30, assignment: 'infirmary' },
        'Suturador': { target: 'infirmary', effect: 'death_reduction', value: 0.15, assignment: 'infirmary' },
        'Cocinero': { target: 'kitchen', effect: 'ration_bonus', value: 0.20, assignment: 'kitchen' },
        'Soldado': { target: 'security', effect: 'theft_reduction', value: 0.40, assignment: 'security' }, // Soldado no estaba en la lista original, añadirlo o mapear 'Seguridad'
        'Seguridad': { target: 'security', effect: 'theft_reduction', value: 0.25, assignment: 'security' }
    },

    LORE_CLUE_THRESHOLD: 2, // Número de escaneos para revelar pista de lore
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
        FUEL_ROOM: 'fuel-room',
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
    // Master Room Dictionary - Single source of truth for room naming
    ROOM_NAMES: {
        generator: { id: 'generator', displayName: 'GENERADOR', icon: 'fa-bolt', size: { w: 2, h: 1 } },
        security: { id: 'security', displayName: 'SEGURIDAD', icon: 'fa-shield-halved', size: { w: 1, h: 1 } },
        supplies: { id: 'supplies', displayName: 'ALMACÉN', icon: 'fa-box-open', size: { w: 2, h: 1 } },
        storage: { id: 'supplies', displayName: 'ALMACÉN', icon: 'fa-box-open', size: { w: 2, h: 1 } }, // Alias
        fuel: { id: 'fuel', displayName: 'COMBUSTIBLE', icon: 'fa-gas-pump', size: { w: 1, h: 1 } },
        meditation: { id: 'meditation', displayName: 'SALA Z', icon: 'fa-skull', size: { w: 1, h: 2 } },
        lab: { id: 'lab', displayName: 'LABORATORIO', icon: 'fa-flask', size: { w: 1, h: 1 } },
        infirmary: { id: 'infirmary', displayName: 'ENFERMERÍA', icon: 'fa-suitcase-medical', size: { w: 1, h: 1 } },
        medical: { id: 'infirmary', displayName: 'ENFERMERÍA', icon: 'fa-suitcase-medical', size: { w: 1, h: 1 } }, // Alias
        game: { id: 'game', displayName: 'PUESTO GUARDIA', icon: 'fa-person-military-rifle', size: { w: 1, h: 1 } },
        shelter: { id: 'shelter', displayName: 'REFUGIO', icon: 'fa-house', size: { w: 2, h: 2 } },
        morgue: { id: 'morgue', displayName: 'MORGUE', icon: 'fa-skull-crossbones', size: { w: 1, h: 1 } },
        database: { id: 'database', displayName: 'ARCHIVOS', icon: 'fa-database', size: { w: 1, h: 1 } }
    },
    ROOM_CONFIG: {
        game: { method: 'navigateToGuard', label: 'PUESTO DE GUARDIA' },
        room: { method: 'navigateToRoom', label: 'HABITACIÓN' },
        shelter: { method: 'navigateToShelter', label: 'REFUGIO' },
        generator: { method: 'navigateToGenerator', label: 'GENERADOR' },
        supplies: { method: 'navigateToSuppliesHub', label: 'ALMACÉN' },
        fuel: { method: 'navigateToFuelRoom', label: 'COMBUSTIBLE' },
        morgue: { method: 'navigateToMorgue', label: 'MORGUE' },
        database: { screen: 'database', label: 'ARCHIVOS' },
        meditation: { method: 'navigateToMeditation', label: 'SALA Z' }
    },
    SECTOR_CONFIG: {
        generator: {
            name: 'GENERADOR',
            icon: 'fa-bolt',
            slots: 1,
            sabotageMsg: 'SABOTAJE: Fallo provocado en generador por {npc}.',
            feedback: '¡SABOTAJE EN EL GENERADOR!'
        },
        security: {
            name: 'SEGURIDAD',
            icon: 'fa-shield-halved',
            slots: 1,
            sabotageMsg: 'SABOTAJE: Seguridad comprometida vía {item} por {npc}.',
            feedback: '¡PUERTA ABIERTA DESDE DENTRO!'
        },
        supplies: {
            name: 'SUMINISTROS',
            icon: 'fa-box-open',
            slots: 1,
            sabotageMsg: 'SABOTAJE: Desaparición de {amount} suministros por {npc}.',
            feedback: '¡SUMINISTROS ROBADOS!'
        },
        fuel: {
            name: 'COMBUSTIBLE',
            icon: 'fa-gas-pump',
            slots: 1,
            sabotageMsg: 'SABOTAJE: Fuga de combustible provocada por {npc}.',
            feedback: '¡FUGA DE COMBUSTIBLE!'
        }
    },
    ROOM_STATUS_CONFIG: {
        generator: {
            check: (state) => {
                if (!state.generator.isOn) return 'status-critical'; // Apagado -> Rojo
                if (state.generator.mode === 'save') return 'status-level-save'; // Ahorro -> Celeste
                if (state.generator.mode === 'overload') return 'status-level-overload'; // Overload -> Naranja
                return 'status-active'; // Normal -> Verde
            }
        },
        shelter: {
            check: (state) => {
                const pop = state.admittedNPCs.length;
                const cap = state.config.maxShelterCapacity;
                if (pop >= cap) return 'status-critical';
                if (pop > cap * 0.8) return 'status-alert';
                return 'status-active';
            }
        },
        supplies: {
            check: (state) => {
                if (state.supplies < 5) return 'status-critical';
                if (state.supplies < 10) return 'status-alert';
                return 'status-active';
            }
        },
        fuel: {
            check: (state) => {
                if (state.fuel < 3) return 'status-critical';
                if (state.fuel < 6) return 'status-alert';
                return 'status-active';
            }
        },
        security: {
            check: (state) => {
                const isGenOn = state.generator && state.generator.isOn;
                const isSecSystemOn = state.generator && state.generator.systems && state.generator.systems.security.active;
                let guardId = null;
                if (state.assignments && state.assignments.security) {
                    guardId = state.assignments.security.occupants[0];
                } else {
                    guardId = state.sectorAssignments?.security?.[0];
                }

                // Todo apagado (Gen o Sistema Sec)
                if (!isGenOn || !isSecSystemOn) {
                    return guardId ? 'status-alert' : 'status-critical';
                    // Apagado + Asignado -> Amarillo (Alert)
                    // Apagado + Sin Asignado -> Rojo (Critical)
                }

                // Todo encendido
                return guardId ? 'status-active' : 'status-alert';
                // Encendido + Asignado -> Verde (Active)
                // Encendido + Sin Asignado -> Amarillo (Alert)
            }
        },
        room: {
            check: (state) => {
                // Misma lógica que Security para la sala de vigilancia (habitación)
                const isGenOn = state.generator && state.generator.isOn;
                const isSecSystemOn = state.generator && state.generator.systems && state.generator.systems.security.active;
                let guardId = null;
                if (state.assignments && state.assignments.security) {
                    guardId = state.assignments.security.occupants[0];
                } else {
                    guardId = state.sectorAssignments?.security?.[0];
                }

                if (!isGenOn || !isSecSystemOn) {
                    return guardId ? 'status-alert' : 'status-critical';
                }
                return guardId ? 'status-active' : 'status-alert';
            }
        }
    }
};
