import { NPC } from './NPC.js';
import { State } from './State.js';
import { UIManager } from './UIManager.js';
import { StatsManager } from './StatsManager.js';
import { AudioManager } from './AudioManager.js';

class Game {
    constructor() {
        this.audio = new AudioManager();
        this.ui = new UIManager(this.audio);
        this.stats = new StatsManager();
        this.isAnimating = false; // Bloquear acciones durante animaciones
        this.bindEvents();
        this.audio.loadManifest('assets/audio/audio_manifest.json');
        this.initStats();
    }

    bindEvents() {
        $('#tool-thermo, #tool-flash, #tool-pulse, #tool-pupils, #btn-admit, #btn-ignore').addClass('btn-interactive');
        // Start & Settings
        $('#btn-start-game').on('click', () => { this.audio.unlock(); this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.startGame(); });
        $('#btn-settings-toggle').on('click', () => {
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            $('#config-volume-master').val(Math.round(this.audio.master * 100));
            $('#config-volume-ambient').val(Math.round(this.audio.levels.ambient * 100));
            $('#config-volume-lore').val(Math.round(this.audio.levels.lore * 100));
            $('#config-volume-sfx').val(Math.round(this.audio.levels.sfx * 100));
            this.ui.showScreen('settings');
        });
        $('#btn-close-settings').on('click', () => {
            // Save config
            State.config.maxShelterCapacity = parseInt($('#config-max-shelter').val());
            State.config.dayLength = parseInt($('#config-day-length').val());
            State.config.dayAfterTestsDefault = parseInt($('#config-dayafter-tests').val());
            const mv = Math.max(0, Math.min(100, parseInt($('#config-volume-master').val()))) / 100;
            const av = Math.max(0, Math.min(100, parseInt($('#config-volume-ambient').val()))) / 100;
            const lv = Math.max(0, Math.min(100, parseInt($('#config-volume-lore').val()))) / 100;
            const sv = Math.max(0, Math.min(100, parseInt($('#config-volume-sfx').val()))) / 100;
            this.audio.setMasterVolume(mv);
            this.audio.setChannelLevel('ambient', av);
            this.audio.setChannelLevel('lore', lv);
            this.audio.setChannelLevel('sfx', sv);
            if (State.cycle === 1 && State.dayTime === 1) this.ui.showScreen('start');
            else this.ui.showScreen('game');
        });

        // Navigation
        $('#nav-guard').on('click', () => { this.ui.lastNav = 'game'; this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.ui.showScreen('game'); });
        $('#nav-room').on('click', () => { this.ui.lastNav = 'room'; this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.openRoom(); });
        $('#nav-shelter').on('click', () => { this.ui.lastNav = 'shelter'; this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.openShelter(); });
        $('#nav-morgue').on('click', () => { this.ui.lastNav = 'morgue'; this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.openMorgue(); });
        $('#nav-generator').on('click', () => { this.ui.lastNav = 'generator'; this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.openGenerator(); });
        $('#nav-morgue-stats').on('click', () => this.toggleMorgueStats());
        $('#btn-audio-diagnostics').on('click', () => {
            const logs = this.audio.getLogString();
            this.ui.showMessage(logs, () => { }, 'normal');
        });
        $('#btn-audio-validate').on('click', async () => {
            const report = await this.audio.validateManifest();
            this.ui.showMessage(report, () => { }, 'normal');
        });
        $('#btn-pause').on('click', () => {
            State.paused = true;
            $('body').addClass('paused');
            $('#screen-game').addClass('is-paused');
            $('#modal-pause').removeClass('hidden').addClass('flex');
            $('#toggle-mute-music').prop('checked', (this.audio.levels.ambient === 0 && this.audio.levels.lore === 0));
            $('#toggle-mute-sfx').prop('checked', (this.audio.levels.sfx === 0));
        });
        $('#btn-pause-close').on('click', () => {
            $('#modal-pause').addClass('hidden').removeClass('flex');
            State.paused = false;
            $('body').removeClass('paused');
            $('#screen-game').removeClass('is-paused');
        });

        $('#btn-pause-restart-day').on('click', () => {
            this.ui.showConfirm('¿REINICIAR EL DÍA ACTUAL? SE PERDERÁ TODO EL PROGRESO DE HOY.', () => {
                this.restartDay();
            });
        });

        $('#btn-pause-restart-game').on('click', () => {
            this.ui.showConfirm('¿INICIAR NUEVA PARTIDA? SE PERDERÁ TODO EL PROGRESO ACTUAL.', () => {
                this.restartGame();
            });
        });

        // Final stats navigation
        $('#btn-final-to-start').on('click', () => {
            State.reset();
            this.ui.showScreen('start');
        });

        $('#toggle-mute-music').on('change', (e) => {
            const checked = $(e.target).is(':checked');
            if (checked) {
                this.prevMusicLevels = { ambient: this.audio.levels.ambient, lore: this.audio.levels.lore };
                this.audio.setChannelLevel('ambient', 0);
                this.audio.setChannelLevel('lore', 0);
            } else {
                const prev = this.prevMusicLevels || { ambient: 0.28, lore: 0.5 };
                this.audio.setChannelLevel('ambient', prev.ambient);
                this.audio.setChannelLevel('lore', prev.lore);
            }
        });
        $('#toggle-mute-sfx').on('change', (e) => {
            const checked = $(e.target).is(':checked');
            if (checked) {
                this.prevSfxLevel = this.audio.levels.sfx;
                this.audio.setChannelLevel('sfx', 0);
            } else {
                this.audio.setChannelLevel('sfx', this.prevSfxLevel ?? 1.0);
            }
        });

        // Game Actions (Delegated to handle dynamic updates if any)
        $(document).on('click', '#btn-admit', () => {
            if (State.paused) return;
            $('#btn-admit').addClass('btn-click-flash');
            setTimeout(() => $('#btn-admit').removeClass('btn-click-flash'), 220);
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.handleDecision('admit');
        });

        $(document).on('click', '#btn-ignore', () => {
            if (State.paused) return;
            $('#btn-ignore').addClass('btn-click-flash');
            setTimeout(() => $('#btn-ignore').removeClass('btn-click-flash'), 220);
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.handleDecision('ignore');
        });

        // Tools delegation
        $('#inspection-tools-container').on('click', '#tool-thermo', () => { if (State.paused) return; this.inspect('thermometer'); });
        $('#inspection-tools-container').on('click', '#tool-flash', () => { if (State.paused) return; this.inspect('flashlight'); });
        $('#inspection-tools-container').on('click', '#tool-pulse', () => { if (State.paused) return; this.inspect('pulse'); });
        $('#inspection-tools-container').on('click', '#tool-pupils', () => { if (State.paused) return; this.inspect('pupils'); });

        // El botón de ir al generador que aparece cuando está apagado
        $('#inspection-tools-container').on('click', '#btn-goto-generator', () => {
            $('#nav-generator').trigger('click');
        });

        // Night Actions
        $('#btn-sleep').on('click', () => this.sleep());
        $('#btn-night-escape').on('click', () => this.finishRun());

        // Finalize day without purge (visible only at end of day in Shelter)
        $('#btn-finalize-day-no-purge').on('click', () => {
            if (State.isDayOver() && !State.isNight) {
                this.startNightPhase();
            }
        });
    }

