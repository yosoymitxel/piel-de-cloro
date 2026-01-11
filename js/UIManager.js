import { State } from './State.js';
import { LoreManager } from './LoreManager.js';
import { ModalManager } from './ModalManager.js';
import { AvatarRenderer } from './AvatarRenderer.js';
import { ScreenManager } from './ScreenManager.js';
import { GeneratorManager } from './GeneratorManager.js';
import { TypingEngine } from './ui/TypingEngine.js';
import { StatsHUD } from './ui/StatsHUD.js';
import { DialogueRenderer } from './ui/DialogueRenderer.js';
import { NavManager } from './ui/NavManager.js';
import { SectorRenderer } from './ui/SectorRenderer.js';
import { LogRenderer } from './ui/LogRenderer.js';
import { RunStatsRenderer } from './ui/RunStatsRenderer.js';
import { ToolsRenderer } from './ui/ToolsRenderer.js';
import { EffectsRenderer } from './ui/EffectsRenderer.js';
import { InteractionRenderer } from './ui/InteractionRenderer.js';
import { parseDialogueMarkup, escapeHtml } from './markup.js';

export class UIManager {
    constructor(audio = null) {
        this.audio = audio;
        this.screens = {
            start: $('#screen-start'),
            game: $('#screen-game'),
            shelter: $('#screen-shelter'),
            morgue: $('#screen-morgue'),
            settings: $('#screen-settings'),
            night: $('#screen-night'),
            lore: $('#screen-lore'),
            room: $('#screen-room'),
            generator: $('#screen-generator'),
            finalStats: $('#screen-final-stats'),
            log: $('#screen-log')
        };

        this.elements = {
            paranoia: $('#paranoia-level'),
            cycle: $('#cycle-count'),
            time: $('#time-display'),
            feedback: $('#inspection-feedback'),
            npcDisplay: $('#npc-display'),
            dialogue: $('#npc-dialogue'),
            dialogueOptions: $('#dialogue-options'),
            shelterGrid: $('#shelter-grid'),
            morgueGridPurged: $('#morgue-grid-purged'),
            morgueGridEscaped: $('#morgue-grid-escaped'),
            morgueGridNight: $('#morgue-grid-night'),
            securityGrid: $('#security-grid'),
            securityCount: $('#security-count'),
            roomPowerWarning: $('#room-power-warning'),
            logContainer: $('#log-container'),
            shelterCount: $('#shelter-count'),
            generatorPanel: $('#generator-panel'),
            generatorPowerBar: $('#generator-power-bar'),
            generatorModeLabel: $('#generator-mode-label'),
            sidebar: $('#sidebar-left'),
            settingsBtn: $('#btn-settings-toggle'),
            dayafterPanel: $('#dayafter-panel'),
            dayafterTestsLeft: $('#dayafter-tests-left'),
            dayafterPendingCount: $('#dayafter-pending-count'),
            dayafterValidatedCount: $('#dayafter-validated-count'),

            // Modal NPC
            modal: $('#modal-npc'),
            modalName: $('#modal-npc-name'),
            modalStatus: $('#modal-npc-status'),
            modalStats: $('#modal-npc-stats-content'),
            modalLog: $('#modal-npc-log'),
            modalPurgeBtn: $('#btn-modal-purge'),
            modalTests: $('#modal-tests-grid'),
            modalError: $('#modal-error'),

            // Generator warnings
            genWarningGame: $('#generator-warning-game'),
            genWarningShelter: $('#generator-warning-shelter'),
            genWarningPanel: $('#generator-warning-panel'),
            gameActionsContainer: $('#game-actions-container'),
            inspectionToolsContainer: $('#inspection-tools-container'),

            // Shelter finalize button
            finalizeNoPurgeBtn: $('#btn-finalize-day-no-purge'),

            // Message Modal
            msgModal: $('#modal-message'),
            msgContent: $('#modal-message-content'),
            msgBtn: $('#btn-message-ok'),

            // Confirm Modal
            confirmModal: $('#modal-confirm'),
            confirmContent: $('#modal-confirm-content'),
            confirmYes: $('#btn-confirm-yes'),
            confirmCancel: $('#btn-confirm-cancel'),

            // Tools
            tools: [
                $('#tool-thermo'),
                $('#tool-flash'),
                $('#tool-pulse'),
                $('#tool-pupils')
            ]
        };
        this.infectionEffectActive = false;
        this.typingTimer = null;

        this.timings = {
            vhsDuration: 1000,
            loreFadeOut: 500,
            modalBloodFlash: 700,
            validationOpen: 0,
            precloseOpen: 0
        };

        this.colors = State.colors;

        // Initialize Specialized Managers
        this.avatarRenderer = AvatarRenderer; // Static class
        this.screenManager = new ScreenManager(this);
        this.loreManager = new LoreManager(this, audio);
        this.modalManager = new ModalManager(this, audio);
        this.generatorManager = new GeneratorManager(this, audio);
        
        // Modularized UI Components
        this.typingEngine = new TypingEngine(audio);
        this.statsHUD = new StatsHUD(this.elements, this.colors);
        this.dialogueRenderer = new DialogueRenderer(this, this.typingEngine);
        this.navManager = new NavManager(this);
        this.sectorRenderer = new SectorRenderer(this);
        this.logRenderer = new LogRenderer(this.elements.logContainer);
        this.runStatsRenderer = new RunStatsRenderer();
        this.toolsRenderer = new ToolsRenderer(this.elements);
        this.effectsRenderer = new EffectsRenderer(audio);
        this.interactionRenderer = new InteractionRenderer(this.elements, audio);

        // For backward compatibility while refactoring
        this.modules = {
            lore: this.loreManager,
            modal: this.modalManager,
            generator: this.generatorManager,
            screen: this.screenManager,
            nav: this.navManager,
            sector: this.sectorRenderer
        };
    }

