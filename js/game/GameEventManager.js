import { State } from '../State.js';

export class GameEventManager {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
    }

    bindAll() {
        $('#tool-thermo, #tool-flash, #tool-pulse, #tool-pupils, #btn-admit, #btn-ignore').addClass('btn-interactive');
        
        // Fullscreen Toggle
        $('#btn-toggle-fullscreen, #btn-pause-fullscreen').on('click', () => this.game.toggleFullscreen());

        // Start & Settings
        $('#btn-start-game').on('click', () => { 
            this.audio.unlock(); 
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.game.startGame(); 
        });

        $('#btn-settings-toggle').on('click', () => {
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            
            // Cargar valores actuales en los inputs
            $('#config-max-shelter').val(State.config.maxShelterCapacity);
            $('#config-day-length').val(State.config.dayLength);
            $('#config-dayafter-tests').val(State.config.dayAfterTestsDefault);
            
            $('#config-volume-master').val(Math.round(this.audio.master * 100));
            $('#config-volume-ambient').val(Math.round(this.audio.levels.ambient * 100));
            $('#config-volume-lore').val(Math.round(this.audio.levels.lore * 100));
            $('#config-volume-sfx').val(Math.round(this.audio.levels.sfx * 100));
            this.ui.showScreen('settings');
        });

        $('#btn-close-settings').on('click', () => {
            // Save config
            State.config.maxShelterCapacity = parseInt($('#config-max-shelter').val());
            State.config.dayLength = parseInt($('#config-day-length').val());
            State.config.dayAfterTestsDefault = parseInt($('#config-dayafter-tests').val());
            
            const mv = Math.max(0, Math.min(100, parseInt($('#config-volume-master').val()))) / 100;
            const av = Math.max(0, Math.min(100, parseInt($('#config-volume-ambient').val()))) / 100;
            const lv = Math.max(0, Math.min(100, parseInt($('#config-volume-lore').val()))) / 100;
            const sv = Math.max(0, Math.min(100, parseInt($('#config-volume-sfx').val()))) / 100;
            
            this.audio.setMasterVolume(mv);
            this.audio.setChannelLevel('ambient', av);
            this.audio.setChannelLevel('lore', lv);
            this.audio.setChannelLevel('sfx', sv);

            // Persist audio settings
            State.audioSettings = { master: mv, ambient: av, lore: lv, sfx: sv };
            State.savePersistentData();

            if (State.cycle === 1 && State.dayTime === 1) this.ui.showScreen('start');
            else this.ui.showScreen('game');
        });

        // Navigation
        $('#nav-guard').on('click', () => { 
            this.ui.lastNav = 'game'; 
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.ui.showScreen('game'); 
        });
        $('#nav-room').on('click', () => { 
            this.ui.lastNav = 'room'; 
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.game.openRoom(); 
        });
        $('#nav-shelter').on('click', () => { 
            this.ui.lastNav = 'shelter'; 
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.game.openShelter(); 
        });
        $('#nav-morgue').on('click', () => { 
            this.ui.lastNav = 'morgue'; 
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.game.openMorgue(); 
        });
        $('#nav-generator').on('click', () => { 
            this.ui.lastNav = 'generator'; 
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.game.openGenerator(); 
        });
        $('#hud-energy-container').on('click', () => { 
            this.ui.lastNav = 'generator'; 
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.game.openGenerator(); 
        });
        $('#btn-open-log').on('click', () => { 
            this.ui.lastNav = 'log'; 
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.game.openLog(); 
        });
        $('#btn-log-close-header, #btn-log-back').on('click', () => {
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.ui.showScreen('game');
        });
        $('#nav-morgue-stats').on('click', () => this.game.toggleMorgueStats());
        $('#btn-audio-diagnostics').on('click', () => {
            const logs = this.audio.getLogString();
            this.ui.showMessage(logs, () => { }, 'normal');
        });
        $('#btn-audio-validate').on('click', async () => {
            const report = await this.audio.validateManifest();
            this.ui.showMessage(report, () => { }, 'normal');
        });
        $('#btn-pause').on('click', () => {
            State.paused = true;
            $('body').addClass('paused');
            $('#screen-game').addClass('is-paused');
            $('#modal-pause').removeClass('hidden').addClass('flex');
            $('#toggle-mute-music').prop('checked', (this.audio.levels.ambient === 0 && this.audio.levels.lore === 0));
            $('#toggle-mute-sfx').prop('checked', (this.audio.levels.sfx === 0));
        });
        $('#btn-pause-close').on('click', () => {
            $('#modal-pause').addClass('hidden').removeClass('flex');
            State.paused = false;
            $('body').removeClass('paused');
            $('#screen-game').removeClass('is-paused');
        });

        $('#btn-pause-restart-day').on('click', () => {
            this.ui.showConfirm('¿REINICIAR EL DÍA ACTUAL? SE PERDERÁ TODO EL PROGRESO DE HOY.', () => {
                this.game.restartDay();
            }, null, 'warning');
        });

        $('#btn-pause-restart-game').on('click', () => {
            this.ui.showConfirm('¿INICIAR NUEVA PARTIDA? SE PERDERÁ TODO EL PROGRESO ACTUAL.', () => {
                this.game.restartGame();
            }, null, 'danger');
        });

        // Final stats navigation
        $('#btn-final-to-start').on('click', () => {
            State.reset();
            this.ui.showScreen('start');
        });

        $('#toggle-mute-music').on('change', (e) => {
            const checked = $(e.target).is(':checked');
            if (checked) {
                this.game.prevMusicLevels = { ambient: this.audio.levels.ambient, lore: this.audio.levels.lore };
                this.audio.setChannelLevel('ambient', 0);
                this.audio.setChannelLevel('lore', 0);
            } else {
                const prev = this.game.prevMusicLevels || { ambient: 0.28, lore: 0.5 };
                this.audio.setChannelLevel('ambient', prev.ambient);
                this.audio.setChannelLevel('lore', prev.lore);
            }
            this.game.syncAudioPersistence();
        });
        $('#toggle-mute-sfx').on('change', (e) => {
            const checked = $(e.target).is(':checked');
            if (checked) {
                this.game.prevSfxLevel = this.audio.levels.sfx;
                this.audio.setChannelLevel('sfx', 0);
            } else {
                this.audio.setChannelLevel('sfx', this.game.prevSfxLevel ?? 1.0);
            }
            this.game.syncAudioPersistence();
        });

        // Game Actions (Delegated to handle dynamic updates if any)
        $(document).on('click', '#btn-admit', () => {
            if (State.paused) return;
            $('#btn-admit').addClass('btn-click-flash');
            setTimeout(() => $('#btn-admit').removeClass('btn-click-flash'), 220);
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.game.handleDecision('admit');
        });

        $(document).on('click', '#btn-ignore', () => {
            if (State.paused) return;
            $('#btn-ignore').addClass('btn-click-flash');
            setTimeout(() => $('#btn-ignore').removeClass('btn-click-flash'), 220);
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.game.handleDecision('ignore');
        });

        // Tools delegation
        $('#inspection-tools-container').on('click', '#tool-thermo', () => { 
            if (State.paused) return; 
            this.game.inspect('thermometer'); 
        });
        $('#inspection-tools-container').on('click', '#tool-flash', () => { 
            if (State.paused) return; 
            this.game.inspect('flashlight'); 
        });
        $('#inspection-tools-container').on('click', '#tool-pulse', () => { 
            if (State.paused) return; 
            this.game.inspect('pulse'); 
        });
        $('#inspection-tools-container').on('click', '#tool-pupils', () => { 
            if (State.paused) return; 
            this.game.inspect('pupils'); 
        });

        // El botón de ir al generador que aparece cuando está apagado
        $('#inspection-tools-container').on('click', '#btn-goto-generator', () => {
            $('#nav-generator').trigger('click');
        });

        // Night Hub Actions
        $('#btn-night-sleep').on('click', () => this.game.sleep());
        $('#btn-night-escape').on('click', () => this.game.finishRun());
        $('#btn-night-relocate').on('click', () => this.game.relocateShelter());
        $('#btn-night-shelter').on('click', () => this.game.openShelter());

        // Relocation Modal Events
        $('#btn-relocate-cancel').on('click', () => {
            $('#modal-relocate').addClass('hidden');
        });

        $('#btn-relocate-confirm').on('click', () => {
            this.game.confirmRelocation();
        });

        // Log notification animation
        $(document).on('log-added', () => {
            const btn = $('#btn-open-log');
            btn.addClass('log-btn-notify');
            setTimeout(() => btn.removeClass('log-btn-notify'), 800);
        });

        // Finalize day without purge (visible only at end of day in Shelter)
        $('#btn-finalize-day-no-purge').on('click', () => {
            if (State.isDayOver() && !State.isNight) {
                this.game.startNightPhase();
            }
        });
    }
}
