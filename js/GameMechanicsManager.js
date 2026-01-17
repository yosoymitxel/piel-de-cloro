import { State } from './State.js';
import { NPC } from './NPC.js';
import { CONSTANTS } from './Constants.js';

export class GameMechanicsManager {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
        this.nightResolutionHooks = [];
        this.registerDefaultHooks();
    }

    registerNightHook(hookFn) {
        if (typeof hookFn === 'function') {
            this.nightResolutionHooks.push(hookFn);
        }
    }

    registerDefaultHooks() {
        // 1. Hook de Recarga del Generador
        this.registerNightHook((state) => {
            let summary = "";
            // 1. Hook de Recarga del Generador (Consume Combustible)
            if (state.generator.power < 100) {
                const fuelNeeded = 2;
                if (state.fuel >= fuelNeeded) {
                    state.fuel -= fuelNeeded;
                    state.generator.power = Math.min(100, state.generator.power + 25);
                    summary += "Recarga nocturna completada (-2 combustible). ";
                } else if (state.fuel > 0) {
                    state.fuel = 0;
                    state.generator.power = Math.min(100, state.generator.power + 10);
                    summary += "Recarga parcial por falta de combustible. ";
                } else {
                    state.generator.power = Math.min(100, state.generator.power + 5);
                    summary += "Recarga mínima (sin combustible). ";
                }
            }
            return summary;
        });

        // 2. Hook de Soporte Vital
        this.registerNightHook((state) => {
            let summary = "";
            const sys = state.generator.systems;
            if (sys && sys.lifeSupport && !sys.lifeSupport.active) {
                const admitted = state.admittedNPCs;
                for (let i = admitted.length - 1; i >= 0; i--) {
                    const npc = admitted[i];
                    if (npc.trait && npc.trait.id === 'sickly' && Math.random() < 0.5) {
                        admitted.splice(i, 1);
                        npc.death = { reason: 'fallo_soporte_vital', cycle: state.cycle, revealed: false };
                        state.purgedNPCs.push(npc);
                        summary += `${npc.name} ha muerto debido a la falta de soporte vital. `;
                        state.addLogEntry('danger', `CRÍTICO: ${npc.name} falleció por fallo en soporte vital.`, { icon: 'fa-lungs-virus' });
                    }
                }
            }
            return summary;
        });

        // 3. Hook de Inestabilidad por Paranoia
        this.registerNightHook((state) => {
            let summary = "";
            if (state.paranoia > 70 && Math.random() < 0.4) {
                const items = state.securityItems;
                const target = items[Math.floor(Math.random() * items.length)];
                if (target) {
                    if (target.type === 'alarma') target.active = false;
                    else target.secured = false;
                    const targetName = target.type === 'alarma' ? 'ALARMA' : (target.type === 'tuberias' ? 'TUBERÍAS' : target.type.toUpperCase());
                    summary += `La tensión en el sector ha provocado un fallo en: ${targetName}. `;
                }
            }
            return summary;
        });
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

    calculateTotalLoad() {
        if (!State.generator.isOn) return 0;

        let total = State.generator.baseConsumption || 0;

        // Efecto del Guardia: Reduce consumo base si está asignado y saludable
        if (State.generator.assignedGuardId) {
            total -= 5; // Optimización de mantenimiento
        }

        // Sumar consumo de sub-sistemas activos
        if (State.generator.systems) {
            Object.values(State.generator.systems).forEach(system => {
                if (system.active) total += (system.load || 0);
            });
        }

        // Cargas dinámicas adicionales
        if (State.generator.bloodTestCountdown > 0) {
            total += 45;
        }

        if (State.paranoia > 80) total += 5;
        if (State.sanity < 20) total += 5;

        State.generator.load = Math.max(0, total);
        return State.generator.load;
    }

    updateGenerator() {
        if (State.paused) return;
        if (!State.generator.isOn) {
            State.generator.load = 0;
            return;
        }

        const totalLoad = this.calculateTotalLoad();
        const capacity = State.generator.capacity;

        // --- Lógica de Batería (Reserva) ---
        // Se descarga gradualmente según la carga total
        // La descarga es: (carga / 100) puntos de batería por turno
        const batteryDrain = totalLoad / 20;
        State.generator.power = Math.max(0, State.generator.power - batteryDrain);

        if (State.generator.power <= 0) {
            this.audio.playSFXByKey('generator_stop', { volume: 0.6 });
            this.triggerGeneratorFailure();
            this.ui.showFeedback("¡BATERÍA AGOTADA!", "red", 5000);
            return;
        }

        // Lógica de Estabilidad
        if (totalLoad > capacity) {
            State.generator.overloadTimer++;
            const excess = (totalLoad - capacity) / capacity;
            const stabilityDrain = 2 + (excess * 15);
            State.generator.stability = Math.max(0, State.generator.stability - stabilityDrain);

            if (State.generator.stability < 30) {
                const failureChance = 0.1 + (excess * 0.4);
                if (Math.random() < failureChance) {
                    this.triggerGeneratorFailure();
                    return;
                }
            }
        } else {
            State.generator.overloadTimer = 0;
            if (State.generator.stability < 100) {
                State.generator.stability = Math.min(100, State.generator.stability + 1);
            }
        }

        // COMPATIBILIDAD LEGACY
        let legacyFailureChance = 0;
        if (State.config && State.config.generator && State.config.generator.failureChance) {
            legacyFailureChance = State.config.generator.failureChance[State.generator.mode || 'normal'] || 0;
        }
        if (State.generator.overloadRiskTurns > 0) {
            legacyFailureChance = Math.max(legacyFailureChance, 0.25);
            State.generator.overloadRiskTurns = 0;
        }

        if (legacyFailureChance > 0 && Math.random() < legacyFailureChance) {
            this.triggerGeneratorFailure();
            return;
        }

        if (State.generator.isOn && State.generator.stability < 70) {
            const residualChance = (70 - State.generator.stability) / 1000;
            if (Math.random() < residualChance) {
                this.triggerGeneratorFailure();
            }
        }

        // --- EFECTOS DE SUBSISTEMAS ---
        if (State.generator.isOn) {
            const sys = State.generator.systems;

            // Iluminación
            if (sys.lighting && !sys.lighting.active) {
                State.updateParanoia(2);
                if (Math.random() < 0.1) this.ui.showFeedback("OSCURIDAD: PARANOIA EN AUMENTO", "red", 3000);
            }

            // Soporte Vital
            if (sys.lifeSupport && !sys.lifeSupport.active) {
                State.updateSanity(-5);
                if (Math.random() < 0.1) this.ui.showFeedback("AIRE VICIADO: CORDURA DISMINUYENDO", "red", 3000);
            }
        }
    }

    triggerGeneratorFailure() {
        State.generator.isOn = false;
        State.generator.mode = 'normal'; // Reset mode for next start
        State.generator.power = Math.floor(State.generator.power * 0.4); // Keep 40%
        if (State.currentNPC) {
            State.currentNPC.scanCount = 99;
        }
        this.shutdownSecuritySystem();
        this.audio.playSFXByKey('glitch_low', { volume: 0.8 });
        State.addLogEntry('system', 'FALLO CRÍTICO: Generador apagado por inestabilidad.');
        this.ui.showFeedback("¡FALLO CRÍTICO DEL GENERADOR!", "red", 5000);
        if (this.ui && typeof this.ui.updateGeneratorNavStatus === 'function') {
            this.ui.updateGeneratorNavStatus();
        }
        this.ui.renderGeneratorRoom();
        this.game.updateHUD();
        this.ui.updateInspectionTools(State.currentNPC);
    }

    setGeneratorProtocol(newMode) {
        if (!State.generator.isOn) return false;

        const capMap = { 'save': 1, 'normal': 2, 'overload': 3 };
        const powerMap = { 'save': 32, 'normal': 63, 'overload': 95 };
        const newCap = capMap[newMode] || 2;

        const npc = State.currentNPC;
        const actionTaken = (npc && (npc.scanCount > 0 || npc.dialogueStarted)) || State.generator.restartLock;
        const currentMax = State.generator.maxModeCapacityReached || 2;

        // Validación de Protocolo (No se puede aumentar carga si ya se empezó a actuar)
        if (actionTaken && newCap > currentMax) {
            this.ui.showFeedback("PROTOCOLO BLOQUEADO: ACCIÓN EN CURSO", "red", 3000);
            return false;
        }

        State.generator.mode = newMode;
        State.generator.power = powerMap[newMode];
        State.generator.maxModeCapacityReached = Math.max(currentMax, newCap);

        this.ui.showFeedback(`PROTOCOLO ${newMode.toUpperCase()} CARGADO`, "green", 3000);
        this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });

        // Sincronizar UI centralmente
        this.ui.updateGeneratorNavStatus();
        this.ui.updateEnergyHUD();
        if (State.currentScreen === 'generator') {
            this.ui.renderGeneratorRoom();
        }

        return true;
    }

    toggleGenerator() {
        if (State.paused) return;
        const wasOff = !State.generator.isOn;
        State.generator.isOn = !State.generator.isOn;

        if (State.generator.isOn && wasOff) {
            this.audio.playSFXByKey('generator_start', { volume: 0.7 });

            if (this.ui && typeof this.ui.updateGeneratorNavStatus === 'function') {
                this.ui.updateGeneratorNavStatus();
            }

            // Reinicio parcial tras fallo
            State.generator.mode = 'save';
            State.generator.maxModeCapacityReached = 1;
            State.generator.load = this.calculateTotalLoad();
            State.generator.stability = Math.min(40, State.generator.stability + 10);

            // Si la batería estaba en 0, dar un poquito para arrancar
            if (State.generator.power <= 0) {
                State.generator.power = 5;
            }

            State.generator.restartLock = true;
            this.ui.showFeedback("SISTEMA REINICIADO: MODO AHORRO ACTIVO", "yellow", 4000);

            // Sync UI
            this.ui.updateGeneratorNavStatus();
            this.ui.updateEnergyHUD();

            const noActivity = State.currentNPC && State.currentNPC.scanCount === 0 && !State.currentNPC.dialogueStarted;
            const hadFailure = State.currentNPC && State.currentNPC.scanCount >= 90;

            if (State.currentNPC && !State.generator.emergencyEnergyGranted && (noActivity || hadFailure)) {
                State.currentNPC.scanCount = 0;
                State.generator.emergencyEnergyGranted = true;
                this.ui.showFeedback("ENERGÍA RESTAURADA: 1 TEST DISPONIBLE", "green", 4000);
            }

        } else if (!State.generator.isOn) {
            this.audio.playSFXByKey('generator_stop', { volume: 0.6 });
            if (State.currentNPC) {
                State.currentNPC.scanCount = 99;
            }
            this.shutdownSecuritySystem();
            if (this.ui && typeof this.ui.updateGeneratorNavStatus === 'function') {
                this.ui.updateGeneratorNavStatus();
            }
            this.ui.showFeedback("GENERADOR APAGADO: ENERGÍA DISIPADA", "red", 4000);
        }

        this.ui.renderGeneratorRoom();
        this.game.updateHUD();
        this.ui.updateInspectionTools(State.currentNPC);
    }

    assignGuardToGenerator(npcId) {
        if (!npcId) {
            State.generator.assignedGuardId = null;
            this.ui.showFeedback("GENERADOR SIN GUARDIA", "yellow");
            return;
        }

        const npc = State.admittedNPCs.find(n => n.id === npcId);
        if (!npc) return;

        State.generator.assignedGuardId = npcId;
        this.ui.showFeedback(`GUARDIA ASIGNADO: ${npc.name}`, "green");

        // Registrar log inicial
        this.processGuardEffects(true);

        this.ui.renderGeneratorRoom();
        this.ui.updateEnergyHUD();
    }

    processGuardEffects(initial = false) {
        const guardId = State.generator.assignedGuardId;
        if (!guardId) return;

        const npc = State.admittedNPCs.find(n => n.id === guardId);
        if (!npc) {
            State.generator.assignedGuardId = null;
            return;
        }

        // Generar Log según estado del NPC
        let message = "";
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

        if (npc.isInfected) {
            const lies = [
                "Núcleo estable. Todo bajo control.",
                "Se detectaron moscas en el conducto, pero ya las limpié.",
                "La carga parece un poco alta, pero el dial miente.",
                "He ajustado las bobinas. Debería ir mejor ahora."
            ];
            message = lies[Math.floor(Math.random() * lies.length)];

            if (!initial) {
                State.generator.power = Math.max(0, State.generator.power - 2);
            }
        } else {
            message = `Estado nominal. Carga actual: ${Math.floor((State.generator.load / State.generator.capacity) * 100)}%. Batería: ${Math.floor(State.generator.power)}%`;
        }

        if (!State.generator.guardShiftLogs) State.generator.guardShiftLogs = [];
        State.generator.guardShiftLogs.push(`[${time}] ${npc.name}: ${message}`);
        if (State.generator.guardShiftLogs.length > 5) State.generator.guardShiftLogs.shift();
    }

    manualEmergencyCharge() {
        if (State.supplies < 3) {
            this.ui.showFeedback("SUMINISTROS INSUFICIENTES (Req: 3)", "red");
            return;
        }

        State.updateSupplies(-3);
        State.generator.power = Math.min(100, State.generator.power + 15);
        this.audio.playSFXByKey('ui_button_click', { volume: 0.8 });
        this.ui.showFeedback("CARGA DE EMERGENCIA REALIZADA (+15%)", "green");

        this.ui.updateEnergyHUD();
        this.game.updateHUD();
        if (State.currentScreen === 'generator') this.ui.renderGeneratorRoom();
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
            if (this.ui.updateSecurityNavStatus) {
                this.ui.updateSecurityNavStatus(State.securityItems);
            }
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

    checkLoreNPCDanger() {
        // Check if any lore NPCs are in the shelter
        const loreNPCs = State.admittedNPCs.filter(npc => npc.uniqueType === 'lore');

        if (loreNPCs.length === 0) {
            return { triggered: false };
        }

        // 80% probability of death PER lore NPC
        for (const loreNPC of loreNPCs) {
            if (Math.random() < 0.8) {
                return {
                    triggered: true,
                    loreNPC: loreNPC,
                    count: loreNPCs.length
                };
            }
        }

        // Survived - track for potential final_lore_survivor ending
        State.loreSurvivalStreak = (State.loreSurvivalStreak || 0) + 1;
        return { triggered: false, survived: true, count: loreNPCs.length };
    }

    sleep() {
        if (State.paused) return;

        // CRITICAL: Check for lore NPC danger FIRST (80% death probability)
        const loreDanger = this.checkLoreNPCDanger();
        if (loreDanger.triggered) {
            this.audio.playSFXByKey('glitch_burst', { volume: 0.8 });

            // Trigger appropriate lore ending
            if (loreDanger.count >= 2) {
                this.game.endings.triggerEnding('final_lore_collector');
            } else {
                // Replace {loreName} in lore text
                this.game.endings.loreNPCName = loreDanger.loreNPC.name;
                this.game.endings.triggerEnding('final_lore_assimilation');
            }
            return;
        }

        this.audio.playSFXByKey('night_transition', { volume: 0.5 });
        this.audio.playAmbientByKey('ambient_night_loop', { loop: true, volume: this.audio.levels.ambient, fadeIn: 800 });

        const admitted = State.admittedNPCs;
        const count = admitted.length;

        // Procesar recursos y rasgos antes de determinar el resultado de la noche
        const resourceSummary = this.processNightResourcesAndTraits();

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

                // Recarga ligera si el jugador está despierto cuidando (manual adjustments could go here)
                // Pero por diseño, la recarga "automática" es el mantenimiento nocturno general.

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
                ? admitted.findIndex(n => !n.isInfected && (n.trait && n.trait.id !== 'tough'))
                : -1;

            // Si no hay civiles normales, buscar uno con rasgo 'tough' (más difícil de matar)
            let finalVictimIndex = victimIndex;
            if (finalVictimIndex === -1 && civilians.length > 0) {
                finalVictimIndex = admitted.findIndex(n => !n.isInfected);
            }

            if (finalVictimIndex > -1) {
                const victim = admitted[finalVictimIndex];
                admitted.splice(finalVictimIndex, 1);
                victim.death = { reason: 'asesinado', cycle: State.cycle, revealed: false };
                State.purgedNPCs.push(victim);
                State.lastNight.message = `${resourceSummary}Durante la noche, ${victim.name} fue asesinado. Se sospecha presencia de cloro.`;
                State.lastNight.victims = 1;
                this.audio.playSFXByKey('lore_night_civil_death', { volume: 0.5 });
                this.ui.showLore('night_civil_death', () => {
                    State.updateParanoia(30);
                    this.continueDay();
                });
            } else {
                State.lastNight.message = `${resourceSummary}No quedaban civiles. El guardia fue víctima del cloro.`;
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

        // Check if player survived with lore NPC (special log entry)
        const loreNPCs = State.admittedNPCs.filter(npc => npc.uniqueType === 'lore');
        let loreMessage = '';
        if (loreNPCs.length > 0) {
            const loreNames = loreNPCs.map(npc => npc.name).join(', ');
            loreMessage = `\n\n⚠️ ALERTA: Sobreviviste la noche con ${loreNames} en el refugio. Los registros muestran anomalías en los sensores.`;
        }

        State.lastNight.message = `${resourceSummary}La noche pasó tranquila.${loreMessage}`;
        State.lastNight.victims = 0;
        this.audio.playSFXByKey('lore_night_tranquil', { volume: 0.4 });
        this.ui.showLore('night_tranquil', () => {
            // REBALANCEO: Reducir paranoia base
            let reduction = -10;

            // Si hay más civiles que cloros (infectados) en el refugio, la paranoia baja más
            const civilians = State.admittedNPCs.filter(n => !n.isInfected).length;
            const infected = State.admittedNPCs.filter(n => n.isInfected).length;

            if (civilians > infected) {
                reduction -= 5; // Reducción extra por sensación de seguridad
            }

            State.updateParanoia(reduction);
            this.continueDay();
        });
    }

    processNightResourcesAndTraits() {
        const admitted = State.admittedNPCs;
        let summary = "";

        if (admitted.length === 0) return summary;

        let totalConsumption = 0;
        let scavenged = 0;
        let sanityMod = 0;
        let paranoiaMod = 0;

        admitted.forEach(npc => {
            // Consumo base
            const consumption = (npc.trait && npc.trait.id === 'sickly') ? 2 : 1;
            totalConsumption += consumption;

            // Efectos de rasgos
            if (npc.trait && npc.trait.id === 'scavenger' && Math.random() < 0.4) {
                const found = Math.floor(Math.random() * 5) + 1;
                scavenged += found;
                State.addLogEntry('system', `RASGO: ${npc.name} (Recolector) encontró ${found} suministros.`, { icon: 'fa-box-open' });
            }
            if (npc.trait && npc.trait.id === 'optimist') {
                paranoiaMod -= 10;
                State.addLogEntry('system', `RASGO: ${npc.name} (Optimista) calmó los nervios del grupo.`, { icon: 'fa-face-smile' });
            }
            if (npc.trait && npc.trait.id === 'paranoid') {
                paranoiaMod += 5;
                State.addLogEntry('system', `RASGO: ${npc.name} (Paranoico) difundió rumores inquietantes.`, { icon: 'fa-user-secret' });
            }
        });

        // Aplicar suministros
        State.updateSupplies(scavenged - totalConsumption);

        if (scavenged > 0) {
            summary += `Los recolectores encontraron ${scavenged} suministros. `;
        }

        if (State.supplies <= 0) {
            State.updateSanity(-15);
            summary += "La falta de suministros está causando desesperación. ";
            // Probabilidad de muerte por inanición si no hay suministros
            if (Math.random() < 0.1) {
                const victimIndex = Math.floor(Math.random() * admitted.length);
                const victim = admitted[victimIndex];
                admitted.splice(victimIndex, 1);
                victim.death = { reason: 'inanición', cycle: State.cycle, revealed: false };
                State.purgedNPCs.push(victim);
                summary += `${victim.name} ha muerto por falta de recursos. `;
            }
        }

        // Aplicar modificadores de rasgos
        if (sanityMod !== 0) {
            State.updateSanity(sanityMod);
            if (sanityMod > 0) summary += "El optimismo de algunos refugiados mejora el ambiente. ";
        }
        if (paranoiaMod !== 0) {
            State.updateParanoia(paranoiaMod);
            if (paranoiaMod > 0) summary += "Los susurros paranoicos se extienden por el refugio. ";
            if (paranoiaMod < 0) summary += "La presencia de líderes positivos calma los nervios del grupo. ";
        }

        // --- EFECTO: SOPORTE VITAL OFF (RIESGO PARA ENFERMOS) ---
        // Movido a Hook #2

        // MECÁNICA DIFERENCIADA: Pesadillas vs Fallos de Seguridad
        // La baja cordura provoca "Incidentes Mentales"
        if (State.sanity < 30 && Math.random() < 0.4) {
            const extraLoss = 10;
            State.updateSanity(-extraLoss);
            summary += "Las pesadillas han sido insoportables esta noche. ";
            if (Math.random() < 0.3) {
                State.updateSupplies(-1);
                summary += "En un ataque de pánico, se han desperdiciado suministros. ";
            }
        }

        // La alta paranoia provoca "Inestabilidad de Sistemas"
        // Movido a Hook #3

        // Recarga Nocturna del Generador (Mantenimiento Automático)
        // Movido a Hook #1

        // --- EJECUTAR HOOKS DE RESOLUCIÓN ---
        this.nightResolutionHooks.forEach(hook => {
            const hookSummary = hook(State);
            if (hookSummary) summary += hookSummary;
        });

        return summary;
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
        this.updateTurnEndSystems();
        this.ui.updateRunStats(State);
    }

    updateTurnEndSystems() {
        // 1. Procesar Blood Analyzer
        if (State.generator.bloodTestCountdown > 0) {
            State.generator.bloodTestCountdown--;
            if (State.generator.bloodTestCountdown === 0 && State.generator.bloodTestId) {
                // Revelar resultado
                const npc = State.admittedNPCs.find(n => n.id === State.generator.bloodTestId) || (State.currentNPC && State.currentNPC.id === State.generator.bloodTestId ? State.currentNPC : null);
                if (npc) {
                    if (!npc.revealedStats.includes('isInfected')) npc.revealedStats.push('isInfected');
                    npc.isBloodValidated = true;
                    State.addLogEntry('system', `ANÁLISIS COMPLETADO: ${npc.name} -> ${npc.isInfected ? 'INFECTADO' : 'LIMPIO'}`);
                    this.ui.showFeedback(`ANALISIS: ${npc.name} (${npc.isInfected ? 'INFECTADO' : 'LIMPIO'})`, npc.isInfected ? "red" : "green", 5000);
                }
                State.generator.bloodTestId = null;
            }
        }

        // 2. Procesar Sabotajes de Sectores
        this.processSectorSabotages();
    }

    assignNPCToSector(npc, sector) {
        if (!State.sectorAssignments[sector]) State.sectorAssignments[sector] = [];

        // Quitar de otros sectores
        Object.keys(State.sectorAssignments).forEach(s => {
            const idx = State.sectorAssignments[s].indexOf(npc.id);
            if (idx > -1) State.sectorAssignments[s].splice(idx, 1);
        });

        State.sectorAssignments[sector].push(npc.id);
        npc.assignedSector = sector;

        // UNIFY: If assigned to generator, update generator property
        if (sector === 'generator') {
            State.generator.assignedGuardId = npc.id;
        } else if (State.generator.assignedGuardId === npc.id) {
            // If it was the guard but moved to another sector, clear guard
            State.generator.assignedGuardId = null;
        }
    }

    processSectorSabotages() {
        let sabotageHappened = false;
        Object.keys(State.sectorAssignments).forEach(sector => {
            const assignedIds = State.sectorAssignments[sector];
            assignedIds.forEach(id => {
                const npc = State.admittedNPCs.find(n => n.id === id);
                if (npc && npc.isInfected && Math.random() < 0.15) { // 15% prob de sabotaje por infectado
                    sabotageHappened = true;
                    this.triggerSabotage(sector, npc);
                }
            });
        });
        return sabotageHappened;
    }

    triggerSabotage(sector, npc) {
        const config = CONSTANTS.SECTOR_CONFIG[sector];
        if (!config) return;

        this.audio.playSFXByKey('glitch_low', { volume: 0.6 });

        const handlers = {
            generator: () => {
                State.generator.isOn = false;
                State.addLogEntry('system', config.sabotageMsg.replace('{npc}', npc.name));
            },
            security: () => {
                const items = State.securityItems.filter(i => i.type !== 'alarma' && i.secured);
                if (items.length > 0) {
                    const target = items[Math.floor(Math.random() * items.length)];
                    target.secured = false;
                    const itemLabel = target.type === 'tuberias' ? 'TUBERÍAS' : target.type.toUpperCase();
                    State.addLogEntry('system', config.sabotageMsg.replace('{item}', itemLabel).replace('{npc}', npc.name));
                }
            },
            supplies: () => {
                const stolen = Math.min(State.supplies, Math.floor(Math.random() * 3) + 1);
                State.updateSupplies(-stolen);
                State.addLogEntry('system', config.sabotageMsg.replace('{amount}', stolen).replace('{npc}', npc.name));
            }
        };

        if (handlers[sector]) {
            handlers[sector]();
            this.ui.showFeedback(config.feedback || "¡SABOTAJE DETECTADO!", "red", 4000);
        }

        this.game.updateHUD();
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

        this.handleIntrusionCombat(via, 'nocturna');
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
                    this.handleIntrusionCombat(via, 'diurna');
                }
            }
            State.rescheduleIntrusion();
        }
    }

    handleIntrusionCombat(via, period) {
        const securityNPCId = State.sectorAssignments?.security?.[0];
        const guard = State.admittedNPCs.find(n => n.id === securityNPCId);

        if (!guard) {
            // No hay guardias, la intrusión entra libremente
            this.createIntrusion(via, period);
            return;
        }

        // Simulación de combate
        const intrusionStrength = Math.random() * 100;
        let guardModifier = 50; // Poder base

        if (guard.trait) {
            if (guard.trait.id === 'scavenger') guardModifier += 25; // Más fuerte
            if (guard.trait.id === 'sickly') guardModifier -= 35; // Más débil
        }

        const winChance = guardModifier / (guardModifier + intrusionStrength);

        if (Math.random() < winChance) {
            // Éxito: Intrusión detenida
            State.addLogEntry('system', `SEGURIDAD: ${guard.name} interceptó una intrusión vía ${via.type}.`, { icon: 'fa-shield-halved' });
            this.ui.showFeedback(`INTRUSIÓN DETENIDA POR ${guard.name}`, "green", 5000);
            this.ui.updateSecurityCombatLog(`${guard.name}: Contacto visual en ${via.type}. Objetivo neutralizado.`);

            // Riesgo de herida (puramente visual por ahora)
            if (Math.random() < 0.2) {
                this.ui.updateSecurityCombatLog(`${guard.name}: Enviando reporte médico. Heridas leves.`);
            }
        } else {
            // Fallo: El guardia muere o es superado
            const fatal = Math.random() < 0.4;
            if (fatal) {
                // MUERTE
                const idx = State.admittedNPCs.indexOf(guard);
                if (idx > -1) {
                    State.admittedNPCs.splice(idx, 1);
                    guard.death = { reason: `combate contra intruso (${via.type})`, cycle: State.cycle, revealed: true };
                    State.purgedNPCs.push(guard);

                    State.addLogEntry('system', `CRÍTICO: ${guard.name} murió defendiendo el refugio contra una intrusión vía ${via.type}.`, { icon: 'fa-skull' });
                    this.ui.showFeedback(`${guard.name} HA CAÍDO EN COMBATE`, "red", 7000);
                    this.ui.updateSecurityCombatLog(`ALERTA: Bio-señal de ${guard.name} perdida en ${via.type}.`);
                }

                // La intrusión entra de todos modos
                this.createIntrusion(via, period);
            } else {
                // Superado pero vivo (el intruso entra)
                State.addLogEntry('system', `SEGURIDAD: ${guard.name} fue superado por un intruso en ${via.type}.`, { icon: 'fa-person-falling' });
                this.ui.showFeedback(`${guard.name} SUPERADO EN COMBATE`, "orange", 5000);
                this.ui.updateSecurityCombatLog(`${guard.name}: Superado numéricamente. El intruso ha penetrado el perímetro.`);
                this.createIntrusion(via, period);
            }
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

    startScavengingExpedition(npc) {
        if (!npc || State.paused) return;

        // Mostrar pantalla de expedición
        this.game.events.switchScreen(CONSTANTS.SCREENS.EXPEDITION, {
            force: true,
            lockNav: true,
            sound: 'ui_heavy_click'
        });

        $('#expedition-npc-name span').text(npc.name);

        // Calcular riesgo y recompensa
        let risk = 15 + (Math.random() * 20); // Base 15-35%
        let minLoot = 5;
        let maxLoot = 15;

        if (npc.trait) {
            if (npc.trait.id === 'scavenger') {
                risk -= 5;
                minLoot += 3;
                maxLoot += 5;
            }
            if (npc.trait.id === 'sickly') {
                risk += 15;
            }
        }

        const riskFormatted = Math.min(100, Math.max(0, Math.round(risk)));
        const lootValue = Math.floor(Math.random() * (maxLoot - minLoot + 1)) + minLoot;

        $('#expedition-risk-value').text(`${riskFormatted}%`);
        $('#expedition-loot-value').text(lootValue);

        // Animación de carga
        let progress = 0;
        const fill = $('#expedition-progress-fill');
        const text = $('#expedition-progress-text');

        this.audio.playSFXByKey('expedition_ambient', { loop: true, volume: 0.3, id: 'exp_loop' });

        const interval = setInterval(() => {
            if (State.paused) return;

            progress += Math.random() * 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.audio.stopSFX('exp_loop');
                this.finalizeExpedition(npc, riskFormatted, lootValue);
            }

            fill.css('width', `${progress}%`);
            text.text(`${Math.round(progress)}%`);

            if (Math.random() < 0.1) this.audio.playSFXByKey('radio_chatter', { volume: 0.15 });
        }, 150);
    }

    finalizeExpedition(npc, risk, loot) {
        const survived = Math.random() * 100 > risk;

        if (survived) {
            State.updateSupplies(loot);
            State.addLogEntry('system', `EXPEDICIÓN: ${npc.name} regresó con ${loot} suministros.`, { icon: 'fa-box-open' });
            this.ui.showFeedback(`EXPEDICIÓN EXITOSA: +${loot} SUMINISTROS`, "green", 5000);

            // Volver al mapa después de una pausa dramática
            setTimeout(() => {
                this.game.events.navigateToMap({ force: true, lockNav: false });
            }, 1500);
        } else {
            // MUERTE
            const idx = State.admittedNPCs.indexOf(npc);
            if (idx > -1) {
                State.admittedNPCs.splice(idx, 1);
                npc.death = { reason: 'muerto en expedición externa (suministros)', cycle: State.cycle, revealed: true };
                State.purgedNPCs.push(npc);

                State.addLogEntry('system', `PÉRDIDA: La señal de ${npc.name} se perdió permanentemente durante la búsqueda de suministros.`, { icon: 'fa-skull' });
                this.ui.showFeedback(`${npc.name} NO REGRESÓ DE LA EXPEDICIÓN`, "red", 7000);
            }

            setTimeout(() => {
                this.game.events.navigateToMap({ force: true, lockNav: false });
            }, 2500);
        }
    }

    startFuelExpedition(npc) {
        if (!npc || State.paused) return;

        // Mostrar pantalla de expedición (reutilizamos la misma vista)
        this.game.events.switchScreen(CONSTANTS.SCREENS.EXPEDITION, {
            force: true,
            lockNav: true,
            sound: 'ui_heavy_click'
        });

        $('#expedition-npc-name span').text(`${npc.name} (DEPÓSITO EXTERNO)`);
        $('#screen-expedition h1').text('RECOLECCIÓN DE COMBUSTIBLE');

        // Calcular riesgo y recompensa (MÁS ALTO QUE SUMINISTROS)
        let risk = 40 + (Math.random() * 20); // Base 40-60% (Mucho más peligroso)
        let minLoot = 4;
        let maxLoot = 10;

        if (npc.trait) {
            if (npc.trait.id === 'scavenger') {
                risk -= 10;
                minLoot += 2;
                maxLoot += 4;
            }
            if (npc.trait.id === 'sickly') {
                risk += 25;
            }
        }

        const riskFormatted = Math.min(100, Math.max(0, Math.round(risk)));
        const lootValue = Math.floor(Math.random() * (maxLoot - minLoot + 1)) + minLoot;

        $('#expedition-risk-value').text(`${riskFormatted}%`).addClass('text-alert');
        $('#expedition-loot-value').text(lootValue);

        // Animación de carga
        let progress = 0;
        const fill = $('#expedition-progress-fill');
        const text = $('#expedition-progress-text');

        this.audio.playSFXByKey('expedition_ambient', { loop: true, volume: 0.4, id: 'exp_loop' });

        const interval = setInterval(() => {
            if (State.paused) return;

            progress += Math.random() * 3; // Un poco más lenta
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.audio.stopSFX('exp_loop');
                this.finalizeFuelExpedition(npc, riskFormatted, lootValue);
            }

            fill.css('width', `${progress}%`);
            text.text(`${Math.round(progress)}%`);

            if (Math.random() < 0.2) this.audio.playSFXByKey('radio_chatter', { volume: 0.2 });
        }, 200);
    }

    finalizeFuelExpedition(npc, risk, loot) {
        const survived = Math.random() * 100 > risk;

        if (survived) {
            State.fuel += loot;
            State.addLogEntry('system', `COMBUSTIBLE: ${npc.name} recuperó ${loot} bidones.`, { icon: 'fa-gas-pump' });
            this.ui.showFeedback(`EXPEDICIÓN RIESGOSA ÉXITOSA: +${loot} COMBUSTIBLE`, "green", 5000);

            setTimeout(() => {
                this.game.events.navigateToMap({ force: true, lockNav: false });
            }, 1500);
        } else {
            const idx = State.admittedNPCs.indexOf(npc);
            if (idx > -1) {
                State.admittedNPCs.splice(idx, 1);
                npc.death = { reason: 'muerto extrayendo combustible (letalidad alta)', cycle: State.cycle, revealed: true };
                State.purgedNPCs.push(npc);

                State.addLogEntry('system', `BAJA CRÍTICA: La señal de ${npc.name} desapareció en el depósito de combustible.`, { icon: 'fa-radiation' });
                this.ui.showFeedback(`${npc.name} PERECIÓ EN EL DEPÓSITO`, "red", 7000);
            }

            setTimeout(() => {
                this.game.events.navigateToMap({ force: true, lockNav: false });
            }, 2500);
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
            this.ui.showFeedback(`SISTEMA BLOQUEADO: No puedes abandonar tu puesto hasta que el refugio esté lleno (${count}/${max}).`, "alert", 4000);
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
            const actionTaken = (npc && (npc.scanCount > 0 || npc.dialogueStarted)) || State.generator.restartLock;
            const currentMax = State.generator.maxModeCapacityReached;

            if (actionTaken && newCap > currentMax) {
                this.ui.showFeedback(`SISTEMA BLOQUEADO: No puedes subir la potencia tras interactuar con el civil.`, "yellow", 4000);
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
            this.ui.showFeedback(`MODO ${newMode.toUpperCase()} ACTIVADO`, "green", 3000);
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

        // Trigger Purge Animation
        this.ui.triggerPurgeAnimation(() => {
            if (State.isNight) {
                this.startNightPhase();
            } else if (State.isDayOver()) {
                this.startNightPhase();
            } else {
                this.game.events.navigateToShelter();
            }
        });
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
