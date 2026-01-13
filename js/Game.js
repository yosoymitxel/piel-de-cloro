import { NPC } from './NPC.js';
import { State } from './State.js';
import { UIManager } from './UIManager.js';
import { StatsManager } from './StatsManager.js';
import { AudioManager } from './AudioManager.js';
import { GameActionHandler } from './GameActionHandler.js';
import { GameMechanicsManager } from './GameMechanicsManager.js';
import { GameEventManager } from './GameEventManager.js';
import { GameEndingManager } from './GameEndingManager.js';
import { RandomEventManager } from './RandomEventManager.js';
import { CONSTANTS } from './Constants.js';
import { DialogueData } from './DialogueData.js';


class Game {
    constructor(dependencies = {}) {
        this.audio = dependencies.audio || new AudioManager();
        State.loadPersistentData();
        State.reset(); // Inicializar el estado global del juego
        
        this.ui = dependencies.ui || new UIManager(this.audio, { game: this });
        this.stats = dependencies.stats || new StatsManager();
        this.isAnimating = false; // Bloquear acciones durante animaciones
        
        this.applySavedAudioSettings();
        
        // Modules initialization (Phase 2 & 3)
        this.mechanics = new GameMechanicsManager(this);
        this.actions = new GameActionHandler(this);
        this.events = new GameEventManager(this);
        this.endings = new GameEndingManager(this);
        this.randomEvents = new RandomEventManager(this);

        this.events.bindAll();
        this.audio.loadManifest('assets/audio/audio_manifest.json');
    }

