import { NPC } from './NPC.js';
import { State } from './State.js';
import { UIManager } from './UIManager.js?v=20261022-mobilefix2';
import { StatsManager } from './StatsManager.js';
import { AudioManager } from './AudioManager.js';
import { GameActionHandler } from './GameActionHandler.js';
import { GameMechanicsManager } from './GameMechanicsManager.js?v=20261021-daytransition1';
import { GameEventManager } from './GameEventManager.js?v=20261021-daytransition1';
import { EventOrchestrator } from './EventOrchestrator.js';
import { GameEndingManager } from './GameEndingManager.js';
import { RandomEventManager } from './RandomEventManager.js';
import { AssignmentManager } from './AssignmentManager.js';
import { GameLoopManager } from './GameLoopManager.js';
import { RenderManager } from './RenderManager.js';
import { CONSTANTS } from './Constants.js';
import { DialogueData } from './DialogueData.js';


class Game {
    constructor(dependencies = {}) {
        this.audio = dependencies.audio || new AudioManager();
        State.loadPersistentData();
        State.reset(); // Inicializar el estado global del juego

        this.ui = dependencies.ui || new UIManager(this.audio, { game: this });
        this.renderManager = new RenderManager(this.ui);
        this.stats = dependencies.stats || new StatsManager();
        this.isAnimating = false; // Bloquear acciones durante animaciones

        this.loopManager = new GameLoopManager(this);

        this.applySavedAudioSettings();

        // Modules initialization (Phase 2 & 3)
        this.orchestrator = new EventOrchestrator(this); // Init Orchestrator
        this.mechanics = new GameMechanicsManager(this);
        this.actions = new GameActionHandler(this);
        this.events = new GameEventManager(this);
        this.endings = new GameEndingManager(this);
        this.randomEvents = new RandomEventManager(this);
        this.assignments = new AssignmentManager(this);

        this.events.bindAll();
        this.bindPauseControls();
        // this.audio.loadManifest('assets/audio/audio_manifest.json'); // Moved to start button click for strict timing

        // Bloquear navegación al inicio
        this.ui.setNavLocked(true);
    }

    bindPauseControls() {
        if (typeof document === 'undefined') return;

        const bind = (id, handler) => {
            const element = document.getElementById(id);
            if (typeof element?.addEventListener === 'function') {
                element.addEventListener('click', handler);
            }
        };

        bind('btn-pause', () => this.togglePause());
        bind('btn-pause-mobile', () => this.togglePause());
        bind('btn-toggle-header', () => this.toggleHeaderCollapse());
        bind('btn-pause-close', () => this.resumeGame());
        bind('btn-pause-fullscreen', () => this.toggleFullscreen());
        bind('btn-pause-restart-day', () => this.restartDay());
        bind('btn-pause-restart-game', () => this.restartGame());
        bind('btn-pause-to-start', () => this.goToStart());
        this.setPauseControlsVisible(false);
    }

    setPauseControlsVisible(visible) {
        if (typeof document === 'undefined') return;
        for (const id of ['btn-pause', 'btn-pause-mobile']) {
            const element = document.getElementById(id);
            if (typeof element?.classList?.toggle === 'function') {
                element.classList.toggle('hidden', !visible);
            }
        }
    }

    toggleHeaderCollapse() {
        if (typeof document === 'undefined') return;
        const header = document.querySelector('#screen-game > header');
        if (!header) return;
        const collapsed = header.classList.toggle('header-collapsed');
        const icon = document.querySelector('#btn-toggle-header i');
        if (icon) {
            icon.classList.toggle('fa-chevron-up', !collapsed);
            icon.classList.toggle('fa-chevron-down', collapsed);
        }
        // Expanding used to leave the panel above the current scroll offset,
        // so only a clipped slice was visible. Bring the guard post back to
        // the top whenever the full panel is opened.
        if (!collapsed) {
            document.getElementById('screen-game')?.scrollTo?.({ top: 0, behavior: 'smooth' });
        }
        try { localStorage.setItem('headerCollapsed', collapsed ? '1' : '0'); } catch (e) {}
    }

