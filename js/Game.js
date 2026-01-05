import { NPC } from './NPC.js';
import { State } from './State.js';
import { UIManager, StatsManager } from './UIManager.js';

class Game {
    constructor() {
        this.ui = new UIManager();
        this.stats = new StatsManager();
        this.bindEvents();
        this.initStats();
    }

    bindEvents() {
        // Start & Settings
        $('#btn-start-game').on('click', () => this.startGame());
        $('#btn-settings-toggle').on('click', () => this.ui.showScreen('settings'));
        $('#btn-close-settings').on('click', () => {
             // Save config
             State.config.maxShelterCapacity = parseInt($('#config-max-shelter').val());
             State.config.dayLength = parseInt($('#config-day-length').val());
             State.config.dayAfterTestsDefault = parseInt($('#config-dayafter-tests').val());
             if (State.cycle === 1 && State.dayTime === 1) this.ui.showScreen('start');
             else this.ui.showScreen('game');
        });

        // Navigation
        $('#nav-guard').on('click', () => this.ui.showScreen('game'));
        $('#nav-room').on('click', () => this.openRoom());
        $('#nav-shelter').on('click', () => this.openShelter());
        $('#nav-morgue').on('click', () => this.openMorgue());
        $('#nav-morgue-stats').on('click', () => this.toggleMorgueStats());

        // Game Actions
        $('#btn-admit').on('click', () => this.handleDecision('admit'));
        $('#btn-ignore').on('click', () => this.handleDecision('ignore'));
        
        // Tools
        $('#tool-thermo').on('click', () => this.inspect('thermometer'));
        $('#tool-flash').on('click', () => this.inspect('flashlight'));
        $('#tool-pulse').on('click', () => this.inspect('pulse'));
        $('#tool-pupils').on('click', () => this.inspect('pupils'));

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
    }

    startGame() {
        this.ui.showLore('initial', () => {
            State.reset();
            this.generateInitialEntrants();
            this.nextTurn();
            this.ui.showScreen('game');
            this.ui.updateRunStats(State);
        });
    }

