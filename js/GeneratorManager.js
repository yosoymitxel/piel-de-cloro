import { GeneratorRenderer } from './ui/GeneratorRenderer.js';

export class GeneratorManager {
    constructor(uiManager, audioManager) {
        this.ui = uiManager;
        this.audio = audioManager;
        this.elements = uiManager.elements;
        this.renderer = new GeneratorRenderer(uiManager.elements, uiManager.colors);
    }

    renderGeneratorRoom(state) {
        state.generatorCheckedThisTurn = true;

        // Update warnings immediately
        this.renderer.hideWarnings();

        // Update nav status based on state (Persistent Status)
        if (this.ui && this.ui.setNavItemStatus) {
            if (!state.generator.isOn) {
                this.ui.setNavItemStatus('nav-generator', 4); // Critical
            } else if (state.generator.power <= 10) {
                this.ui.setNavItemStatus('nav-generator', 3); // Warning
            } else {
                this.ui.setNavItemStatus('nav-generator', null); // Clear
            }
        }

        // Refresh game actions to restore normal buttons
        this.ui.updateGameActions();
        this.ui.updateInspectionTools();
        this.ui.updateStats(state.paranoia, state.cycle, state.dayTime, state.config.dayLength, state.currentNPC);

        const power = Math.max(0, Math.min(100, state.generator.power));
        let color = state.generator.isOn ? this.ui.colors.ENERGY : this.ui.colors.OFF;

        if (state.generator.isOn) {
            switch (state.generator.mode) {
                case 'save': color = this.ui.colors.SAVE; break;
                case 'normal': color = this.ui.colors.ENERGY; break;
                case 'overload': color = this.ui.colors.OVERLOAD; break;
            }
        }

        this.renderer.renderPowerBar(power, state.generator.isOn, color, state.generator.mode);
        this.renderer.updateModeLabel(state.generator.isOn, state.generator.mode, color);
        this.updateToggleButton(state);
        this.renderer.updateStatusSummary(state.generator.isOn, state.generator.mode);
        
        const npc = state.currentNPC;
        const actionTaken = (npc && npc.scanCount > 0) || state.dialogueStarted || state.generator.restartLock;
        this.renderer.updateModeButtons(state.generator.mode, actionTaken, state.generator.maxModeCapacityReached, state.generator.overclockCooldown);

        this.setupModeButtons(state);
        this.setupToggleEvent(state);
    }

    updateToggleButton(state) {
        this.renderer.updateToggleButton(state.generator.isOn, state.generator.blackoutUntil);
    }

    setupToggleEvent(state) {
        const toggleBtn = $('#btn-gen-toggle');
        toggleBtn.off('click').on('click', () => {
            const isLocked = state.generator.blackoutUntil > Date.now();
            if (isLocked) return;

            // Delegar al controlador del juego para manejar efectos secundarios (apagado de seguridad, audio, etc.)
            if (window.game && typeof window.game.toggleGenerator === 'function') {
                window.game.toggleGenerator();
            }
        });
    }

    setupModeButtons(state) {
        const btnSave = $('#btn-gen-save');
        const btnNormal = $('#btn-gen-normal');
        const btnOver = $('#btn-gen-over');

        const npc = state.currentNPC;
        const actionTaken = (npc && npc.scanCount > 0) || state.dialogueStarted || state.generator.restartLock;
        const currentMax = state.generator.maxModeCapacityReached;

        const handleModeSwitch = (newMode, newCap) => {
            if (actionTaken && newCap > currentMax) {
                // Animación de feedback en el texto de restricción
                const restrictionText = $('#generator-restriction-text');
                restrictionText.removeClass('text-gray-400').addClass('text-alert animate-pulse font-bold');
                setTimeout(() => {
                    restrictionText.removeClass('text-alert animate-pulse font-bold').addClass('text-gray-400');
                }, 600);

                this.ui.showFeedback(`SISTEMA BLOQUEADO: No puedes subir la potencia tras interactuar con el civil.`, "yellow");
                if (this.audio) this.audio.playSFXByKey('ui_error', { volume: 0.5 });
                return false;
            }

            state.generator.mode = newMode;
            switch (newMode) {
                case 'normal':
                    state.generator.power = 63;
                    break;
                case 'save':
                    state.generator.power = 32;
                    break;
                case 'overload':
                    state.generator.power = 100;
                    break;
                default:
                    console.warn(`Unknown generator mode: ${newMode}`);
            }
            state.generator.maxModeCapacityReached = newCap;

            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.ui.showFeedback(`MODO ${newMode.toUpperCase()} ACTIVADO`, "green");

            // Refrescar herramientas en el puesto
            this.ui.updateInspectionTools();

            this.renderGeneratorRoom(state);
            return true;
        };

        btnSave.off('click').on('click', () => handleModeSwitch('save', 1));
        btnNormal.off('click').on('click', () => handleModeSwitch('normal', 2));

        btnOver.off('click').on('click', () => {
            if (state.generator.overclockCooldown) return;

            if (handleModeSwitch('overload', 3)) {
                if (this.audio) this.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
                if (Math.random() < 0.35) {
                    const now = Date.now();
                    state.generator.blackoutUntil = now + 1200;
                    this.ui.applyBlackout(1200);
                }
            }
        });

        $('#btn-gen-manual-toggle').off('click').on('click', () => {
            $('#generator-manual').toggleClass('hidden');
        });
    }
}
