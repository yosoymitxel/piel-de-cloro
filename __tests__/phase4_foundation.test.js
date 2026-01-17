
import { State } from '../js/State.js';
import { Shelter, Room, ROOM_TYPES } from '../js/ShelterModel.js';

describe('Phase 4: Shelter Model & Blueprint System', () => {
    beforeEach(() => {
        // Mocking DOM and jQuery for UIManager tests if needed, 
        // but here we focus on State & Model logic first.
        State.reset();
    });

    test('State should initialize with a currentShelter', () => {
        expect(State.currentShelter).toBeDefined();
        expect(State.currentShelter).toBeInstanceOf(Shelter);
        expect(State.currentShelterId).not.toBeNull();
    });

    test('Procedural Generation should create a valid grid', () => {
        const shelter = Shelter.generateRandom('3x3');
        expect(Object.keys(shelter.grid).length).toBe(9);

        const rooms = shelter.getAllRooms();
        const hasGenerator = rooms.some(r => r.type === 'GENERATOR');
        expect(hasGenerator).toBe(true);

        // Generator should be at (1,1) for 3x3 if using default logic
        const centerRoom = shelter.getRoom(1, 1);
        expect(centerRoom.type).toBe('GENERATOR');
    });

    test('Room should correctly map load and icon from type', () => {
        const medicalRoom = new Room({ type: 'MEDICAL' });
        expect(medicalRoom.name).toBe(ROOM_TYPES.MEDICAL.name);
        expect(medicalRoom.icon).toBe(ROOM_TYPES.MEDICAL.icon);
        expect(medicalRoom.load).toBe(ROOM_TYPES.MEDICAL.powerDraw);
    });

    test('Shelter should allow adding NPCs to rooms', () => {
        const shelter = State.currentShelter;
        const room = shelter.getRoom(1, 1);
        room.addOccupant('npc_test_1');

        expect(room.occupants).toContain('npc_test_1');
        room.removeOccupant('npc_test_1');
        expect(room.occupants).not.toContain('npc_test_1');
    });
});