    initStats() {
        this.stats.start();
    }

    toggleMorgueStats() {
        this.ui.updateRunStats(State);
        const panel = $('#stats-panel');
        const btn = $('#nav-morgue-stats');
        const hidden = panel.hasClass('hidden');
        panel.toggleClass('hidden', !hidden);
        btn.toggleClass('active', hidden);
        if (hidden) this.audio.playSFXByKey('stats_panel_open', { volume: 0.5 });
    }

    startGame() {
        this.ui.showLore('initial', () => {
            State.reset();
            this.audio.playAmbientByKey('ambient_main_loop', { loop: true, volume: 0.28, fadeIn: 800 });
            this.generateInitialEntrants();
            this.nextTurn();
            this.ui.showScreen('game');
            this.ui.updateRunStats(State);
        });
    }

    restartDay() {
        // Limpiar estado del día actual
        State.dayTime = 1;
        State.admittedNPCs = [];
        State.purgedNPCs = [];
        State.ignoredNPCs = [];
        State.dayClosed = false;
        State.dayEnded = false;
        State.generatorCheckedThisTurn = false;
        State.generator = { isOn: true, mode: 'normal', power: 100, blackoutUntil: 0 };

        // Quitar pausa
        State.paused = false;
        $('body').removeClass('paused');
        $('#screen-game').removeClass('is-paused');
        $('#modal-pause').addClass('hidden').removeClass('flex');

        // Regenerar y reiniciar
        this.generateInitialEntrants();
        this.nextTurn();
        this.ui.showScreen('game');
        this.ui.updateRunStats(State);
        this.ui.showFeedback("DÍA REINICIADO", "yellow");
    }

