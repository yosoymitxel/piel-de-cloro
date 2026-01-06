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

    showConfirm(text, onYes, onCancel) {
        const modal = this.elements.confirmModal;
        const content = this.elements.confirmContent;
        modal.removeClass('hidden').addClass('flex');
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
        this.elements.modal.removeClass('hidden').addClass('flex');
        if (this.audio) this.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });
        
        this.elements.modalName.text(`SUJETO ${npc.name}`);
        const visualContainer = $('#modal-npc-visual');
        visualContainer.empty().append(this.ui.renderAvatar(npc, 'sm'));
        
        const avatarEl = visualContainer.find('.pixel-avatar');
        if (npc.death && npc.death.revealed && npc.isInfected) {
            avatarEl.addClass('infected');
        }

        this.updateModalStatus(npc, allowPurge);
        this.renderModalStats(npc, allowPurge, state);
        this.renderModalLog(npc);

        if (allowPurge) {
            this.elements.modalPurgeBtn.removeClass('hidden');
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

    updateModalStatus(npc, allowPurge) {
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
            }
            this.elements.modalStatus.text(statusText).css('color', color);
        }
    }

    renderModalStats(npc, allowPurge, state) {
        if (!npc.dayAfter) {
            npc.dayAfter = { dermis: false, pupils: false, temperature: false, pulse: false, usedNightTests: 0, validated: false };
        }

        const showStat = (key, label, value) => {
            const knownByDay = npc.revealedStats && npc.revealedStats.includes(key);
            const knownByNight = npc.dayAfter && npc.dayAfter[key];
            if (knownByDay || knownByNight) {
                return `<p>${label}: <span class="text-white">${value}</span></p>`;
            }
            return `<p>${label}: <span class="text-gray-600">???</span></p>`;
        };

        const dermisTxt = this.ui.translateValue('skinTexture', npc.attributes.skinTexture);
        const pupilsTxt = this.ui.translateValue('pupils', npc.attributes.pupils);
        const stayCycles = npc.enterCycle != null && npc.death ? 
            Math.max(0, npc.death.cycle - npc.enterCycle) : 
            (npc.enterCycle != null ? Math.max(0, state.cycle - npc.enterCycle) : 0);
        
        const extraDeathInfo = npc.death ? 
            `<p>MUERTE: <span class="text-white">CICLO ${npc.death.cycle}</span></p><p>TIEMPO EN REFUGIO: <span class="text-white">${stayCycles} ciclos</span></p>` : '';

        this.elements.modalStats.html(`
            ${showStat('temperature', 'TEMP', `${npc.attributes.temperature}°C`)}
            ${showStat('pulse', 'PULSO', `${npc.attributes.pulse} BPM`)}
            ${showStat('skinTexture', 'DERMIS', dermisTxt)}
            ${showStat('pupils', 'PUPILAS', pupilsTxt)}
            ${extraDeathInfo}
        `);

        this.elements.modal.find('.dayafter-tests').remove();
        
        if (allowPurge) {
            const testsGrid = $('<div>', { class: 'dayafter-tests mt-3' });
            
            const makeSlot = (key, label) => {
                const knownByDay = npc.revealedStats && npc.revealedStats.includes(key);
                const doneNight = npc.dayAfter[key];
                const slot = $('<div>', { class: `slot ${knownByDay || doneNight ? 'done blocked' : ''}`, text: label });
                
                slot.on('click', () => {
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
                    slot.addClass('done');
                    testsGrid.find('.slot').addClass('blocked');
                    this.elements.dayafterTestsLeft.text(state.dayAfter.testsAvailable);
                    
                    // Re-render stats
                    const complete = npc.dayAfter.dermis && npc.dayAfter.pupils && npc.dayAfter.temperature && npc.dayAfter.pulse;
                    npc.dayAfter.validated = complete;
                    this.ui.updateDayAfterSummary(state.admittedNPCs);
                    this.renderModalStats(npc, allowPurge, state);
                    this.clearModalError();
                });
                return slot;
            };

            testsGrid.append(
                makeSlot('skinTexture', 'DERMIS'),
                makeSlot('pupils', 'PUPILAS'),
                makeSlot('temperature', 'TEMP'),
                makeSlot('pulse', 'PULSO')
            );
            this.elements.modalStats.after(testsGrid);
        }
    }

    renderModalLog(npc) {
        this.elements.modalLog.empty();
        if (npc.history && npc.history.length > 0) {
            npc.history.forEach(entry => {
                this.elements.modalLog.append($('<div>', { class: 'mb-1 border-b border-gray-900 pb-1', text: entry }));
            });
        } else {
            this.elements.modalLog.text("Sin registro de diálogo.");
        }
    }
}