    showScreen(screenName) {
        this.screenManager.showScreen(screenName, State);
    }

    renderFinalStats(state, endingId) {
        this.screenManager.renderFinalStats(state, endingId);
    }

    applyVHS(intensity = 0.6, duration = 1000) {
        this.effectsRenderer.applyVHS(intensity, duration);
    }

    updateStats(paranoia, cycle, dayTime, dayLength, currentNPC) {
        this.statsHUD.update(paranoia, cycle, dayTime, dayLength, currentNPC);
    }

    typeText(el, text, speed = 20) {
        this.typingEngine.typeText(el, text, speed);
    }

    updateDialogueBox(npc) {
        this.dialogueRenderer.update(npc);
    }

    renderNPC(npc) {
        // Update action buttons and tools based on generator status
        this.updateGameActions();
        this.updateInspectionTools();

        // Reset Visuals
        this.elements.npcDisplay.css({ transform: 'none', filter: 'none' });
        this.elements.npcDisplay.empty();

        // Use new Render System
        const avatar = this.renderAvatar(npc, 'lg');
        this.elements.npcDisplay.append(avatar);

        // Initial Dialogue (Conversation engine)
        this.updateDialogueBox(npc);

        // Glitch
        const glitchChance = Math.min(0.9, (npc.visualFeatures.glitchChance || 0) * (State.getGlitchModifier ? State.getGlitchModifier() : 1));
        if (Math.random() < glitchChance) {
            this.triggerGlitch();
            this.applyVHS(0.8, 1000);
        }
    }

    renderAvatar(npc, sizeClass = 'lg', modifier = 'normal') {
        return AvatarRenderer.render(npc, sizeClass, modifier);
    }

    triggerGlitch() {
        this.effectsRenderer.triggerGlitch(this.elements.npcDisplay);
    }

    updateGameActions() {
        this.interactionRenderer.updateGameActions(State);
    }

    updateInspectionTools() {
        this.interactionRenderer.updateInspectionTools(State);
    }

    handleOmitTest(npc) {
        this.interactionRenderer.handleOmitTest(npc, State, this);
    }

    showValidationGate(npc) {
        this.interactionRenderer.showValidationGate(npc, State, this);
    }