    restartGame() {
        State.paused = false;
        $('body').removeClass('paused');
        $('#screen-game').removeClass('is-paused');
        $('#modal-pause').addClass('hidden').removeClass('flex');

        this.startGame();
    }

    nextTurn() {
        // Actualizar estado del generador al pasar de turno
        this.updateGenerator();

        // Check Day/Night Cycle
        if (State.isDayOver()) {
            this.ui.showPreCloseFlow((action) => {
                if (action === 'purge') {
                    this.openShelter();
                } else if (action === 'finalize') {
                    this.startNightPhase();
                } else if (action === 'stay') {
                    this.startNightPhase();
                }
            });
            return;
        }

        State.currentNPC = new NPC();
        State.generatorCheckedThisTurn = false; // Resetear para cada nuevo NPC
        State.generator.emergencyEnergyGranted = false; // Resetear flag de energía gratis

        // Resetear límite de capacidad del generador según el modo actual al inicio del turno
        const currentMode = State.generator.mode;
        let initialCap = 2;
        if (currentMode === 'save') initialCap = 1;
        if (currentMode === 'overload') initialCap = 3;
        State.generator.maxModeCapacityReached = initialCap;

        this.ui.hideFeedback();
        this.ui.renderNPC(State.currentNPC);

        if (State.currentNPC.isInfected) {
            State.infectedSeenCount++;
        }
        if (State.interludesShown < 2 && Math.random() < 0.15) {
            State.interludesShown++;
            this.ui.showLore('intermediate', () => {
                this.ui.showScreen('game');
            });
        }
        this.updateHUD();
        this.ui.updateRunStats(State);
    }

    updateHUD() {
        this.ui.updateStats(State.paranoia, State.cycle, State.dayTime, State.config.dayLength, State.currentNPC);
    }

    inspect(tool) {
        if (this.isAnimating) return;
        const npc = State.currentNPC;
        if (!npc) return;

        // Validar estado del generador
        if (!State.generator.isOn) {
            this.ui.showFeedback("GENERADOR APAGADO: ACCIÓN IMPOSIBLE", "red");
            this.updateHUD(); // Sincronizar contador de energía
            return;
        }

        // Definir límite máximo de energías según el modo del generador
        let maxEnergy = 2; // Normal y Activo ahora son iguales
        if (State.generator.mode === 'save') maxEnergy = 1;
        if (State.generator.mode === 'overload') maxEnergy = 3;

        if (npc.scanCount >= maxEnergy) {
            this.ui.showFeedback("ENERGÍA INSUFICIENTE PARA ESTE TURNO", "yellow");
            this.ui.updateInspectionTools(); // Asegurar sincronización visual
            return;
        }

        const statMap = {
            'thermometer': 'temperature',
            'flashlight': 'skinTexture',
            'pupils': 'pupils',
            'pulse': 'pulse'
        };
        const statKey = statMap[tool];

        if (npc.revealedStats.includes(statKey)) {
            this.ui.showFeedback("TEST YA REALIZADO", "yellow");
            this.ui.updateInspectionTools(); // Asegurar sincronización visual
            return;
        }

        this.isAnimating = true;
        State.verificationsCount++;
        npc.scanCount++;
        this.updateHUD(); // Actualizar el HUD inmediatamente (refleja energía en el contador)
        let result = "";
        let color = "yellow";
        let animDuration = 1000;

        switch (tool) {
            case 'thermometer':
                animDuration = 2200;
                result = `TEMP: ${npc.attributes.temperature}°C`;
                if (npc.attributes.temperature < 35) color = '#aaffaa';
                if (!npc.revealedStats.includes('temperature')) npc.revealedStats.push('temperature');
                this.ui.applyVHS(0.4, 700);
                this.ui.animateToolThermometer(npc.attributes.temperature);
                this.audio.playSFXByKey('tool_thermometer_beep', { volume: 0.6 });
                break;
            case 'flashlight':
                animDuration = 900;
                result = `DERMIS: ${this.ui.translateValue('skinTexture', npc.attributes.skinTexture)}`;
                if (!npc.revealedStats.includes('skinTexture')) npc.revealedStats.push('skinTexture');
                this.ui.applyVHS(0.7, 900);
                this.ui.animateToolFlashlight(npc.attributes.skinTexture, npc.visualFeatures.skinColor);
                this.audio.playSFXByKey('tool_uv_toggle', { volume: 0.6 });
                break;
            case 'pupils':
                animDuration = 2200;
                result = `PUPILAS: ${this.ui.translateValue('pupils', npc.attributes.pupils)}`;
                if (!npc.revealedStats.includes('pupils')) npc.revealedStats.push('pupils');
                this.ui.applyVHS(0.6, 800);
                this.ui.animateToolPupils(npc.attributes.pupils);
                this.audio.playSFXByKey('tool_pupils_lens', { volume: 0.6 });
                break;
            case 'pulse':
                animDuration = 2600;
                result = `BPM: ${npc.attributes.pulse}`;
                if (!npc.revealedStats.includes('pulse')) npc.revealedStats.push('pulse');
                this.ui.applyVHS(0.5, 800);
                this.ui.animateToolPulse(npc.attributes.pulse);
                this.audio.playSFXByKey('tool_pulse_beep', { volume: 0.6 });
                break;
        }

        // Bloquear el botón específico y actualizar estado de energías
        this.ui.updateInspectionTools();

        setTimeout(() => {
            this.isAnimating = false;
        }, animDuration);

        // Feedback textual ocultado para que la evidencia no sea explícita en pantalla
        this.updateHUD(); // To update energy
        if (npc.scanCount > 0) {
            this.ui.hideOmitOption();
        }
    }

