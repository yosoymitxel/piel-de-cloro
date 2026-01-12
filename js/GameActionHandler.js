import { State } from './State.js';
import { CONSTANTS } from './Constants.js';

export class GameActionHandler {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
    }

    inspect(tool) {
        if (State.paused || this.game.isAnimating) return;
        const npc = State.currentNPC;
        if (!npc) return;

        // Validar estado del generador
        if (!State.generator.isOn) {
            this.ui.showFeedback("GENERADOR APAGADO: ACCIÓN IMPOSIBLE", "red");
            this.game.updateHUD(); // Sincronizar contador de energía
            return;
        }

        // Definir límite máximo de energías según el modo del generador
        let maxEnergy = CONSTANTS.GENERATOR.DEFAULT_MAX_CAPACITY;
        if (State.generator.mode === 'save') maxEnergy = CONSTANTS.GENERATOR.SAVE_MODE_CAPACITY;
        if (State.generator.mode === 'overload') maxEnergy = CONSTANTS.GENERATOR.OVERLOAD_MODE_CAPACITY;

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

        this.game.isAnimating = true;
        State.verificationsCount++;
        npc.scanCount++;
        this.game.mechanics.checkSecurityDegradation(); // Riesgo de fallo en seguridad al usar herramientas
        this.game.updateHUD(); // Actualizar el HUD inmediatamente (refleja energía en el contador)
        
        let result = "";
        let color = "yellow";
        let animDuration = 1000;

        // Inyectar animaciones visuales
        const animMap = {
            'thermometer': 'animateToolThermometer',
            'flashlight': 'animateToolFlashlight',
            'pupils': 'animateToolPupils',
            'pulse': 'animateToolPulse'
        };

        const animMethod = animMap[tool];
        const valMap = {
            'thermometer': npc.attributes.temperature,
            'flashlight': npc.attributes.skinTexture,
            'pupils': npc.attributes.pupils,
            'pulse': npc.attributes.pulse
        };

        if (this.ui[animMethod]) {
            this.ui[animMethod](valMap[tool], null, npc.isInfected);
        }

        switch (tool) {
            case 'thermometer':
                animDuration = 2200;
                result = `TEMP: ${npc.attributes.temperature}°C`;
                if (npc.attributes.temperature < 35) color = '#aaffaa';
                if (!npc.revealedStats.includes('temperature')) npc.revealedStats.push('temperature');
                this.ui.applyVHS(0.4, 700);
                this.audio.playSFXByKey('tool_thermometer_beep', { volume: 0.6 });
                break;
            case 'flashlight':
                animDuration = 900;
                result = `DERMIS: ${this.ui.translateValue('skinTexture', npc.attributes.skinTexture)}`;
                if (!npc.revealedStats.includes('skinTexture')) npc.revealedStats.push('skinTexture');
                this.ui.applyVHS(0.7, 900);
                this.audio.playSFXByKey('tool_uv_toggle', { volume: 0.6 });
                break;
            case 'pupils':
                animDuration = 2700;
                result = `PUPILAS: ${this.ui.translateValue('pupils', npc.attributes.pupils)}`;
                if (!npc.revealedStats.includes('pupils')) npc.revealedStats.push('pupils');
                this.ui.applyVHS(0.6, 800);
                this.audio.playSFXByKey('tool_pupils_lens', { volume: 0.6 });
                break;
            case 'pulse':
                animDuration = 2600;
                result = `BPM: ${npc.attributes.pulse}`;
                if (!npc.revealedStats.includes('pulse')) npc.revealedStats.push('pulse');
                this.ui.applyVHS(0.5, 800);
                this.audio.playSFXByKey('tool_pulse_beep', { volume: 0.6 });
                break;
        }

        // Bloquear el botón específico y actualizar estado de energías
        this.ui.updateInspectionTools();

        setTimeout(() => {
            this.game.isAnimating = false;
        }, animDuration);

        // Feedback textual ocultado para que la evidencia no sea explícita en pantalla
        this.game.updateHUD(); // To update energy
        if (npc.scanCount > 0) {
            this.ui.hideOmitOption();
        }
    }

    handleDecision(action) {
        if (State.paused) return;
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
            
            // Consecuencia por ignorar: la paranoia aumenta porque no sabes qué has dejado fuera
            const amount = npc.isInfected ? 10 : 5;
            State.updateParanoia(amount);
            
            const msg = npc.isInfected 
                ? `HAS PERMITIDO QUE ${npc.name} SE MARCHE. SIENTES UN ESCALOFRÍO MIENTRAS DESAPARECE EN LA NIEBLA.`
                : `HAS PERMITIDO QUE ${npc.name} SE MARCHE. LA INCERTIDUMBRE CRECE.`;
            
            if (npc.isInfected && Math.random() < 0.2) {
                this.ui.showMessage(msg, null, npc.isInfected ? 'warning' : 'normal');
            }
        }

        State.nextSubject();
        this.game.nextTurn();
        this.ui.updateRunStats(State);
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
