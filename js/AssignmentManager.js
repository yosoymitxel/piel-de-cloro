import { State } from './State.js';
import { AssignmentLogs } from './dialogue_pools/AssignmentLogs.js';

export class AssignmentManager {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        
        // Ensure state integrity on init
        if (!State.assignments) {
            State.reset(); // Or initialize just assignments
        }
    }

    /**
     * Tries to assign an NPC to a sector.
     * @param {string} npcId - The ID of the NPC.
     * @param {string} sectorId - The target sector ID.
     * @returns {boolean} - True if successful, false otherwise.
     */
    assign(npcId, sectorId) {
        const sector = State.assignments[sectorId];
        const npc = State.admittedNPCs.find(n => n.id === npcId);

        if (!sector) {
            console.error(`AssignmentManager: Sector '${sectorId}' does not exist.`);
            return false;
        }
        if (!npc) {
            console.error(`AssignmentManager: NPC '${npcId}' not found.`);
            return false;
        }

        // 1. Check if already assigned to THIS sector
        if (sector.occupants.includes(npcId)) {
            console.warn(`AssignmentManager: ${npc.name} is already assigned to ${sectorId}.`);
            return true; // Already done
        }

        // 2. Check Capacity
        if (sector.occupants.length >= sector.slots) {
            // Option: Auto-swap? For now, we'll enforce strict capacity or swap the first one.
            // Requirement implies we might want to swap.
            // Let's implement SWAP logic: If full, unassign the first occupant.
            const occupantToRemove = sector.occupants[0];
            this.unassign(occupantToRemove, sectorId);
        }

        // 3. Remove from ANY other sector (Exclusivity)
        this.removeFromAllSectors(npcId);

        // 4. Assign
        sector.occupants.push(npcId);
        npc.assignedSector = sectorId;

        // Sync legacy properties for backward compatibility (temporarily)
        if (sectorId === 'generator') State.generator.assignedGuardId = npcId;
        
        // Log & UI
        this.addLog(sectorId, npc, this.getRandomLog('start', sectorId, npc));
        
        if (this.ui) {
            this.ui.showFeedback(`${npc.name} ASIGNADO A ${sectorId.toUpperCase()}`, "green", 3000);
            this.updateUI(sectorId);
        }

        return true;
    }

    /**
     * Unassigns an NPC from a specific sector.
     * @param {string} npcId 
     * @param {string} sectorId 
     */
    unassign(npcId, sectorId) {
        const sector = State.assignments[sectorId];
        if (!sector) return;

        const idx = sector.occupants.indexOf(npcId);
        if (idx > -1) {
            sector.occupants.splice(idx, 1);
            
            const npc = State.admittedNPCs.find(n => n.id === npcId);
            if (npc) {
                npc.assignedSector = null;
                this.addLog(sectorId, npc, this.getRandomLog('end', sectorId, npc));
            }

            // Sync legacy
            if (sectorId === 'generator' && State.generator.assignedGuardId === npcId) {
                State.generator.assignedGuardId = null;
            }

            this.updateUI(sectorId);
        }
    }

    /**
     * Removes an NPC from ALL sectors they might be in.
     * @param {string} npcId 
     */
    removeFromAllSectors(npcId) {
        for (const [sId, data] of Object.entries(State.assignments)) {
            if (data.occupants.includes(npcId)) {
                this.unassign(npcId, sId);
            }
        }
    }

    /**
     * Returns the list of NPC objects assigned to a sector.
     * @param {string} sectorId 
     * @returns {Array} Array of NPC objects
     */
    getAssignedNPCs(sectorId) {
        const sector = State.assignments[sectorId];
        if (!sector) return [];
        return sector.occupants.map(id => State.admittedNPCs.find(n => n.id === id)).filter(n => n);
    }

    /**
     * Checks if an NPC is assigned anywhere.
     * @param {string} npcId 
     * @returns {string|null} The sector ID or null.
     */
    getAssignmentForNPC(npcId) {
        for (const [sId, data] of Object.entries(State.assignments)) {
            if (data.occupants.includes(npcId)) return sId;
        }
        return null;
    }

    /**
     * Returns the first assigned NPC (useful for single-slot sectors).
     * @param {string} sectorId 
     * @returns {Object|null}
     */
    getFirstAssigned(sectorId) {
        const npcs = this.getAssignedNPCs(sectorId);
        return npcs.length > 0 ? npcs[0] : null;
    }

    /**
     * Updates shifts (e.g., end of turn), generating random logs.
     */
    updateShifts() {
        if (!State.assignments) return;

        for (const [sector, data] of Object.entries(State.assignments)) {
            if (!data.occupants || data.occupants.length === 0) continue;

            const npcId = data.occupants[0];
            const npc = State.admittedNPCs.find(n => n.id === npcId);

            if (npc) {
                // Chance to log something
                if (Math.random() < 0.4) {
                    this.addLog(sector, npc, this.getRandomLog('updates', sector, npc));
                }
            }
        }
    }

    // --- Logging & UI (Kept mostly same but updated) ---

    addLog(sector, npc, message) {
        State.addSectorLog(sector, message, npc.name);
        
        // Trigger specific UI log update if method exists
        if (this.ui && this.ui.renderRoomLog) {
            this.ui.renderRoomLog(sector, $(`#${sector}-room-log`));
        }
    }

    getRandomLog(type, sector, npc) {
        let pool = [];
        if (type === 'updates') {
            pool = AssignmentLogs.updates[sector] || AssignmentLogs.updates['security'];
        } else {
            pool = AssignmentLogs[type];
        }

        if (!pool || !pool.length) return "Registro ilegible.";
        const template = pool[Math.floor(Math.random() * pool.length)];
        return template.replace(/{sector}/g, sector.toUpperCase()).replace(/{npc}/g, npc.name);
    }

    updateUI(sectorId) {
        if (!this.game || !this.game.events) return;
        
        // Refresh specific panels based on active screen or generic listeners
        // We can check if specific UIManager methods exist for updating sectors
        
        if (this.ui.renderSectorPanel) {
            // Try to find the container for this sector
            const map = {
                'generator': '#generator-guard-panel',
                'security': '#security-guard-display', // Fixed: target the inner display container, not the wrapper
                'supplies': '#supplies-guard-panel',
                'fuel': '#fuel-guard-panel'
            };
            const selector = map[sectorId];
            if (selector && $(selector).length) {
                this.ui.renderSectorPanel(selector, sectorId, State);
            }
        }
        
        // Also refresh Shelter grid if visible, as availability changes
        if ($('#screen-shelter').is(':visible')) {
            this.game.events.navigateToShelter();
        }
    }
}
