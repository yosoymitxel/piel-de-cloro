import { State } from './State.js';

export class GeneratorManager {
    constructor(uiManager, audioManager, game = null) {
        this.ui = uiManager;
        this.audio = audioManager;
        this.game = game;
        this.elements = uiManager.elements;
    }

    renderGeneratorRoom(state) {
        state.generatorCheckedThisTurn = true;

        // Update active state of mode buttons
        $('.btn-generator-control').removeClass('active');
        if (state.generator.isOn) {
            $(`#btn-gen-${state.generator.mode}`).addClass('active');
        }

        // Update warnings immediately
        if (this.elements.genWarningGame) this.elements.genWarningGame.addClass('hidden');
        if (this.elements.genWarningShelter) this.elements.genWarningShelter.addClass('hidden');

        // El panel de advertencia ahora tiene un estilo CRT
        const warningPanel = $('#generator-warning-panel');
        if (warningPanel.length) {
            warningPanel.toggleClass('hidden', state.generator.isOn);
        }

        // Update nav status based on state (Persistent Status)
        if (this.ui && typeof this.ui.updateGeneratorNavStatus === 'function') {
            this.ui.updateGeneratorNavStatus(state);
        }

        // Refresh game actions to restore normal buttons
        this.ui.updateGameActions();
        this.ui.updateInspectionTools();
        this.ui.updateStats(state.paranoia, state.sanity, state.cycle, state.dayTime, state.config.dayLength, state.currentNPC);

        const modeLabel = $('#generator-mode-label');
        const power = Math.max(0, Math.min(100, state.generator.power));

        this.updateDial(power, state.generator.isOn);
        this.updateCables(power, state.generator.isOn);
        this.updateScreenEffects(state);

        let statusText = state.generator.isOn ? `MODE_${state.generator.mode.toUpperCase()}` : 'SYSTEM_OFF';
        modeLabel.text(statusText);

        // Color mapping for modes
        let color = '#666';
        if (state.generator.isOn) {
            switch (state.generator.mode) {
                case 'save': color = State.colors.save; break;
                case 'normal': color = State.colors.terminalGreen; break;
                case 'overload': color = State.colors.overload; break;
            }
        }
        modeLabel.css('color', color);
        modeLabel.css('text-shadow', state.generator.isOn ? `0 0 10px ${color}` : 'none');

        this.updateToggleButton(state);
        this.updateStatusSummary(state);
        this.setupModeButtons(state);
        this.setupToggleEvent(state);

        // Sincronizar estado del cristal
        const glassCover = $('#gen-glass-cover');
        if (state.generator.isOn) {
            glassCover.addClass('broken');
        } else {
            glassCover.removeClass('broken cracked');
        }

        // Volver al puesto
        $('#btn-gen-back').off('click').on('click', () => {
            const game = this.game || window.game;
            if (game && game.events && typeof game.events.navigateToRoom === 'function') {
                game.events.navigateToRoom();
            }
        });
    }

    updateCables(power, isOn) {
        const cables = $('.cable');
        if (isOn && power > 20) {
            cables.addClass('vibrating-cable');
            // La velocidad de vibración podría depender de la potencia si quisiéramos ser pro
            cables.each((i, el) => {
                const rot = $(el).css('transform'); // Mantener su rotación original
                $(el).css('--rot', rot);
            });
        } else {
            cables.removeClass('vibrating-cable');
        }
    }

