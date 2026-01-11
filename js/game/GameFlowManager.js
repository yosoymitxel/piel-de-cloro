import { State } from '../State.js';
import { NPC } from '../NPC.js';

export class GameFlowManager {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
    }

    startGame() {
        this.ui.showLore('initial', () => {
            State.reset();
            this.ui.clearAllNavStatuses();
            this.audio.playAmbientByKey('ambient_main_loop', { loop: true, volume: 0.28, fadeIn: 800 });
            this.game.generateInitialEntrants();
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
        State.departedNPCs = [];
        State.isNight = false;
        State.dayClosed = false;
        State.dayEnded = false;
        State.endingTriggered = false;
        State.nightPurgePerformed = false;
        State.generatorCheckedThisTurn = false;
        State.generator = { 
            isOn: true, 
            mode: 'normal', 
            power: 100, 
            blackoutUntil: 0, 
            overclockCooldown: false, 
            emergencyEnergyGranted: false, 
            maxModeCapacityReached: 2, 
            restartLock: false 
        };
        
        this.ui.clearAllNavStatuses();

        // Quitar pausa
        State.paused = false;
        $('body').removeClass('paused');
        $('#screen-game').removeClass('is-paused');
        $('#modal-pause').addClass('hidden').removeClass('flex');

        // Regenerar y reiniciar
        this.game.generateInitialEntrants();
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
        if (State.endingTriggered) return;

        // Asegurar que el nav esté desbloqueado al inicio de cada turno
        this.ui.setNavLocked(false);

        // Actualizar estado del generador al pasar de turno
        this.game.updateGenerator();

        // Si la paranoia es extrema, colapso mental inmediato
        if (State.paranoia >= 100) {
            this.triggerEnding('final_death_paranoia');
            return;
        }

        // Si se ignoran demasiados sujetos, el refugio se considera abandonado
        if (State.ignoredNPCs && State.ignoredNPCs.length >= 15) {
            this.triggerEnding('final_abandonment');
            return;
        }

        // Check Day/Night Cycle
        if (State.isDayOver()) {
            this.startNightPhase();
            return;
        }

        // Procesar posibles intrusiones diurnas ANTES de generar el nuevo NPC
        // pero solo si ya ha pasado tiempo (no en el primer turno del ciclo)
        if (State.dayTime > 1) {
            this.game.attemptDayIntrusion();
        }

        // Primero verificamos si el refugio está lleno. 
        // Si está lleno, forzamos el flujo de cierre para que el jugador tome una decisión estratégica.
        const isShelterFull = State.admittedNPCs.length >= State.config.maxShelterCapacity;
        
        if (isShelterFull) {
            this.ui.showFeedback("REFUGIO LLENO: Debes tomar una decisión estratégica.", "yellow");
            this.startNightPhase();
            return;
        }

        State.currentNPC = new NPC();
        if (State.endingTriggered) return; // Doble check tras posible intrusion de final

        State.generatorCheckedThisTurn = false; // Resetear para cada nuevo NPC
        State.generator.emergencyEnergyGranted = false; // Resetear flag de energía gratis

        // Resetear límite de capacidad del generador según el modo actual al inicio del turno
        const currentMode = State.generator.mode;
        let initialCap = 2;
        if (currentMode === 'save') initialCap = 1;
        if (currentMode === 'overload') initialCap = 3;
        State.generator.maxModeCapacityReached = initialCap;
        State.generator.restartLock = false;

        this.ui.hideFeedback();
        this.ui.renderNPC(State.currentNPC);
        this.ui.showScreen('game');

        if (State.currentNPC.isInfected) {
            State.infectedSeenCount++;
        }
        if (State.interludesShown < 2 && Math.random() < 0.15 && !State.endingTriggered) {
            State.interludesShown++;
            this.ui.showLore('intermediate', () => {
                if (!State.endingTriggered) {
                    this.ui.showScreen('game');
                }
            });
        }
        this.game.updateHUD();
        this.ui.updateRunStats(State);
        this.ui.updateSecurityNavStatus(State.securityItems);
    }

    startNightPhase() {
        State.isNight = true;
        State.dayClosed = true;
        
        // Desbloquear navegación por si venimos de gestionar refugio
        this.ui.setNavLocked(false);
        $('#btn-finalize-day-no-purge').addClass('hidden');

        this.audio.playSFXByKey('night_transition', { volume: 0.5 });
        this.audio.playAmbientByKey('ambient_night_loop', { loop: true, volume: this.audio.levels.ambient, fadeIn: 800 });
        
        // Solo procesar intrusiones si es el inicio de la fase nocturna (no tras volver de purga)
        if (!State.lastNight.occurred) {
            this.game.processIntrusions();
            State.lastNight.occurred = true;
        }

        this.ui.renderNightScreen(State);

        // Ocultar opción de gestionar si ya se purgó
        if (State.nightPurgePerformed) {
            $('#btn-night-shelter').addClass('hidden');
            // Reajustar grid de botones si es necesario
            $('#screen-night .grid').removeClass('sm:grid-cols-2').addClass('sm:grid-cols-1 max-w-sm');
        } else {
            $('#btn-night-shelter').removeClass('hidden');
            $('#screen-night .grid').addClass('sm:grid-cols-2').removeClass('sm:grid-cols-1 max-w-sm');
        }
    }

    startNextDay() {
        State.cycle++;
        State.dayTime = 1;
        State.dayEnded = false;
        State.dayClosed = false;
        State.isNight = false;
        State.nightPurgePerformed = false;
        State.lastNight.occurred = false;
        
        // Resetear recursos diarios
        if (State.dayAfter) {
            State.dayAfter.testsAvailable = State.config.dayAfterTestsDefault;
        }
        
        // Limpiar registros temporales
        State.ignoredNPCs = []; // Opcional: resetear ignores diarios

        this.nextTurn();
    }

    triggerEnding(endingId) {
        // Bloquear cualquier otra acción
        this.game.isAnimating = true;
        State.endingTriggered = true;

        // Ocultar cualquier overlay o modal activo inmediatamente
        $('#preclose-overlay').addClass('hidden').removeClass('flex');
        $('.modal-overlay-base').addClass('hidden');

        // Guardar el final desbloqueado persistentemente
        State.unlockEnding(endingId);
        this.game.lastEndingId = endingId;

        // Si es un final de peligro, añadir efecto visual
        const isDanger = endingId.includes('death') || endingId.includes('corrupted') || endingId.includes('off') || endingId.includes('abandonment');
        
        if (isDanger) {
            this.audio.playSFXByKey('glitch_burst', { volume: 0.8 });
            if (this.ui.applyVHS) this.ui.applyVHS(1.0, 2000);
        }

        // Mostrar primero la resonancia (post_final) y luego el lore del final específico
        this.ui.showLore('post_final', () => {
            this.ui.showLore(endingId, () => {
                this.endGame();
            });
        });
    }

    endGame() {
        this.audio.stopAmbient({ fadeOut: 1000 });
        if (typeof this.ui.renderFinalStats === 'function') {
            this.ui.renderFinalStats(State, this.game.lastEndingId);
        } else {
            const proto = Object.getPrototypeOf(this.ui);
            if (typeof proto.renderFinalStats === 'function') {
                proto.renderFinalStats.call(this.ui, State, this.game.lastEndingId);
            }
        }
    }
}