    handleDecision(action) {
        const npc = State.currentNPC;

        if (npc.scanCount <= 0 && !npc.optOut && !npc.dialogueStarted) {
            this.ui.showValidationGate(npc);
            return;
        }
        if (action === 'admit') {
            if (State.isShelterFull()) {
                this.ui.showMessage("REFUGIO LLENO. Debes purgar a alguien desde la pantalla de Refugio.", null, 'warning');
                return;
            }
            npc.initDayAfterStatus();
            State.addAdmitted(npc);
        } else if (action === 'ignore') {
            npc.exitCycle = State.cycle;
            State.ignoredNPCs.push(npc);
        }

        State.nextSubject();
        this.attemptDayIntrusion();
        this.nextTurn();
        this.ui.updateRunStats(State);
    }

    openShelter() {
        if (!State.dayAfter) {
            State.dayAfter = { testsAvailable: State.config.dayAfterTestsDefault || 5 };
        }
        this.ui.hideFeedback();
        this.ui.renderShelterGrid(State.admittedNPCs, State.config.maxShelterCapacity,
            // On Purge Confirm Logic (Not used directly here, modal handles it)
            null,
            // On Detail Click
            (npc, allowPurge) => {
                this.ui.openModal(npc, allowPurge, (target) => {
                    State.addPurged(target);
                    // Notify morgue nav that a new purga exists
                    if (this.ui && this.ui.setNavItemStatus) {
                        this.ui.setNavItemStatus('nav-morgue', 3);
                    }
                    this.calculatePurgeConsequences(target);
                    // If we are already at end of day, transition to Night after a purge
                    if (State.isDayOver() && !State.isNight) {
                        this.startNightPhase();
                    } else {
                        this.openShelter();
                    }
                });
            }
        );
        this.ui.updateDayAfterSummary(State.admittedNPCs);
        this.ui.showScreen('shelter');
    }

    openRoom() {
        const items = State.securityItems;
        this.ui.renderSecurityRoom(items, (idx, item) => {
            State.securityItems[idx] = item;
        });
        this.ui.showScreen('room');
    }

    openMorgue() {
        // Mapeamos las listas del Estado a las secciones de la UI
        const purged = State.purgedNPCs || [];
        const escaped = State.ignoredNPCs || []; // Los ignorados cuentan como fugitivos/escapados
        const night = State.departedNPCs || [];     // Lista futura para eventos nocturnos

        this.ui.renderMorgueGrid(purged, escaped, night, (npc) => {
            this.ui.openModal(npc, false, null);
        });
        this.ui.showScreen('morgue');
        this.ui.updateRunStats(State);
    }

