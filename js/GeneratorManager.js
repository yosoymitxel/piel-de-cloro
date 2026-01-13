export class GeneratorManager {
    constructor(uiManager, audioManager, game = null) {
        this.ui = uiManager;
        this.audio = audioManager;
        this.game = game;
        this.elements = uiManager.elements;
    }

    renderGeneratorRoom(state) {
        state.generatorCheckedThisTurn = true;

        // Update warnings immediately
        if (this.elements.genWarningGame) this.elements.genWarningGame.addClass('hidden');
        if (this.elements.genWarningShelter) this.elements.genWarningShelter.addClass('hidden');
        if (this.elements.genWarningPanel) this.elements.genWarningPanel.addClass('hidden');

        // Update nav status based on state (Persistent Status)
        if (this.ui && typeof this.ui.updateGeneratorNavStatus === 'function') {
            this.ui.updateGeneratorNavStatus(state);
        }

        // Refresh game actions to restore normal buttons
        this.ui.updateGameActions();
        this.ui.updateInspectionTools();
        this.ui.updateStats(state.paranoia, state.sanity, state.cycle, state.dayTime, state.config.dayLength, state.currentNPC);

        const bar = this.elements.generatorPowerBar;
        const modeLabel = this.elements.generatorModeLabel;
        const power = Math.max(0, Math.min(100, state.generator.power));

        let color = state.generator.isOn ? this.ui.colors.energy : this.ui.colors.off;

        if (state.generator.isOn) {
            switch (state.generator.mode) {
                case 'save': color = this.ui.colors.save; break;
                case 'normal': color = this.ui.colors.energy; break;
                case 'overload': color = this.ui.colors.overload; break;
            }
        }

        this.renderPowerBar(bar, power, state.generator.isOn, color);

        modeLabel.text(state.generator.isOn ? state.generator.mode.toUpperCase() : 'APAGADO');
        modeLabel.css('color', color);

        this.updateToggleButton(state);
        this.updateStatusSummary(state);
        this.setupModeButtons(state);
        this.setupToggleEvent(state);
    }

    setupToggleEvent(state) {
        const toggleBtn = $('#btn-gen-toggle');
        toggleBtn.off('click').on('click', () => {
            const isLocked = state.generator.blackoutUntil > Date.now();
            if (isLocked) return;

            // Delegar al controlador del juego para manejar efectos secundarios (apagado de seguridad, audio, etc.)
            const game = this.game || window.game;
            if (game && game.mechanics && typeof game.mechanics.toggleGenerator === 'function') {
                game.mechanics.toggleGenerator();
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

        // Helper para actualizar estado visual de botones
        const updateBtnState = (btn, targetCap, isCooldown = false) => {
            const isBlocked = (actionTaken && targetCap > currentMax) || isCooldown;
            if (isBlocked) {
                btn.prop('disabled', true).addClass('opacity-30 grayscale cursor-not-allowed border-dashed');
                btn.attr('title', isCooldown ? 'BLOQUEADO: Enfriamiento' : 'BLOQUEADO: Restricción de potencia');
            } else {
                btn.prop('disabled', false).removeClass('opacity-30 grayscale cursor-not-allowed border-dashed');
                btn.attr('title', '');
            }
        };

        updateBtnState(btnNormal, 2);
        updateBtnState(btnOver, 3, state.generator.overclockCooldown);

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

        btnSave.toggleClass('horror-btn-save-active', state.generator.mode === 'save');
        btnNormal.toggleClass('horror-btn-normal-active', state.generator.mode === 'normal');
        btnOver.toggleClass('horror-btn-overload-active', state.generator.mode === 'overload');

        $('#btn-gen-manual-toggle').off('click').on('click', () => {
            $('#generator-manual').toggleClass('hidden');
        });
    }

    renderPowerBar(bar, power, isOn, color) {
        bar.empty();
        bar.css({
            background: '#050505',
            border: '1px solid #333',
            position: 'relative',
            display: 'flex',
            gap: '2px',
            padding: '2px',
            overflow: 'hidden'
        });

        const totalBlocks = 20;
        const activeBlocks = Math.ceil((power / 100) * totalBlocks);

        for (let i = 0; i < totalBlocks; i++) {
            const opacity = i < activeBlocks ? 1 : 0.1;
            const blockColor = isOn ? color : '#333';
            const delay = i * 30;

            const block = $('<div>', {
                css: {
                    flex: '1',
                    height: '100%',
                    background: blockColor,
                    opacity: 0,
                    boxShadow: i < activeBlocks && isOn ? `0 0 8px ${color}` : 'none',
                    transition: 'all 0.3s ease',
                    transform: 'scaleY(0.5)'
                }
            });

            bar.append(block);

            setTimeout(() => {
                block.css({
                    opacity: opacity,
                    transform: 'scaleY(1)'
                });

                if (isOn && i < activeBlocks) {
                    this.startFlicker(block);
                }
            }, delay);
        }
    }

    startFlicker(block) {
        const flicker = () => {
            // Check global state if generator still on - ideally passed or accessed via state
            // For now, simple random flicker
            if (Math.random() > 0.98) {
                block.css('opacity', 0.5);
                setTimeout(() => block.css('opacity', 1), 50 + Math.random() * 100);
            }
            setTimeout(flicker, 1000 + Math.random() * 3000);
        };
        flicker();
    }

    updateToggleButton(state) {
        const toggleBtn = $('#btn-gen-toggle');
        const isLocked = state.generator.blackoutUntil > Date.now();

        if (isLocked) {
            toggleBtn.prop('disabled', true).addClass('opacity-50 grayscale cursor-wait');
            toggleBtn.html('<i class="fa-solid fa-plug-circle-exclamation"></i> BLOQUEADO');
            setTimeout(() => this.renderGeneratorRoom(state), state.generator.blackoutUntil - Date.now() + 100);
        } else {
            toggleBtn.prop('disabled', false).removeClass('opacity-50 grayscale cursor-wait');
            toggleBtn.html(state.generator.isOn ? '<i class="fa-solid fa-power-off"></i> APAGAR' : '<i class="fa-solid fa-bolt"></i> ENCENDER');
        }

        toggleBtn.toggleClass('horror-btn-primary', state.generator.isOn);
        toggleBtn.removeClass('btn-off btn-on');

        // Ensure button text color updates reliably along with icon and background for good contrast
        if (state.generator.isOn) {
            toggleBtn.addClass('btn-on');
            toggleBtn.css('color', '#000');
            toggleBtn.find('i').css('color', this.ui.colors.chlorineDark);
        } else {
            toggleBtn.addClass('btn-off');
            toggleBtn.css('color', '#000');
            toggleBtn.find('i').css('color', this.ui.colors.off);
        }
    }

    updateStatusSummary(state) {
        const statusSummary = $('#generator-status-summary');
        if (statusSummary.length) {
            const statusHtml = `
                <span>ESTADO: <span class="${state.generator.isOn ? 'text-chlorine-light' : 'text-alert'}">${state.generator.isOn ? 'OPERATIVO' : 'OFF'}</span></span>
                <span>MODO: <span class="text-white">${state.generator.isOn ? state.generator.mode.toUpperCase() : 'N/A'}</span></span>
            `;
            statusSummary.html(statusHtml);
        }
    }
}
