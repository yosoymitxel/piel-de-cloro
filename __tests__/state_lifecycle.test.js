import { State } from '../js/State.js';
import { NPC } from '../js/NPC.js';

describe('State NPC lifecycle', () => {
    beforeEach(() => State.reset());

    test('admission is idempotent and refuses terminal NPC states', () => {
        const npc = new NPC();
        expect(State.addAdmitted(npc)).toBe(true);
        expect(State.addAdmitted(npc)).toBe(false);
        expect(State.admittedNPCs.filter(item => item.id === npc.id)).toHaveLength(1);

        const dead = new NPC();
        dead.death = { reason: 'test', cycle: 1, revealed: false };
        expect(State.addAdmitted(dead)).toBe(false);
        expect(State.admittedNPCs.some(item => item.id === dead.id)).toBe(false);
    });

    test('ignored subjects are recorded once with their exit cycle', () => {
        const npc = new NPC();
        expect(State.addIgnored(npc)).toBe(true);
        expect(State.addIgnored(npc)).toBe(false);
        expect(npc.exitCycle).toBe(State.cycle);
        expect(State.ignoredNPCs.filter(item => item.id === npc.id)).toHaveLength(1);
        expect(State.admittedNPCs).not.toContain(npc);
    });

    test('departure removes the NPC and assignments exactly once', () => {
        const npc = new NPC();
        State.addAdmitted(npc);
        npc.assignedSector = 'security';
        State.assignments = { security: { occupants: [npc.id] } };
        State.sectorAssignments = { fuel: [npc.id] };
        State.generator.assignedGuardId = npc.id;

        expect(State.markDeparted(npc)).toBe(true);
        expect(State.markDeparted(npc)).toBe(false);
        expect(State.admittedNPCs).not.toContain(npc);
        expect(State.departedNPCs.filter(item => item.id === npc.id)).toHaveLength(1);
        expect(npc.left.cycle).toBe(State.cycle);
        expect(npc.exitDate).toBe(State.cycle);
        expect(State.assignments.security.occupants).not.toContain(npc.id);
        expect(State.sectorAssignments.fuel).not.toContain(npc.id);
        expect(State.generator.assignedGuardId).toBeNull();
        expect(npc.assignedSector).toBeNull();
    });

    test('death removes admission and records one terminal status with its reason', () => {
        const npc = new NPC();
        State.addAdmitted(npc);
        State.assignments = { security: { occupants: [npc.id] } };

        expect(State.recordDeath(npc, 'fallo_soporte_vital', true)).toBe(true);
        expect(State.recordDeath(npc, 'otra_causa')).toBe(false);
        expect(State.admittedNPCs).not.toContain(npc);
        expect(State.purgedNPCs.filter(item => item.id === npc.id)).toHaveLength(1);
        expect(npc.death).toEqual({ reason: 'fallo_soporte_vital', cycle: State.cycle, revealed: true });
        expect(State.assignments.security.occupants).not.toContain(npc.id);
    });
});