    nextTurn() {
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
        const npc = State.currentNPC;
        
        // Limit checks
        if (npc.scanCount >= npc.maxScans) {
            this.ui.showFeedback("MÁXIMO DE ESCANEOS ALCANZADO", "red");
            return;
        }

        State.verificationsCount++;
        npc.scanCount++;
        let result = "";
        let color = "yellow";

        switch(tool) {
            case 'thermometer':
                result = `TEMP: ${npc.attributes.temperature}°C`;
                if (npc.attributes.temperature < 35) color = '#aaffaa';
                if (!npc.revealedStats.includes('temperature')) npc.revealedStats.push('temperature');
                this.ui.applyVHS(0.4, 700);
                break;
            case 'flashlight':
                result = `DERMIS: ${this.ui.translateValue('skinTexture', npc.attributes.skinTexture)}`;
                if (npc.attributes.skinTexture === 'dry') {
                    // Visual feedback now handled by avatar (maybe glitch or tint if I add it to avatar logic later)
                }
                if (!npc.revealedStats.includes('skinTexture')) npc.revealedStats.push('skinTexture');
                this.ui.applyVHS(0.7, 900);
                break;
            case 'pupils':
                result = `PUPILAS: ${this.ui.translateValue('pupils', npc.attributes.pupils)}`;
                if (!npc.revealedStats.includes('pupils')) npc.revealedStats.push('pupils');
                this.ui.applyVHS(0.6, 800);
                break;
            case 'pulse':
                result = `BPM: ${npc.attributes.pulse}`;
                if (!npc.revealedStats.includes('pulse')) npc.revealedStats.push('pulse');
                this.ui.applyVHS(0.5, 800);
                break;
        }

        this.ui.showFeedback(`[HERRAMIENTA] > ${result}`, color);
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
                this.ui.showMessage("REFUGIO LLENO. Debes purgar a alguien desde la pantalla de Refugio.");
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

    calculatePurgeConsequences(npc) {
        if (!npc.isInfected) {
            State.paranoia += 20; 
            this.ui.showMessage(`HAS PURGADO A UN HUMANO (${npc.name}). LA PARANOIA AUMENTA.`);
        } else {
            State.paranoia = Math.max(0, State.paranoia - 5); 
            this.ui.showMessage(`AMENAZA ELIMINADA (${npc.name}). BIEN HECHO.`);
        }
        this.updateHUD();
    }

    startNightPhase() {
        State.isNight = true;
        State.dayClosed = true;
        this.processIntrusions();
        this.ui.showScreen('night');
    }

    sleep() {
        const admitted = State.admittedNPCs;
        const count = admitted.length;
        const infectedInShelter = admitted.filter(n => n.isInfected);
        const allInfected = count > 0 && infectedInShelter.length === count;

        // Refugio vacío: >90% muerte
        if (count === 0) {
            if (Math.random() < 0.92) {
                State.lastNight.message = "Dormiste sin compañía. El refugio no te protegió.";
                State.lastNight.victims = 1;
                this.ui.showLore('night_player_death', () => window.location.reload());
                return;
            } else {
                State.lastNight.message = "Te mantuviste en vela. Nadie llegó.";
                State.lastNight.victims = 0;
                this.ui.showLore('night_tranquil', () => {
                    State.paranoia = Math.max(0, State.paranoia - 5);
                    this.continueDay();
                });
                return;
            }
        }

        // Condiciones de muerte del guardia
        if (count === 1 || allInfected) {
            State.lastNight.message = count === 1
                ? "El guardia pasó la noche solo. Nadie respondió."
                : "El refugio estaba tomado por el cloro. No hubo humanidad.";
            State.lastNight.victims = 1;
            this.ui.showLore('night_player_death', () => {
                window.location.reload();
            });
            return;
        }

        // Posibilidad de muerte según paranoia (máx 10%)
        const chance = Math.min(0.10, State.paranoia / 100);
        const occurs = infectedInShelter.length > 0 && Math.random() < chance;

        if (occurs) {
            // Elegir víctima civil si existe, si no, muerte del guardia
            const victimIndex = admitted.findIndex(n => !n.isInfected);
            if (victimIndex > -1) {
                const victim = admitted[victimIndex];
                admitted.splice(victimIndex, 1);
                victim.death = { reason: 'asesinado', cycle: State.cycle, revealed: false };
                State.purgedNPCs.push(victim); 
                State.lastNight.message = `Durante la noche, ${victim.name} fue asesinado. Se sospecha presencia de cloro.`;
                State.lastNight.victims = 1;
                this.ui.showLore('night_civil_death', () => {
                    State.paranoia += 30;
                    this.continueDay();
                });
            } else {
                State.lastNight.message = "No quedaban civiles. El guardia fue víctima del cloro.";
                State.lastNight.victims = 1;
                this.ui.showLore('night_player_death', () => {
                    window.location.reload();
                });
            }
            return;
        }

        // Noche tranquila
        State.lastNight.message = "La noche pasó tranquila.";
        State.lastNight.victims = 0;
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
                this.ui.showLore('final_death_alone', () => window.location.reload());
                return;
            }
        }

        // Chequeo de muerte por paranoia antes de escapar
        const chance = Math.min(0.10, State.paranoia / 100);
        if (Math.random() < chance) {
            this.ui.showLore('final_death_paranoia', () => window.location.reload());
            return;
        }

        // Jugador infectado: final personalizado
        if (State.playerInfected) {
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
    
    processIntrusions() {
        const items = State.securityItems;
        const prob = State.config.securityIntrusionProbability;
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
        const npc = new NPC(State.config.dayIntrusionInfectedChance);
        const stats = ['temperature', 'pulse', 'skinTexture', 'pupils'];
        const s = stats[Math.floor(Math.random() * stats.length)];
        npc.revealedStats.push(s);
        npc.scanCount = 1;
        npc.history = npc.history || [];
        npc.history.push(`Intrusión nocturna por ${via.type}. Registro simulado.`);
        State.addAdmitted(npc);
        if (alarm && alarm.active) {
            this.ui.showMessage("ALARMA ACTIVADA: Se detectó intrusión durante la noche.", () => {});
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
                npc.history.push('Ingreso aleatorio inicial. Registro simulado.');
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
            const prob = State.config.dayIntrusionProbability;
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
                    const npc = new NPC(State.config.dayIntrusionInfectedChance);
                    const stats = ['temperature', 'pulse', 'skinTexture', 'pupils'];
                    const s = stats[Math.floor(Math.random() * stats.length)];
                    npc.revealedStats.push(s);
                    npc.scanCount = 1;
                    npc.history = npc.history || [];
                    npc.history.push(`Intrusión diurna por ${via.type}. Registro simulado.`);
                    State.addAdmitted(npc);
                    const msg = alarm && alarm.active
                        ? "ALARMA ACTIVADA: Intrusión detectada durante el día."
                        : "";
                    if(msg) this.ui.showMessage(msg, () => {});
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
