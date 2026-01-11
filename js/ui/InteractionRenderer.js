export class InteractionRenderer {
    constructor(elements, audio = null) {
        this.elements = elements;
        this.audio = audio;
    }

    updateGameActions(state) {
        if (!this.elements.gameActionsContainer) return;
        const generatorOk = state.generator && state.generator.isOn && (state.generator.power > 10);
        const needsCheck = !generatorOk;
        if (this.elements.genWarningGame) this.elements.genWarningGame.toggleClass('hidden', !needsCheck);
    }

    updateInspectionTools(state) {
        const npc = state.currentNPC;
        if (!state.generator.isOn) {
            if (this.elements.genWarningPanel) this.elements.genWarningPanel.removeClass('hidden');
            this.elements.inspectionToolsContainer.removeClass('grid-cols-2 sm:grid-cols-2 lg:grid-cols-4').addClass('grid-cols-1');
            this.elements.inspectionToolsContainer.html(`
                <button id="btn-goto-generator" class="horror-btn horror-btn-alert w-full p-6 text-xl flex items-center justify-center gap-3 animate-pulse">
                    <i class="fa-solid fa-bolt"></i>
                    <span>SISTEMA ELÉCTRICO INESTABLE: REVISAR GENERADOR</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            `);
            return;
        }

        const currentMode = state.generator.mode;
        const maxEnergy = state.config.generator.consumption[currentMode] || 2;

        if (npc && npc.optOut) {
            this.elements.inspectionToolsContainer.removeClass('grid-cols-2 sm:grid-cols-2 lg:grid-cols-4').addClass('grid-cols-1');
            this.elements.inspectionToolsContainer.html(`
                <div class="horror-btn horror-btn-disabled w-full p-4 text-center opacity-70 cursor-not-allowed border-dashed">
                    <i class="fa-solid fa-comment-slash mr-2 text-warning"></i>
                    TEST OMITIDO: PROCEDER CON DECISIÓN
                </div>
            `);
        } else if (npc && npc.scanCount >= maxEnergy) {
            this.elements.inspectionToolsContainer.removeClass('grid-cols-2 sm:grid-cols-2 lg:grid-cols-4').addClass('grid-cols-1');
            this.elements.inspectionToolsContainer.html(`
                <div class="horror-btn horror-btn-disabled w-full p-4 text-center opacity-70 cursor-not-allowed border-dashed">
                    <i class="fa-solid fa-battery-empty mr-2 text-alert"></i>
                    BATERÍAS AGOTADAS: SOLO DIÁLOGO O DECISIÓN
                </div>
            `);
        } else {
            this.elements.inspectionToolsContainer.removeClass('grid-cols-1').addClass('grid-cols-2 sm:grid-cols-2 lg:grid-cols-4');
            const modeMap = { 'save': 'Ahorro: Máx 1', 'normal': 'Normal: Máx 2', 'overload': 'Overclock: Máx 3' };
            const modeLabel = modeMap[currentMode] || `Modo ${currentMode}`;
            let extraLabel = `<div class="col-span-full text-center text-xs text-chlorine-light mb-1 opacity-80 uppercase tracking-widest">
                <i class="fa-solid fa-bolt mr-1"></i> ${modeLabel}
            </div>`;
            this.elements.inspectionToolsContainer.html(`
                ${extraLabel}
                <button id="tool-thermo" class="horror-btn horror-btn-tool btn-interactive ${npc && npc.revealedStats.includes('temperature') ? 'btn-disabled opacity-20 grayscale' : ''}">
                    <i class="fa-solid fa-temperature-half"></i> TERMÓMETRO
                </button>
                <button id="tool-flash" class="horror-btn horror-btn-tool btn-interactive ${npc && npc.revealedStats.includes('skinTexture') ? 'btn-disabled opacity-20 grayscale' : ''}">
                    <i class="fa-solid fa-lightbulb"></i> LINTERNA UV
                </button>
                <button id="tool-pulse" class="horror-btn horror-btn-tool btn-interactive ${npc && npc.revealedStats.includes('pulse') ? 'btn-disabled opacity-20 grayscale' : ''}">
                    <i class="fa-solid fa-heart-pulse"></i> PULSO
                </button>
                <button id="tool-pupils" class="horror-btn horror-btn-tool btn-interactive ${npc && npc.revealedStats.includes('pupils') ? 'btn-disabled opacity-20 grayscale' : ''}">
                    <i class="fa-solid fa-eye"></i> PUPILAS
                </button>
            `);
        }
    }

    handleOmitTest(npc, state, ui) {
        if (!npc) return;
        npc.optOut = true;
        npc.scanCount = 99; 
        if (!npc.history) npc.history = [];
        npc.history.push({ text: 'Test omitido voluntariamente mediante protocolo de diálogo.', type: 'warning' });
        this.showFeedback('TEST OMITIDO: SIN EVIDENCIA MÉDICA', 'yellow');
        this.updateInspectionTools(state);
        ui.updateStats(state.paranoia, state.cycle, state.dayTime, state.config.dayLength, state.currentNPC);
    }

    showValidationGate(npc, state, ui) {
        const overlay = $('#validation-overlay');
        overlay.removeClass('hidden').addClass('flex');
        if (this.audio) this.audio.playSFXByKey('validation_gate_open', { volume: 0.5 });
        $('#btn-do-test').off('click').on('click', () => {
            overlay.addClass('hidden').removeClass('flex');
        });
        $('#btn-omit-test').off('click').on('click', () => {
            this.handleOmitTest(npc, state, ui);
            overlay.addClass('hidden').removeClass('flex');
        });
    }

    showFeedback(text, color = 'yellow') {
        const colorMap = { 'yellow': 'text-warning', 'red': 'text-alert', '#aaffaa': 'text-green-400' };
        this.elements.feedback.removeClass('text-warning text-alert text-green-400');
        if (colorMap[color]) {
            this.elements.feedback.addClass(colorMap[color]);
        } else {
            this.elements.feedback.css('color', color);
        }
        this.elements.feedback.text(text).removeClass('hidden');
    }

    hideFeedback() {
        this.elements.feedback.addClass('hidden');
    }

    hideOmitOption() {
        $('#btn-omit-test').addClass('hidden');
    }
}
