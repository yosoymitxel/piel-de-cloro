// NEW GUARD ASSIGNMENT SYSTEM - Simplified and Working

export class GuardAssignmentSystem {
    constructor(state, ui, audio) {
        this.state = state;
        this.ui = ui;
        this.audio = audio;
    }

    // Get currently assigned guard
    getAssignedGuard() {
        const guardId = this.state.generator.assignedGuardId;
        if (!guardId) return null;

        const guard = this.state.admittedNPCs.find(n => n.id === guardId);
        if (!guard) {
            // Clean up if guard no longer exists
            this.state.generator.assignedGuardId = null;
            return null;
        }

        return guard;
    }

    // Assign a guard to the generator
    assignGuard(npcId) {
        if (!npcId) {
            this.state.generator.assignedGuardId = null;
            if (this.ui && this.ui.showFeedback) {
                this.ui.showFeedback("GUARDIA REMOVIDO", "yellow", 2000);
            }
            return true;
        }

        const npc = this.state.admittedNPCs.find(n => n.id === npcId);
        if (!npc) {
            console.error("[GuardSystem] NPC not found:", npcId);
            return false;
        }

        // Assign
        this.state.generator.assignedGuardId = npcId;

        // Initialize guard logs if needed
        if (!this.state.generator.guardShiftLogs) {
            this.state.generator.guardShiftLogs = [];
        }

        // Add initial log
        const timestamp = `CICLO ${this.state.cycle}`;
        this.state.generator.guardShiftLogs.unshift(`${timestamp}: ${npc.name} asignado a seguridad`);

        // Keep only last 5 logs
        if (this.state.generator.guardShiftLogs.length > 5) {
            this.state.generator.guardShiftLogs = this.state.generator.guardShiftLogs.slice(0, 5);
        }

        if (this.ui && this.ui.showFeedback) {
            this.ui.showFeedback(`GUARDIA ASIGNADO: ${npc.name}`, "green", 2000);
        }

        if (this.audio) {
            this.audio.playSFXByKey('ui_success', { volume: 0.5 });
        }

        return true;
    }

    // Get eligible NPCs for guard duty (exclude first-turn NPCs)
    getEligibleNPCs() {
        const currentCycle = this.state.cycle || 1;

        return this.state.admittedNPCs.filter(npc => {
            // Exclude if admitted this cycle
            const admittedCycle = npc.admittedCycle || npc.cycle || 0;
            if (admittedCycle >= currentCycle) return false;

            // Optionally exclude already assigned guard
            // if (npc.id === this.state.generator.assignedGuardId) return false;

            return true;
        });
    }

    // Render the guard panel
    renderPanel(container) {
        if (!container || !container.length) {
            console.warn("[GuardSystem] Container not found");
            return;
        }

        container.empty();

        const guard = this.getAssignedGuard();

        if (guard) {
            // Render assigned guard
            const avatar = this.ui.renderAvatar ? this.ui.renderAvatar(guard, 'sm') : $('<div>?</div>');
            const avatarHtml = avatar.prop ? avatar.prop('outerHTML') : '?';

            const html = `
                <div class="guard-card active w-full animate__animated animate__fadeIn">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 bg-white/5 border border-white/10 overflow-hidden relative">
                                ${avatarHtml}
                                <div class="absolute inset-0 border border-terminal-green/30"></div>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-terminal-green">${guard.name}</span>
                                <span class="text-[9px] text-green-500 font-mono uppercase tracking-widest">VIGILANCIA ACTIVA</span>
                            </div>
                        </div>
                        <button class="btn-reassign-guard text-[10px] opacity-50 hover:opacity-100 hover:text-terminal-green transition-all border border-transparent hover:border-terminal-green/20 px-2 py-1 bg-black/50">
                            <i class="fa-solid fa-rotate mr-1"></i>REASIGNAR
                        </button>
                    </div>
                    <div class="guard-logs-container bg-black/50 border-t border-terminal-green/10 p-2">
                        <div class="text-terminal-green text-[9px] font-mono mb-1 uppercase opacity-60">
                            REGISTROS DE TURNO
                        </div>
                        ${(this.state.generator.guardShiftLogs || []).length > 0 ?
                    this.state.generator.guardShiftLogs.map(log => `
                                <div class="text-[8px] font-mono leading-tight mb-1 text-gray-300 border-l-2 border-terminal-green/30 pl-1">${log}</div>
                            `).join('') :
                    '<div class="text-[8px] opacity-30 italic">Sistema de monitoreo activo.</div>'
                }
                    </div>
                </div>
            `;

            container.html(html);

            // Attach reassign event
            container.find('.btn-reassign-guard').on('click', () => {
                this.showSelectionModal();
            });
        } else {
            // Render empty state
            const html = `
                <div class="guard-card empty w-full flex flex-row items-center justify-between p-3 border border-white/10 hover:border-terminal-green/30 transition-colors bg-white/5 group gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 flex items-center justify-center bg-black/40 rounded-sm border border-dashed border-white/20 group-hover:border-terminal-green/40">
                            <i class="fa-solid fa-user-shield text-lg opacity-30 group-hover:text-terminal-green transition-colors"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold opacity-70 group-hover:text-terminal-green transition-colors">PUESTO VACANTE</span>
                            <span class="text-[9px] opacity-40 font-mono uppercase">Vigilancia Requerida</span>
                        </div>
                    </div>
                    <button class="btn-assign-guard horror-btn-sm bg-terminal-green/10 hover:bg-terminal-green/20 border border-terminal-green/30 text-terminal-green text-[10px] py-1 px-3">
                        ASIGNAR
                    </button>
                </div>
            `;

            container.html(html);

            // Attach assign event
            container.find('.btn-assign-guard').on('click', () => {
                this.showSelectionModal();
            });
        }
    }