    openGenerator() {
        this.ui.renderGeneratorRoom();
        this.ui.showScreen('generator');
    }

    updateGenerator() {
        if (!State.generator.isOn) {
            // No hay energía disponible si el generador está apagado
            if (State.currentNPC) {
                State.currentNPC.scanCount = 99; // Valor alto para bloquear cualquier acción
                this.updateHUD();
            }
            return;
        }

        const mode = State.generator.mode;
        const chance = State.config.generator.failureChance[mode];

        // Riesgo de Sobrecarga: probabilidad media de apagón en los próximos 2 turnos
        if (State.generator.overloadRiskTurns > 0) {
            if (Math.random() < 0.25) { // 25% de probabilidad de apagón repentino
                this.triggerGeneratorFailure();
                State.generator.overloadRiskTurns = 0;
                return;
            }
            State.generator.overloadRiskTurns--;
        }

        if (mode === 'overload') {
            // Probabilidad de muerte por sobrecarga si hay pocos civiles
            if (State.admittedNPCs.length < 3 && Math.random() < 0.1) {
                this.gameOver("MUERTE POR SOBRECARGA: El sistema eléctrico colapsó violentamente. La falta de personal para estabilizar los núcleos provocó una explosión térmica.");
                return;
            }
            State.generator.overloadRiskTurns = 2; // Activa el riesgo para los próximos 2 turnos
        }

        // Ahorro garantiza que no se apagará (chance es 0 en config)
        if (Math.random() < chance) {
            this.triggerGeneratorFailure();
        }
    }

    triggerGeneratorFailure() {
        State.generator.isOn = false;
        if (State.currentNPC) {
            State.currentNPC.scanCount = 99; // Disipar energías inmediatamente
        }
        this.shutdownSecuritySystem();
        this.audio.playSFXByKey('glitch_low', { volume: 0.8 });
        this.ui.showFeedback("¡FALLO CRÍTICO DEL GENERADOR!", "red");
        // Mark generator nav as critical
        if (this.ui && this.ui.setNavItemStatus) {
            this.ui.setNavItemStatus('nav-generator', 4);
        }
        this.ui.renderGeneratorRoom();
        this.updateHUD(); // Reflejar pérdida de energía en el contador superior
        this.ui.updateInspectionTools();
    }

    toggleGenerator() {
        const wasOff = !State.generator.isOn;
        State.generator.isOn = !State.generator.isOn;

        if (State.generator.isOn && wasOff) {
            // El generador solo se enciende manualmente
            this.audio.playSFXByKey('generator_start', { volume: 0.7 });

            // Clear generator nav warning when turned on
            if (this.ui && this.ui.setNavItemStatus) {
                this.ui.setNavItemStatus('nav-generator', null);
            }

            // LÓGICA DE ENERGÍA DE EMERGENCIA
            // Si el jugador no ha hecho nada (scanCount=0 y no diálogo) y el generador estaba apagado
            // O si estaba apagado por un fallo (scanCount >= 90)
            const noActivity = State.currentNPC && State.currentNPC.scanCount === 0 && !State.dialogueStarted;
            const hadFailure = State.currentNPC && State.currentNPC.scanCount >= 90;

            if (State.currentNPC && !State.generator.emergencyEnergyGranted && (noActivity || hadFailure)) {
                State.currentNPC.scanCount = 0; // Resetear para que tenga sus energías normales según el modo
                State.generator.emergencyEnergyGranted = true; // Marcar como usado para este NPC
                this.ui.showFeedback("ENERGÍA RESTAURADA: 1 TEST DISPONIBLE", "green");
            } else if (State.currentNPC && State.currentNPC.scanCount >= 90) {
                // Si ya se usó la energía de emergencia o hubo actividad, pero el generador falló,
                // NO restauramos energías gratis. El jugador debe gestionar sus fallos.
                this.ui.showFeedback("GENERADOR REINICIADO (SIN CARGAS EXTRAS)", "yellow");
            }

            if (State.generator.power <= 0) {
                State.generator.power = 1;
                State.generator.overclockCooldown = true;
                this.ui.showFeedback("RECUPERACIÓN DE EMERGENCIA: 1 ENERGÍA. SOBRECARGA BLOQUEADA.", "yellow");
            }
        } else if (!State.generator.isOn) {
            this.audio.playSFXByKey('generator_stop', { volume: 0.6 });
            // Al apagar manualmente por error o voluntad: pierde energías
            if (State.currentNPC) {
                State.currentNPC.scanCount = 99;
            }
            this.shutdownSecuritySystem();

            // Mark nav generator as warning/critical when turned off manually
            if (this.ui && this.ui.setNavItemStatus) {
                this.ui.setNavItemStatus('nav-generator', 4);
            }
            this.ui.showFeedback("GENERADOR APAGADO: ENERGÍA DISIPADA", "red");
        }

        this.ui.renderGeneratorRoom();
        this.updateHUD(); // Sincronizar contador de energía del puesto
        this.ui.updateInspectionTools();
    }

