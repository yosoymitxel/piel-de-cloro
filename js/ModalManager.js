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
        const panel = modal.find('.horror-panel-modal');

        modal.removeClass('hidden').addClass('flex');

        // Reset classes
        panel.removeClass('military-order horror-panel-message horror-panel-confirm horror-panel-danger');
        panel.find('.order-stamp, .digital-glitch-stain').remove();

        // Aplicar estética según tipo
        if (type === 'death' || type === 'ending') {
            panel.addClass('military-order');
            panel.append('<div class="order-stamp">TERMINATED</div>');
        } else if (type === 'warning') {
            panel.addClass('horror-panel-danger');
        }

        const iconClass = {
            death: 'fa-skull',
            warning: 'fa-triangle-exclamation',
            lore: 'fa-book'
        }[type] || 'fa-circle-info';

        content.html(`
            <div class="flex flex-col items-center gap-4">
                <i class="fa-solid ${iconClass} text-3xl mb-2 ${type === 'death' ? 'text-alert' : type === 'warning' ? 'text-warning' : 'text-chlorine-light'}"></i>
                <span class="text-lg text-center leading-relaxed font-mono uppercase tracking-tight">${text}</span>
            </div>
        `);

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
        const panel = modal.find('.horror-panel-modal');

        modal.removeClass('hidden').addClass('flex');

        // Reset classes
        content.removeClass('text-gray-300 text-warning text-alert');
        panel.removeClass('military-order horror-panel-message horror-panel-confirm horror-panel-danger');
        panel.find('.order-stamp, .digital-glitch-stain').remove();
        this.elements.confirmYes.removeClass('btn-purge-heavy');

        if (type === 'danger' && (text.includes('PURGAR') || text.includes('BLOQUEAR'))) {
            panel.addClass('military-order horror-panel-danger');
            panel.append('<div class="order-stamp">EXECUTED</div>');
            panel.append('<div class="digital-glitch-stain" style="top:10%; left:20%"></div>');
            panel.append('<div class="digital-glitch-stain" style="bottom:20%; right:10%"></div>');
            this.elements.confirmYes.addClass('btn-purge-heavy');
            content.addClass('text-alert font-bold');
        } else if (type === 'warning') {
            panel.addClass('horror-panel-danger');
            content.addClass('text-warning');
        } else if (type === 'danger') {
            panel.addClass('horror-panel-danger');
            content.addClass('text-alert');
        } else {
            content.addClass('text-gray-300');
        }

        content.html(`
            <div class="flex flex-col items-center gap-4">
                <!-- <i class="fa-solid fa-circle-question text-3xl mb-2 opacity-50"></i> -->
                <span class="text-center font-mono uppercase tracking-tight">${text}</span>
            </div>
        `);

        if (this.audio) this.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });

        this.elements.confirmYes.off('click').on('click', () => {
            modal.addClass('hidden').removeClass('flex');
            if (typeof onYes === 'function') onYes();
        });

        this.elements.confirmCancel.off('click').on('click', () => {
            modal.addClass('hidden').removeClass('flex');
            if (typeof onCancel === 'function') onCancel();
        });
    }

    openModal(npc, allowPurge, onPurgeConfirm, state) {
        if (State.endingTriggered) return;
        this.ui.currentModalNPC = npc; // Guardar referencia al NPC actual del modal
        this.clearModalError();
        this.elements.modal.removeClass('hidden').addClass('flex');
        if (this.audio) this.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });

        this.elements.modalName.text(`${npc.name}`);

        if (this.elements.modalTrait) {
            const trait = npc.trait || { id: 'none', name: 'Ninguno', description: 'Sin rasgos especiales.' };
            if (trait.id !== 'none') {
                this.elements.modalTrait.html(`
                    <div class="flex flex-col gap-1 w-full text-xs">
                        <div class="flex items-center justify-between">
                            <span class="text-white font-bold uppercase tracking-wider">Rasgo: ${trait.name}</span>
                            <button id="btn-modal-help-traits" class="text-[9px] bg-blue-900/40 hover:bg-blue-800 text-blue-300 px-2 py-0.5 border border-blue-700/50 rounded flex items-center gap-1 transition-colors uppercase font-mono">
                                <i class="fa-solid fa-circle-info"></i>
                            </button>
                        </div>
                        <span class="text-sm text-gray-400 italic leading-tight">${trait.description}</span>
                    </div>
                `).removeClass('hidden');

                // Vincular el botón de ayuda del rasgo a la Base de Datos
                $('#btn-modal-help-traits').on('click', (e) => {
                    e.stopPropagation();
                    this.closeModal(true);

                    // Navegar a la Base de Datos
                    if (this.ui && typeof this.ui.showScreen === 'function') {
                        this.ui.showScreen('database'); // Usamos el string 'database' que es el ID estándar

                        // Seleccionar la sección de rasgos en la DB
                        setTimeout(() => {
                            const traitBtn = $(`.db-nav-btn[data-target="db-traits"]`);
                            if (traitBtn.length) {
                                traitBtn.click();
                            }
                        }, 50);
                    }

                    if (this.audio) this.audio.playSFXByKey('ui_hover', { volume: 0.3 });
                });
            } else {
                this.elements.modalTrait.addClass('hidden');
            }
        }

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

        // Add DANGER WARNING for lore NPCs
        if (npc.uniqueType === 'lore') {
            const warningSection = $(`
                <div class="unique-info-section unique-lore" style="margin: 1rem; border-left: 3px solid var(--alert); background: rgba(255, 50, 50, 0.1); padding: 0.75rem;">
                    <h4 style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem; color: var(--alert); font-family: 'Courier New', monospace;">
                        <i class="fa-solid fa-skull-crossbones"></i> ADVERTENCIA DE ANOMALÍA
                    </h4>
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; padding: 0.25rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-family: 'Courier New', monospace;">
                        <span style="color: rgba(255, 255, 255, 0.6);">Nivel de Amenaza</span>
                        <span style="color: var(--alert); font-weight: 600; animation: anomaly-flash 2s ease-in-out infinite;">CRÍTICO</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; padding: 0.25rem 0; font-family: 'Courier New', monospace;">
                        <span style="color: rgba(255, 255, 255, 0.6);">Riesgo Nocturno</span>
                        <span style="color: var(--alert); font-weight: 600; animation: anomaly-flash 2s ease-in-out infinite;">80% LETAL</span>
                    </div>
                </div>
            `);
            visualContainer.append(warningSection);
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
                const panel = $('#modal-npc .horror-panel-modal');
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
            if (npc.assignedSector) {
                this.elements.modalStatus.text(`ASIGNADO: ${npc.assignedSector.toUpperCase()}`).css('color', '#00ff41'); // Terminal Green
            } else {
                this.elements.modalStatus.text("EN REFUGIO").css('color', '#fff');
            }
        } else {
            let statusText = 'POR DETERMINAR';
            let color = State.colors.textGray;
            if (npc.death && npc.death.revealed) {
                if (npc.death.reason === 'purga') {
                    statusText = npc.isInfected ? 'PURGADO — CLORO' : 'PURGADO — CIVIL';
                    color = npc.isInfected ? this.colors.chlorine : State.colors.textGray;
                } else if (npc.death.reason === 'asesinado') {
                    statusText = npc.isInfected ? 'ASESINADO — CLORO' : 'ASESINADO — CIVIL';
                    color = npc.isInfected ? this.colors.chlorine : State.colors.textGray;
                }
            } else if (npc.exitCycle && state && npc.exitCycle < state.cycle) {
                // Ignorados / Fugitivos
                statusText = npc.isInfected ? 'FUGITIVO — CLORO' : 'FUGITIVO — CIVIL';
                color = npc.isInfected ? this.colors.chlorine : State.colors.textGray;
            } else if (npc.left && state && npc.left.cycle <= state.cycle) {
                // Salidas nocturnas
                statusText = npc.isInfected ? 'DESERCIÓN — CLORO' : 'DESERCIÓN — CIVIL';
                color = npc.isInfected ? this.colors.chlorine : State.colors.textGray;
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
                <div class="dossier-stat-item">
                    <span class="dossier-stat-label">${label}</span>
                    <span class="dossier-stat-value ${isRevealed ? 'text-white' : 'text-gray-600 italic'}">${display}</span>
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
            const noPower = state.generator && state.generator.isOn === false;

            if (isPurgeLocked || alreadyTested || noTestsLeft || noPower) {
                testsGrid.removeClass('grid-cols-4').addClass('grid-cols-1');
                let msg = "";
                let icon = "";

                if (noPower) {
                    msg = "SISTEMA SIN ENERGÍA: REVISAR GENERADOR";
                    icon = "fa-bolt-slash";
                } else if (isPurgeLocked) {
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
                    <div class="horror-btn horror-btn-disabled w-full p-4 text-center opacity-70 cursor-not-allowed border-dashed text-xs flex items-center justify-center col-span-4 w-100">
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

                // --- NUEVO: ANALIZADOR DE HEMOGLOBINA ---
                const bloodBtn = $('<button>', {
                    class: `horror-tool-btn horror-tool-btn--blood col-span-4 mt-2 ${State.generator.bloodTestCountdown > 0 ? 'processing' : ''}`,
                    html: `<i class="fa-solid fa-droplet mr-2"></i><span>ANALIZADOR DE HEMOGLOBINA (TEST DEFINITIVO)</span>`
                });

                const bloodValidation = this.ui.game.actions.validateBloodTest();
                if (!bloodValidation.allowed) {
                    bloodBtn.addClass('opacity-50 grayscale cursor-not-allowed').prop('disabled', true);
                    bloodBtn.attr('title', bloodValidation.reason);
                }

                if (State.generator.bloodTestCountdown > 0) {
                    bloodBtn.html(`<i class="fa-solid fa-spinner fa-spin mr-2"></i><span>PROCESANDO... (${State.generator.bloodTestCountdown} TUR)</span>`);
                    bloodBtn.prop('disabled', true);
                }

                bloodBtn.on('click', () => {
                    this.ui.game.actions.startBloodTest(npc);
                    this.renderModalStats(npc, allowPurge, state); // Refresh UI
                });

                testsGrid.append(bloodBtn);
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