    updateDial(power, isOn) {
        const needle = $('#generator-needle');
        if (!needle.length) return;

        // Power 0-100 mapped to -90 to 90 degrees
        const degrees = (power * 1.8) - 90;

        if (isOn) {
            needle.css('transform', `rotate(${degrees}deg)`);
            needle.css('--deg', `${degrees}deg`);
            needle.css('stroke', power > 80 ? State.colors.alert : State.colors.terminalGreen);

            // Temblor en zona roja o sobrecarga
            if (power > 85) {
                // Delay adding the trembling class to allow the transition to complete
                if (!needle.hasClass('needle-trembling')) {
                    setTimeout(() => {
                        // Check if power is still high before adding
                        const currentPower = this.game ? this.game.state.generator.power : (window.game ? window.game.state.generator.power : 0);
                        if (currentPower > 85) {
                            needle.addClass('needle-trembling');
                        }
                    }, 800);
                }
            } else {
                needle.removeClass('needle-trembling');
            }
        } else {
            needle.css('transform', `rotate(-90deg)`);
            needle.css('--deg', `-90deg`);
            needle.css('stroke', '#333');
            needle.removeClass('needle-trembling');
        }
    }

    updateScreenEffects(state) {
        const monitor = $('.crt-monitor');
        const isOverload = state.generator.isOn && state.generator.mode === 'overload';

        if (isOverload) {
            monitor.addClass('overload-vibration overload-tint');
        } else {
            monitor.removeClass('overload-vibration overload-tint');
        }
    }

    setupToggleEvent(state) {
        const toggleBtn = $('#btn-gen-toggle');
        toggleBtn.off('click').on('click', () => {
            const isLocked = state.generator.blackoutUntil > Date.now();
            if (isLocked) {
                if (this.audio) this.audio.playSFXByKey('ui_error', { volume: 0.5 });
                return;
            }

            const glassCover = $('#gen-glass-cover');
            const mushroomHead = $('#gen-mushroom-head');

            if (!state.generator.isOn && !glassCover.hasClass('broken')) {
                // Si está apagado y el cristal no está roto, primero romper cristal
                if (!glassCover.hasClass('cracked')) {
                    glassCover.addClass('cracked');
                    if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); // Sonido de cristal?
                    return;
                } else {
                    glassCover.addClass('broken');
                    if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.8 });
                    // No return, proceed to turn on
                }
            }

