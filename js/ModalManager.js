import { State } from './State.js';

export class ModalManager {
    constructor(uiManager, audioManager) {
        this.ui = uiManager;
        this.audio = audioManager;
        this.elements = uiManager.elements;
        this.colors = uiManager.colors;
    }

    showModalError(text) {
        this.elements.modalError.text(text).removeClass('hidden');
    }

    clearModalError() {
        this.elements.modalError.text('').addClass('hidden');
    }

    closeModal(silent = false) {
        this.clearModalError();
        this.elements.modal.addClass('hidden').removeClass('flex');
        this.elements.msgModal.addClass('hidden').removeClass('flex');
        this.elements.confirmModal.addClass('hidden').removeClass('flex');
        if (!silent && this.audio) {
            this.audio.playSFXByKey('ui_modal_close', { volume: 0.5, priority: 0 });
        }
    }

    showMessage(text, onClose, type = 'normal') {
        if (State.endingTriggered) return;
        const modal = this.elements.msgModal;
        const content = this.elements.msgContent;
        modal.removeClass('hidden').addClass('flex');
        modal.removeClass('modal-normal modal-lore modal-death modal-warning').addClass(`modal-${type}`);

        const iconClass = {
            death: 'modal-death-icon',
            warning: 'modal-warning-icon',
            lore: 'modal-lore-icon'
        }[type] || 'modal-normal-icon';

        content.html(`<span class="${iconClass}"></span> <span>${text}</span>`);

        if (this.audio) this.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });

        this.elements.msgBtn.off('click').on('click', () => {
            modal.addClass('hidden').removeClass('flex');
            if (this.audio) this.audio.playSFXByKey('ui_modal_close', { volume: 0.5 });
            if (onClose) onClose();
        });
    }

    showConfirm(text, onYes, onCancel, type = 'normal') {
        if (State.endingTriggered) return;
        const modal = this.elements.confirmModal;
        const content = this.elements.confirmContent;
        modal.removeClass('hidden').addClass('flex');

        // Reset classes
        content.removeClass('text-gray-300 text-warning text-alert');

        if (type === 'warning') content.addClass('text-warning');
        else if (type === 'danger') content.addClass('text-alert');
        else content.addClass('text-gray-300');

        content.text(text);

        if (this.audio) this.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });

        this.elements.confirmYes.off('click').on('click', () => {
            modal.addClass('hidden').removeClass('flex');
            if (onYes) onYes();
        });

        this.elements.confirmCancel.off('click').on('click', () => {
            modal.addClass('hidden').removeClass('flex');
            if (onCancel) onCancel();
        });
    }

    openModal(npc, allowPurge, onPurgeConfirm, state) {
        if (State.endingTriggered) return;
        this.clearModalError();
        this.elements.modal.removeClass('hidden').addClass('flex');
        if (this.audio) this.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });

        this.elements.modalName.text(`${npc.name}`);

        // Renderizar Avatar Grande en el nuevo contenedor visual
        const visualContainer = $('#modal-visual-container');
        // Limpiar todo excepto los overlays fijos (título y cerrar)
        visualContainer.children().not('.absolute').remove();

        const isRevealedInfected = (npc.death && npc.death.revealed && npc.isInfected) || 
                                   (npc.dayAfter && npc.dayAfter.validated && npc.isInfected);
        const modifier = (npc.dayAfter && npc.dayAfter.validated) || (npc.death && npc.death.revealed) ? 'perimeter' : 'normal';
        const avatar = this.ui.renderAvatar(npc, 'lg', modifier);
        visualContainer.append(avatar);

        const avatarEl = avatar; // Referencia para efectos
        if (isRevealedInfected) {
            avatarEl.addClass('infected');
        }

        this.updateModalStatus(npc, allowPurge, state);
        this.renderModalStats(npc, allowPurge, state);
        this.renderModalLog(npc);

        if (allowPurge) {
            this.elements.modalPurgeBtn.removeClass('hidden');

            // Resetear estado del botón (por si quedó bloqueado por un NPC anterior)
            this.elements.modalPurgeBtn.prop('disabled', false);
            this.elements.modalPurgeBtn.removeClass('opacity-50 cursor-not-allowed grayscale');
            this.elements.modalPurgeBtn.html('<i class="fa-solid fa-biohazard mr-2"></i> PURGAR DEL REFUGIO');

            this.elements.modalPurgeBtn.off('click').on('click', () => {
                const panel = $('#modal-npc .horror-panel');
                panel.addClass('modal-blood-flash');
                setTimeout(() => panel.removeClass('modal-blood-flash'), 700);

                if (this.audio) {
                    this.audio.playSFXByKey('purge_blood_flash', { volume: 0.6, priority: 2, lockMs: 600 });
                    this.audio.playSFXByKey('purge_confirm', { volume: 0.7, priority: 2, lockMs: 600 });
                }

                onPurgeConfirm(npc);
                this.closeModal(true);
            });
        } else {
            this.elements.modalPurgeBtn.addClass('hidden');
        }

        $('.close-modal').off('click').on('click', () => this.closeModal());
    }

    updateModalStatus(npc, allowPurge, state) {
        if (allowPurge) {
            this.elements.modalStatus.text("EN REFUGIO").css('color', '#fff');
        } else {
            let statusText = 'POR DETERMINAR';
            let color = '#cccccc';
            if (npc.death && npc.death.revealed) {
                if (npc.death.reason === 'purga') {
                    statusText = npc.isInfected ? 'PURGADO — CLORO' : 'PURGADO — CIVIL';
                    color = npc.isInfected ? this.colors.chlorine : "#cccccc";
                } else if (npc.death.reason === 'asesinado') {
                    statusText = npc.isInfected ? 'ASESINADO — CLORO' : 'ASESINADO — CIVIL';
                    color = npc.isInfected ? this.colors.chlorine : "#cccccc";
                }
            } else if (npc.exitCycle && state && npc.exitCycle < state.cycle) {
                // Ignorados / Fugitivos
                statusText = npc.isInfected ? 'FUGITIVO — CLORO' : 'FUGITIVO — CIVIL';
                color = npc.isInfected ? this.colors.chlorine : "#cccccc";
            } else if (npc.left && state && npc.left.cycle <= state.cycle) {
                // Salidas nocturnas
                statusText = npc.isInfected ? 'DESERCIÓN — CLORO' : 'DESERCIÓN — CIVIL';
                color = npc.isInfected ? this.colors.chlorine : "#cccccc";
            }
            this.elements.modalStatus.text(statusText).css('color', color);
        }
    }

    renderModalStats(npc, allowPurge, state) {
        if (!this.modalAnimating) this.modalAnimating = false;
        if (!npc.dayAfter) {
            npc.dayAfter = { dermis: false, pupils: false, temperature: false, pulse: false, usedNightTests: 0, validated: false };
        }

        const statsGrid = this.elements.modalStats;
        const testsGrid = this.elements.modalTests;
        statsGrid.empty();
        testsGrid.empty().addClass('hidden');

        const renderStat = (label, value, key) => {
            const isRevealed = (npc.revealedStats && npc.revealedStats.includes(key)) || (npc.dayAfter && npc.dayAfter[key]);
            const display = isRevealed ? value : '???';
            statsGrid.append(`
                <div class="flex justify-between items-center border-b border-chlorine/10 py-2 px-1 hover:bg-white/5 transition-colors">
                    <span class="text-xs opacity-60 uppercase font-mono">${label}</span>
                    <span class="font-mono text-sm ${isRevealed ? 'text-white' : 'text-gray-600 italic'}">${display}</span>
                </div>
            `);
        };

        renderStat('Dermis', this.ui.translateValue('skinTexture', npc.attributes.skinTexture), 'skinTexture');
        renderStat('Pupilas', this.ui.translateValue('pupils', npc.attributes.pupils), 'pupils');
        renderStat('Temperatura', `${npc.attributes.temperature}°C`, 'temperature');
        renderStat('Pulso', `${npc.attributes.pulse} BPM`, 'pulse');

        if (allowPurge) {
            testsGrid.removeClass('hidden');

            const isPurgeLocked = npc.purgeLockedUntil && state.cycle < npc.purgeLockedUntil;
            const alreadyTested = npc.dayAfter && npc.dayAfter.usedNightTests >= 1;
            const noTestsLeft = state.dayAfter.testsAvailable <= 0;

            if (isPurgeLocked || alreadyTested || noTestsLeft) {
                testsGrid.removeClass('grid-cols-4').addClass('grid-cols-1');
                let msg = "";
                let icon = "";

                if (isPurgeLocked) {
                    msg = "PROTOCOLO DE SEGURIDAD: SUJETO RECIENTE (BLOQUEADO)";
                    icon = "fa-lock";
                } else if (alreadyTested) {
                    msg = "SUJETO YA EVALUADO";
                    icon = "fa-ban";
                } else {
                    msg = "SIN REACTIVOS DISPONIBLES";
                    icon = "fa-flask";
                }

                testsGrid.html(`
                    <div class="horror-btn horror-btn-disabled w-full p-4 text-center opacity-70 cursor-not-allowed border-dashed text-xs flex items-center justify-center">
                        <i class="fa-solid ${icon} mr-2"></i> ${msg}
                    </div>
                `);
            } else {
                testsGrid.removeClass('grid-cols-1').addClass('grid-cols-4');

                const makeSlot = (key, label, icon, animMethod) => {
                    const knownByDay = npc.revealedStats && npc.revealedStats.includes(key);

                    const btn = $('<button>', {
                        class: `horror-tool-btn horror-tool-btn--modal animate-button-in ${knownByDay ? 'done' : ''}`,
                        html: `<i class="fa-solid ${icon}"></i><span>${label}</span>`
                    });

                    if (knownByDay || this.modalAnimating) {
                        btn.prop('disabled', true);
                    }

                    btn.on('click', () => {
                        if (knownByDay || this.modalAnimating) return;
                        if (npc.dayAfter.usedNightTests >= 1) return;
                        if (state.dayAfter.testsAvailable <= 0) return;

                        this.modalAnimating = true;
                        this.renderModalStats(npc, allowPurge, state); // Re-render to disable buttons

                        state.dayAfter.testsAvailable--;
                        this.elements.dayafterTestsLeft.text(state.dayAfter.testsAvailable);

                        // Ejecutar animación en el contenedor visual del modal
                        const visualContainer = $('#modal-visual-container');
                        let duration = 1000;

                        if (typeof this.ui[animMethod] === 'function') {
                            // Mapeo de valores para la animación
                            let val = null;
                            if (key === 'temperature') {
                                val = npc.attributes.temperature;
                                duration = 2200;
                            }
                            if (key === 'skinTexture') {
                                val = npc.attributes.skinTexture;
                                duration = 900;
                            }
                            if (key === 'pulse') {
                                val = npc.attributes.pulse;
                                duration = 2600;
                            }
                            if (key === 'pupils') {
                                val = npc.attributes.pupils;
                                duration = 2700;
                            }

                            // Llamar a la animación pasando el contenedor del modal e infección
                            this.ui[animMethod](val, visualContainer, npc.isInfected);

                            // Audio feedback
                            const audioKey = {
                                'temperature': 'tool_thermometer_beep',
                                'skinTexture': 'tool_uv_toggle',
                                'pulse': 'tool_pulse_beep',
                                'pupils': 'tool_pupils_lens'
                            }[key];
                            if (this.audio && audioKey) this.audio.playSFXByKey(audioKey, { volume: 0.6 });
                        } else {
                            console.error(`ModalManager Error: El método de animación '${animMethod}' no existe en UIManager.`);
                        }

                        setTimeout(() => {
                            npc.dayAfter[key] = true;
                            npc.dayAfter.usedNightTests++;

                            // Re-render stats
                            const complete = npc.dayAfter.dermis && npc.dayAfter.pupils && npc.dayAfter.temperature && npc.dayAfter.pulse;
                            npc.dayAfter.validated = complete;
                            this.ui.updateDayAfterSummary(state.admittedNPCs);

                            this.modalAnimating = false;
                            this.renderModalStats(npc, allowPurge, state);
                            this.clearModalError();
                        }, duration);
                    });
                    return btn;
                };

                testsGrid.append(
                    makeSlot('skinTexture', 'DERMIS', 'fa-lightbulb', 'animateToolFlashlight'),
                    makeSlot('pupils', 'PUPILAS', 'fa-eye', 'animateToolPupils'),
                    makeSlot('temperature', 'TEMP', 'fa-temperature-half', 'animateToolThermometer'),
                    makeSlot('pulse', 'PULSO', 'fa-heart-pulse', 'animateToolPulse')
                );
            }
        }
    }

    renderModalLog(npc) {
        this.elements.modalLog.empty();
        if (npc.history && npc.history.length > 0) {
            npc.history.forEach(entry => {
                const isNpc = entry.speaker === 'npc';
                const speakerClass = isNpc ? 'text-chlorine-light font-bold' : 'text-gray-400';
                const speakerName = isNpc ? (npc.name || 'SUJETO') : 'TÚ';
                let text = entry.text || entry;
                // Filtrar acciones (*texto*) del historial por si acaso
                if (typeof text === 'string') {
                    text = text.replace(/\*.*?\*/g, '').trim();
                }
                
                if (!text) return; // No mostrar si quedó vacío tras filtrar
                
                const html = `
                    <div class="mb-2 border-b border-gray-900 pb-1 text-xs">
                        <span class="${speakerClass}">${speakerName}:</span>
                        <span class="text-gray-300 ml-1">${text}</span>
                    </div>
                `;
                this.elements.modalLog.append(html);
            });
        } else {
            this.elements.modalLog.text("Sin registro de diálogo.");
        }
    }
}
