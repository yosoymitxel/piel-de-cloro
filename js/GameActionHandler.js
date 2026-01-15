import { State } from './State.js';
import { CONSTANTS } from './Constants.js';

export class GameActionHandler {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
        this.processingDecision = false;
    }

    /**
     * Valida si una herramienta puede ser utilizada.
     * @param {string} tool - ID de la herramienta
     * @returns {Object} Resultado de la validación { allowed: boolean, reason: string, code: string }
     */
    validateInspection(tool) {
        if (State.paused) {
            return { allowed: false, reason: "JUEGO EN PAUSA", code: "PAUSED" };
        }

        if (this.game.isAnimating) {
            return { allowed: false, reason: "ANIMACIÓN EN CURSO", code: "ANIMATING" };
        }

        const npc = State.currentNPC;
        if (!npc) {
            return { allowed: false, reason: "NO HAY SUJETO ACTIVO", code: "NO_NPC" };
        }

        if (!State.generator.isOn) {
            return { allowed: false, reason: "GENERADOR APAGADO", code: "POWER_OFF" };
        }

        const statMap = {
            'thermometer': 'temperature',
            'flashlight': 'skinTexture',
            'pupils': 'pupils',
            'pulse': 'pulse'
        };
        const statKey = statMap[tool];

        if (npc.revealedStats.includes(statKey)) {
            return { allowed: false, reason: "TEST YA REALIZADO", code: "ALREADY_DONE" };
        }

        // Validar energía
        let maxEnergy = CONSTANTS.GENERATOR.DEFAULT_MAX_CAPACITY;
        if (State.generator.mode === 'save') maxEnergy = CONSTANTS.GENERATOR.SAVE_MODE_CAPACITY;
        if (State.generator.mode === 'overload') maxEnergy = CONSTANTS.GENERATOR.OVERLOAD_MODE_CAPACITY;

        let energyCost = 1;
        if (State.paranoia > 70 && Math.random() < (State.paranoia / 200)) {
            energyCost = 2;
        }

        if (npc.scanCount + energyCost > maxEnergy) {
            return { allowed: false, reason: "ENERGÍA INSUFICIENTE", code: "NO_ENERGY" };
        }

        return { allowed: true, reason: "OK", code: "READY", cost: energyCost, statKey: statKey };
    }

    inspect(tool) {
        State.log(`[GameActionHandler] --- INICIO INSPECCIÓN: ${tool} ---`);

        const validation = this.validateInspection(tool);
        State.log(`[GameActionHandler] Resultado Validación:`, validation);

        const npc = State.currentNPC;
        if (!validation.allowed) {
            State.warn(`[GameActionHandler] Inspección cancelada: ${validation.reason} (${validation.code})`);

            // Mostrar feedback visual según el error
            switch (validation.code) {
                case "ANIMATING":
                    this.ui.showFeedback("ESPERA A QUE TERMINE LA ACCIÓN", "orange", 2500);
                    break;
                case "POWER_OFF":
                    this.ui.showFeedback("GENERADOR APAGADO: ACCIÓN IMPOSIBLE", "red", 3000);
                    this.game.updateHUD();
                    break;
                case "NO_ENERGY":
                    this.ui.showFeedback("ENERGÍA INSUFICIENTE PARA ESTE TURNO", "yellow", 3000);
                    if (npc) this.ui.updateInspectionTools(npc);
                    break;
                case "ALREADY_DONE":
                    this.ui.showFeedback("TEST YA REALIZADO", "yellow", 2000);
                    if (npc) this.ui.updateInspectionTools(npc);
                    break;
                case "PAUSED":
                    State.warn("[GameActionHandler] Intento de inspección con juego pausado.");
                    break;
                case "NO_NPC":
                    State.error("[GameActionHandler] Intento de inspección sin NPC activo.");
                    this.ui.showFeedback("ERROR: NO HAY SUJETO QUE INSPECCIONAR", "red", 3000);
                    break;
                default:
                    this.ui.showFeedback(`SISTEMA BLOQUEADO: ${validation.reason}`, "red", 3000);
            }
            return;
        }

        State.log(`[GameActionHandler] Ejecutando inspección de ${tool}...`);
        const { cost: energyCost, statKey } = validation;

        // MECÁNICA PARANOIA: Probabilidad de fallo de hardware (Glitch)
        const glitchChance = State.paranoia > 60 ? (State.paranoia - 60) / 100 : 0;
        const isGlitch = Math.random() < glitchChance;

        if (isGlitch) {
            State.log("[GameActionHandler] GLITCH activado");
            this.game.isAnimating = true;
            npc.scanCount += energyCost;
            this.ui.applyVHS(1.0, 1500);
            this.audio.playSFXByKey('ui_hover', { volume: 0.8 }); // Sonido de error
            this.ui.showFeedback("ERROR DE LECTURA: INTERFERENCIA EN EL SECTOR", "red");

            setTimeout(() => {
                this.game.isAnimating = false;
                this.game.updateHUD();
                this.ui.hideFeedback();
            }, 1500);
            return;
        }

        this.game.isAnimating = true;
        State.verificationsCount++;
        npc.scanCount += energyCost;
        this.game.mechanics.checkSecurityDegradation();
        this.game.updateHUD();

        let result = "";
        let color = "yellow";
        let animDuration = 1000;

        // MECÁNICA CORDURA: Alucinación de síntomas
        // Si la cordura es baja, el resultado puede estar falseado
        const sanityHallucinationChance = State.sanity < 40 ? (40 - State.sanity) / 100 : 0;
        const isHallucination = Math.random() < sanityHallucinationChance;

        let toolValue = npc.attributes[statKey];

        if (isHallucination) {
            State.log("[GameActionHandler] ALUCINACIÓN activada");
            // Generar un valor falso (si es humano, mostrar infectado; si es infectado, mostrar humano)
            if (npc.isInfected) {
                // Falso negativo (peligroso!)
                if (statKey === 'temperature') toolValue = (36.5 + Math.random() * 0.5).toFixed(1);
                else if (statKey === 'pulse') toolValue = 70 + Math.floor(Math.random() * 20);
                else toolValue = 'normal';
            } else {
                // Falso positivo (paranoia!)
                if (statKey === 'temperature') toolValue = (34 + Math.random() * 1).toFixed(1);
                else if (statKey === 'pulse') toolValue = 10 + Math.floor(Math.random() * 10);
                else toolValue = statKey === 'skinTexture' ? 'dry' : 'dilated';
            }
            this.ui.applyVHS(0.8, 2000); // Efecto visual de "distorsión mental"
        }

        State.log(`[GameActionHandler] Ejecutando inspección con '${tool}'. Valor: ${toolValue}, Alucinación: ${isHallucination}`);

        const animMap = {
            'thermometer': 'animateToolThermometer',
            'flashlight': 'animateToolFlashlight',
            'pupils': 'animateToolPupils',
            'pulse': 'animateToolPulse'
        };

        const animMethod = animMap[tool];
        if (this.ui[animMethod]) {
            this.ui[animMethod](toolValue, null, npc.isInfected);
        }

        switch (tool) {
            case 'thermometer':
                animDuration = 2200;
                result = `TEMP: ${toolValue}°C`;
                if (parseFloat(toolValue) < 35) color = State.colors.textGreen;
                if (!npc.revealedStats.includes('temperature')) npc.revealedStats.push('temperature');
                this.ui.applyVHS(0.4, 700);
                this.audio.playSFXByKey('tool_thermometer_beep', { volume: 0.6 });
                break;
            case 'flashlight':
                animDuration = 900;
                result = `DERMIS: ${this.ui.translateValue('skinTexture', toolValue)}`;
                if (!npc.revealedStats.includes('skinTexture')) npc.revealedStats.push('skinTexture');
                this.ui.applyVHS(0.7, 900);
                this.audio.playSFXByKey('tool_uv_toggle', { volume: 0.6 });
                break;
            case 'pupils':
                animDuration = 2700;
                result = `PUPILAS: ${this.ui.translateValue('pupils', toolValue)}`;
                if (!npc.revealedStats.includes('pupils')) npc.revealedStats.push('pupils');
                this.ui.applyVHS(0.6, 800);
                this.audio.playSFXByKey('tool_pupils_lens', { volume: 0.6 });
                break;
            case 'pulse':
                animDuration = 2200;
                result = `PULSO: ${toolValue} PPM`;
                if (parseInt(toolValue) < 40) color = State.colors.textRed;
                if (!npc.revealedStats.includes('pulse')) npc.revealedStats.push('pulse');
                this.ui.applyVHS(0.5, 700);
                this.audio.playSFXByKey('tool_pulse_sensor', { volume: 0.6 });
                break;
        }

        if (isHallucination) {
            this.ui.showFeedback("LECTURA INESTABLE", "rose", 2500);
        }

        // Bloquear el botón específico y actualizar estado de energías
        this.ui.updateInspectionTools(npc);

        setTimeout(() => {
            this.game.isAnimating = false;
            this.ui.hideFeedback();
            this.game.updateHUD(); // Asegurar HUD actualizado
        }, animDuration);

        // Feedback textual ocultado para que la evidencia no sea explícita en pantalla
        this.game.updateHUD(); // To update energy
        if (npc.scanCount > 0) {
            this.ui.hideOmitOption();
        }
    }

    handleDecision(action) {
        if (State.paused || this.processingDecision) return;
        const npc = State.currentNPC;
        if (!npc) return;

        // Validar que se haya realizado alguna acción antes de decidir
        if (npc.scanCount <= 0 && !npc.optOut && !npc.dialogueStarted) {
            this.ui.showValidationGate(npc);
            return;
        }

        this.processingDecision = true;

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

            // Consecuencia por ignorar: la paranoia aumenta porque no sabes qué has dejado fuera
            // REBALANCEO: Ahora es un factor aleatorio que no supera los 7 (antes era 5 o 10 fijo)
            const maxIncrease = npc.isInfected ? 7 : 4;
            const amount = Math.floor(Math.random() * maxIncrease) + 1;
            State.updateParanoia(amount);

            const msg = npc.isInfected
                ? `Has permitido que ${npc.name} se marche. Sientes un escalofrío mientras desaparece en la niebla.`
                : `Has permitido que ${npc.name} se marche. La incertidumbre crece.`;


            if (npc.isInfected && Math.random() < 0.2) {
                this.ui.showMessage(msg, null, npc.isInfected ? 'warning' : 'normal');
            }
        }

        if (this.audio) this.audio.stopLore({ fadeOut: 1000 });

        State.nextSubject();
        this.game.nextTurn();
        this.ui.updateRunStats(State);

        // Reset flag for next NPC
        this.processingDecision = false;
    }

    handleSupplyRequest() {
        if (State.paused || this.game.isAnimating) return;

        // Mecánica de suministros: Solicitar suministros de emergencia
        // Coste: Aumenta la paranoia significativamente (ruido logístico)
        // Beneficio: +3 suministros

        const paranoiaCost = 15;
        const supplyGain = 3;

        this.ui.showConfirm(
            `SOLICITAR SUMINISTROS DE EMERGENCIA: ¿Solicitar reabastecimiento aéreo? La logística aumentará la PARANOIA en un ${paranoiaCost}%.`,
            () => {
                State.updateParanoia(paranoiaCost);
                State.updateSupplies(supplyGain);
                this.audio.playSFXByKey('ui_confirm');
                this.ui.showFeedback(`SUMINISTROS RECIBIDOS (+${supplyGain})`, "green", 4000);
                this.game.updateHUD();
            },
            () => {
                this.audio.playSFXByKey('ui_cancel');
            },
            'warning'
        );
    }

    handlePreCloseAction(action) {
        if (State.paused) return;
        if (action === 'purge') {
            this.game.events.navigateToShelter();
        } else if (action === 'finalize' || action === 'sleep') {
            this.game.mechanics.sleep();
        } else if (action === 'stay') {
            // No hace nada especial
        } else if (action === 'escape') {
            this.game.mechanics.finishRun();
        } else if (action === 'relocate') {
            this.relocateShelter();
        }
    }

    relocateShelter() {
        if (State.paused) return;
        if (State.admittedNPCs.length === 0) {
            this.confirmRelocation([]);
            return;
        }

        this.ui.openRelocationModal(State.admittedNPCs, (selectedNPCs) => {
            this.confirmRelocation(selectedNPCs);
        });
    }

    confirmRelocation(selectedNPCs = []) {
        const paranoiaReduction = 30;
        State.updateParanoia(-paranoiaReduction);

        this.ui.setNavLocked(false);

        const abandoned = State.admittedNPCs.filter(npc => !selectedNPCs.includes(npc));
        const abandonedCount = abandoned.length;

        abandoned.forEach(npc => {
            State.departedNPCs.push(npc);
        });

        State.admittedNPCs = selectedNPCs;

        this.audio.playSFXByKey('preclose_overlay_open', { volume: 0.8 });
        State.addLogEntry('system', `MUDANZA: Sector abandonado. ${abandonedCount} sujetos dejados atrás. ${selectedNPCs.length} mantenidos.`);

        let msg = `MUDANZA COMPLETADA: Has abandonado el sector. `;
        if (abandonedCount > 0) msg += `${abandonedCount} refugiados quedaron atrás. `;
        if (selectedNPCs.length > 0) msg += `Te llevas contigo a ${selectedNPCs.length} sujetos. `;
        msg += `La paranoia ha disminuido.`;

        this.ui.closeRelocationModal();

        this.ui.showMessage(msg, () => {
            this.game.mechanics.continueDay();
        }, 'normal');
    }
}