            // Delegar al controlador del juego
            const game = this.game || window.game;
            if (game && game.mechanics && typeof game.mechanics.toggleGenerator === 'function') {
                game.mechanics.toggleGenerator();

                // Audio mecánico
                if (this.audio) {
                    this.audio.playSFXByKey(state.generator.isOn ? 'ui_button_click' : 'glitch_low', { volume: 0.6 });
                }
            }
        });
    }

    setupModeButtons(state) {
        const btnSave = $('#btn-gen-save');
        const btnNormal = $('#btn-gen-normal');
        const btnOver = $('#btn-gen-over');

        const npc = state.currentNPC;
        const actionTaken = (npc && (npc.scanCount > 0 || npc.dialogueStarted)) || state.generator.restartLock;
        const currentMax = state.generator.maxModeCapacityReached;

        const handleModeSwitch = (newMode, newCap) => {
            if (actionTaken && newCap > currentMax) {
                const restrictionText = $('#generator-restriction-text');
                restrictionText.removeClass('opacity-40').addClass('text-alert animate-pulse opacity-100');
                setTimeout(() => {
                    restrictionText.removeClass('text-alert animate-pulse opacity-100').addClass('opacity-40');
                }, 1000);

                this.ui.showFeedback(`PROTOCOLO ACTIVO: NO SE PERMITE AUMENTO DE CARGA`, "red", 3000);
                if (this.audio) this.audio.playSFXByKey('ui_error', { volume: 0.5 });
                return false;
            }

            state.generator.mode = newMode;
            switch (newMode) {
                case 'normal': state.generator.power = 63; break;
                case 'save': state.generator.power = 32; break;
                case 'overload': state.generator.power = 95; break;
            }
            state.generator.maxModeCapacityReached = newCap;

            // Update button styles immediately
            $('.btn-generator-control').removeClass('active');
            $(`#btn-gen-${newMode}`).addClass('active');

            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.ui.showFeedback(`SISTEMA: MODO ${newMode.toUpperCase()} CARGADO`, "green", 3000);

            // Trigger level change animation with more robustness
            const monitor = $('.crt-monitor');
            monitor.removeClass('glitch-level-change');

            // Clear any existing timeout to avoid premature removal
            if (this._glitchTimeout) clearTimeout(this._glitchTimeout);

            // Force reflow and restart animation
            requestAnimationFrame(() => {
                monitor.each((i, el) => void el.offsetWidth);
                monitor.addClass('glitch-level-change');

                this._glitchTimeout = setTimeout(() => {
                    monitor.removeClass('glitch-level-change');
                    this._glitchTimeout = null;
                }, 400); // Slightly longer for visibility
            });

            this.ui.updateInspectionTools(npc);
            this.renderGeneratorRoom(state);
            return true;
        };

        btnSave.off('click').on('click', () => handleModeSwitch('save', 1));
        btnNormal.off('click').on('click', () => handleModeSwitch('normal', 2));

        const updateBtnState = (btn, targetCap, isCooldown = false) => {
            const isBlocked = (actionTaken && targetCap > currentMax) || isCooldown || !state.generator.isOn;
            if (isBlocked) {
                btn.prop('disabled', true).addClass('opacity-30 grayscale cursor-not-allowed');
            } else {
                btn.prop('disabled', false).removeClass('opacity-30 grayscale cursor-not-allowed');
            }
        };

        updateBtnState(btnSave, 1);
        updateBtnState(btnNormal, 2);
        updateBtnState(btnOver, 3, state.generator.overclockCooldown);

        btnOver.off('click').on('click', () => {
            if (state.generator.overclockCooldown) return;
            if (handleModeSwitch('overload', 3)) {
                if (this.audio) this.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
                if (Math.random() < 0.35) {
                    state.generator.blackoutUntil = Date.now() + 1500;
                    this.ui.applyBlackout(1500);
                }
            }
        });

        btnSave.toggleClass('active', state.generator.mode === 'save');
        btnNormal.toggleClass('active', state.generator.mode === 'normal');
        btnOver.toggleClass('active', state.generator.mode === 'overload');

        $('#btn-gen-manual-toggle').off('click').on('click', () => {
            $('#generator-manual').toggleClass('hidden');
            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.2 });
        });
    }

    updateToggleButton(state) {
        const isLocked = state.generator.blackoutUntil > Date.now();
        const mushroomHead = $('#gen-mushroom-head');
        const wrapper = $('#btn-gen-toggle-wrapper');
        const toggleBtn = $('#btn-gen-toggle');

        if (isLocked) {
            wrapper.addClass('opacity-50 grayscale cursor-wait');
            setTimeout(() => this.renderGeneratorRoom(state), state.generator.blackoutUntil - Date.now() + 100);
        } else {
            wrapper.removeClass('opacity-50 grayscale cursor-wait');
        }

        if (state.generator.isOn) {
            mushroomHead.addClass('pressed');
            toggleBtn.addClass('btn-on').removeClass('btn-off').css('color', '#000');
        } else {
            mushroomHead.removeClass('pressed');
            toggleBtn.addClass('btn-off').removeClass('btn-on').css('color', '#000');
        }
    }

    updateStatusSummary(state) {
        const statusSummary = $('#generator-status-summary');
        if (statusSummary.length) {
            const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const statusHtml = `
                <span>> LOG_TIME: ${time}</span>
                <span>> SYS_STATUS: <span class="${state.generator.isOn ? 'text-terminal-green' : 'text-alert'}">${state.generator.isOn ? 'OPERATIONAL' : 'OFFLINE'}</span></span>
                <span>> PWR_OUTPUT: ${state.generator.isOn ? state.generator.power + '%' : '0%'}</span>
                <span>> MODE_LOAD: ${state.generator.isOn ? state.generator.mode.toUpperCase() : 'NONE'}</span>
                ${state.generator.overclockCooldown ? '<span class="text-warning">> WARNING: THERMAL_COOLDOWN_ACTIVE</span>' : ''}
            `;
            statusSummary.html(statusHtml);
        }
    }
}
