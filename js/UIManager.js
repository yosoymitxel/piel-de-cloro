import { State } from './State.js';
export class UIManager {
    constructor(audio = null) {
        this.screens = {
            start: $('#screen-start'),
            game: $('#screen-game'),
            shelter: $('#screen-shelter'),
            morgue: $('#screen-morgue'),
            settings: $('#screen-settings'),
            night: $('#screen-night'),
            lore: $('#screen-lore'),
            room: $('#screen-room'),
            generator: $('#screen-generator'),
            finalStats: $('#screen-final-stats')
        };
        
        this.elements = {
            paranoia: $('#paranoia-level'),
            cycle: $('#cycle-count'),
            time: $('#time-display'),
            feedback: $('#inspection-feedback'),
            npcDisplay: $('#npc-display'),
            dialogue: $('#npc-dialogue'),
            dialogueOptions: $('#dialogue-options'),
            shelterGrid: $('#shelter-grid'),
            morgueGrid: $('#morgue-grid'),
            securityGrid: $('#security-grid'),
            securityCount: $('#security-count'),
            shelterCount: $('#shelter-count'),
            generatorPanel: $('#generator-panel'),
            generatorPowerBar: $('#generator-power-bar'),
            generatorModeLabel: $('#generator-mode-label'),
            sidebar: $('#sidebar-left'),
            settingsBtn: $('#btn-settings-toggle'),
            dayafterPanel: $('#dayafter-panel'),
            dayafterList: $('#dayafter-list'),
            dayafterTestsLeft: $('#dayafter-tests-left'),
            dayafterGroupLimit: $('#dayafter-group-limit'),
            dayafterValidatedCount: $('#dayafter-validated-count'),
            
            // Modal NPC
            modal: $('#modal-npc'),
            modalName: $('#modal-npc-name'),
            modalStatus: $('#modal-npc-status'),
            modalStats: $('#modal-npc-stats-content'),
            modalLog: $('#modal-npc-log'),
            modalPurgeBtn: $('#btn-modal-purge'),
            modalError: $('#modal-error'),
            
            // Generator warnings
            genWarningGame: $('#generator-warning-game'),
            genWarningShelter: $('#generator-warning-shelter'),
            genWarningPanel: $('#generator-warning-panel'),
            gameActionsContainer: $('#game-actions-container'),
            inspectionToolsContainer: $('#inspection-tools-container'),
            
            // Shelter finalize button
            finalizeNoPurgeBtn: $('#btn-finalize-day-no-purge'),

            // Message Modal
            msgModal: $('#modal-message'),
            msgContent: $('#modal-message-content'),
            msgBtn: $('#btn-message-ok'),

            // Confirm Modal
            confirmModal: $('#modal-confirm'),
            confirmContent: $('#modal-confirm-content'),
            confirmYes: $('#btn-confirm-yes'),
            confirmCancel: $('#btn-confirm-cancel'),

            // Tools
            tools: [
                $('#tool-thermo'),
                $('#tool-flash'),
                $('#tool-pulse'),
                $('#tool-pupils')
            ]
        };
        this.infectionEffectActive = false;
        this.typingTimer = null;
        this.audio = audio;
        this.timings = {
            vhsDuration: 1000,
            loreFadeOut: 500,
            modalBloodFlash: 700,
            validationOpen: 0,
            precloseOpen: 0
        };
        const self = this;
        this.modules = {
            lore: {
                showLore(type, onClose) {
                    const title = $('#lore-screen-title');
                                const content = $('#lore-screen-content');
                                const panel = $('#screen-lore .lore-panel');
                                let t = '';
                                let c = '';
                                title.removeClass('text-alert glitch-effect');
                                panel.removeClass('animate__shakeX lore-danger lore-calm');
                                if (type === 'initial') {
                                    t = 'Protocolo del Refugio';
                                    c = `
                            <p>Los piel de cloro son portadores. La piel se reseca, los ojos se dilatan y el pulso baja.</p>
                            <p>Herramientas: usa TERMÓMETRO, LINTERNA UV, PULSO y PUPILAS para revelar señales.</p>
                            <p>Decisiones: admitir aumenta riesgo; purgar reduce amenaza pero sube la paranoia si era civil.</p>
                            <p>Al caer la noche, si hay cloro dentro, alguien muere. Si no, descansas o afrontas un riesgo leve.</p>
                        `;
                        if (self.audio) self.audio.playLoreByKey('lore_intro_track', { loop: false, volume: 0.22, crossfade: 600 });
                    } else if (type === 'intermediate') {
                        const variants = [
                            { kind: 'radio', text: '“Realmente no son personas, purgarlos debería ser corr...”. La señal se corta. Luego silencio.' },
                            { kind: 'oido', text: 'Golpes: dos cortos y uno largo. Afuera puede ser peligroso.' },
                            { kind: 'vista', text: 'Una sombra cruzó el pasillo. Por un instante, se nos fue el aliento, debemos revisar si todo está asegurado.' },
                            { kind: 'registro', text: 'Anotación: la piel reseca aparece con luz UV y olor metálico es percibido de forma sutil.' },
                            { kind: 'radio', text: 'Se rumorea que se alimentan de humedad, moho y agua estancada, no se descarta que también de carne podrida.' },
                            { kind: 'oido', text: 'Se escuchan gritos a través de las tuberías, quizá hay alguien ahí.' },
                            { kind: 'vista', text: 'Los espejos del pasillo empañan cuando alguien piel de cloro pasa delante.' },
                            { kind: 'radio', text: 'Transmisión interceptada: “El cloro recuerda quién abrió la puerta, normalmente lo deja vivir”.' },
                            { kind: 'oido', text: 'Se ven restos de piel en el pasillo ¿De quién será?' },
                            { kind: 'registro', text: 'Nota olvidada: “Si la sed despierta tras beber, no bebas más”.' },
                            { kind: 'vista', text: 'Parece que alguien ha estado quieto en el pasillo.' },
                            { kind: 'radio', text: 'Estática hace horas, quizá días, no podemos saber mucho más de lo que pasa afuera.' },
                            { kind: 'oido', text: 'Pasos fuera de la sala, hay agua por todos lados, se siente peligroso.' },
                            { kind: 'registro', text: 'Página de anotaciones de un refugiado: “La piel se desprende si miras de frente demasiado rato”.' },
                            { kind: 'vista', text: 'Una mancha verde en el techo crece cuando nadie la observa.' },
                            { kind: 'radio', text: '“El agua sabe a cloro, parece que alguien ha infectado el tanque de agua”.' },
                            { kind: 'oido', text: 'Goteo que imita tu ritmo cardíaco hasta que cambias de ritmo.' },
                            { kind: 'registro', text: 'Aviso: “Sellen las grietas con sal; el cloro odia el mar”.' },
                            { kind: 'vista', text: 'Siluetas en la niebla tratando de entrar por puertas que no existen.' },
                            { kind: 'radio', text: '“No duermas con la boca abierta, aunque la posibilidad es baja puedes convertirte en uno de ellos”.' }
                        ];
                        t = 'Interludio';
                        const pick = variants[Math.floor(Math.random() * variants.length)];
                        const icon = pick.kind === 'radio' ? 'fa-tower-broadcast' : pick.kind === 'vista' ? 'fa-eye' : pick.kind === 'oido' ? 'fa-ear-listen' : 'fa-book-open';
                        const label = pick.kind === 'radio' ? 'RADIO' : pick.kind === 'vista' ? 'VISTO' : pick.kind === 'oido' ? 'ESCUCHADO' : 'REGISTRO';
                        c = `<p class="mb-2"><i class="fa-solid ${icon} mr-2"></i><span class="font-bold">${label}</span></p><p>${pick.text}</p>`;
                        if (self.audio) {
                            if (pick.kind === 'radio') self.audio.playLoreByKey('lore_interlude_radio', { loop: false, volume: 0.22, crossfade: 500 });
                            else if (pick.kind === 'vista') self.audio.playLoreByKey('lore_interlude_seen', { loop: false, volume: 0.22, crossfade: 500 });
                            else if (pick.kind === 'oido') self.audio.playLoreByKey('lore_interlude_heard', { loop: false, volume: 0.22, crossfade: 500 });
                        }
                    } else if (type === 'pre_final') {
                        t = 'Umbral';
                        c = 'Antes de decidir, recuerda: sin pruebas, solo queda la palabra. El refugio no olvida.';
                    } else if (type === 'post_final') {
                        t = 'Resonancia';
                        c = 'El refugio recuerda. Las decisiones dejan marcas invisibles que la noche ilumina.';
                    } else if (type === 'night_tranquil') {
                        t = 'Noche tranquila';
                        c = 'El silencio fue real. Nadie habló y nadie cayó.';
                        panel.addClass('lore-calm');
                    } else if (type === 'night_civil_death') {
                        t = 'Noche de sangre';
                        c = 'Alguien fue encontrado sin pulso. El cloro respiró entre nosotros.';
                        title.addClass('text-alert');
                        panel.addClass('animate__shakeX lore-danger');
                        title.addClass('glitch-effect').attr('data-text', t);
                        if (self.audio) self.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
                    } else if (type === 'night_player_death') {
                        t = 'Última guardia';
                        c = 'El refugio te consumió. El cloro no duerme. Tú tampoco.';
                        title.addClass('text-alert');
                        panel.addClass('animate__shakeX lore-danger');
                        title.addClass('glitch-effect').attr('data-text', t);
                        if (self.audio) self.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
                    } else if (type === 'final_clean') {
                        t = 'Salida limpia';
                        c = 'Escapaste con humanidad intacta. Por ahora, el ciclo descansa.';
                        panel.addClass('lore-calm');
                        if (self.audio) self.audio.playLoreByKey('lore_final_clean', { loop: false, volume: 0.22, crossfade: 600 });
                    } else if (type === 'final_corrupted') {
                        t = 'Salida contaminada';
                        c = 'Escapaste, pero el agua os sigue. El ciclo no termina.';
                        title.addClass('text-alert');
                        panel.addClass('animate__shakeX lore-danger');
                        title.addClass('glitch-effect').attr('data-text', t);
                        if (self.audio) self.audio.playLoreByKey('lore_final_corrupted', { loop: false, volume: 0.22, crossfade: 600 });
                    } else if (type === 'final_death_alone') {
                        t = 'Soledad terminal';
                        c = 'Nadie sobrevivió contigo. Nadie te escuchó. Fin.';
                        title.addClass('text-alert');
                        panel.addClass('animate__shakeX lore-danger');
                        title.addClass('glitch-effect').attr('data-text', t);
                        if (self.audio) self.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
                    } else if (type === 'final_death_all_infected') {
                        t = 'Refugio tomado';
                        c = 'Todos eran cloro. No hubo salida posible.';
                        title.addClass('text-alert');
                        panel.addClass('animate__shakeX lore-danger');
                        title.addClass('glitch-effect').attr('data-text', t);
                        if (self.audio) self.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
                    } else if (type === 'final_death_paranoia') {
                        t = 'La paranoia te alcanzó';
                        c = 'Al intentar huir, el ruido te encontró primero.';
                        title.addClass('text-alert');
                        panel.addClass('animate__shakeX lore-danger');
                        title.addClass('glitch-effect').attr('data-text', t);
                        if (self.audio) self.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
                    } else if (type === 'final_player_infected_escape') {
                        t = 'Salida portadora';
                        c = 'No era el refugio. Eras tú. Lo llevaste contigo.';
                        title.addClass('text-alert');
                        panel.addClass('animate__shakeX lore-danger');
                        title.addClass('glitch-effect').attr('data-text', t);
                        if (self.audio) self.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
                    }
                    title.text(t);
                    content.html(c);
                    self.showScreen('lore');
                    if (self.audio) self.audio.duckAmbient(0.12);
                    $('#btn-lore-continue-screen').off('click').on('click', () => {
                        if (self.audio) {
                            self.audio.stopLore({ fadeOut: self.timings.loreFadeOut });
                            self.audio.unduckAmbient(300, 0.28);
                        }
                        if (onClose) onClose();
                        else self.showScreen('game');
                    });
                }
            },
            modal: {
                showModalError(text) {
                    self.elements.modalError.text(text).removeClass('hidden');
                },
                clearModalError() {
                    self.elements.modalError.text('').addClass('hidden');
                },
                closeModal(silent = false) {
                    this.clearModalError();
                    self.elements.modal.addClass('hidden').removeClass('flex');
                    self.elements.msgModal.addClass('hidden').removeClass('flex');
                    if (!silent && self.audio) self.audio.playSFXByKey('ui_modal_close', { volume: 0.5, priority: 0 });
                },
                showMessage(text, onClose, type = 'normal') {
                    const modal = self.elements.msgModal;
                    const content = self.elements.msgContent;
                    modal.removeClass('hidden').addClass('flex');
                    modal.removeClass('modal-normal modal-lore modal-death modal-warning').addClass(`modal-${type}`);
                    const iconClass = type === 'death' ? 'modal-death-icon' : type === 'warning' ? 'modal-warning-icon' : type === 'lore' ? 'modal-lore-icon' : 'modal-normal-icon';
                    content.html(`<span class="${iconClass}"></span> <span>${text}</span>`);
                    if (self.audio) self.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });
                    self.elements.msgBtn.off('click').on('click', () => {
                        modal.addClass('hidden').removeClass('flex');
                        if (self.audio) self.audio.playSFXByKey('ui_modal_close', { volume: 0.5 });
                        if (onClose) onClose();
                    });
                },
                openModal(npc, allowPurge, onPurgeConfirm) {
                    self.elements.modal.removeClass('hidden').addClass('flex');
                    if (self.audio) self.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });
                    self.elements.modalName.text(`SUJETO ${npc.name}`);
                    const visualContainer = $('#modal-npc-visual');
                    visualContainer.empty().append(self.renderAvatar(npc, 'sm'));
                    visualContainer.css('background', 'transparent');
                    const avatarEl = visualContainer.find('.pixel-avatar');
                    if (npc.death && npc.death.revealed && npc.isInfected) {
                        avatarEl.addClass('infected');
                    }
                    if (allowPurge) {
                        self.elements.modalStatus.text("EN REFUGIO").css('color', '#fff');
                    } else {
                        let statusText = 'POR DETERMINAR';
                        let color = '#cccccc';
                        if (npc.death && npc.death.revealed) {
                            if (npc.death.reason === 'purga') {
                                statusText = npc.isInfected ? 'PURGADO — CLORO' : 'PURGADO — CIVIL';
                                color = npc.isInfected ? self.colors.chlorine : "#cccccc";
                            } else if (npc.death.reason === 'asesinado') {
                                statusText = npc.isInfected ? 'ASESINADO — CLORO' : 'ASESINADO — CIVIL';
                                color = npc.isInfected ? self.colors.chlorine : "#cccccc";
                            }
                        }
                        self.elements.modalStatus.text(statusText).css('color', color);
                    }
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
                    const dermisTxt = self.translateValue('skinTexture', npc.attributes.skinTexture);
                    const pupilsTxt = self.translateValue('pupils', npc.attributes.pupils);
                    const stayCycles = npc.enterCycle != null && npc.death ? Math.max(0, npc.death.cycle - npc.enterCycle) : (npc.enterCycle != null ? Math.max(0, State.cycle - npc.enterCycle) : 0);
                    const extraDeathInfo = npc.death ? `<p>MUERTE: <span class="text-white">CICLO ${npc.death.cycle}</span></p><p>TIEMPO EN REFUGIO: <span class="text-white">${stayCycles} ciclos</span></p>` : '';
                    self.elements.modalStats.html(`
            ${showStat('temperature', 'TEMP', `${npc.attributes.temperature}°C`)}
            ${showStat('pulse', 'PULSO', `${npc.attributes.pulse} BPM`)}
            ${showStat('skinTexture', 'DERMIS', dermisTxt)}
            ${showStat('pupils', 'PUPILAS', pupilsTxt)}
            ${extraDeathInfo}
        `);
                    self.elements.modal.find('.dayafter-tests').remove();
                    if (allowPurge) {
                        const testsGrid = $('<div>', { class: 'dayafter-tests mt-3' });
                        const handleAfterClick = () => {
                            const complete = npc.dayAfter.dermis && npc.dayAfter.pupils && npc.dayAfter.temperature && npc.dayAfter.pulse;
                            npc.dayAfter.validated = complete;
                            self.updateDayAfterSummary(State.admittedNPCs);
                            const dermisTxt2 = self.translateValue('skinTexture', npc.attributes.skinTexture);
                            const pupilsTxt2 = self.translateValue('pupils', npc.attributes.pupils);
                            const stayCycles2 = npc.enterCycle != null && npc.death ? Math.max(0, npc.death.cycle - npc.enterCycle) : (npc.enterCycle != null ? Math.max(0, State.cycle - npc.enterCycle) : 0);
                            const extraDeathInfo2 = npc.death ? `<p>MUERTE: <span class="text-white">CICLO ${npc.death.cycle}</span></p><p>TIEMPO EN REFUGIO: <span class="text-white">${stayCycles2} ciclos</span></p>` : '';
                            self.elements.modalStats.html(`
                    ${showStat('temperature', 'TEMP', `${npc.attributes.temperature}°C`)}
                    ${showStat('pulse', 'PULSO', `${npc.attributes.pulse} BPM`)}
                    ${showStat('skinTexture', 'DERMIS', dermisTxt2)}
                    ${showStat('pupils', 'PUPILAS', pupilsTxt2)}
                    ${extraDeathInfo2}
                `);
                        };
                        const makeSlot = (key, label) => {
                            const knownByDay = npc.revealedStats && npc.revealedStats.includes(key);
                            const doneNight = npc.dayAfter[key];
                            const slot = $('<div>', { class: `slot ${knownByDay || doneNight ? 'done blocked' : ''}`, text: label });
                            slot.on('click', () => {
                                if (knownByDay || npc.dayAfter[key]) return;
                                if (npc.dayAfter.usedNightTests >= 1) {
                                    self.showModalError('SOLO 1 TEST NOCTURNO POR SUJETO');
                                    return;
                                }
                                if (State.dayAfter.testsAvailable <= 0) {
                                    self.showModalError('SIN TESTS DISPONIBLES');
                                    return;
                                }
                                State.dayAfter.testsAvailable--;
                                npc.dayAfter[key] = true;
                                npc.dayAfter.usedNightTests++;
                                slot.addClass('done');
                                testsGrid.find('.slot').addClass('blocked');
                                self.elements.dayafterTestsLeft.text(State.dayAfter.testsAvailable);
                                handleAfterClick();
                                self.clearModalError();
                            });
                            return slot;
                        };
                        testsGrid.append(
                            makeSlot('skinTexture', 'DERMIS'),
                            makeSlot('pupils', 'PUPILAS'),
                            makeSlot('temperature', 'TEMP'),
                            makeSlot('pulse', 'PULSO')
                        );
                        self.elements.modalStats.after(testsGrid);
                    }
                    self.elements.modalLog.empty();
                    if (npc.history && npc.history.length > 0) {
                        npc.history.forEach(entry => {
                            self.elements.modalLog.append($('<div>', { class: 'mb-1 border-b border-gray-900 pb-1', text: entry }));
                        });
                    } else {
                        self.elements.modalLog.text("Sin registro de diálogo.");
                    }
                    if (allowPurge) {
                        self.elements.modalPurgeBtn.removeClass('hidden');
                        self.elements.modalPurgeBtn.off('click').on('click', () => {
                            const panel = $('#modal-npc .horror-panel');
                            panel.addClass('modal-blood-flash');
                            setTimeout(() => panel.removeClass('modal-blood-flash'), 700);
                            if (self.audio) {
                                self.audio.playSFXByKey('purge_blood_flash', { volume: 0.6, priority: 2, lockMs: 600 });
                                self.audio.playSFXByKey('purge_confirm', { volume: 0.7, priority: 2, lockMs: 600 });
                            }
                            onPurgeConfirm(npc);
                            self.closeModal(true);
                        });
                    } else {
                        self.elements.modalPurgeBtn.addClass('hidden');
                    }
                    $('.close-modal').off('click').on('click', () => self.closeModal());
                }
            }
        };
    }

    renderFinalStats(state) {
        const totalProcesados = state.admittedNPCs.length + state.ignoredNPCs.length + state.purgedNPCs.length + state.departedNPCs.length;
        const admitted = state.admittedNPCs.length;
        const purged = state.purgedNPCs.length;
        const infectedDetected = state.infectedSeenCount;
        
        const leaked = state.admittedNPCs.filter(n => n.isInfected).length + 
                    state.departedNPCs.filter(n => n.isInfected).length;
        
        const deaths = state.purgedNPCs.filter(n => !n.isInfected).length;

        $('#final-stat-total').text(totalProcesados);
        $('#final-stat-admitted').text(admitted);
        $('#final-stat-purged').text(purged);
        $('#final-stat-infected').text(infectedDetected);
        $('#final-stat-leaked').text(leaked);
        $('#final-stat-deaths').text(deaths);

        const notes = $('#final-stat-notes');
        notes.empty();
        const addNote = (txt) => notes.append(`<p>> ${txt}</p>`);
        
        if (leaked > 0) addNote(`ALERTA: Se han detectado ${leaked} brechas biológicas en el perímetro.`);
        else addNote("PROTOCOLO DE CONTENCIÓN: ÉXITO TOTAL. No hay rastros de infección.");
        
        if (deaths > 0) addNote(`Bajas civiles confirmadas: ${deaths}. Daños colaterales dentro de los márgenes.`);
        if (state.paranoia > 80) addNote("ADVERTENCIA: Niveles de estrés post-traumático críticos en el operador.");
        
        const outcome = $('#final-stat-outcome');
        if (leaked > 2 || state.playerInfected) {
            outcome.text("FALLIDO").addClass('text-alert').removeClass('text-chlorine');
        } else {
            outcome.text("COMPLETADO").addClass('text-chlorine').removeClass('text-alert');
        }

        this.showScreen('finalStats');
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(s => s.addClass('hidden'));
        if (this.screens[screenName]) {
            this.screens[screenName].removeClass('hidden');
        }

        // Logic 1: Settings button only on start screen
        if (screenName === 'start') {
            this.elements.settingsBtn.removeClass('hidden');
        } else {
            this.elements.settingsBtn.addClass('hidden');
        }

        // Logic 2: Sidebar only on Game, Shelter, Morgue, Room, Generator
        if (['game', 'shelter', 'morgue', 'room', 'generator'].includes(screenName)) {
            this.elements.sidebar.removeClass('hidden');
        } else {
            this.elements.sidebar.addClass('hidden');
        }

        // Toggle finalize button visibility in Shelter
        if (screenName === 'shelter') {
            const shouldShow = State.isDayOver() && !State.isNight;
            this.elements.finalizeNoPurgeBtn.toggleClass('hidden', !shouldShow);
        } else {
            this.elements.finalizeNoPurgeBtn.addClass('hidden');
        }

        // Clear global feedback on screen change
        this.hideFeedback();
        // Update active state in sidebar
        $('.group').removeClass('active text-black bg-chlorine opacity-100').addClass('text-chlorine-light opacity-60');
        
        const activeClass = 'active text-black bg-chlorine opacity-100';
        const inactiveClass = 'text-chlorine-light opacity-60';

        if (screenName === 'game') $('#nav-guard').addClass(activeClass).removeClass(inactiveClass);
        if (screenName === 'shelter') $('#nav-shelter').addClass(activeClass).removeClass(inactiveClass);
        if (screenName === 'morgue') $('#nav-morgue').addClass(activeClass).removeClass(inactiveClass);
        if (screenName === 'room') $('#nav-room').addClass(activeClass).removeClass(inactiveClass);
        if (screenName === 'generator') $('#nav-generator').addClass(activeClass).removeClass(inactiveClass);
        // Toggle visibility of morgue stats nav button
        $('#nav-morgue-stats').removeClass('hidden');
    }

    applyVHS(intensity = 0.6, duration = 1000) {
        const target = $('#screen-game').find('main.vhs-target');
        target.css('--vhs-intensity', intensity);
        target.css('--vhs-duration', `${duration}ms`);
        target.addClass('vhs-active');
        if (this.audio) this.audio.playSFXByKey('vhs_flicker', { volume: 0.5 });
        setTimeout(() => target.removeClass('vhs-active'), duration);
    }

    updateStats(paranoia, cycle, dayTime, dayLength, currentNPC) {
        this.elements.paranoia.text(`${paranoia}%`);
        this.elements.cycle.text(cycle);
        this.elements.time.text(`${dayTime}/${dayLength}`);

        // La revisión solo es "obligatoria" si no hay energía o está apagado
        const generatorOk = State.generator && State.generator.isOn;
        const needsCheck = !generatorOk; 
        
        if (this.elements.genWarningGame) this.elements.genWarningGame.toggleClass('hidden', !needsCheck);
        if (this.elements.genWarningShelter) this.elements.genWarningShelter.toggleClass('hidden', !needsCheck);
        
        if (paranoia > 70) {
            this.elements.paranoia.removeClass('text-chlorine-light').addClass('text-alert');
        } else {
            this.elements.paranoia.removeClass('text-alert').addClass('text-chlorine-light');
        }

        // Update Energy
        const energySpan = $('#scan-energy');
        if (currentNPC) {
            // Definir límite máximo según modo
            const mode = State.generator.mode;
            const maxEnergy = State.config.generator.consumption[mode] || 2;

            // Calcular energía actual (0 si está apagado o fallo)
            const currentEnergy = (!State.generator.isOn || currentNPC.scanCount >= 90) ? 0 : Math.max(0, maxEnergy - currentNPC.scanCount);
            
            energySpan.text(`${currentEnergy}/${maxEnergy}`);
            
            if (currentEnergy > 0) {
                energySpan.removeClass('text-alert animate-pulse').addClass('text-cyan-400');
            } else {
                energySpan.removeClass('text-cyan-400').addClass('text-alert animate-pulse');
            }

            if (currentEnergy <= 0) {
                this.elements.tools.forEach(btn => btn.addClass('btn-disabled'));
            } else {
                this.elements.tools.forEach(btn => btn.removeClass('btn-disabled'));
            }
        } else {
            energySpan.text('---');
            this.elements.tools.forEach(btn => btn.addClass('btn-disabled'));
        }
    }

    renderAvatar(npc, sizeClass = 'lg') {
        // We stick to vanilla JS creation for the complex structure or rewrite to template literals
        // Template literals are cleaner.
        
        let accessoryHTML = '';
        if (npc.visualFeatures.accessory !== 'none') {
            accessoryHTML = `
                <div class="avatar-accessory">
                    <div class="acc-${npc.visualFeatures.accessory}"></div>
                </div>
            `;
        }

        const html = `
            <div class="pixel-avatar ${sizeClass}">
                <div class="avatar-body">
                    <div class="clothes-detail"></div>
                </div>
                <div class="avatar-neck" style="background-color: ${npc.visualFeatures.skinColor};"></div>
                <div class="avatar-head" style="background-color: ${npc.visualFeatures.skinColor};">
                    <div class="avatar-eyes ${npc.visualFeatures.eyeType}">
                        <div class="eye"></div>
                        <div class="eye"></div>
                    </div>
                    <div class="avatar-mouth ${npc.visualFeatures.mouthType}"></div>
                </div>
                <div class="avatar-hair">
                    <div class="hair-style ${npc.visualFeatures.hair}"></div>
                </div>
                ${accessoryHTML}
            </div>
        `;
        
        return $(html);
    }

    translateValue(type, value) {
        if (type === 'skinTexture') {
            return value === 'dry' ? 'SECA' : 'NORMAL';
        }
        if (type === 'pupils') {
            return value === 'dilated' ? 'DILATADAS' : 'NORMAL';
        }
        return (value ?? '').toString();
    }

    updateGameActions() {
        if (!this.elements.gameActionsContainer) return;

        // La revisión solo es "obligatoria" visualmente si no hay energía o está apagado
        const generatorOk = State.generator && State.generator.isOn && (State.generator.power > 10);
        const needsCheck = !generatorOk;
        
        if (this.elements.genWarningGame) this.elements.genWarningGame.toggleClass('hidden', !needsCheck);
        
        // Los botones de admitir/ignorar ya no se reemplazan aquí.
        // Se asume que el HTML inicial de index.html es el correcto.
    }

    updateInspectionTools() {
        if (!this.elements.inspectionToolsContainer) return;

        const npc = State.currentNPC;
        
        if (!State.generator.isOn) {
            // Caso 1: Generador apagado
            this.elements.inspectionToolsContainer.removeClass('grid-cols-2 sm:grid-cols-2 lg:grid-cols-4').addClass('grid-cols-1');
            this.elements.inspectionToolsContainer.html(`
                <button id="btn-goto-generator" class="horror-btn horror-btn-alert w-full p-6 text-xl flex items-center justify-center gap-3 animate-pulse">
                    <i class="fa-solid fa-bolt"></i>
                    <span>SISTEMA ELÉCTRICO INESTABLE: REVISAR GENERADOR</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            `);
            
            // Simplemente vinculamos al botón del nav para no complicarnos
            $('#btn-goto-generator').off('click').on('click', () => {
                $('#nav-generator').trigger('click');
            });
            
            return;
        }

        // Determinar el límite de energía actual según el modo
        const currentMode = State.generator.mode;
        const maxEnergy = State.config.generator.consumption[currentMode] || 2;

        if (npc && npc.scanCount >= maxEnergy) {
            // Caso 3: Sin energías por el límite del modo actual
            this.elements.inspectionToolsContainer.removeClass('grid-cols-2 sm:grid-cols-2 lg:grid-cols-4').addClass('grid-cols-1');
            this.elements.inspectionToolsContainer.html(`
                <div class="horror-btn horror-btn-disabled w-full p-4 text-center opacity-70 cursor-not-allowed border-dashed">
                    <i class="fa-solid fa-battery-empty mr-2"></i>
                    BATERÍAS AGOTADAS: SOLO DIÁLOGO O DECISIÓN
                </div>
            `);
        } else {
            // Caso Normal con energía disponible
            this.elements.inspectionToolsContainer.removeClass('grid-cols-1').addClass('grid-cols-2 sm:grid-cols-2 lg:grid-cols-4');
            
            const modeMap = {
                'save': 'Ahorro: Máx 1',
                'normal': 'Normal: Máx 2',
                'overload': 'Overclock: Máx 3'
            };
            const modeLabel = modeMap[currentMode] || `Modo ${currentMode}`;

            let extraLabel = `<div class="col-span-full text-center text-[10px] text-chlorine-light mb-1 opacity-80 uppercase tracking-widest">
                <i class="fa-solid fa-bolt mr-1"></i> ${modeLabel}
            </div>`;

            this.elements.inspectionToolsContainer.html(`
                ${extraLabel}
                <button id="tool-thermo" class="horror-btn horror-btn-tool ${npc && npc.revealedStats.includes('temperature') ? 'btn-disabled opacity-20 grayscale' : ''}">
                    <i class="fa-solid fa-temperature-half"></i> TERMÓMETRO
                </button>
                <button id="tool-flash" class="horror-btn horror-btn-tool ${npc && npc.revealedStats.includes('skinTexture') ? 'btn-disabled opacity-20 grayscale' : ''}">
                    <i class="fa-solid fa-lightbulb"></i> LINTERNA UV
                </button>
                <button id="tool-pulse" class="horror-btn horror-btn-tool ${npc && npc.revealedStats.includes('pulse') ? 'btn-disabled opacity-20 grayscale' : ''}">
                    <i class="fa-solid fa-heart-pulse"></i> PULSO
                </button>
                <button id="tool-pupils" class="horror-btn horror-btn-tool ${npc && npc.revealedStats.includes('pupils') ? 'btn-disabled opacity-20 grayscale' : ''}">
                    <i class="fa-solid fa-eye"></i> PUPILAS
                </button>
            `);
            
            // Vincular eventos
            if (window.game) {
                $('#tool-thermo').on('click', () => !$(this).hasClass('btn-disabled') && window.game.inspect('thermo'));
                $('#tool-flash').on('click', () => !$(this).hasClass('btn-disabled') && window.game.inspect('flashlight'));
                $('#tool-pulse').on('click', () => !$(this).hasClass('btn-disabled') && window.game.inspect('pulse'));
                $('#tool-pupils').on('click', () => !$(this).hasClass('btn-disabled') && window.game.inspect('pupils'));
                $('#tool-thermo, #tool-flash, #tool-pulse, #tool-pupils').addClass('btn-interactive');
            }
        }
    }

    renderNPC(npc) {
        // Update action buttons and tools based on generator status
        this.updateGameActions();
        this.updateInspectionTools();

        // Reset Visuals
        this.elements.npcDisplay.css({ transform: 'none', filter: 'none' });
        this.elements.npcDisplay.empty();

        // Use new Render System
        const avatar = this.renderAvatar(npc, 'lg');
        this.elements.npcDisplay.append(avatar);

        // Initial Dialogue
        this.updateDialogueBox(npc.dialogueTree.root, npc);
        
        // Glitch
        const glitchChance = Math.min(0.9, (npc.visualFeatures.glitchChance || 0) * (State.getGlitchModifier ? State.getGlitchModifier() : 1));
        if (Math.random() < glitchChance) {
            this.triggerGlitch();
            this.applyVHS(0.8, 1000);
        }
    }

    updateDialogueBox(node, npc) {
        this.elements.dialogue.html(`<span class="npc-name font-bold text-chlorine">SUJETO ${npc.name}:</span> <span class="npc-text"></span>`);
        const textEl = this.elements.dialogue.find('.npc-text');
        this.typeText(textEl, node.text, 18);
        this.elements.dialogueOptions.empty();
        
        node.options.forEach(opt => {
            const btn = $('<button>', {
                class: 'option-btn border border-chlorine-light text-chlorine-light px-2 py-1 hover:bg-chlorine-light hover:text-black transition-colors text-left text-sm',
                text: `> ${opt.label}`
            });
            
            btn.on('click', () => {
                if (npc.dialogueTree[opt.next]) {
                    // Al seleccionar cualquier diálogo, el botón de omitir desaparece permanentemente
                    npc.dialogueStarted = true;
                    this.hideOmitOption(); // Asegurar que se oculta inmediatamente
                    
                    this.updateDialogueBox(npc.dialogueTree[opt.next], npc);
                    if (!npc.history) npc.history = [];
                    npc.history.push(`Q: ${opt.label} | A: ${npc.dialogueTree[opt.next].text}`);
                    State.dialoguesCount++;
                    
                    this.updateInspectionTools(); // Asegurar que las herramientas reflejen que ya hubo interacción
                }
            });
            
            this.elements.dialogueOptions.append(btn);
        });

        // Solo mostrar botón omitir si no se ha interactuado de ninguna forma (ni diálogo ni tests)
        const hasInteracted = npc.dialogueStarted || npc.scanCount > 0;

        if (!npc.optOut && !hasInteracted) {
            const omitBtn = $('<button>', {
                class: 'option-btn option-omit border border-[#7a5a1a] text-[#ffcc66] px-2 py-1 hover:bg-[#7a5a1a] hover:text-black transition-colors text-left text-sm',
                text: '> Omitir por diálogo'
            });
            omitBtn.on('click', () => {
                npc.optOut = true;
                npc.scanCount = npc.maxScans;
                npc.dialogueStarted = true; // También cuenta como interacción
                if (!npc.history) npc.history = [];
                npc.history.push('Protocolo de omisión por diálogo activado.');
                this.showFeedback('TEST OMITIDO POR DIÁLOGO', 'yellow');
                this.updateInspectionTools();
                this.updateDialogueBox(npc.dialogueTree['end'] || {text: "Entendido. Puede continuar.", options: []}, npc);
            });
            this.elements.dialogueOptions.append(omitBtn);
        }
    }
    
    typeText(el, text, speed = 20) {
        if (this.typingTimer) {
            cancelAnimationFrame(this.typingTimer);
            this.typingTimer = null;
        }
        el.text('');
        if (this.audio) this.audio.playSFXByKey('ui_dialogue_type', { volume: 0.4 });
        let i = 0;
        const minStep = Math.max(5, speed);
        const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const step = (now) => {
            const elapsed = now - start;
            const shouldBe = Math.floor(elapsed / minStep);
            while (i <= shouldBe && i < text.length) {
                el.text(el.text() + text.charAt(i));
                i++;
            }
            if (i >= text.length) {
                this.typingTimer = null;
                return;
            }
            this.typingTimer = requestAnimationFrame(step);
        };
        this.typingTimer = requestAnimationFrame(step);
    }

    hideOmitOption() {
        const btn = this.elements.dialogueOptions.find('.option-omit');
        if (btn.length) btn.addClass('hidden');
    }

    triggerGlitch() {
        this.elements.npcDisplay.css({
            transform: 'skewX(10deg)',
            filter: 'invert(1)'
        });
        setTimeout(() => {
            this.elements.npcDisplay.css({
                transform: 'none',
                filter: 'none'
            });
        }, 150);
    }

    showValidationGate(npc) {
        const overlay = $('#validation-overlay');
        overlay.removeClass('hidden').addClass('flex');
        if (this.audio) this.audio.playSFXByKey('validation_gate_open', { volume: 0.5 });
        $('#btn-do-test').off('click').on('click', () => {
            overlay.addClass('hidden').removeClass('flex');
        });
        $('#btn-omit-test').off('click').on('click', () => {
            npc.optOut = true;
            npc.scanCount = npc.maxScans;
            if (!npc.history) npc.history = [];
            npc.history.push('El sujeto omitió el test mediante diálogo.');
            overlay.addClass('hidden').removeClass('flex');
            this.updateStats(State.paranoia, State.cycle, State.dayTime, State.config.dayLength, State.currentNPC);
            this.showFeedback('TEST OMITIDO POR DIÁLOGO', 'yellow');
            this.hideOmitOption();
        });
    }

    showLore(type, onClose) { return this.modules.lore.showLore(type, onClose); }

    showPreCloseFlow(onAction) {
        const overlay = $('#preclose-overlay');
        const step1 = $('#preclose-step1');
        const step2 = $('#preclose-step2');
        step2.addClass('hidden');
        step1.removeClass('hidden');
        overlay.removeClass('hidden').addClass('flex');
        if (this.audio) this.audio.playSFXByKey('preclose_overlay_open', { volume: 0.5 });
        // Hide sidebar while end-of-day flow is active
        this.elements.sidebar.addClass('hidden');
        $('#btn-preclose-open-shelter').off('click').on('click', () => {
            overlay.addClass('hidden').removeClass('flex');
            if (onAction) onAction('purge');
        });
        // Skip intermediate step: continue goes straight to Night
        $('#btn-preclose-continue').off('click').on('click', () => {
            overlay.addClass('hidden').removeClass('flex');
            if (onAction) onAction('finalize');
        });
        $('#btn-preclose-finish').off('click').on('click', () => {
            overlay.addClass('hidden').removeClass('flex');
            if (onAction) onAction('finalize');
        });
        $('#btn-preclose-stay').off('click').on('click', () => {
            overlay.addClass('hidden').removeClass('flex');
            if (onAction) onAction('stay');
        });
    }

    showFeedback(text, color = 'yellow') {
        const colorMap = {
            'yellow': 'text-warning',
            'red': 'text-alert',
            '#aaffaa': 'text-green-400'
        };
        
        // Remove old color classes
        this.elements.feedback.removeClass('text-warning text-alert text-green-400');
        
        // Add new color class or style if not mapped
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

    renderShelterGrid(npcs, max, onPurgeClick, onDetailClick) {
        this.elements.shelterCount.text(`${npcs.length}/${max}`);
        this.elements.shelterGrid.empty();
        
        const batch = [];
        npcs.forEach(npc => {
            const card = $('<div>', {
                class: 'bg-[#080808] border border-[#333] p-2 flex flex-col items-center cursor-pointer hover:border-chlorine-light hover:bg-[#111] transition-all'
            });
            
            const avatar = this.renderAvatar(npc, 'sm');
            const name = $('<span>', { text: npc.name, class: 'mt-2 text-xs' });

            card.append(avatar, name);
            card.on('click', () => onDetailClick(npc, true));
            
            batch.push(card[0]);
        });
        if (batch.length) this.elements.shelterGrid.append(batch);
    }

    updateDayAfterSummary(npcs) {
        const testsLeft = State.dayAfter.testsAvailable;
        this.elements.dayafterTestsLeft.text(testsLeft);
        const validatedCount = npcs.filter(n => n.dayAfter && n.dayAfter.validated).length;
        this.elements.dayafterValidatedCount.text(validatedCount);

        // La revisión solo es "obligatoria" si no hay energía o está apagado
        const generatorOk = State.generator && State.generator.isOn && (State.generator.power > 10);
        const needsCheck = !generatorOk;

        if (this.elements.genWarningShelter) this.elements.genWarningShelter.toggleClass('hidden', !needsCheck);
        
        // Si necesita revisión, podemos añadir un botón temporal en el panel de tests
        const testsPanel = this.elements.dayafterPanel.find('.flex.flex-wrap');
        if (needsCheck) {
            if ($('#btn-shelter-goto-gen').length === 0) {
                const btn = $('<button>', {
                    id: 'btn-shelter-goto-gen',
                    class: 'horror-btn horror-btn-alert px-3 py-1 text-xs flex items-center gap-2 animate-pulse',
                    html: '<i class="fa-solid fa-bolt"></i> IR AL GENERADOR'
                }).on('click', () => {
                    if (window.game) window.game.openGenerator();
                });
                testsPanel.append(btn);
            }
        } else {
            $('#btn-shelter-goto-gen').remove();
        }
    }

    renderMorgueGrid(npcs, onDetailClick) {
        this.elements.morgueGrid.empty();
        
        const batch = [];
        npcs.forEach(npc => {
            const statusColorClass = npc.death && npc.death.revealed && npc.isInfected ? 'infected' : '';
            
            const card = $('<div>', {
                class: `horror-card p-2 flex flex-col items-center cursor-pointer ${statusColorClass}`
            });
            
            const avatar = this.renderAvatar(npc, 'sm');
            if (npc.death && npc.death.revealed && npc.isInfected) {
                avatar.addClass('infected');
                if (!this.infectionEffectActive && Math.random() < 0.12) {
                    this.flashInfectionEffect(avatar);
                }
            }
            const name = $('<span>', { text: npc.name, class: 'mt-2 text-xs' });

            card.append(avatar, name);
            card.on('click', () => onDetailClick(npc, false));
            
            batch.push(card[0]);
        });
        if (batch.length) this.elements.morgueGrid.append(batch);
    }

    renderSecurityRoom(items, onToggle) {
        this.elements.securityGrid.empty();
        const filtered = items.filter(i => i.type !== 'generador');
        this.elements.securityCount.text(filtered.length);
        const batch = [];
        filtered.forEach((it, idx) => {
            const icon = it.type === 'alarma' ? 'fa-bell' : it.type === 'puerta' ? 'fa-door-closed' : it.type === 'ventana' ? 'fa-window-maximize' : it.type === 'tuberias' ? 'fa-water' : it.type === 'generador' ? 'fa-bolt' : 'fa-question';
            const activeOrSecured = it.type === 'alarma' ? it.active : it.secured;
            const activeColor = '#00FF00';
            const inactiveColor = '#ff2b2b';
            const borderColor = activeOrSecured ? activeColor : inactiveColor;
            const iconColor = activeOrSecured ? activeColor : inactiveColor;
            const card = $('<div>', {
                class: `bg-[#080808] p-3 flex flex-col gap-2 items-center hover:bg-[#111] transition-all`,
                css: { border: `1px solid ${borderColor}` }
            });
            card.append($('<i>', { class: `fa-solid ${icon} text-3xl`, css: { color: iconColor } }));
            const label = it.type === 'alarma' ? 'ALARMA' : (it.type === 'tuberias' ? 'TUBERÍAS' : it.type === 'generador' ? 'GENERADOR' : it.type.toUpperCase());
            card.append($('<span>', { text: label, class: 'text-xs font-mono' }));
            {
                const btnText = it.type === 'alarma' ? (it.active ? 'ACTIVADA' : 'ACTIVAR') : (activeOrSecured ? 'ASEGURADO' : 'ASEGURAR');
                const btn = $('<button>', { class: 'horror-btn horror-btn-primary w-full py-1 text-xs', text: btnText });
                if (activeOrSecured) btn.addClass('opacity-60');
                btn.on('click', () => {
                    if (it.type === 'alarma') {
                        if (!it.active) it.active = true;
                        if (this.audio) this.audio.playSFXByKey('alarm_activate', { volume: 0.6, priority: 1 });
                    } else {
                        if (!it.secured) it.secured = true;
                        if (this.audio) {
                            if (it.type === 'puerta') this.audio.playSFXByKey('door_secure', { volume: 0.6, priority: 1 });
                            if (it.type === 'ventana') this.audio.playSFXByKey('window_secure', { volume: 0.6, priority: 1 });
                            if (it.type === 'tuberias') this.audio.playSFXByKey('pipes_whisper', { volume: 0.4, priority: 1 });
                        }
                    }
                    if (onToggle) onToggle(idx, it);
                    this.renderSecurityRoom(items, onToggle);
                });
                card.append(btn);
            }
            batch.push(card[0]);
        });
        if (batch.length) this.elements.securityGrid.append(batch);
    }
    
    renderGeneratorRoom() {
        State.generatorCheckedThisTurn = true;
        
        // Update warnings immediately
        if (this.elements.genWarningGame) this.elements.genWarningGame.addClass('hidden');
        if (this.elements.genWarningShelter) this.elements.genWarningShelter.addClass('hidden');
        if (this.elements.genWarningPanel) this.elements.genWarningPanel.removeClass('hidden'); // Show maintenance info in panel
        
        // Refresh game actions to restore normal buttons
        this.updateGameActions();
        this.updateInspectionTools();
        this.updateStats(State.paranoia, State.cycle, State.dayTime, State.config.dayLength, State.currentNPC);

        const panel = this.elements.generatorPanel;
        const bar = this.elements.generatorPowerBar;
        const modeLabel = this.elements.generatorModeLabel;
        const power = Math.max(0, Math.min(100, State.generator.power));
        
        // Colores centralizados
        let color = State.generator.isOn ? State.colors.energy : State.colors.off;
        if (State.generator.isOn && State.generator.mode === 'overload') {
            color = State.colors.overload;
        }

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
            const isPowerOn = State.generator.isOn;
            const opacity = i < activeBlocks ? 1 : 0.1;
            const blockColor = isPowerOn ? color : '#333';
            
            // Añadir un pequeño retraso aleatorio para la animación de entrada
            const delay = i * 30;
            
            const block = $('<div>', {
                css: {
                    flex: '1',
                    height: '100%',
                    background: blockColor,
                    opacity: 0, // Inicia invisible para la animación
                    boxShadow: i < activeBlocks && isPowerOn ? `0 0 8px ${color}` : 'none',
                    transition: 'all 0.3s ease',
                    transform: 'scaleY(0.5)'
                }
            });

            bar.append(block);

            // Animación de entrada
            setTimeout(() => {
                block.css({
                    opacity: opacity,
                    transform: 'scaleY(1)'
                });

                // Efecto de parpadeo aleatorio sutil si está encendido
                if (isPowerOn && i < activeBlocks) {
                    const flicker = () => {
                        if (!State.generator.isOn) return;
                        const rand = Math.random();
                        if (rand > 0.98) {
                            block.css('opacity', 0.5);
                            setTimeout(() => block.css('opacity', 1), 50 + Math.random() * 100);
                        }
                        setTimeout(flicker, 1000 + Math.random() * 3000);
                    };
                    flicker();
                }
            }, delay);
        }
        
        modeLabel.text(State.generator.isOn ? State.generator.mode.toUpperCase() : 'APAGADO');
        modeLabel.css('color', color);

        const toggleBtn = $('#btn-gen-toggle');
        // Verificar si está bloqueado por sobrecarga
        const isLocked = State.generator.blackoutUntil > Date.now();
        if (isLocked) {
            toggleBtn.prop('disabled', true).addClass('opacity-50 grayscale cursor-wait');
            toggleBtn.html('<i class="fa-solid fa-plug-circle-exclamation"></i> BLOQUEADO');
            // Auto-refrescar cuando se desbloquee
            setTimeout(() => this.renderGeneratorRoom(), State.generator.blackoutUntil - Date.now() + 100);
        } else {
            toggleBtn.prop('disabled', false).removeClass('opacity-50 grayscale cursor-wait');
            toggleBtn.html(State.generator.isOn ? '<i class="fa-solid fa-power-off"></i> APAGAR' : '<i class="fa-solid fa-bolt"></i> ENCENDER');
        }

        const setToggleVisuals = () => {
            toggleBtn.toggleClass('horror-btn-primary', State.generator.isOn);
            toggleBtn.removeClass('btn-off btn-on');
            if (State.generator.isOn) {
                toggleBtn.addClass('btn-on');
                toggleBtn.find('i').css('color', State.colors.safe);
                toggleBtn.text('').append($('<i>', { class: 'fa-solid fa-power-off' })).append($('<span>', { text: ' ON', class: 'ml-2' }));
            } else {
                toggleBtn.addClass('btn-off');
                toggleBtn.find('i').css('color', State.colors.off);
                toggleBtn.text('').append($('<i>', { class: 'fa-solid fa-power-off' })).append($('<span>', { text: ' OFF', class: 'ml-2' }));
            }
        };

        setToggleVisuals();

        // Actualizar resumen de estado (Fuera del manual)
        const statusSummary = $('#generator-status-summary');
        if (statusSummary.length) {
            const statusHtml = `
                <span>ESTADO: <span class="${State.generator.isOn ? 'text-chlorine-light' : 'text-alert'}">${State.generator.isOn ? 'OPERATIVO' : 'OFF'}</span></span>
                <span>MODO: <span class="text-white">${State.generator.isOn ? State.generator.mode.toUpperCase() : 'N/A'}</span></span>
            `;
            statusSummary.html(statusHtml);
        }

        toggleBtn.off('click').on('click', () => {
            if (window.game) window.game.toggleGenerator();
            else {
                State.generator.isOn = !State.generator.isOn;
                if (!State.generator.isOn) State.generator.mode = 'normal';
                this.renderGeneratorRoom();
            }
            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            toggleBtn.addClass('animate__animated animate__pulse');
            setTimeout(() => toggleBtn.removeClass('animate__animated animate__pulse'), 300);
        });

        // Configurar botones de modo con restricción de potencia
        const btnSave = $('#btn-gen-save');
        const btnNormal = $('#btn-gen-normal');
        const btnOver = $('#btn-gen-over');

        const handleModeSwitch = (newMode, newCap) => {
            const currentMax = State.generator.maxModeCapacityReached;
            const npc = State.currentNPC;
            
            // Si hay un NPC y ya se ha realizado alguna acción (scan o diálogo), aplicamos la restricción
            const actionTaken = (npc && npc.scanCount > 0) || State.dialogueStarted;

            if (actionTaken && newCap > currentMax) {
                this.showFeedback(`SISTEMA BLOQUEADO: No puedes subir la potencia tras interactuar con el civil.`, "yellow");
                if (this.audio) this.audio.playSFXByKey('ui_error', { volume: 0.5 });
                return false;
            }

            State.generator.mode = newMode;
            // Actualizamos el techo de capacidad (solo si hay acciones se vuelve restrictivo para el futuro)
            State.generator.maxModeCapacityReached = newCap; 
            
            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.showFeedback(`MODO ${newMode.toUpperCase()} ACTIVADO`, "green");
            this.renderGeneratorRoom();
            return true;
        };

        btnSave.off('click').on('click', () => handleModeSwitch('save', 1));
        btnNormal.off('click').on('click', () => handleModeSwitch('normal', 2));
        
        // El botón Overload se bloquea si hay enfriamiento
        if (State.generator.overclockCooldown) {
            btnOver.prop('disabled', true).addClass('opacity-50 grayscale cursor-not-allowed');
            btnOver.attr('title', 'BLOQUEADO: Espera al siguiente turno');
        } else {
            btnOver.prop('disabled', false).removeClass('opacity-50 grayscale cursor-not-allowed');
            btnOver.attr('title', 'Sobrecarga el sistema (Overclock)');
        }

        btnOver.off('click').on('click', () => {
            if (State.generator.overclockCooldown) return;
            
            if (handleModeSwitch('overload', 3)) {
                if (this.audio) this.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
                if (Math.random() < 0.35) {
                    const now = Date.now();
                    State.generator.blackoutUntil = now + 1200;
                    this.applyBlackout(1200);
                }
            }
        });

        btnSave.toggleClass('horror-btn-primary', State.generator.mode === 'save');
        btnNormal.toggleClass('horror-btn-primary', State.generator.mode === 'normal');
        btnOver.toggleClass('horror-btn-primary', State.generator.mode === 'overload');
        
        $('#btn-gen-manual-toggle').off('click').on('click', () => {
            $('#generator-manual').toggleClass('hidden');
        });
    }
    
    showTypedModal(type = 'normal', title = '', body = '', onClose) {
        const modal = this.elements.msgModal;
        const content = this.elements.msgContent;
        const btn = this.elements.msgBtn;
        modal.removeClass('hidden').addClass('flex');
        content.html(`<div class="modal-${type}-icon mr-2 inline-block"></div><span>${title ? title + '<br>' : ''}${body}</span>`);
        modal.removeClass('modal-normal modal-lore modal-death modal-warning').addClass(`modal-${type}`);
        if (this.audio) this.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });
        btn.off('click').on('click', () => {
            modal.addClass('hidden').removeClass('flex');
            if (this.audio) this.audio.playSFXByKey('ui_modal_close', { volume: 0.5 });
            if (onClose) onClose();
        });
    }

    showConfirm(text, onYes, onCancel) {
        const modal = this.elements.confirmModal;
        const content = this.elements.confirmContent;
        const yesBtn = this.elements.confirmYes;
        const cancelBtn = this.elements.confirmCancel;

        modal.removeClass('hidden').addClass('flex');
        content.text(text);
        
        if (this.audio) this.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });

        yesBtn.off('click').on('click', () => {
            modal.addClass('hidden').removeClass('flex');
            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.6 });
            if (onYes) onYes();
        });

        cancelBtn.off('click').on('click', () => {
            modal.addClass('hidden').removeClass('flex');
            if (this.audio) this.audio.playSFXByKey('ui_modal_close', { volume: 0.5 });
            if (onCancel) onCancel();
        });
    }
    
    applyBlackout(ms = 1200) {
        const target = $('#screen-game').find('main.vhs-target');
        const overlay = $('<div>', { class: 'blackout', css: { position: 'fixed', inset: 0, background: '#000', opacity: 0.0, pointerEvents: 'none', zIndex: 9999 } });
        $('body').append(overlay);
        const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const step = (now) => {
            const t = Math.min(1, (now - start) / ms);
            overlay.css('opacity', t < 0.5 ? t * 0.8 : (1 - t) * 1.6);
            if (t < 1) requestAnimationFrame(step);
            else overlay.remove();
        };
        requestAnimationFrame(step);
    }
    openModal(npc, allowPurge, onPurgeConfirm) { return this.modules.modal.openModal(npc, allowPurge, onPurgeConfirm); }

    showModalError(text) { return this.modules.modal.showModalError(text); }
    clearModalError() { return this.modules.modal.clearModalError(); }
    closeModal(silent = false) { return this.modules.modal.closeModal(silent); }

    showMessage(text, onClose, type = 'normal') { return this.modules.modal.showMessage(text, onClose, type); }

    updateRunStats(state) {
        const admitted = state.admittedNPCs.length;
        const ignored = state.ignoredNPCs.length;
        const purgedInfected = state.purgedNPCs.filter(n => n.isInfected).length;
        const purgedCivil = state.purgedNPCs.filter(n => !n.isInfected).length;
        const civilesMuertos = state.purgedNPCs.filter(n => n.death && n.death.reason === 'asesinado' && !n.isInfected).length;
        const clorosFuera = state.ignoredNPCs.filter(n => n.infected).length;
        const showSensitive = !!(state.lastNight && state.lastNight.occurred);

        $('#stat-run-dialogues').text(state.dialoguesCount);
        $('#stat-run-verifications').text(state.verificationsCount);
        $('#stat-run-admitted').text(admitted);
        $('#stat-run-ignored').text(ignored);
        $('#stat-run-cloros-vistos').text(showSensitive ? state.infectedSeenCount : '—');
        $('#stat-run-cloros-fuera').text(showSensitive ? clorosFuera : '—');
        $('#stat-run-cloros-purgados').text(showSensitive ? purgedInfected : '—');
        $('#stat-run-civiles-muertos').text(civilesMuertos);
        $('#stat-run-civiles-purgados').text(showSensitive ? purgedCivil : '—');
        $('#stat-run-last-night').text(showSensitive ? (state.lastNight.message || '—') : '—');
    }

    updateToolButtons(npc) {
        if (!npc) return;
        const toolMap = {
            'thermometer': 'temperature',
            'flashlight': 'skinTexture',
            'pupils': 'pupils',
            'pulse': 'pulse'
        };

        Object.entries(toolMap).forEach(([toolId, statKey]) => {
            const btn = $(`#btn-tool-${toolId}`);
            if (npc.revealedStats.includes(statKey)) {
                // Estado inhabilitado (UX mejorada)
                btn.prop('disabled', true)
                   .addClass('opacity-20 grayscale pointer-events-none')
                   .css({
                       'cursor': 'not-allowed',
                       'filter': 'grayscale(100%) brightness(0.5)',
                       'border-color': '#444'
                   });
                
                // El dot de estado lo ponemos en un color neutro/apagado
                btn.find('.tool-status-dot').css('background-color', '#333');
            } else {
                // Estado habilitado
                btn.prop('disabled', false)
                   .removeClass('opacity-20 grayscale pointer-events-none')
                   .css({
                       'cursor': 'pointer',
                       'filter': 'none',
                       'border-color': '' // Vuelve al color del CSS
                   });
                btn.find('.tool-status-dot').css('background-color', State.colors.safe);
            }
        });
    }

    flashInfectionEffect(avatar) {
        this.infectionEffectActive = true;
        const head = avatar.find('.avatar-head');
        const eyes = avatar.find('.eye');
        const origHeadColor = head.css('background-color');
        const origEyeColor = eyes.css('background-color');
        avatar.css({ filter: 'hue-rotate(90deg) contrast(130%)' });
        head.css('background-color', State.colors.chlorine);
        eyes.css('background-color', '#ff0000');
        if (this.audio) this.audio.playSFXByKey('morgue_reveal_infected', { volume: 0.5 });
        setTimeout(() => {
            head.css('background-color', origHeadColor);
            eyes.css('background-color', origEyeColor);
            avatar.css({ filter: 'none' });
            this.infectionEffectActive = false;
        }, 120);
    }
    
    animateToolThermometer(value) {
        const container = this.elements.npcDisplay;
        container.css('position', 'relative');
        container.find('.tool-thermo').remove();
        const overlay = $('<div>', { class: 'tool-thermo', css: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 } });
        const tube = $('<div>', { css: { width: '20px', height: '120px', background: '#0a0a0a', border: '1px solid #555', position: 'relative', boxShadow: 'inset 0 0 8px #000' } });
        const isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;
        
        // Colores dinámicos basados en infección (cloro)
        const fillColor = value < 35 
            ? (isInfected ? State.colors.chlorineSutil : State.colors.safe) 
            : (isInfected ? State.colors.chlorineLight : '#a83232');
            
        const fill = $('<div>', { css: { position: 'absolute', bottom: '0px', left: 0, width: '100%', height: '0%', background: fillColor, filter: isInfected ? `drop-shadow(0 0 4px ${State.colors.chlorineSutil})` : 'none' } });
        const ticks = $('<div>', { css: { position: 'absolute', inset: 0 } });
        for (let i = 0; i <= 6; i++) {
            ticks.append($('<div>', { css: { position: 'absolute', left: '20px', bottom: `${i*20}px`, width: '10px', height: '1px', background: '#444' } }));
        }
        tube.append(fill, ticks);
        overlay.append(tube);
        container.append(overlay);
        const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const target = Math.max(0, Math.min(100, Math.round((value / 45) * 100)));
        const step = (now) => {
            const t = Math.min(1, (now - start) / 1800);
            const h = Math.floor(target * t);
            fill.css('height', `${h}%`);
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        if (isInfected) {
            const bubbleLayer = $('<div>', { css: { position: 'absolute', inset: 0, overflow: 'hidden' } });
            overlay.append(bubbleLayer);
            const bubbles = [];
            for (let i = 0; i < 6; i++) {
                const b = $('<div>', { css: { position: 'absolute', bottom: '0', left: `${2 + Math.random()*14}px`, width: '3px', height: '3px', background: '#2d5a27', borderRadius: '50%', opacity: 0.0 } });
                bubbles.push(b);
                bubbleLayer.append(b);
            }
            const bStart = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            const bStep = (now) => {
                const elapsed = now - bStart;
                bubbles.forEach((b, idx) => {
                    const y = (elapsed/12 + idx*20) % 120;
                    b.css({ bottom: `${y}px`, opacity: y > 20 ? 0.25 : 0.0 });
                });
                if (elapsed < 2000) requestAnimationFrame(bStep);
            };
            requestAnimationFrame(bStep);
        }
        setTimeout(() => overlay.remove(), 2200);
    }

    animateToolPupils(type = 'normal') {
        const overlay = $('#pupil-overlay');
        const container = overlay.find('.pupil-eye-container');
        const pupil = $('#giant-pupil');
        
        overlay.removeClass('hidden').addClass('flex');
        
        // Reset pupila
        pupil.css({ width: '24px', height: '24px' });

        // Animación de aparición
        setTimeout(() => {
            container.removeClass('scale-0').addClass('scale-100');
            
            // Reacción de la pupila
            setTimeout(() => {
                const size = type === 'dilated' ? '64px' : '24px';
                pupil.css({ width: size, height: size });
                
                // Efecto de parpadeo/reacción
                if (type === 'dilated') {
                    pupil.addClass('animate-pulse');
                    pupil.css('background', 'radial-gradient(circle, #fff 0%, #00ff00 100%)');
                } else {
                    pupil.css('background', '#fff');
                }
            }, 600);
        }, 50);

        // Desvanecimiento
        setTimeout(() => {
            container.removeClass('scale-100').addClass('scale-0');
            setTimeout(() => {
                overlay.removeClass('flex').addClass('hidden');
                pupil.removeClass('animate-pulse').css('background', '#fff');
            }, 500);
        }, 2200);
    }
    
    animateToolFlashlight(skinTexture, skinColor) {
        const container = this.elements.npcDisplay;
        container.css('position', 'relative');
        container.find('.tool-flash').remove();
        const flash = $('<div>', { class: 'tool-flash', css: { position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.18)', mixBlendMode: 'screen', pointerEvents: 'none', zIndex: 10 } });
        container.append(flash);
        const avatar = container.find('.pixel-avatar');
        const head = avatar.find('.avatar-head');
        const neck = avatar.find('.avatar-neck');
        const origHead = head.css('background-color');
        const origNeck = neck.css('background-color');
        if (skinTexture === 'dry') {
            const tint = 'hue-rotate(90deg) contrast(115%) saturate(110%)';
            avatar.css('filter', tint);
        }
        setTimeout(() => {
            flash.remove();
            avatar.css('filter', 'none');
            head.css('background-color', origHead);
            neck.css('background-color', origNeck);
        }, 900);
    }
    
    animateToolPulse(bpm) {
        const container = this.elements.npcDisplay;
        container.css('position', 'relative');
        container.find('.tool-pulse').remove();
        const overlay = $('<div>', { class: 'tool-pulse', css: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 } });
        const svg = $(document.createElementNS('http://www.w3.org/2000/svg', 'svg')).attr({ width: 220, height: 40 });
        const isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;
        
        // Color de pulso: verde sutil si es cloro
        const strokeColor = isInfected ? State.colors.chlorineSutil : State.colors.safe;
        
        const path = $(document.createElementNS('http://www.w3.org/2000/svg', 'path')).attr({ d: 'M0 20 L20 20 L25 10 L30 30 L35 20 L220 20', stroke: strokeColor, 'stroke-width': 2, fill: 'none' });
        path.css({ filter: `drop-shadow(0 0 4px ${strokeColor})`, transform: isInfected ? 'scaleY(1.08)' : 'none', transformOrigin: 'center' });
        svg.append(path);
        if (isInfected) {
            const pathGhost = $(document.createElementNS('http://www.w3.org/2000/svg', 'path')).attr({ d: 'M0 20 L20 20 L25 11 L30 29 L35 20 L220 20', stroke: '#79ff79', 'stroke-width': 1, fill: 'none', opacity: 0.3 });
            svg.append(pathGhost);
        }
        const dash = 260;
        path.attr({ 'stroke-dasharray': dash, 'stroke-dashoffset': dash });
        overlay.append(svg);
        container.append(overlay);
        const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const baseInterval = Math.max(280, Math.min(900, Math.round(60000 / Math.max(40, Math.min(160, bpm))))); 
        let lastBeat = start;
        const step = (now) => {
            const elapsedSinceBeat = now - lastBeat;
            const t = Math.min(1, (now - start) / 2400);
            const offset = dash * (1 - t);
            path.attr({ 'stroke-dashoffset': offset });
            const variance = isInfected ? (Math.random() * 120 - 60) : 0;
            const intervalMs = Math.max(240, baseInterval + variance);
            if (elapsedSinceBeat >= intervalMs) {
                svg.css('opacity', 0.9);
                setTimeout(() => svg.css('opacity', 1), 120);
                lastBeat = now;
            }
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        setTimeout(() => overlay.remove(), 2600);
    }
}

export class StatsManager {
    constructor() {
        this.dom = {
            rtUsers: $('#stat-rt-users'),
            rtTransactions: $('#stat-rt-transactions'),
            rtEvents: $('#stat-rt-events'),
            rtAlerts: $('#stat-rt-alerts'),
            nightConsolidated: $('#stat-night-consolidated'),
            nightAverage: $('#stat-night-average'),
            nightTrend: $('#stat-night-trend'),
            nightNextRefresh: $('#stat-night-next-refresh'),
            refreshBtn: $('#btn-stats-refresh'),
            panel: $('#stats-panel')
        };
        this.cacheKey = 'stats_cache_v1';
        this.cache = this.loadCache();
        this.realtimeTTL = 5000;
        this.nightlyTTL = 24 * 60 * 60 * 1000;
        this.pollIntervalMs = 5000;
        this.baseUrl = '/api';
        this.useMock = true;
        this.pollTimer = null;
        this.nightTimer = null;
    }

    loadCache() {
        try {
            const raw = localStorage.getItem(this.cacheKey);
            return raw ? JSON.parse(raw) : { realtime: {}, nightly: {} };
        } catch {
            return { realtime: {}, nightly: {} };
        }
    }
    saveCache() {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
        } catch {}
    }

    now() { return Date.now(); }
    isFresh(ts, ttl) { return ts && (this.now() - ts) < ttl; }

    async fetchJSON(url) {
        if (this.useMock) {
            return this.mockResponse(url);
        }
        try {
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            return this.mockResponse(url);
        }
    }

    mockResponse(url) {
        // Simple deterministic mock based on URL hash
        const seed = Array.from(url).reduce((a, c) => a + c.charCodeAt(0), 0);
        const rand = (min, max, s = seed) => {
            const x = Math.sin(s++) * 10000;
            return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
        };
        if (url.includes('/rt')) {
            return {
                users: rand(50, 150),
                transactions: rand(1000, 5000),
                events: rand(200, 800),
                alerts: rand(0, 20)
            };
        }
        if (url.includes('/nightly')) {
            const consolidated = rand(20000, 30000);
            const average = rand(18000, 26000);
            const trendPct = Math.round(((consolidated - average) / Math.max(1, average)) * 100);
            return {
                consolidated,
                average,
                trendPct
            };
        }
        return {};
    }

    formatNumber(n) {
        return new Intl.NumberFormat('es-ES').format(n);
    }

    async updateRealtime(force = false) {
        const c = this.cache.realtime;
        if (!force && this.isFresh(c.ts, this.realtimeTTL)) {
            this.updateUIRealtime(c.data);
            console.info('[Stats] Realtime from cache');
            return;
        }
        const data = await this.fetchJSON(`${this.baseUrl}/rt/counters`);
        this.cache.realtime = { ts: this.now(), data };
        this.saveCache();
        this.updateUIRealtime(data);
        console.info('[Stats] Realtime fetched', data);
    }

    updateUIRealtime(data) {
        this.dom.rtUsers.text(this.formatNumber(data.users ?? 0));
        this.dom.rtTransactions.text(this.formatNumber(data.transactions ?? 0));
        this.dom.rtEvents.text(this.formatNumber(data.events ?? 0));
        this.dom.rtAlerts.text(this.formatNumber(data.alerts ?? 0));
    }

    async updateNightly(force = false) {
        const n = this.cache.nightly;
        if (!force && this.isFresh(n.ts, this.nightlyTTL)) {
            this.updateUINightly(n.data);
            this.updateNextRefreshLabel();
            console.info('[Stats] Nightly from cache');
            return;
        }
        const data = await this.fetchJSON(`${this.baseUrl}/nightly/metrics`);
        this.cache.nightly = { ts: this.now(), data };
        this.saveCache();
        this.updateUINightly(data);
        this.updateNextRefreshLabel();
        console.info('[Stats] Nightly fetched', data);
    }

    updateUINightly(data) {
        const consolidated = data.consolidated ?? 0;
        const average = data.average ?? 0;
        const trendPct = data.trendPct ?? 0;
        this.dom.nightConsolidated.text(this.formatNumber(consolidated));
        this.dom.nightAverage.text(this.formatNumber(average));
        const sign = trendPct > 0 ? '+' : '';
        this.dom.nightTrend
            .text(`${sign}${trendPct}%`)
            .removeClass('trend-up trend-down')
            .addClass(trendPct >= 0 ? 'trend-up' : 'trend-down');
    }

    updateNextRefreshLabel() {
        const nextMidnight = this.computeNextMidnight();
        const fmt = nextMidnight.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' });
        this.dom.nightNextRefresh.text(fmt);
    }

    computeNextMidnight() {
        const d = new Date();
        d.setHours(24, 0, 0, 0);
        return d;
    }

    scheduleNightly() {
        if (this.nightTimer) clearTimeout(this.nightTimer);
        const ms = this.computeNextMidnight().getTime() - this.now();
        this.nightTimer = setTimeout(async () => {
            await this.updateNightly(true);
            this.scheduleNightly();
        }, Math.max(1000, ms));
        this.updateNextRefreshLabel();
        console.info('[Stats] Nightly scheduled in ms:', Math.max(1000, ms));
    }

    startPollingRealtime() {
        if (this.pollTimer) clearInterval(this.pollTimer);
        this.pollTimer = setInterval(() => this.updateRealtime(false), this.pollIntervalMs);
    }

    bindActions() {
        this.dom.refreshBtn.off('click').on('click', async () => {
            await this.updateRealtime(true);
            await this.updateNightly(true);
            console.info('[Stats] Manual refresh triggered');
        });
    }

    async start() {
        this.bindActions();
        await this.updateRealtime(true);
        await this.updateNightly(false);
        this.startPollingRealtime();
        this.scheduleNightly();
        this.applyResponsiveBehavior();
    }

    applyResponsiveBehavior() {
        const panel = this.dom.panel;
        const update = () => {
            const small = window.matchMedia('(max-width: 768px)').matches;
            panel.toggleClass('w-full', small);
            panel.toggleClass('border-l', !small);
            panel.toggleClass('border-t', small);
        };
        update();
        $(window).on('resize', update);
    }
}