    showLore(type, onClose) { return this.modules.lore.showLore(type, onClose); }

    renderNightScreen(state) {
        this.showScreen('night');
    }

    showFeedback(text, color = 'yellow') {
        this.interactionRenderer.showFeedback(text, color);
    }

    hideFeedback() {
        this.interactionRenderer.hideFeedback();
    }

    renderShelterGrid(npcs, max, onPurgeClick, onDetailClick) {
        this.sectorRenderer.renderShelterGrid(npcs, max, onPurgeClick, onDetailClick);
    }

    renderMorgueGrid(purged, escaped, night, onDetailClick) {
        this.sectorRenderer.renderMorgueGrid(purged, escaped, night, onDetailClick);
    }

    renderSecurityRoom(npcs, onDetailClick) {
        this.sectorRenderer.renderSecurityRoom(npcs, onDetailClick);
    }

    setNavStatus(navId, status) {
        this.navManager.setNavStatus(navId, status);
    }

    setNavItemStatus(navId, level) {
        this.navManager.setNavItemStatus(navId, level);
    }

    clearAllNavStatuses() {
        this.navManager.clearAllNavStatuses();
    }

    setNavLocked(navId, locked) {
        this.navManager.setNavLocked(navId, locked);
    }

    updateDayAfterSummary(npcs) {
        this.sectorRenderer.updateDayAfterSummary(npcs, State);
    }

    showMessage(text, onOk, type = 'info') {
        this.modalManager.showMessage(text, onOk, type);
    }

    showConfirm(text, onYes, onCancel) {
        this.modalManager.showConfirm(text, onYes, onCancel);
    }

    addLogEntry(type, text, options) {
        State.addLogEntry(type, text, options);
        this.updateLog();
    }

    updateLog() {
        this.logRenderer.update(State);
    }

    updateRoomStatus(state) {
        this.sectorRenderer.updateRoomStatus(state);
    }

    updateGeneratorPanel(generator) {
        this.generatorManager.updatePanel(generator);
    }

    translateValue(type, value) {
        if (type === 'skinTexture') return value === 'dry' ? 'SECA' : 'NORMAL';
        if (type === 'pupils') return value === 'dilated' ? 'DILATADAS' : 'NORMAL';
        return (value ?? '').toString();
    }

    openModal(npc, allowPurge, onPurgeConfirm) {
        this.modalManager.openModal(npc, allowPurge, onPurgeConfirm, State);
    }

    openRelocationModal(npcs, onConfirm) {
        this.modalManager.openRelocationModal(npcs, onConfirm, State);
    }

    closeModal(silent = false) {
        this.modalManager.closeModal(silent);
    }

    showModalError(text) {
        this.modalManager.showModalError(text);
    }

    clearModalError() {
        this.modalManager.clearModalError();
    }

    applyBlackout(ms = 1200) {
        this.effectsRenderer.applyBlackout(ms);
    }

    updateRunStats(state) {
        this.runStatsRenderer.update(state);
    }

    flashInfectionEffect(avatar) {
        this.effectsRenderer.flashInfectionEffect(avatar, this.colors);
    }

    animateToolThermometer(value, container = null, isInfected = null) {
        this.toolsRenderer.animateToolThermometer(value, container, isInfected);
    }

    animateToolFlashlight(value, container = null, isInfected = null) {
        this.toolsRenderer.animateToolFlashlight(value, container, isInfected);
    }

    animateToolPupils(type = 'normal', container = null, isInfected = false) {
        this.toolsRenderer.animateToolPupils(type, container, isInfected);
    }

    animateToolPulse(bpm, container = null, isInfected = null) {
        this.toolsRenderer.animateToolPulse(bpm, container, isInfected);
    }

    updateSecurityNavStatus(items) {
        this.sectorRenderer.updateSecurityNavStatus(items);
    }

    renderGeneratorRoom(state = null) {
        this.generatorManager.renderGeneratorRoom(state || State);
    }

    hideOmitOption() {
        this.interactionRenderer.hideOmitOption();
    }
}
