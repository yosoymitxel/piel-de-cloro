
/**
 * ShelterModel.js - Core architecture for the procedurally generated shelter system.
 * Part of Phase 4: Scalable Architecture.
 */

export const ROOM_TYPES = {
    GENERATOR: {
        id: 'GENERATOR',
        name: "Núcleo de Energía",
        powerDraw: 0,
        icon: "fa-bolt",
        category: 'system'
    },
    LAB: {
        id: 'LAB',
        name: "Laboratorio Químico",
        powerDraw: 8,
        icon: "fa-flask",
        category: 'research'
    },
    STORAGE: {
        id: 'STORAGE',
        name: "Depósito de Víveres",
        powerDraw: 2,
        icon: "fa-box-open",
        category: 'resources'
    },
    MEDICAL: {
        id: 'MEDICAL',
        name: "Enfermería",
        powerDraw: 8,
        icon: "fa-house-medical",
        category: 'survival'
    },
    SECURITY: {
        id: 'SECURITY',
        name: "Puesto de Seguridad",
        powerDraw: 5,
        icon: "fa-shield-halved",
        category: 'security'
    },
    FUEL: {
        id: 'FUEL',
        name: "Depósito de Combustible",
        powerDraw: 4,
        icon: "fa-gas-pump",
        category: 'resources'
    },
    MORGUE: {
        id: 'MORGUE',
        name: "Morgue",
        powerDraw: 8,
        icon: "fa-skull",
        category: 'survival'
    },
    DATABASE: {
        id: 'DATABASE',
        name: "Archivos de Datos",
        powerDraw: 5,
        icon: "fa-database",
        category: 'lore'
    },
    MEDITATION: {
        id: 'MEDITATION',
        name: "Núcleo Psíquico",
        powerDraw: 6,
        icon: "fa-brain",
        category: 'mental'
    },
    COMMS: {
        id: 'COMMS',
        name: "Sala de Comunicaciones",
        powerDraw: 8,
        icon: "fa-tower-broadcast",
        category: 'lore'
    },
    GREENHOUSE: {
        id: 'GREENHOUSE',
        name: "Invernadero Hidropónico",
        powerDraw: 10,
        icon: "fa-seedling",
        category: 'resources'
    },
    EMPTY: {
        id: 'EMPTY',
        name: "Sector Vacío",
        powerDraw: 2,
        icon: "fa-square",
        category: 'none'
    }
};

export class Room {
    constructor(config = {}) {
        this.id = config.id || `room_${Math.random().toString(36).substr(2, 9)}`;
        this.type = config.type || 'EMPTY';
        const typeData = ROOM_TYPES[this.type] || ROOM_TYPES.EMPTY;

        this.name = config.name || typeData.name;
        this.coords = config.coords || { x: 0, y: 0 };
        this.isDiscovered = config.isDiscovered !== undefined ? config.isDiscovered : true;
        this.integrity = config.integrity !== undefined ? config.integrity : 100;
        this.powerActive = config.powerActive !== undefined ? config.powerActive : true;
        this.occupants = config.occupants || [];

        this.load = typeData.powerDraw || 0;
        this.icon = typeData.icon;
    }

    addOccupant(npcId) {
        if (!this.occupants.includes(npcId)) {
            this.occupants.push(npcId);
        }
    }

    removeOccupant(npcId) {
        this.occupants = this.occupants.filter(id => id !== npcId);
    }
}

export class Shelter {
    constructor(config = {}) {
        this.id = config.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `shelter_${Date.now()}`);
        this.name = config.name || "SHELTER_ALPHA";
        this.layoutName = config.layoutName || "Estructura Estándar";

        this.grid = {};
        if (config.grid) {
            Object.entries(config.grid).forEach(([key, roomData]) => {
                this.grid[key] = new Room(roomData);
            });
        }

        this.stats = config.stats || {
            integrity: 100,
            noiseLevel: 0,
            maxCapacity: config.maxCapacity || 10
        };
    }

    getRoom(x, y) {
        return this.grid[`${x},${y}`];
    }

    getAllRooms() {
        return Object.values(this.grid);
    }

    getRoomByType(type) {
        if (!type) return null;
        return Object.values(this.grid).find(r => r.type.toUpperCase() === type.toUpperCase());
    }

    static createPlaceholder(type = '3x3') {
        const shelter = new Shelter({ name: "REFUGIO ALPHA-01", layoutName: type });
        let width = 3, height = 3;
        if (type === '4x4') { width = 4; height = 4; }

        const layoutPattern = [
            ['EMPTY', 'STORAGE', 'FUEL'],
            ['SECURITY', 'GENERATOR', 'MEDICAL'],
            ['DATABASE', 'LAB', 'MORGUE']
        ];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let rType = 'EMPTY';
                if (layoutPattern[y] && layoutPattern[y][x]) rType = layoutPattern[y][x];
                shelter.grid[`${x},${y}`] = new Room({ type: rType, coords: { x, y } });
            }
        }
        return shelter;
    }

    static generateRandom(type = '3x3') {
        const shelter = new Shelter({ name: "REFUGIO PROCEDURAL", layoutName: type });
        let width = 3, height = 3;
        if (type === '4x4') { width = 4; height = 4; }

        const mandatory = ['STORAGE', 'MEDICAL', 'SECURITY', 'LAB', 'FUEL', 'MORGUE', 'DATABASE'];
        const rare = [];
        if (Math.random() < 0.15) rare.push('COMMS');
        if (Math.random() < 0.15) rare.push('GREENHOUSE');

        const genX = Math.floor(width / 2);
        const genY = Math.floor(height / 2);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                shelter.grid[`${x},${y}`] = new Room({ type: 'EMPTY', coords: { x, y } });
            }
        }

        shelter.grid[`${genX},${genY}`] = new Room({ type: 'GENERATOR', coords: { x: genX, y: genY } });

        const pool = [...mandatory, ...rare];
        const spots = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (x === genX && y === genY) continue;
                spots.push({ x, y });
            }
        }

        for (let i = spots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [spots[i], spots[j]] = [spots[j], spots[i]];
        }

        pool.forEach(rType => {
            if (spots.length > 0) {
                const s = spots.pop();
                shelter.grid[`${s.x},${s.y}`] = new Room({ type: rType, coords: s });
            }
        });

        return shelter;
    }
}