    shutdownSecuritySystem() {
        if (State.securityItems) {
            State.securityItems.forEach(item => {
                if (item.type === 'alarma') item.active = false;
                else item.secured = false;
            });
            // Si la sala es visible, refrescar para mostrar el estado apagado
            if ($('#screen-room').is(':visible')) {
                this.ui.renderSecurityRoom(State.securityItems, (idx, item) => { State.securityItems[idx] = item; });
            }
        }
    }

    calculatePurgeConsequences(npc) {
        if (!npc.isInfected) {
            State.paranoia += 20;
            this.ui.showMessage(`HAS PURGADO A UN HUMANO (${npc.name}). LA PARANOIA AUMENTA.`, null, 'warning');
        } else {
            State.paranoia = Math.max(0, State.paranoia - 5);
            this.ui.showMessage(`AMENAZA ELIMINADA (${npc.name}). BIEN HECHO.`, null, 'normal');
        }
        this.updateHUD();
    }

    startNightPhase() {
        State.isNight = true;
        State.dayClosed = true;
        this.audio.playSFXByKey('night_transition', { volume: 0.5 });
        this.audio.playAmbientByKey('ambient_night_loop', { loop: true, volume: this.audio.levels.ambient, fadeIn: 800 });
        this.processIntrusions();
        this.ui.showScreen('night');
    }

    endGame() {
        this.audio.stopAmbient({ fadeOut: 1000 });
        if (typeof this.ui.renderFinalStats === 'function') {
            this.ui.renderFinalStats(State);
        } else {
            const proto = Object.getPrototypeOf(this.ui);
            if (typeof proto.renderFinalStats === 'function') {
                proto.renderFinalStats.call(this.ui, State);
            }
        }
    }

    sleep() {
        const admitted = State.admittedNPCs;
        const count = admitted.length;
        const infectedInShelter = admitted.filter(n => n.isInfected);
        const civilians = admitted.filter(n => !n.isInfected);
        const allInfected = count > 0 && infectedInShelter.length === count;

        // Refugio vacío: >90% muerte
        if (count === 0) {
            if (Math.random() < 0.92) {
                State.lastNight.message = "Dormiste sin compañía. El refugio no te protegió.";
                State.lastNight.victims = 1;
                this.audio.playSFXByKey('sleep_begin', { volume: 0.5 });
                this.ui.showLore('night_player_death', () => this.endGame());
                return;
            } else {
                State.lastNight.message = "Te mantuviste en vela. Nadie llegó.";
                State.lastNight.victims = 0;
                this.audio.playSFXByKey('sleep_begin', { volume: 0.4 });
                this.ui.showLore('night_tranquil', () => {
                    State.paranoia = Math.max(0, State.paranoia - 5);
                    this.continueDay();
                });
                return;
            }
        }

        // Si hay al menos un infectado dentro: muerte garantizada
        if (infectedInShelter.length > 0) {
            const victimIndex = civilians.length > 0
                ? admitted.findIndex(n => !n.isInfected)
                : -1;
            if (victimIndex > -1) {
                const victim = admitted[victimIndex];
                admitted.splice(victimIndex, 1);
                victim.death = { reason: 'asesinado', cycle: State.cycle, revealed: false };
                State.purgedNPCs.push(victim);
                State.lastNight.message = `Durante la noche, ${victim.name} fue asesinado. Se sospecha presencia de cloro.`;
                State.lastNight.victims = 1;
                this.audio.playSFXByKey('lore_night_civil_death', { volume: 0.5 });
                this.ui.showLore('night_civil_death', () => {
                    State.paranoia += 30;
                    this.continueDay();
                });
            } else {
                State.lastNight.message = "No quedaban civiles. El guardia fue víctima del cloro.";
                State.lastNight.victims = 1;
                this.audio.playSFXByKey('lore_night_player_death', { volume: 0.5 });
                this.ui.showLore('night_player_death', () => {
                    this.endGame();
                });
            }
            return;
        }

        // Sin infectados dentro: leve posibilidad de muerte del guardia
        if (Math.random() < (State.config.noInfectedGuardDeathChance || 0.05)) {
            State.lastNight.message = "Aunque no había cloro dentro, algo te encontró en la oscuridad.";
            State.lastNight.victims = 1;
            this.ui.showLore('night_player_death', () => {
                this.endGame();
            });
            return;
        }

        // Noche tranquila
        State.lastNight.message = "La noche pasó tranquila.";
        State.lastNight.victims = 0;
        this.audio.playSFXByKey('lore_night_tranquil', { volume: 0.4 });
        this.ui.showLore('night_tranquil', () => {
            State.paranoia = Math.max(0, State.paranoia - 10);
            this.continueDay();
        });
    }