    // Show NPC selection modal
    showSelectionModal() {
        const candidates = this.getEligibleNPCs();

        if (candidates.length === 0) {
            if (this.audio) this.audio.playSFXByKey('ui_error', { volume: 0.5 });
            if (this.ui && this.ui.showFeedback) {
                this.ui.showFeedback("NO HAY PERSONAL DISPONIBLE (Deben pasar al menos un turno)", "orange", 3000);
            }
            return;
        }

        let content = `
            <div class="p-4 w-full">
                <h3 class="text-sm font-bold mb-4 uppercase tracking-widest text-chlorine-light border-b border-terminal-green/20 pb-2">
                    Seleccionar Guardia
                </h3>
                <div class="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        `;

        candidates.forEach(npc => {
            const avatar = this.ui.renderAvatar ? this.ui.renderAvatar(npc, 'md') : $('<div>?</div>');
            const avatarHtml = avatar.prop ? avatar.prop('outerHTML') : '?';

            content += `
                <button class="candidate-btn w-full flex items-center gap-3 p-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-terminal-green/50 transition-all text-left group relative overflow-hidden" data-npc-id="${npc.id}">
                    <div class="w-10 h-10 border border-white/10 group-hover:border-terminal-green/30 transition-colors relative z-10 bg-black">
                        ${avatarHtml}
                    </div>
                    <div class="flex flex-col relative z-10 w-full overflow-hidden">
                        <span class="text-xs font-bold group-hover:text-terminal-green truncate">${npc.name}</span>
                        <div class="flex justify-between items-center w-full">
                            <span class="text-[9px] opacity-40 font-mono">${npc.uniqueType === 'lore' ? 'Sujeto de Interés' : 'Civil Admitido'}</span>
                            ${npc.isInfected ? '<i class="fa-solid fa-virus text-[8px] text-alert animate-pulse" title="Infección Detectada"></i>' : ''}
                        </div>
                    </div>
                    <div class="absolute inset-0 bg-terminal-green/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </button>
            `;
        });

        content += `
                </div>
            </div>
        `;

        // Show modal
        if (this.ui && this.ui.showMessage) {
            this.ui.showMessage(content, null, 'normal', {
                isCustomHtml: true,
                closeOnOverlay: true,
                onRender: (modalEl) => {
                    modalEl.find('.candidate-btn').on('click', (e) => {
                        const npcId = $(e.currentTarget).data('npc-id');
                        this.assignGuard(npcId);

                        if (this.ui.closeModal) this.ui.closeModal();

                        // Re-render the panel
                        setTimeout(() => {
                            const container = $('#generator-guard-panel');
                            if (container.length) {
                                this.renderPanel(container);
                            }
                        }, 100);
                    });
                }
            });
        }
    }
}