    setHeaderCollapsed(collapsed) {
        if (typeof document === 'undefined') return;
        const header = document.querySelector('#screen-game > header');
        if (!header) return;
        header.classList.toggle('header-collapsed', collapsed);
        const icon = document.querySelector('#btn-toggle-header i');
        if (icon) {
            icon.classList.toggle('fa-chevron-up', !collapsed);
            icon.classList.toggle('fa-chevron-down', collapsed);
        }
    }

    togglePause() {
        if (State.paused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    pauseGame() {
        if (!this.loopManager || State.paused) return;
        if (!this.loopManager.isRunning) this.loopManager.start();

        State.paused = true;
        this.loopManager.pause();
        this.stopClock();
        document.body?.classList?.add('paused');
        document.getElementById('screen-game')?.classList?.add?.('is-paused');
        $('#modal-pause').removeClass('hidden').addClass('flex');

        // Reflect the live audio state when opening the shared pause/settings modal.
        const pauseAudioValues = [
            ['master', this.audio?.master],
            ['ambient', this.audio?.levels?.ambient],
            ['sfx', this.audio?.levels?.sfx],
            ['lore', this.audio?.levels?.lore],
            ['generator', this.audio?.levels?.generator]
        ];
        for (const [key, rawValue] of pauseAudioValues) {
            const value = Number.isFinite(rawValue) ? Math.round(rawValue * 100) : null;
            if (value === null) continue;
            const slider = document.getElementById(`pause-config-volume-${key}`);
            const label = document.getElementById(`pause-label-volume-${key}`);
            if (slider) slider.value = String(value);
            if (label) label.textContent = `${value}%`;
        }

        this.audio?.playSFXByKey('ui_modal_open', { volume: 0.5 });
    }

    resumeGame() {
        const wasPaused = State.paused;
        State.paused = false;
        this.loopManager?.resume();
        if (this.loopManager?.isRunning) this.startClock();
        if (typeof document !== 'undefined') {
            document.body?.classList?.remove('paused');
            document.getElementById('screen-game')?.classList?.remove?.('is-paused');
            $('#modal-pause').addClass('hidden').removeClass('flex');
        }
        if (wasPaused) this.audio?.playSFXByKey('ui_modal_close', { volume: 0.5 });
    }

    applySavedAudioSettings() {
        this.stats.start();

        // Aplicar configuraciones de audio persistentes
        if (State.audioSettings) {
            console.log('[Audio] Applying persistent settings:', State.audioSettings);
            const s = State.audioSettings;
            this.audio.setMasterVolume(s.master !== undefined ? s.master : 1.0);
            this.audio.setChannelLevel('ambient', s.ambient !== undefined ? s.ambient : 0.3);
            this.audio.setChannelLevel('lore', s.lore !== undefined ? s.lore : 0.25);
            this.audio.setChannelLevel('sfx', s.sfx !== undefined ? s.sfx : 0.6);
            this.audio.setChannelLevel('generator', s.generator !== undefined ? s.generator : 0.15);
            this.audio.setChannelLevel('heartbeat', s.heartbeat !== undefined ? s.heartbeat : 0.4);

            if (s.muted) {
                this.audio.muteChannel('ambient', !!s.muted.ambient);
                this.audio.muteChannel('lore', !!s.muted.lore);
                this.audio.muteChannel('sfx', !!s.muted.sfx);
                this.audio.muteChannel('generator', !!s.muted.generator);
                this.audio.muteChannel('heartbeat', !!s.muted.heartbeat);
            }
        } else {
            console.warn('[Audio] No persistent settings found, using defaults.');
        }

        // Cargar logs iniciales si la partida está empezando y no hay logs
        if (State.cycle === 1 && State.dayTime === 1 && (!State.gameLog || State.gameLog.length <= 1)) {
            // El reset ya añade uno, así que comprobamos si hay pocos
            if (State.gameLog.length === 0) {
                State.addLogEntry('system', 'SISTEMA RUTA-01 INICIALIZADO. PROTOCOLO DE CONTENCIÓN ACTIVO.', { icon: 'fa-microchip' });
            }
            State.addLogEntry('system', 'CONEXIÓN ESTABLECIDA CON EL REFUGIO SUBTERRÁNEO.', { icon: 'fa-network-wired' });
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
        // El tutorial no debe dejar la partida marcada como pausada al comenzar una sesión nueva.
        State.paused = false;
        document.body?.classList?.remove('paused');
        $('#modal-pause').addClass('hidden').removeClass('flex');
        this.setPauseControlsVisible(false);
        // En lugar de empezar directo, mostramos el tutorial inicial
        this.mechanics.calculateTotalLoad(); // Ensure load is calculated
        this.ui.showScreen('game');
        this.ui.elements.modalTutorial.removeClass('hidden').addClass('flex');
        
        // Usar volumen guardado o defecto
        const vol = (State.audioSettings && typeof State.audioSettings.ambient === 'number') 
            ? State.audioSettings.ambient 
            : 0.28;
            
        this.audio.playAmbientByKey('ambient_main_loop', { loop: true, volume: vol, fadeIn: 800 });

        this.loopManager.start();
    }

    startFirstDay() {
        State.paused = false;
        document.body?.classList?.remove('paused');
        document.getElementById('screen-game')?.classList?.remove?.('is-paused');
        $('#modal-pause').addClass('hidden').removeClass('flex');
        this.ensureMeditationRoom();
        this.mechanics.generateInitialEntrants();
        this.nextTurn();
        this.loopManager.start();
        this.loopManager.resume();
        this.startClock(); // Ensure clock is running
        this.setPauseControlsVisible(true);
        if (window.innerWidth <= 1280) this.setHeaderCollapsed(true);
        this.ui.updateRunStats(State);
    }

    ensureMeditationRoom() {
        if (State.currentShelter && State.currentShelter.grid) {
            const hasMeditation = Object.values(State.currentShelter.grid).some(r => r.type === 'MEDITATION');
            if (!hasMeditation) {
                console.log("[PATCH] Injecting Meditation Room...");
                let targetKey = '0,4'; // Default
                let coords = { x: 0, y: 4 };

                // Try to find an EMPTY room to replace
                const emptyRoom = Object.values(State.currentShelter.grid).find(r => r.type === 'EMPTY');
                if (emptyRoom) {
                    targetKey = `${emptyRoom.coords.x},${emptyRoom.coords.y}`;
                    coords = { ...emptyRoom.coords };
                    console.log(`[PATCH] Replacing EMPTY room at ${targetKey}`);
                }

                State.currentShelter.grid[targetKey] = {
                    id: `room_meditation_patch_${Date.now()}`,
                    type: 'MEDITATION',
                    name: 'Núcleo Psíquico',
                    coords: coords,
                    isDiscovered: true,
                    integrity: 100,
                    powerActive: true,
                    occupants: []
                };
                
                // Update shelter rooms list if tracked separately
                if (State.shelter && State.shelter.rooms && !State.shelter.rooms.includes('meditation')) {
                    State.shelter.rooms.push('meditation');
                }
            }
        }
    }

    restartDay() {
        // Un solo reset canónico: evita que esta ruta conserve flags o recursos de la partida anterior.
        State.reset();
        this.ensureMeditationRoom();

        // Reset Tutorial System
        if (this.tutorial) {
            this.tutorial.reset();
        }

        // Calculate initial load immediately to ensure UI is correct
        this.mechanics.calculateTotalLoad();

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
        this.loopManager.resume();
        this.loopManager.start();
        this.startClock();
        this.setPauseControlsVisible(true);
        if (window.innerWidth <= 1280) this.setHeaderCollapsed(true);
        this.ui.showScreen('game');
        this.ui.updateRunStats(State);
        this.ui.showFeedback("DÍA REINICIADO", "yellow", 3000);
    }

    restartGame() {
        this.stopClock();
        this.loopManager.stop();
        this.setPauseControlsVisible(false);
        State.reset();
        this.isAnimating = false;
        this.ui.resetUI();

        State.paused = false;
        $('body').removeClass('paused');
        $('#screen-game').removeClass('is-paused');
        $('#modal-pause').addClass('hidden').removeClass('flex');

        this.startGame();
    }

    goToStart() {
        this.stopClock();
        this.setPauseControlsVisible(false);
        State.reset();
        this.isAnimating = false;
        this.ui.resetUI();

        State.paused = false;
        $('body').removeClass('paused');
        $('#screen-game').removeClass('is-paused');
        $('#modal-pause').addClass('hidden').removeClass('flex');

        this.loopManager.stop();

        this.ui.showScreen('start');
        this.audio.stopAmbient({ fadeOut: 800 });
        
        const vol = (State.audioSettings && typeof State.audioSettings.ambient === 'number') 
            ? State.audioSettings.ambient 
            : 0.1;
            
        this.audio.playAmbientByKey('ambient_main_loop', { loop: true, volume: vol, fadeIn: 2000 });
    }

    start() {
        this.setPauseControlsVisible(State.cycle > 0);
        if (State.cycle === 0) {
            this.ui.showScreen('start');
        } else {
            this.ui.showScreen('game');
        }
        
        // Iniciar reloj del juego
        this.startClock();
        
        this.audio.stopAmbient({ fadeOut: 800 });
        
        const vol = (State.audioSettings && typeof State.audioSettings.ambient === 'number') 
            ? State.audioSettings.ambient 
            : 0.1;
            
        this.audio.playAmbientByKey('ambient_main_loop', { loop: true, volume: vol, fadeIn: 2000 });
    }

    startClock() {
        if (this.clockInterval) clearInterval(this.clockInterval);
        
        // 1 segundo real = 1 minuto de juego
        this.clockInterval = setInterval(() => {
            if (!State.isNight && !State.endingTriggered) {
                // Ensure secondsElapsed is a number
                if (typeof State.secondsElapsed !== 'number' || isNaN(State.secondsElapsed)) {
                    State.secondsElapsed = 0;
                }
                
                State.secondsElapsed++;
                this.ui.updateTimeDisplay();
                
                // Opcional: Si el reloj pasa de ciertas horas, cambiar iluminación o sonido
                const time = State.getGameTime();
                if (time.isNextDay && !State.dayEnded) {
                    // Forzar fin del día si llega a la madrugada (00:00)?
                    // Por ahora solo visual.
                }
            }
        }, 1000);
    }

    stopClock() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
    }

    nextTurn() {
        if (State.endingTriggered) return;

        // Sync Game Clock to Turn logic (Simulate hours passing)
        State.updateGameTimeForTurn();
        this.ui.updateTimeDisplay();

        // Limpiar referencia al NPC actual para evitar fugas de estado durante la transición
        State.currentNPC = null;

        // Asegurar que el nav esté desbloqueado al inicio de cada turno
        this.ui.setNavLocked(false);

        // Actualizar estado del generador al pasar de turno
        this.mechanics.updateGenerator();

        // Limpiar advertencias visuales del generador al cambiar de turno
        if ($('#generator-warning-panel').length) {
            $('#generator-warning-panel').addClass('hidden').removeClass('animate-pulse');
        }

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
            this.ui.showFeedback("REFUGIO LLENO: Debes tomar una decisión estratégica.", "yellow", 5000);
            this.mechanics.startNightPhase();
            return;
        }

        // Probabilidad de NPC de Lore (12%)
        // Fase 1.2 Roadmap: Filtrar por appearanceDay (NPCs lore aparecen después de cierto día)
        let isLore = false;
        if (Math.random() < 0.12) {
            const unusedLore = DialogueData.loreSubjects.filter(s =>
                !State.isDialogueUsed(s.id) &&
                (!s.appearanceDay || State.cycle >= s.appearanceDay)
            );
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
        State.generator.modeChangedThisTurn = false; // Permitir cambio de modo en nuevo turno

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

    update(deltaTime) {
        // Core game update loop
        if (State.paused) return;

        State.update(deltaTime);

        // Future: Update managers that need time-based logic
        // this.mechanics.update(deltaTime);
        // this.orchestrator.update(deltaTime);
    }

    render(deltaTime) {
        this.renderManager.render(deltaTime);
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
