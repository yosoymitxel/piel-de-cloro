import { State } from './State.js';
import { CONSTANTS } from './Constants.js';

export class GameEventManager {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
    }

    /**
     * Centralized method to switch between game screens.
     * Handles navigation locks, sound effects, and UI state updates.
     */
    switchScreen(screenId, options = {}) {
        const {
            force = false,
            lockNav = null,
            renderFn = null,
            sound = 'ui_button_click',
            volume = 0.5,
            hideFeedback = true
        } = options;

        // Check if navigation is blocked
        if (!force && (State.paused || State.navLocked || State.endingTriggered)) {
            // Exception: Allow shelter navigation during night phase if it's the current target
            if (!(screenId === CONSTANTS.SCREENS.SHELTER && State.isNight)) {
                return false;
            }
        }

        // Apply visual and state changes
        this.ui.lastNav = screenId;
        if (sound) this.audio.playSFXByKey(sound, { volume });
        
        // Detener sonidos cortos al cambiar de navegación (incluyendo bucles de escritura)
        if (this.audio && typeof this.audio.stopAllSFX === 'function') {
            this.audio.stopAllSFX(true);
        }

        if (hideFeedback) this.ui.hideFeedback();

        // Update navigation lock state if requested
        if (lockNav !== null) {
            this.ui.setNavLocked(lockNav);
        }

        // Execute specific screen rendering logic
        if (renderFn && typeof renderFn === 'function') {
            renderFn();
        }

        // Finalize screen transition
        this.ui.showScreen(screenId);
        return true;
    }

    // Navigation Methods
    navigateToGuard() {
        this.switchScreen(CONSTANTS.SCREENS.GAME);
    }

    navigateToShelter() {
        const renderFn = () => {
            if (!State.dayAfter) {
                State.dayAfter = { testsAvailable: State.config.dayAfterTestsDefault || 5 };
            }

            // Configurar el bloqueo y el botón de retorno
            if (State.isNight) {
                this.ui.setNavLocked(true);
                $('#btn-finalize-day-no-purge')
                    .off('click')
                    .on('click', () => {
                        this.ui.setNavLocked(false);
                        this.game.mechanics.startNightPhase();
                    });
            } else {
                $('#btn-finalize-day-no-purge')
                    .off('click')
                    .on('click', () => {
                        this.ui.setNavLocked(false);
                        this.navigateToGuard();
                    });
            }

            const canPurge = !State.isNight || !State.nightPurgePerformed;

            this.ui.renderShelterGrid(State.admittedNPCs, State.config.maxShelterCapacity,
                null,
                (npc) => {
                    this.ui.openModal(npc, canPurge, (target) => {
                        State.addPurged(target);
                        if (State.isNight) State.nightPurgePerformed = true;
                        if (this.ui.setNavItemStatus) this.ui.setNavItemStatus(CONSTANTS.NAV_ITEMS.MORGUE, 3);
                        
                        this.game.mechanics.calculatePurgeConsequences(target);
                        
                        if (State.isNight || State.isDayOver()) {
                            this.game.mechanics.startNightPhase();
                        } else {
                            this.navigateToShelter();
                        }
                    }, State);
                }
            );
            this.ui.updateDayAfterSummary(State.admittedNPCs);
        };

        this.switchScreen(CONSTANTS.SCREENS.SHELTER, { renderFn });
    }

    navigateToRoom() {
        const renderFn = () => {
            this.ui.renderSecurityRoom(State.securityItems, (idx, item) => {
                State.securityItems[idx] = item;
            });
        };
        this.switchScreen(CONSTANTS.SCREENS.ROOM, { renderFn });
    }

    navigateToMorgue() {
        const renderFn = () => {
            const purged = State.purgedNPCs || [];
            const escaped = State.ignoredNPCs || [];
            const night = State.departedNPCs || [];

            this.ui.renderMorgueGrid(purged, escaped, night, (npc) => {
                this.ui.openModal(npc, false, null, State);
            });
            this.ui.updateRunStats(State);
        };
        this.switchScreen(CONSTANTS.SCREENS.MORGUE, { renderFn });
    }

    navigateToGenerator() {
        const renderFn = () => {
            this.ui.renderGeneratorRoom();
        };
        this.switchScreen(CONSTANTS.SCREENS.GENERATOR, { renderFn });
    }

    navigateToLog() {
        const renderFn = () => {
            this.ui.setNavItemStatus(CONSTANTS.NAV_ITEMS.LOG, null);
            this.ui.renderLog(State);
        };
        this.switchScreen(CONSTANTS.SCREENS.LOG, { renderFn });
    }

    bindAll() {
        $('#tool-thermo, #tool-flash, #tool-pulse, #tool-pupils, #btn-admit, #btn-ignore').addClass('btn-interactive');
        
        // Fullscreen Toggle
        $('#btn-toggle-fullscreen, #btn-pause-fullscreen').on('click', () => this.game.toggleFullscreen());

        $(document).on('fullscreenchange', () => { 
            const iconElement = $('#btn-pause-fullscreen i, #btn-toggle-fullscreen i'); 
            if (document.fullscreenElement) { 
                iconElement.removeClass('fa-expand').addClass('fa-compress'); 
            } else { 
                iconElement.removeClass('fa-compress').addClass('fa-expand'); 
            } 
        });

        // Notificaciones de Bitácora
        $(document).on('log-added', (e) => { 
            const type = e.detail?.type; 
            if (type === 'lore' || type === 'note') { 
                this.ui.setNavItemStatus(CONSTANTS.NAV_ITEMS.LOG, 2); 
            } 
        });

        // Start & Settings
        $('#btn-start-game').on('click', async () => { 
            const $btn = $('#btn-start-game');
            const $text = $('#btn-start-game-text');
            
            if ($btn.hasClass('loading')) return;
            
            $btn.addClass('loading opacity-50 cursor-wait');
            $text.text('CARGANDO...');
            
            this.audio.unlock(); 
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            
            try {
                if (Object.keys(this.audio.manifest).length === 0) {
                    await this.audio.loadManifest();
                }
                await this.audio.preloadAll();
            } catch (e) {
                console.error('Preload failed', e);
            } finally {
                $text.text('INICIAR PARTIDA');
                $btn.removeClass('loading opacity-50 cursor-wait');
                this.game.startGame(); 
            }
        });

        $('#btn-settings-toggle').on('click', () => {
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
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

            State.audioSettings = { master: mv, ambient: av, lore: lv, sfx: sv };
            State.savePersistentData();

            if (State.cycle === 1 && State.dayTime === 1) this.ui.showScreen('start');
            else this.ui.showScreen('game');
        });

        // Navigation & Tooltips
        $('#nav-guard').on('click', () => this.navigateToGuard());
        $('#nav-room').on('click', () => this.navigateToRoom());
        
        // Tooltip dinámico para refugio
        $('#nav-shelter')
            .on('click', () => this.navigateToShelter())
            .on('mouseenter', () => {
                const count = State.admittedNPCs.length;
                const max = State.config.maxShelterCapacity;
                $('#nav-shelter').attr('title', `REFUGIO: ${count}/${max} sujetos`);
            });

        $('#nav-morgue').on('click', () => this.navigateToMorgue());
        $('#nav-generator').on('click', () => this.navigateToGenerator());
        $('#hud-energy-container').on('click', () => this.navigateToGenerator());
        $('#btn-bitacora').on('click', () => this.navigateToLog());
        $('#btn-log-close-header, #btn-log-back').on('click', () => {
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.ui.showScreen('game');
        });
        $('#nav-morgue-stats').on('click', () => this.game.toggleMorgueStats());
        
        // Night Screen Actions
        $('#btn-night-sleep').on('click', () => { 
            if (State.paused) return; 
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.game.mechanics.sleep(); 
        });

        $('#btn-night-relocate').on('click', () => { 
            if (State.paused) return; 
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.game.actions.relocateShelter(); 
        });

        $('#btn-night-shelter').on('click', () => { 
            if (State.paused) return; 
            this.navigateToShelter(); 
        });

        $('#btn-night-escape').on('click', () => { 
            if (State.paused) return; 
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.game.mechanics.finishRun(); 
        });

        // Pause Menu
        $('#btn-pause').on('click', () => {
            State.paused = true;
            $('body').addClass('paused');
            $('#screen-game').addClass('is-paused');
            $('#modal-pause').removeClass('hidden').addClass('flex');
            $('#toggle-mute-music').prop('checked', !this.audio.mutedChannels.ambient);
            $('#toggle-mute-sfx').prop('checked', !this.audio.mutedChannels.sfx);
        });

        $('#btn-resume').on('click', () => {
            State.paused = false;
            $('body').removeClass('paused');
            $('#screen-game').removeClass('is-paused');
            $('#modal-pause').addClass('hidden').removeClass('flex');
        });

        $('#btn-pause-restart-day').on('click', () => { 
            this.ui.showConfirm('¿REINICIAR EL DÍA ACTUAL? SE PERDERÁ TODO EL PROGRESO DE HOY.', () => { 
                this.game.restartDay(); 
            }, null, 'warning'); 
        });

        $('#btn-pause-restart-game').on('click', () => { 
            this.ui.showConfirm('¿INICIAR NUEVA PARTIDA? SE PERDERÁ TODO EL PROGRESO ACTUAL.', () => { 
                this.game.restartGame(); 
            }, null, 'warning'); 
        });

        // Inspection Tools (Delegated because they are re-rendered)
        $('#inspection-tools-container').on('click', '#tool-thermo', () => { 
            if (State.paused) return; 
            this.game.actions.inspect('thermometer'); 
        });
        $('#inspection-tools-container').on('click', '#tool-flash', () => { 
            if (State.paused) return; 
            this.game.actions.inspect('flashlight'); 
        });
        $('#inspection-tools-container').on('click', '#tool-pulse', () => { 
            if (State.paused) return; 
            this.game.actions.inspect('pulse'); 
        });
        $('#inspection-tools-container').on('click', '#tool-pupils', () => { 
            if (State.paused) return; 
            this.game.actions.inspect('pupils'); 
        });

        $('#inspection-tools-container').on('click', '#btn-goto-generator', () => { 
            this.navigateToGenerator();
        });

        // Decisions
        $(document).on('click', '#btn-admit', () => { 
            if (State.paused) return;
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.game.actions.handleDecision('admit'); 
        });
        $(document).on('click', '#btn-ignore', () => { 
            if (State.paused) return;
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); 
            this.game.actions.handleDecision('ignore'); 
        });

        // Day After Decisions
        $(document).on('click', '#btn-modal-purge', () => {
            this.game.mechanics.handlePurgeFromModal();
        });

        // Pre-close overlays
        $('#btn-preclose-purge').on('click', () => this.game.actions.handlePreCloseAction('purge'));
        $('#btn-preclose-sleep').on('click', () => this.game.actions.handlePreCloseAction('sleep'));
        $('#btn-preclose-stay').on('click', () => this.game.actions.handlePreCloseAction('stay'));
        $('#btn-preclose-escape').on('click', () => this.game.actions.handlePreCloseAction('escape'));
        $('#btn-preclose-relocate').on('click', () => this.game.actions.handlePreCloseAction('relocate'));
        
        $('#btn-finalize-day-no-purge').on('click', () => this.game.actions.handlePreCloseAction('finalize'));

        // Generator
        $('#btn-generator-toggle').on('click', () => this.game.mechanics.toggleGenerator());
        $('#btn-generator-mode-prev').on('click', () => this.game.mechanics.changeGeneratorMode(-1));
        $('#btn-generator-mode-next').on('click', () => this.game.mechanics.changeGeneratorMode(1));

        // Screen Specifics
        $('#btn-morgue-clear').on('click', () => this.game.mechanics.clearMorgue());

        // Volver al inicio desde estadísticas finales
        $('#btn-final-to-start').on('click', () => { 
            this.game.restartGame();
            this.switchScreen(CONSTANTS.SCREENS.START, { force: true }); 
        });

        // Diagnostics
        $('#btn-audio-diagnostics').on('click', () => {
            const logs = this.audio.getLogString();
            this.ui.showMessage(logs, () => { }, 'normal');
        });
        $('#btn-audio-validate').on('click', async () => {
            const report = await this.audio.validateManifest();
            this.ui.showMessage(report, () => { }, 'normal');
        });

        $('#toggle-mute-music').on('change', (e) => {
            const isEnabled = $(e.target).is(':checked');
            this.audio.muteChannel('ambient', !isEnabled);
            this.audio.muteChannel('lore', !isEnabled);
            this.game.syncAudioPersistence();
        });

        $('#toggle-mute-sfx').on('change', (e) => {
            const isEnabled = $(e.target).is(':checked');
            this.audio.muteChannel('sfx', !isEnabled);
            this.game.syncAudioPersistence();
        });

        $('#btn-pause-close').on('click', () => {
            $('#modal-pause').addClass('hidden').removeClass('flex');
            State.paused = false;
            $('body').removeClass('paused');
            $('#screen-game').removeClass('is-paused');
        });

        // Controles del Generador (Pantalla específica)
        $('#btn-gen-toggle').on('click', () => this.game.mechanics.toggleGenerator());
        $('#btn-gen-save').on('click', () => this.game.mechanics.changeGeneratorMode(-1));
        $('#btn-gen-over').on('click', () => this.game.mechanics.changeGeneratorMode(1));
        $('#btn-gen-normal').on('click', () => {
            const current = State.generator.mode;
            if (current === 'save') this.game.mechanics.changeGeneratorMode(1);
            else if (current === 'overload') this.game.mechanics.changeGeneratorMode(-1);
        });
        $('#btn-gen-manual-toggle').on('click', () => {
            $('#generator-manual').toggleClass('hidden');
        });
    }
}