    applySavedAudioSettings() {
        this.stats.start();

        // Aplicar configuraciones de audio persistentes
        if (State.audioSettings) {
            const s = State.audioSettings;
            this.audio.setMasterVolume(s.master !== undefined ? s.master : 1.0);
            this.audio.setChannelLevel('ambient', s.ambient !== undefined ? s.ambient : 0.3);
            this.audio.setChannelLevel('lore', s.lore !== undefined ? s.lore : 0.25);
            this.audio.setChannelLevel('sfx', s.sfx !== undefined ? s.sfx : 0.6);
            
            if (s.muted) {
                this.audio.muteChannel('ambient', !!s.muted.ambient);
                this.audio.muteChannel('lore', !!s.muted.lore);
                this.audio.muteChannel('sfx', !!s.muted.sfx);
            }
        }
        
        // Cargar logs iniciales si la partida está empezando
        if (State.cycle === 1 && State.dayTime === 1 && (!State.gameLog || State.gameLog.length === 0)) {
            State.gameLog = [
                {
                    type: 'system',
                    cycle: 1,
                    dayTime: 0,
                    text: 'SISTEMA RUTA-01 INICIALIZADO. PROTOCOLO DE CONTENCIÓN ACTIVO.',
                    meta: { icon: 'fa-microchip' }
                },
                {
                    type: 'system',
                    cycle: 1,
                    dayTime: 0,
                    text: 'CONEXIÓN ESTABLECIDA CON EL REFUGIO SUBTERRÁNEO.',
                    meta: { icon: 'fa-network-wired' }
                }
            ];
        }
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

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn(`Error al intentar activar pantalla completa: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    startGame() {
        // En lugar de empezar directo, mostramos el tutorial inicial
        this.ui.showScreen('game');
        this.ui.elements.modalTutorial.removeClass('hidden').addClass('flex');
        this.audio.playAmbientByKey('ambient_main_loop', { loop: true, volume: 0.28, fadeIn: 800 });
    }

    startFirstDay() {
        this.mechanics.generateInitialEntrants();
        this.nextTurn();
        this.ui.updateRunStats(State);
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
        State.generator = { isOn: true, mode: 'normal', power: 100, blackoutUntil: 0, overclockCooldown: false, emergencyEnergyGranted: false, maxModeCapacityReached: 2, restartLock: false };
        
        this.isAnimating = false;
        this.ui.resetUI();

        // Quitar pausa
        State.paused = false;
        $('body').removeClass('paused');
        $('#screen-game').removeClass('is-paused');
        $('#modal-pause').addClass('hidden').removeClass('flex');

        // Regenerar y reiniciar
        this.mechanics.generateInitialEntrants();
        this.nextTurn();
        this.ui.showScreen('game');
        this.ui.updateRunStats(State);
        this.ui.showFeedback("DÍA REINICIADO", "yellow");
    }

    restartGame() {
        State.reset();
        this.isAnimating = false;
        this.ui.resetUI();
        
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
        this.mechanics.updateGenerator();

        // Si la paranoia es extrema, colapso mental inmediato
        if (State.paranoia >= CONSTANTS.GAME.PARANOIA_DEATH_THRESHOLD) {
            this.endings.triggerEnding('final_death_paranoia');
            return;
        }

        // Si se ignoran demasiados sujetos, el refugio se considera abandonado
        if (State.ignoredNPCs && State.ignoredNPCs.length >= CONSTANTS.GAME.MAX_IGNORED_BEFORE_ABANDONMENT) {
            this.endings.triggerEnding('final_abandonment');
            return;
        }

        // Check Day/Night Cycle
        if (State.isDayOver()) {
            this.mechanics.startNightPhase();
            return;
        }

        // Procesar posibles intrusiones diurnas ANTES de generar el nuevo NPC
        // pero solo si ya ha pasado tiempo (no en el primer turno del ciclo)
        if (State.dayTime > 1) {
            this.mechanics.attemptDayIntrusion();
        }

        // Primero verificamos si el refugio está lleno. 
        // Si está lleno, forzamos el flujo de cierre para que el jugador tome una decisión estratégica.
        const isShelterFull = State.admittedNPCs.length >= State.config.maxShelterCapacity;
        
        if (isShelterFull) {
            this.ui.showFeedback("REFUGIO LLENO: Debes tomar una decisión estratégica.", "yellow");
            this.mechanics.startNightPhase();
            return;
        }

// Probabilidad de NPC de Lore (12%)
        let isLore = false;
        if (Math.random() < 0.12) {
            const unusedLore = DialogueData.loreSubjects.filter(s => !State.isDialogueUsed(s.id));
            if (unusedLore.length > 0) {
                isLore = true;
            }
        }

        State.currentNPC = new NPC(null, { isLore });
        if (State.endingTriggered) return; // Doble check tras posible intrusion de final

        State.generatorCheckedThisTurn = false; // Resetear para cada nuevo NPC
        State.generator.emergencyEnergyGranted = false; // Resetear flag de energía gratis

        // Resetear límite de capacidad del generador según el modo actual al inicio del turno
        const currentMode = State.generator.mode;
        let initialCap = CONSTANTS.GENERATOR.DEFAULT_MAX_CAPACITY;
        if (currentMode === 'save') initialCap = CONSTANTS.GENERATOR.SAVE_MODE_CAPACITY;
        if (currentMode === 'overload') initialCap = CONSTANTS.GENERATOR.OVERLOAD_MODE_CAPACITY;
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
        this.updateHUD();
        this.ui.updateRunStats(State);
        this.ui.updateSecurityNavStatus(State.securityItems);
    }

    updateHUD() {
        this.ui.updateStats(State.paranoia, State.sanity, State.cycle, State.dayTime, State.config.dayLength, State.currentNPC, State.supplies);
        this.ui.updateRunStats(State);
    }

    syncAudioPersistence() {
        State.audioSettings = {
            master: this.audio.master,
            ambient: this.audio.levels.ambient,
            lore: this.audio.levels.lore,
            sfx: this.audio.levels.sfx,
            muted: {
                ambient: this.audio.mutedChannels.ambient,
                lore: this.audio.mutedChannels.lore,
                sfx: this.audio.mutedChannels.sfx
            }
        };
        State.savePersistentData();
    }
}

export { Game };