    continueDay() {
        State.startNextDay();
        // If purged deaths were revealed, mark the morgue for user attention
        if (this.ui && this.ui.setNavItemStatus) {
            const anyRevealed = State.purgedNPCs.some(n => n.death && n.death.revealed);
            if (anyRevealed) {
                this.ui.setNavItemStatus('nav-morgue', 3);
            }
        }
        this.ui.showScreen('game');
        this.nextTurn();
        this.ui.updateRunStats(State);
    }

    finishRun() {
        const admitted = State.admittedNPCs;
        const count = admitted.length;
        const infectedCount = admitted.filter(n => n.isInfected).length;
        const allInfected = count > 0 && infectedCount === count;

        // Refugio vacío: >90% muerte al escapar
        if (count === 0) {
            if (Math.random() < 0.92) {
                this.audio.playSFXByKey('escape_attempt', { volume: 0.6 });
                this.ui.showLore('final_death_alone', () => this.endGame());
                return;
            }
        }

        // Chequeo de muerte por paranoia antes de escapar
        const chance = Math.min(0.10, State.paranoia / 100);
        if (Math.random() < chance) {
            this.audio.playSFXByKey('escape_attempt', { volume: 0.6 });
            this.ui.showLore('final_death_paranoia', () => this.endGame());
            return;
        }

        // Jugador infectado: final personalizado
        if (State.playerInfected) {
            this.audio.playSFXByKey('escape_attempt', { volume: 0.6 });
            this.ui.showLore('final_player_infected_escape', () => this.endGame());
            return;
        }

        // Finales adicionales
        if (count <= 1) {
            this.ui.showLore('final_death_alone', () => this.endGame());
            return;
        }
        if (allInfected) {
            this.ui.showLore('final_death_all_infected', () => this.endGame());
            return;
        }

        // Finales originales
        this.ui.showLore('pre_final', () => {
            if (infectedCount === 0) {
                this.ui.showLore('final_clean', () => this.endGame());
            } else {
                this.ui.showLore('final_corrupted', () => this.endGame());
            }
        });
    }

    createIntrusion(via, period) {
        const npc = new NPC(State.config.dayIntrusionInfectedChance);
        const stats = ['temperature', 'pulse', 'skinTexture', 'pupils'];
        const s = stats[Math.floor(Math.random() * stats.length)];
        npc.revealedStats.push(s);
        npc.scanCount = 1;
        npc.history = npc.history || [];
        npc.history.push(`Intrusión ${period} por ${via.type}.`);
        State.addAdmitted(npc);
        this.audio.playSFXByKey('intrusion_detected', { volume: 0.6, priority: 1 });
        if (via.type === 'tuberias') this.audio.playSFXByKey('pipes_whisper', { volume: 0.4, priority: 1 });

        // Mark the room and shelter navs as needing attention
        if (this.ui && this.ui.setNavItemStatus) {
            this.ui.setNavItemStatus('nav-room', 4); // critical
            this.ui.setNavItemStatus('nav-shelter', 3); // check shelter for new entrant
        }
    }

