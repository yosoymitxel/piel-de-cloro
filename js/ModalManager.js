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
        this.clearModalError();
        this.elements.modal.removeClass('hidden').addClass('flex');
        if (this.audio) this.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });

        this.elements.modalName.text(`SUJETO ${npc.name}`);

        // Renderizar Avatar Grande en el nuevo contenedor visual
        const visualContainer = $('#modal-visual-container');
        // Limpiar todo excepto los overlays fijos (título y cerrar)
        visualContainer.children().not('.absolute').remove();

        const avatar = this.ui.renderAvatar(npc, 'lg');
        visualContainer.append(avatar);

        const avatarEl = avatar; // Referencia para efectos
        if (npc.death && npc.death.revealed && npc.isInfected) {
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
        if (!npc.dayAfter) {
            npc.dayAfter = { dermis: false, pupils: false, temperature: false, pulse: false, usedNightTests: 0, validated: false };
        }

        const makeStatItem = (label, value, isUnknown) => `
            <div class="dossier-stat-item">
                <span class="dossier-stat-label">${label}</span>
                <span class="dossier-stat-value ${isUnknown ? 'text-gray-600' : ''}">${value}</span>
            </div>
        `;

        const getStat = (key, label, value) => {
            const knownByDay = npc.revealedStats && npc.revealedStats.includes(key);
            const knownByNight = npc.dayAfter && npc.dayAfter[key];
            const isUnknown = !(knownByDay || knownByNight);
            return makeStatItem(label, isUnknown ? '???' : value, isUnknown);
        };

        const dermisTxt = this.ui.translateValue('skinTexture', npc.attributes.skinTexture);
        const pupilsTxt = this.ui.translateValue('pupils', npc.attributes.pupils);
        const stayCycles = npc.enterCycle != null && npc.death ?
            Math.max(0, npc.death.cycle - npc.enterCycle) :
            (npc.enterCycle != null ? Math.max(0, state.cycle - npc.enterCycle) : 0);

        let extraInfo = '';
        if (npc.death) {
            extraInfo += makeStatItem('CICLO MUERTE', npc.death.cycle, false);
        }
        extraInfo += makeStatItem('TIEMPO EN REFUGIO', `${stayCycles} CICLOS`, false);

        this.elements.modalStats.html(`
            ${getStat('temperature', 'TEMPERATURA', `${npc.attributes.temperature}°C`)}
            ${getStat('pulse', 'PULSO', `${npc.attributes.pulse} BPM`)}
            ${getStat('skinTexture', 'DERMIS', dermisTxt)}
            ${getStat('pupils', 'PUPILAS', pupilsTxt)}
            ${extraInfo}
        `);

        const testsGrid = $('#modal-tests-grid');
        testsGrid.empty().addClass('hidden');

        if (allowPurge) {
            testsGrid.removeClass('hidden');

            const makeSlot = (key, label, icon, animMethod) => {
                const globalTestsAvailable = state.dayAfter.testsAvailable > 0;
                const knownByDay = npc.revealedStats && npc.revealedStats.includes(key);
                const doneNight = npc.dayAfter[key];

                const btn = $('<button>', {
                    class: `btn-test-icon ${knownByDay || doneNight ? 'done' : ''}`,
                    html: `<i class="fa-solid ${icon}"></i><span>${label}</span>`
                });

                if (knownByDay || doneNight || (!globalTestsAvailable && !doneNight)) {
                    btn.prop('disabled', true);
                    if (!globalTestsAvailable && !doneNight && !knownByDay) {
                        btn.addClass('opacity-20 grayscale border-gray-800 text-gray-600');
                    }
                }

                btn.on('click', () => {
                    if (knownByDay || npc.dayAfter[key]) return;
                    if (npc.dayAfter.usedNightTests >= 1) {
                        this.showModalError('SOLO 1 TEST NOCTURNO POR SUJETO');
                        return;
                    }
                    if (state.dayAfter.testsAvailable <= 0) {
                        this.showModalError('SIN TESTS DISPONIBLES');
                        return;
                    }
                    state.dayAfter.testsAvailable--;
                    npc.dayAfter[key] = true;
                    npc.dayAfter.usedNightTests++;

                    // Actualizar UI
                    btn.addClass('done').prop('disabled', true);
                    // Bloquear el resto
                    testsGrid.find('.btn-test-icon').not('.done').prop('disabled', true);

                    this.elements.dayafterTestsLeft.text(state.dayAfter.testsAvailable);

                    // Ejecutar animación en el contenedor visual del modal
                    const visualContainer = $('#modal-visual-container');
                    if (this.ui[animMethod]) {
                        // Mapeo de valores para la animación
                        let val = null;
                        if (key === 'temperature') val = npc.attributes.temperature;
                        if (key === 'skinTexture') val = npc.attributes.skinTexture; // Necesita skinColor también, pero el método lo saca del DOM o args
                        if (key === 'pulse') val = npc.attributes.pulse;
                        if (key === 'pupils') val = npc.attributes.pupils;

                        // Llamar a la animación pasando el contenedor del modal
                        if (typeof this.ui[animMethod] === 'function') {
                            this.ui[animMethod](val, visualContainer);
                        } else {
                            console.error(`ModalManager Error: El método de animación '${animMethod}' no existe en UIManager.`);
                        }
                    }

                    // Re-render stats
                    const complete = npc.dayAfter.dermis && npc.dayAfter.pupils && npc.dayAfter.temperature && npc.dayAfter.pulse;
                    npc.dayAfter.validated = complete;
                    this.ui.updateDayAfterSummary(state.admittedNPCs);
                    this.renderModalStats(npc, allowPurge, state);
                    this.clearModalError();
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

    renderModalLog(npc) {
        this.elements.modalLog.empty();
        if (npc.history && npc.history.length > 0) {
            npc.history.forEach(entry => {
                if (typeof entry === 'object' && entry.type === 'warning') {
                    this.elements.modalLog.append($('<div>', { class: 'mb-1 border-b border-gray-900 pb-1 text-yellow-500', text: entry.text }));
                } else {
                    const txt = typeof entry === 'string' ? entry : (entry.text || JSON.stringify(entry));
                    this.elements.modalLog.append($('<div>', { class: 'mb-1 border-b border-gray-900 pb-1', text: txt }));
                }
            });
        } else {
            this.elements.modalLog.text("Sin registro de diálogo.");
        }
    }
}
