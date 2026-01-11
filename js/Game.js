import { State } from './State.js';
import { UIManager } from './UIManager.js';
import { StatsManager } from './StatsManager.js';
import { AudioManager } from './AudioManager.js';
import { GameEventManager } from './game/GameEventManager.js';
import { GameFlowManager } from './game/GameFlowManager.js';
import { GameActionHandler } from './game/GameActionHandler.js';
import { GameMechanicsManager } from './game/GameMechanicsManager.js';

class Game {
    constructor() {
        this.audio = new AudioManager();
        State.loadPersistentData();
        this.applySavedAudioSettings();
        
        this.ui = new UIManager(this.audio);
        this.stats = new StatsManager();
        this.isAnimating = false; // Bloquear acciones durante animaciones
        
        // Modularized Game Controllers
        this.eventManager = new GameEventManager(this);
        this.flowManager = new GameFlowManager(this);
        this.actionHandler = new GameActionHandler(this);
        this.mechanicsManager = new GameMechanicsManager(this);

        this.bindEvents();
        this.audio.loadManifest('assets/audio/audio_manifest.json');
        this.initStats();
    }

    applySavedAudioSettings() {
        const s = State.audioSettings;
        this.audio.setMasterVolume(s.master);
        this.audio.setChannelLevel('ambient', s.ambient);
        this.audio.setChannelLevel('lore', s.lore);
        this.audio.setChannelLevel('sfx', s.sfx);
    }

    syncAudioPersistence() {
        State.audioSettings = {
            master: this.audio.master,
            ambient: this.audio.levels.ambient,
            lore: this.audio.levels.lore,
            sfx: this.audio.levels.sfx
        };
        State.savePersistentData();
    }

    bindEvents() {
        this.eventManager.bindAll();
    }

    initStats() {
        this.stats.start();
    }

    // --- Delegation to FlowManager ---
    startGame() { this.flowManager.startGame(); }
    restartDay() { this.flowManager.restartDay(); }
    restartGame() { this.flowManager.restartGame(); }
    nextTurn() { this.flowManager.nextTurn(); }
    startNightPhase() { this.flowManager.startNightPhase(); }
    startNextDay() { this.flowManager.startNextDay(); }
    triggerEnding(id) { this.flowManager.triggerEnding(id); }
    endGame() { this.flowManager.endGame(); }

    // --- Delegation to ActionHandler ---
    inspect(tool) { this.actionHandler.inspect(tool); }
    handleDecision(action) { this.actionHandler.handleDecision(action); }
    handlePreCloseAction(action) { this.actionHandler.handlePreCloseAction(action); }
    relocateShelter() { this.actionHandler.relocateShelter(); }
    confirmRelocation(selected) { this.actionHandler.confirmRelocation(selected); }

    // --- Delegation to MechanicsManager ---
    updateGenerator() { this.mechanicsManager.updateGenerator(); }
    triggerGeneratorFailure() { this.mechanicsManager.triggerGeneratorFailure(); }
    toggleGenerator() { this.mechanicsManager.toggleGenerator(); }
    checkSecurityDegradation() { this.mechanicsManager.checkSecurityDegradation(); }
    shutdownSecuritySystem() { this.mechanicsManager.shutdownSecuritySystem(); }
    calculatePurgeConsequences(npc) { this.mechanicsManager.calculatePurgeConsequences(npc); }
    sleep() { this.mechanicsManager.sleep(); }
    continueDay() { this.mechanicsManager.continueDay(); }
    processIntrusions() { this.mechanicsManager.processIntrusions(); }
    attemptDayIntrusion() { this.mechanicsManager.attemptDayIntrusion(); }
    generateInitialEntrants() { this.mechanicsManager.generateInitialEntrants(); }
    deactivateSecurityItem(item, idx) { this.mechanicsManager.deactivateSecurityItem(item, idx); }
    finishRun() { this.mechanicsManager.finishRun(); }

    // --- Navigation & UI Utilities ---
    updateHUD() {
        this.ui.updateStats(State.paranoia, State.cycle, State.dayTime, State.config.dayLength, State.currentNPC);
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

    openShelter() {
        if (State.endingTriggered) return;
        if (!State.dayAfter) {
            State.dayAfter = { testsAvailable: State.config.dayAfterTestsDefault || 5 };
        }
        this.ui.hideFeedback();

        if (State.isNight) {
            this.ui.setNavLocked(true);
            $('#nav-shelter').addClass('active').prop('disabled', false);
            $('#btn-finalize-day-no-purge').off('click').on('click', () => this.startNightPhase());
        } else {
            $('#btn-finalize-day-no-purge').off('click').on('click', () => {
                this.ui.setNavLocked(false);
                this.ui.showScreen('game');
            });
        }

        const canPurge = !State.isNight || !State.nightPurgePerformed;

        this.ui.renderShelterGrid(State.admittedNPCs, State.config.maxShelterCapacity, null, (npc) => {
            this.ui.openModal(npc, canPurge, (target) => {
                State.addPurged(target);
                if (State.isNight) State.nightPurgePerformed = true;
                if (this.ui && this.ui.setNavItemStatus) this.ui.setNavItemStatus('nav-morgue', 3);
                this.calculatePurgeConsequences(target);
                
                if (State.isNight || State.isDayOver()) this.startNightPhase();
                else this.openShelter();
            });
        });
        this.ui.updateDayAfterSummary(State.admittedNPCs);
        this.ui.showScreen('shelter');
    }

    openRoom() {
        if (State.endingTriggered) return;
        this.ui.renderSecurityRoom(State.securityItems, (idx, item) => {
            State.securityItems[idx] = item;
        });
        this.ui.showScreen('room');
    }

    openMorgue() {
        if (State.endingTriggered) return;
        const purged = State.purgedNPCs || [];
        const escaped = State.ignoredNPCs || [];
        const night = State.departedNPCs || [];

        this.ui.renderMorgueGrid(purged, escaped, night, (npc) => {
            this.ui.openModal(npc, false, null);
        });
        this.ui.showScreen('morgue');
        this.ui.updateRunStats(State);
    }

    openGenerator() {
        if (State.endingTriggered) return;
        this.ui.renderGeneratorRoom();
        this.ui.showScreen('generator');
    }

    openLog() {
        if (State.endingTriggered) return;
        this.ui.updateLog();
        this.ui.showScreen('log');
    }
}

// Initialize when DOM is ready
$(document).ready(() => {
    window.game = new Game();
});

export { Game };