    processIntrusions() {
        const items = State.securityItems;
        const prob = State.config.securityIntrusionProbability * State.getIntrusionModifier();
        if (State.isShelterFull()) return;
        if (Math.random() >= prob) return;
        const alarm = items.find(i => i.type === 'alarma');
        const channels = items.filter(i => i.type !== 'alarma' && !i.secured);
        let via = null;
        if (channels.length > 0) {
            via = channels[Math.floor(Math.random() * channels.length)];
        } else if (alarm) {
            via = alarm;
        }
        if (!via) return;
        this.createIntrusion(via, 'nocturna');
        if (alarm && alarm.active) {
            this.ui.showMessage("ALARMA ACTIVADA: Se detectó intrusión durante la noche.", () => { }, 'warning');
        }
    }

    generateInitialEntrants() {
        const maxHalf = Math.floor(State.config.maxShelterCapacity * State.config.initialEntrantMaxFraction);
        for (let i = 0; i < maxHalf; i++) {
            if (State.isShelterFull()) break;
            if (Math.random() < State.config.initialEntrantProbability) {
                const npc = new NPC(0.5); // Sesgo moderado para iniciales
                const stats = ['temperature', 'pulse', 'skinTexture', 'pupils'];
                const s = stats[Math.floor(Math.random() * stats.length)];
                npc.revealedStats.push(s);
                npc.scanCount = 1;
                npc.history = npc.history || [];
                npc.history.push('Ingreso inicial por pertenencia al refugio.');
                State.addAdmitted(npc);
            }
        }
    }

    attemptDayIntrusion() {
        if (State.isShelterFull()) return;
        if (State.nextIntrusionAt && State.dayTime >= State.nextIntrusionAt) {
            const items = State.securityItems;
            const alarm = items.find(i => i.type === 'alarma');
            const channels = items.filter(i => i.type !== 'alarma' && !i.secured);
            const prob = State.config.dayIntrusionProbability * State.getIntrusionModifier();
            if (Math.random() < State.config.dayDeactivationProbability) {
                const securedChannels = items.map((it, idx) => ({ it, idx })).filter(x => x.it.type !== 'alarma' && x.it.secured);
                const activeAlarm = items.map((it, idx) => ({ it, idx })).find(x => x.it.type === 'alarma' && x.it.active);
                let target = null;
                if (securedChannels.length > 0) {
                    target = securedChannels[Math.floor(Math.random() * securedChannels.length)];
                } else if (activeAlarm) {
                    target = activeAlarm;
                }
                if (target) {
                    if (target.it.type === 'alarma') target.it.active = false;
                    else target.it.secured = false;
                    State.securityItems[target.idx] = target.it;
                    if (target.it.type === 'alarma') this.audio.playSFXByKey('alarm_deactivate', { volume: 0.6, priority: 1 });
                    if (target.it.type === 'puerta') this.audio.playSFXByKey('door_unsecure', { volume: 0.6, priority: 1 });
                    if (target.it.type === 'ventana') this.audio.playSFXByKey('window_unsecure', { volume: 0.6, priority: 1 });

                    // Mark the room as needing attention (deactivated channel)
                    if (this.ui && this.ui.setNavItemStatus) {
                        this.ui.setNavItemStatus('nav-room', 3); // warning
                    }

                    if ($('#screen-room').is(':visible')) {
                        this.ui.renderSecurityRoom(State.securityItems, (idx, item) => { State.securityItems[idx] = item; });
                    }
                }
            }
            if (Math.random() < prob) {
                let via = null;
                if (channels.length > 0) {
                    via = channels[Math.floor(Math.random() * channels.length)];
                } else if (alarm) {
                    via = alarm;
                }
                if (via) {
                    this.createIntrusion(via, 'diurna');
                    const msg = alarm && alarm.active
                        ? "ALARMA ACTIVADA: Intrusión detectada durante el día."
                        : "";
                    if (msg) this.ui.showMessage(msg, () => { }, 'warning');
                }
            }
            State.rescheduleIntrusion();
        }
    }
}

// Initialize when DOM is ready (jQuery style)
$(document).ready(() => {
    window.game = new Game();
});
