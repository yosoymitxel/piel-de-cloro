import { State } from './State.js';
import { NPC } from './NPC.js';
import { CONSTANTS } from './Constants.js';

export class GameMechanicsManager {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
    }

    startNightPhase() {
        State.isNight = true;
        State.dayClosed = true;
        
        // Limpiar indicadores y bloquear navegación durante la fase nocturna
        this.ui.clearAllNavStatuses();
        
        // Solo procesar intrusiones si es el inicio de la fase nocturna (no tras volver de purga)
        if (!State.lastNight.occurred) {
            this.processIntrusions();
            State.lastNight.occurred = true;
        }

        // Usar switchScreen para la transición a la pantalla nocturna
        this.game.events.switchScreen(CONSTANTS.SCREENS.NIGHT, {
            force: true,
            lockNav: true,
            sound: 'night_transition',
            renderFn: () => {
                this.audio.playAmbientByKey('ambient_night_loop', { loop: true, volume: this.audio.levels.ambient, fadeIn: 800 });
                this.ui.renderNightScreen(State);
            }
        });
    }

    gameOver(reason) {
        this.audio.playSFXByKey('glitch_burst', { volume: 0.8 });
        this.ui.showMessage(reason, () => {
            this.game.restartGame();
        }, 'danger');
    }

    updateGenerator() {
        if (State.paused) return;
        if (!State.generator.isOn) {
            if (State.currentNPC) {
                State.currentNPC.scanCount = 99;
                this.game.updateHUD();
            }
            return;
        }

        const mode = State.generator.mode;
        const chance = State.config.generator.failureChance[mode];

        if (State.generator.overloadRiskTurns > 0) {
            if (Math.random() < 0.25) {
                this.triggerGeneratorFailure();
                State.generator.overloadRiskTurns = 0;
                return;
            }
            State.generator.overloadRiskTurns--;
        }

        if (mode === 'overload') {
            if (State.admittedNPCs.length < 3 && Math.random() < 0.1) {
                this.game.endings.triggerEnding('final_overload_death');
                return;
            }
            State.generator.overloadRiskTurns = 2;
        }

        if (Math.random() < chance) {
            this.triggerGeneratorFailure();
        }
    }

    triggerGeneratorFailure() {
        State.generator.isOn = false;
        if (State.currentNPC) {
            State.currentNPC.scanCount = 99;
        }
        this.shutdownSecuritySystem();
        this.audio.playSFXByKey('glitch_low', { volume: 0.8 });
        State.addLogEntry('system', 'FALLO CRÍTICO: Generador apagado por inestabilidad.');
        this.ui.showFeedback("¡FALLO CRÍTICO DEL GENERADOR!", "red");
        if (this.ui && this.ui.setNavItemStatus) {
            this.ui.setNavItemStatus(CONSTANTS.NAV_ITEMS.GENERATOR, 4);
        }
        this.ui.renderGeneratorRoom();
        this.game.updateHUD();
        this.ui.updateInspectionTools();
    }

    toggleGenerator() {
        if (State.paused) return;
        const wasOff = !State.generator.isOn;
        State.generator.isOn = !State.generator.isOn;

        if (State.generator.isOn && wasOff) {
            this.audio.playSFXByKey('generator_start', { volume: 0.7 });

            if (this.ui && this.ui.setNavItemStatus) {
                this.ui.setNavItemStatus(CONSTANTS.NAV_ITEMS.GENERATOR, null);
            }

            State.generator.mode = 'save';
            State.generator.power = 32;
            State.generator.overclockCooldown = true;
            State.generator.maxModeCapacityReached = 1;
            State.generator.restartLock = true;
            this.ui.showFeedback("SISTEMA REINICIADO: MODO AHORRO", "yellow");

            const noActivity = State.currentNPC && State.currentNPC.scanCount === 0 && !State.dialogueStarted;
            const hadFailure = State.currentNPC && State.currentNPC.scanCount >= 90;

            if (State.currentNPC && !State.generator.emergencyEnergyGranted && (noActivity || hadFailure)) {
                State.currentNPC.scanCount = 0;
                State.generator.emergencyEnergyGranted = true;
                this.ui.showFeedback("ENERGÍA RESTAURADA: 1 TEST DISPONIBLE", "green");
            } else if (State.currentNPC && State.currentNPC.scanCount >= 90) {
                this.ui.showFeedback("GENERADOR REINICIADO (SIN CARGAS EXTRAS)", "yellow");
            }

            if (State.generator.power <= 0) {
                State.generator.power = 1;
                State.generator.overclockCooldown = true;
                this.ui.showFeedback("RECUPERACIÓN DE EMERGENCIA: 1 ENERGÍA. SOBRECARGA BLOQUEADA.", "yellow");
            }
        } else if (!State.generator.isOn) {
            this.audio.playSFXByKey('generator_stop', { volume: 0.6 });
            if (State.currentNPC) {
                State.currentNPC.scanCount = 99;
            }
            this.shutdownSecuritySystem();

            if (this.ui && this.ui.setNavItemStatus) {
                this.ui.setNavItemStatus('nav-generator', 4);
            }
            this.ui.showFeedback("GENERADOR APAGADO: ENERGÍA DISIPADA", "red");
        }

        this.ui.renderGeneratorRoom();
        this.game.updateHUD();
        this.ui.updateInspectionTools();
    }

    checkSecurityDegradation() {
        const chance = (State.config.dayDeactivationProbability || 0.5) * 0.3;

        if (Math.random() < chance) {
            const items = State.securityItems;
            const securedChannels = items.map((it, idx) => ({ it, idx })).filter(x => x.it.type !== 'alarma' && x.it.secured);
            const activeAlarm = items.map((it, idx) => ({ it, idx })).find(x => x.it.type === 'alarma' && x.it.active);

            let target = null;
            if (securedChannels.length > 0) {
                target = securedChannels[Math.floor(Math.random() * securedChannels.length)];
            } else if (activeAlarm) {
                target = activeAlarm;
            }

            if (target) {
                this.deactivateSecurityItem(target.it, target.idx);
            }
        }
    }

    shutdownSecuritySystem() {
        if (State.securityItems) {
            State.securityItems.forEach(item => {
                if (item.type === 'alarma') item.active = false;
                else item.secured = false;
            });
            if ($('#screen-room').is(':visible')) {
                this.ui.renderSecurityRoom(State.securityItems, (idx, item) => { State.securityItems[idx] = item; });
            }
            this.ui.updateSecurityNavStatus(State.securityItems);
        }
    }

    calculatePurgeConsequences(npc) {
        if (!npc.isInfected) {
            State.updateParanoia(20);
            State.updateSanity(-15);
            this.ui.showMessage(`HAS PURGADO A UN HUMANO (${npc.name}). LA PARANOIA AUMENTA Y TU CORDURA DISMINUYE.`, null, 'warning');
        } else {
            State.updateParanoia(-5);
            State.updateSanity(5);
            this.ui.showMessage(`AMENAZA ELIMINADA (${npc.name}). TU CORDURA SE ESTABILIZA.`, null, 'normal');
        }
        this.game.updateHUD();
    }

    sleep() {
        if (State.paused) return;
        State.isNight = true;
        State.dayClosed = true;
        this.audio.playSFXByKey('night_transition', { volume: 0.5 });
        this.audio.playAmbientByKey('ambient_night_loop', { loop: true, volume: this.audio.levels.ambient, fadeIn: 800 });
        
        const admitted = State.admittedNPCs;
        const count = admitted.length;
        const infectedInShelter = admitted.filter(n => n.isInfected);
        const civilians = admitted.filter(n => !n.isInfected);

        if (count === 0) {
            if (Math.random() < 0.92) {
                State.lastNight.message = "Dormiste sin compañía. El refugio no te protegió.";
                State.lastNight.victims = 1;
                this.audio.playSFXByKey('sleep_begin', { volume: 0.5 });
                this.game.endings.triggerEnding('night_player_death');
                return;
            } else {
                State.lastNight.message = "Te mantuviste en vela. Nadie llegó.";
                State.lastNight.victims = 0;
                this.audio.playSFXByKey('sleep_begin', { volume: 0.4 });
                this.ui.showLore('night_tranquil', () => {
                    State.updateParanoia(-5);
                    this.continueDay();
                });
                return;
            }
        }

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
                    State.updateParanoia(30);
                    this.continueDay();
                });
            } else {
                State.lastNight.message = "No quedaban civiles. El guardia fue víctima del cloro.";
                State.lastNight.victims = 1;
                this.audio.playSFXByKey('lore_night_player_death', { volume: 0.5 });
                this.game.endings.triggerEnding('night_player_death');
            }
            return;
        }

        const baseDeathChance = State.config.noInfectedGuardDeathChance || 0.05;
        const paranoiaModifier = State.paranoia / 250;
        const roll = Math.random();
        if (roll < (baseDeathChance + paranoiaModifier)) {
            State.lastNight.message = State.paranoia > 80 
                ? "Tu mente finalmente cedió. Las sombras del refugio tomaron forma y te arrastraron al vacío."
                : "Aunque no había cloro dentro, algo te encontró en la oscuridad.";
            State.lastNight.victims = 1;
            this.game.endings.triggerEnding('night_player_death');
            return;
        }

        State.lastNight.message = "La noche pasó tranquila.";
        State.lastNight.victims = 0;
        this.audio.playSFXByKey('lore_night_tranquil', { volume: 0.4 });
        this.ui.showLore('night_tranquil', () => {
            State.updateParanoia(-10);
            this.continueDay();
        });
    }

    startNextDay() {
        State.startNextDay();
        
        // Trigger random daily event
        if (this.game.randomEvents) {
            this.game.randomEvents.triggerRandomEvent();
        }
        
        // Restore main ambient music when a new day starts
        if (this.audio) {
            this.audio.playAmbientByKey('ambient_main_loop', { loop: true, volume: 0.28, fadeIn: 1000 });
        }

        if (this.ui) {
            if (this.ui.setNavItemStatus) {
                const anyRevealed = State.purgedNPCs.some(n => n.death && n.death.revealed);
                if (anyRevealed) {
                    this.ui.setNavItemStatus(CONSTANTS.NAV_ITEMS.MORGUE, 3);
                }
            }
        }
        this.game.events.switchScreen(CONSTANTS.SCREENS.GAME, {
            force: true,
            lockNav: false
        });
        this.game.nextTurn();
        this.ui.updateRunStats(State);
    }

    continueDay() {
        this.startNextDay();
    }

    processIntrusions() {
        const items = State.securityItems;
        const prob = State.config.securityIntrusionProbability * State.getIntrusionModifier();
        if (State.isShelterFull()) return;
        if (Math.random() >= prob) return;
        
        const alarm = items.find(i => i.type === 'alarma');
        const otherMethods = items.filter(i => i.type !== 'alarma');
        const unsecuredChannels = otherMethods.filter(i => !i.secured);
        
        let via = null;
        if (otherMethods.length > 0 && unsecuredChannels.length === 0) {
            return;
        }

        if (unsecuredChannels.length > 0) {
            via = unsecuredChannels[Math.floor(Math.random() * unsecuredChannels.length)];
        } else if (otherMethods.length === 0 && alarm) {
            via = alarm;
        }

        if (!via) return;

        this.createIntrusion(via, 'nocturna');
    }

    attemptDayIntrusion() {
        if (State.isShelterFull()) return;
        if (State.nextIntrusionAt && State.dayTime >= State.nextIntrusionAt) {
            const items = State.securityItems;
            const alarm = items.find(i => i.type === 'alarma');
            const otherMethods = items.filter(i => i.type !== 'alarma');
            const unsecuredChannels = otherMethods.filter(i => !i.secured);
            const prob = State.config.dayIntrusionProbability * State.getIntrusionModifier();

            if (Math.random() < prob) {
                let via = null;
                if (otherMethods.length > 0 && unsecuredChannels.length === 0) {
                    State.rescheduleIntrusion();
                    return;
                }

                if (unsecuredChannels.length > 0) {
                    via = unsecuredChannels[Math.floor(Math.random() * unsecuredChannels.length)];
                } else if (otherMethods.length === 0 && alarm) {
                    via = alarm;
                }

                if (via) {
                    this.createIntrusion(via, 'diurna');
                }
            }
            State.rescheduleIntrusion();
        }
    }

    createIntrusion(via, period) {
        const npc = new NPC(State.config.dayIntrusionInfectedChance);
        const stats = ['temperature', 'pulse', 'skinTexture', 'pupils'];
        const s = stats[Math.floor(Math.random() * stats.length)];
        npc.revealedStats.push(s);
        npc.scanCount = 1;
        npc.history = npc.history || [];
        
        const items = State.securityItems || [];
        const alarm = items.find(i => i.type === 'alarma');
        const otherSecured = items.filter(i => i.type !== 'alarma' && i.secured).length;
        
        let logMessage = '';
        const periodText = period === 'diurna' ? 'Día' : 'Noche';
        const timeText = period === 'diurna' ? `Ciclo ${State.cycle}, ${State.dayTime}:00` : `Ciclo ${State.cycle}, Noche`;

        if (alarm && alarm.active) {
            // Alarm is active
            if (via.type === 'alarma' || (otherSecured === 0)) {
                // Alarm was the trigger or it's the only one
                logMessage = `Intrusión ${period} notificada por alarma.`;
            } else {
                // Alarm active but entered through another channel (that might or might not be secured)
                logMessage = `Intrusión ${period} notificada por alarma (Vía ${via.type}).`;
            }
            alarm.active = false;
        } else {
            // No alarm or alarm inactive
            logMessage = `Intrusión detectada vía ${via.type} (${timeText}).`;
        }

        npc.history.push({ text: logMessage, type: 'warning' });
        npc.purgeLockedUntil = State.cycle + 1; 
        State.addLogEntry('system', `ALERTA: ${logMessage}`);
        State.addAdmitted(npc);

        this.audio.playSFXByKey('intrusion_detected', { volume: 0.6, priority: 1 });
        if (via.type === 'tuberias') this.audio.playSFXByKey('pipes_whisper', { volume: 0.4, priority: 1 });

        if (this.ui && this.ui.setNavItemStatus) {
            this.ui.setNavItemStatus('nav-room', 4);
            this.ui.setNavItemStatus('nav-shelter', 3);
        }
        
        if (alarm && alarm.active === false) {
            this.audio.playSFXByKey('alarm_activate', { volume: 0.8 });
            this.ui.showMessage(`ALARMA ACTIVADA: ${logMessage}`, () => { }, 'warning');
        }
    }

    generateInitialEntrants() {
        const maxHalf = Math.floor(State.config.maxShelterCapacity * State.config.initialEntrantMaxFraction);
        for (let i = 0; i < maxHalf; i++) {
            if (State.isShelterFull()) break;
            if (Math.random() < State.config.initialEntrantProbability) {
                const npc = new NPC(0.5);
                const stats = ['temperature', 'pulse', 'skinTexture', 'pupils'];
                const s = stats[Math.floor(Math.random() * stats.length)];
                npc.revealedStats.push(s);
                npc.scanCount = 1;
                npc.history = npc.history || [];
                npc.history.push('Ingreso inicial por pertenencia al refugio.');
                npc.purgeLockedUntil = State.cycle + 1;
                State.addAdmitted(npc);
            }
        }

        if (State.admittedNPCs.length > 0 && this.ui && this.ui.setNavItemStatus) {
            this.ui.setNavItemStatus('nav-shelter', 3);
        }
    }

    deactivateSecurityItem(item, idx) {
        if (item.type === 'alarma') item.active = false;
        else item.secured = false;

        State.securityItems[idx] = item;

        if (item.type === 'alarma') this.audio.playSFXByKey('alarm_deactivate', { volume: 0.6, priority: 1 });
        if (item.type === 'puerta') this.audio.playSFXByKey('door_unsecure', { volume: 0.6, priority: 1 });
        if (item.type === 'ventana') this.audio.playSFXByKey('window_unsecure', { volume: 0.6, priority: 1 });

        this.ui.updateSecurityNavStatus(State.securityItems);

        if ($('#screen-room').is(':visible')) {
            this.ui.renderSecurityRoom(State.securityItems, (idx, it) => { State.securityItems[idx] = it; });
        }
    }

    finishRun() {
        const admitted = State.admittedNPCs;
        const count = admitted.length;
        const max = State.config.maxShelterCapacity;
        const infectedCount = admitted.filter(n => n.isInfected).length;
        const allInfected = count > 0 && infectedCount === count;

        if (count < max) {
            this.ui.showFeedback(`SISTEMA BLOQUEADO: No puedes abandonar tu puesto hasta que el refugio esté lleno (${count}/${max}).`, "alert");
            this.audio.playSFXByKey('glitch_low', { volume: 0.5 });
            return;
        }

        if (!State.generator || !State.generator.isOn) {
            this.game.endings.triggerEnding('final_generator_off');
            return;
        }

        if (count === 0) {
            if (Math.random() < 0.92) {
                this.audio.playSFXByKey('escape_attempt', { volume: 0.6 });
                this.game.endings.triggerEnding('final_death_alone');
                return;
            }
        }

        const chance = Math.min(0.95, State.paranoia / 150);
        if (Math.random() < chance) {
            this.audio.playSFXByKey('escape_attempt', { volume: 0.6 });
            this.game.endings.triggerEnding('final_death_paranoia');
            return;
        }

        if (State.playerInfected) {
            this.audio.playSFXByKey('escape_attempt', { volume: 0.6 });
            this.game.endings.triggerEnding('final_player_infected_escape');
            return;
        }

        if (allInfected) {
            this.game.endings.triggerEnding('final_death_all_infected');
            return;
        }
        if (count <= 1) {
            this.game.endings.triggerEnding('final_death_alone');
            return;
        }

        this.ui.showLore('pre_final', () => {
            if (infectedCount === 0) {
                this.game.endings.triggerEnding('final_clean');
            } else {
                this.game.endings.triggerEnding('final_corrupted');
            }
        });
    }

    // New methods from original Game.js decomposition
    changeGeneratorMode(delta) {
        if (!State.generator.isOn) return;
        const modes = ['save', 'normal', 'overload'];
        let currentIndex = modes.indexOf(State.generator.mode);
        let newIndex = currentIndex + delta;
        
        if (newIndex >= 0 && newIndex < modes.length) {
            const newMode = modes[newIndex];
            const newCap = newIndex + 1;
            
            // Check if capacity increase is allowed
            const npc = State.currentNPC;
            const actionTaken = (npc && npc.scanCount > 0) || State.dialogueStarted || State.generator.restartLock;
            const currentMax = State.generator.maxModeCapacityReached;

            if (actionTaken && newCap > currentMax) {
                this.ui.showFeedback(`SISTEMA BLOQUEADO: No puedes subir la potencia tras interactuar con el civil.`, "yellow");
                this.audio.playSFXByKey('ui_error', { volume: 0.5 });
                return;
            }

            State.generator.mode = newMode;
            State.generator.maxModeCapacityReached = Math.max(currentMax, newCap);
            
            switch (newMode) {
                case 'normal': State.generator.power = 63; break;
                case 'save': State.generator.power = 32; break;
                case 'overload': State.generator.power = 100; break;
            }

            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.ui.showFeedback(`MODO ${newMode.toUpperCase()} ACTIVADO`, "green");
            this.ui.updateInspectionTools();
            this.ui.renderGeneratorRoom();
        }
    }

    handlePurgeFromModal() {
        const target = this.ui.currentModalNPC;
        if (!target) return;

        State.addPurged(target);
        if (State.isNight) {
            State.nightPurgePerformed = true;
        }

        if (this.ui && this.ui.setNavItemStatus) {
            this.ui.setNavItemStatus('nav-morgue', 3);
        }
        
        this.calculatePurgeConsequences(target);
        this.ui.closeModal();

        if (State.isNight) {
            this.startNightPhase();
        } else if (State.isDayOver()) {
            this.startNightPhase();
        } else {
            this.game.events.navigateToShelter();
        }
    }

    clearMorgue() {
        if (State.purgedNPCs.length === 0 && State.ignoredNPCs.length === 0 && State.departedNPCs.length === 0) return;
        
        this.ui.showConfirm('¿VACIAR LA MORGUE? SE ELIMINARÁN TODOS LOS REGISTROS.', () => {
            State.purgedNPCs = [];
            State.ignoredNPCs = [];
            State.departedNPCs = [];
            this.ui.renderMorgueGrid([], [], [], null);
            this.ui.showMessage('MORGUE VACIADA.', null, 'normal');
            if (this.ui.setNavItemStatus) this.ui.setNavItemStatus('nav-morgue', null);
        }, null, 'warning');
    }
}
