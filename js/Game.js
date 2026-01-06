import { NPC } from './NPC.js';
import { State } from './State.js';
import { UIManager, StatsManager } from './UIManager.js';
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
        $('#nav-guard').on('click', () => { this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.ui.showScreen('game'); });
        $('#nav-room').on('click', () => { this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.openRoom(); });
        $('#nav-shelter').on('click', () => { this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.openShelter(); });
        $('#nav-morgue').on('click', () => { this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.openMorgue(); });
        $('#nav-generator').on('click', () => { this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.openGenerator(); });
        $('#nav-morgue-stats').on('click', () => this.toggleMorgueStats());
        $('#btn-audio-diagnostics').on('click', () => {
            const logs = this.audio.getLogString();
            this.ui.showMessage(logs, () => {}, 'normal');
        });
        $('#btn-audio-validate').on('click', async () => {
            const report = await this.audio.validateManifest();
            this.ui.showMessage(report, () => {}, 'normal');
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
            if (confirm('¿Reiniciar el día actual? Perderás el progreso de hoy.')) {
                this.restartDay();
            }
        });

        $('#btn-pause-restart-game').on('click', () => {
            if (confirm('¿Nueva partida? Perderás TODO el progreso.')) {
                this.restartGame();
            }
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

        // Game Actions
        $('#btn-admit').on('click', () => { if (State.paused) return; $('#btn-admit').addClass('btn-click-flash'); setTimeout(()=>$('#btn-admit').removeClass('btn-click-flash'),220); this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.handleDecision('admit'); });
        $('#btn-ignore').on('click', () => { if (State.paused) return; $('#btn-ignore').addClass('btn-click-flash'); setTimeout(()=>$('#btn-ignore').removeClass('btn-click-flash'),220); this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); this.handleDecision('ignore'); });
        
        // Tools
        $('#tool-thermo').on('click', () => { if (State.paused) return; $('#tool-thermo').addClass('btn-click-flash'); setTimeout(()=>$('#tool-thermo').removeClass('btn-click-flash'),220); this.inspect('thermometer'); });
        $('#tool-flash').on('click', () => { if (State.paused) return; $('#tool-flash').addClass('btn-click-flash'); setTimeout(()=>$('#tool-flash').removeClass('btn-click-flash'),220); this.inspect('flashlight'); });
        $('#tool-pulse').on('click', () => { if (State.paused) return; $('#tool-pulse').addClass('btn-click-flash'); setTimeout(()=>$('#tool-pulse').removeClass('btn-click-flash'),220); this.inspect('pulse'); });
        $('#tool-pupils').on('click', () => { if (State.paused) return; $('#tool-pupils').addClass('btn-click-flash'); setTimeout(()=>$('#tool-pupils').removeClass('btn-click-flash'),220); this.inspect('pupils'); });

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
        this.ui.hideFeedback();
        this.ui.renderNPC(State.currentNPC);
        this.ui.updateToolButtons(State.currentNPC);
        
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
        if (this.isAnimating) return; // Evitar superposición
        const npc = State.currentNPC;
        
        // Verificar si el test ya se hizo para este NPC
        const toolMap = {
            'thermometer': 'temperature',
            'flashlight': 'skinTexture',
            'pupils': 'pupils',
            'pulse': 'pulse'
        };
        const statKey = toolMap[tool];
        if (npc.revealedStats.includes(statKey)) {
            this.ui.showFeedback("TEST YA REALIZADO", "yellow");
            return;
        }

        // Limit checks
        if (npc.scanCount >= npc.maxScans) {
            this.ui.showFeedback("MÁXIMO DE ESCANEOS ALCANZADO", "red");
            return;
        }

        this.isAnimating = true;
        State.verificationsCount++;
        npc.scanCount++;
        let result = "";
        let color = "yellow";
        let animDuration = 1000;

        switch(tool) {
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

        // Bloquear el botón específico
        this.ui.updateToolButtons(npc);

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

        if (npc.scanCount <= 0 && !npc.optOut) {
            this.ui.showValidationGate(npc);
            return;
        }
        if (action === 'admit') {
            if (State.isShelterFull()) {
                this.ui.showMessage("REFUGIO LLENO. Debes purgar a alguien desde la pantalla de Refugio.", null, 'warning');
                return;
            }
            State.addAdmitted(npc);
        } else if (action === 'ignore') {
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
        this.ui.renderMorgueGrid(State.purgedNPCs, (npc) => {
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
            // Si está apagado, quizás recupera un poco de energía muy lentamente
            State.generator.power = Math.min(100, State.generator.power + 2);
            return;
        }

        const config = State.config.generator;
        const mode = State.generator.mode;
        
        // 1. Consumir energía
        const consumption = config.consumption[mode] || 5;
        State.generator.power = Math.max(0, State.generator.power - consumption);

        // 2. Calcular probabilidad de fallo
        let failChance = config.failureChance[mode] || 0.05;
        
        // Si la energía es baja, el fallo es más probable
        if (State.generator.power < 20) failChance += 0.2;
        if (State.generator.power <= 0) failChance = 1.0;

        if (Math.random() < failChance) {
            this.triggerGeneratorFailure();
        }
    }

    triggerGeneratorFailure() {
        State.generator.isOn = false;
        
        // Feedback inmediato
        this.audio.playSFXByKey('glitch_low', { volume: 0.8 });
        this.ui.applyVHS(1.0, 1000); // Glitch fuerte
        
        let msg = "¡FALLO DEL GENERADOR! SISTEMAS EN RESERVA.";
        let color = "red";

        if (State.generator.mode === 'overload') {
            msg = "¡COLAPSO POR SOBRECARGA! EL GENERADOR SE HA BLOQUEADO.";
            // En overload, el apagón dura más o es más crítico
            State.generator.blackoutUntil = Date.now() + 5000; 
        } else if (State.generator.power <= 0) {
            msg = "GENERADOR AGOTADO. RECARGA NECESARIA.";
        }

        this.ui.showFeedback(msg, color);
        
        // Si el jugador está en la pantalla del generador, refrescarla
        if ($('#screen-generator').is(':visible')) {
            this.ui.renderGeneratorRoom();
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
                this.ui.showLore('night_player_death', () => window.location.reload());
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
                    window.location.reload();
                });
            }
            return;
        }

        // Sin infectados dentro: leve posibilidad de muerte del guardia
        if (Math.random() < (State.config.noInfectedGuardDeathChance || 0.05)) {
            State.lastNight.message = "Aunque no había cloro dentro, algo te encontró en la oscuridad.";
            State.lastNight.victims = 1;
            this.ui.showLore('night_player_death', () => {
                window.location.reload();
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
                this.ui.showLore('final_death_alone', () => window.location.reload());
                return;
            }
        }

        // Chequeo de muerte por paranoia antes de escapar
        const chance = Math.min(0.10, State.paranoia / 100);
        if (Math.random() < chance) {
            this.audio.playSFXByKey('escape_attempt', { volume: 0.6 });
            this.ui.showLore('final_death_paranoia', () => window.location.reload());
            return;
        }

        // Jugador infectado: final personalizado
        if (State.playerInfected) {
            this.audio.playSFXByKey('escape_attempt', { volume: 0.6 });
            this.ui.showLore('final_player_infected_escape', () => window.location.reload());
            return;
        }

        // Finales adicionales
        if (count <= 1) {
            this.ui.showLore('final_death_alone', () => window.location.reload());
            return;
        }
        if (allInfected) {
            this.ui.showLore('final_death_all_infected', () => window.location.reload());
            return;
        }

        // Finales originales
        this.ui.showLore('pre_final', () => {
            if (infectedCount === 0) {
                this.ui.showLore('final_clean', () => window.location.reload());
            } else {
                this.ui.showLore('final_corrupted', () => window.location.reload());
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
            this.ui.showMessage("ALARMA ACTIVADA: Se detectó intrusión durante la noche.", () => {}, 'warning');
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
                    if(msg) this.ui.showMessage(msg, () => {}, 'warning');
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
