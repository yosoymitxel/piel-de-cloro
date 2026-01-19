import { State } from './State.js';
import { CONSTANTS } from './Constants.js';

export class GameEventManager {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
    }

    saveAudioSettings() {
        State.audioSettings = {
            master: this.audio.master,
            ambient: this.audio.levels.ambient,
            lore: this.audio.levels.lore,
            sfx: this.audio.levels.sfx,
            generator: this.audio.levels.generator,
            heartbeat: this.audio.levels.heartbeat,
            muted: { ...this.audio.mutedChannels }
        };
        State.savePersistentData();
        console.log('[Audio] Settings saved:', State.audioSettings);
    }

    /**
     * Centralized method to switch between game screens.
     * Handles navigation locks, sound effects, and UI state updates.
     */
    async switchScreen(screenId, options = {}) {
        console.log(`[EVENT] switchScreen requested to: ${screenId}`);
        let {
            force = false,
            lockNav = null,
            renderFn = null,
            sound = 'ui_button_click',
            volume = 0.5,
            hideFeedback = true
        } = options;

        if (screenId === CONSTANTS.SCREENS.ROOM && this.ui.lastNav !== CONSTANTS.SCREENS.ROOM) {
             sound = 'camera_switch';
             volume = 0.4;
        }

        // Check if navigation is blocked
        if (!force && (State.paused || State.navLocked || State.endingTriggered)) {
            // Exception: Allow shelter navigation during night phase if it's the current target
            if (!(screenId === CONSTANTS.SCREENS.SHELTER && State.isNight)) {
                console.warn(`[EVENT] Navigation blocked to ${screenId}`);
                return false;
            }
        }

        // Apply visual transition (Phase 5.3)
        // Ahora pasamos la lógica de renderizado como callback para que ocurra durante el "blackout"
        const executeSwitch = () => {
            console.log(`[EVENT] Executing screen switch logic for: ${screenId}`);
             // Execute specific screen rendering logic
            if (renderFn && typeof renderFn === 'function') {
                renderFn();
            }

            // Finalize screen transition
            this.ui.showScreen(screenId);

             // Update navigation lock state if requested
            if (lockNav !== null) {
                this.ui.setNavLocked(lockNav);
            }
        };

        if (this.ui && typeof this.ui.triggerTransitionEffect === 'function') {
            await this.ui.triggerTransitionEffect(executeSwitch);
        } else {
            executeSwitch();
        }

        // Apply visual and state changes
        this.ui.lastNav = screenId;
        if (sound) this.audio.playSFXByKey(sound, { volume });

        // Detener sonidos cortos al cambiar de navegación
        if (this.audio && typeof this.audio.stopAllSFX === 'function') {
            this.audio.stopAllSFX(true);
        }

        if (hideFeedback) this.ui.hideFeedback();

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
                        
                        if (this.audio) this.audio.playSFXByKey('morgue_incinerate', { volume: 0.7 });

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
        console.log("[EVENT] navigateToGenerator called. Setting up renderFn...");
        const renderFn = () => {
            console.log("[EVENT] Executing generator renderFn. Calling ui.renderGeneratorRoom...");
            if (this.ui && typeof this.ui.renderGeneratorRoom === 'function') {
                this.ui.renderGeneratorRoom(State);
            } else {
                console.error("[EVENT] ui.renderGeneratorRoom is not a function!", this.ui);
            }
        };
        console.log("[EVENT] Calling switchScreen to GENERATOR...");
        this.switchScreen(CONSTANTS.SCREENS.GENERATOR, { renderFn });
    }

    navigateToLog() {
        const renderFn = () => {
            this.ui.setNavItemStatus(CONSTANTS.NAV_ITEMS.LOG, null);
            this.ui.renderLog(State);
        };
        this.switchScreen(CONSTANTS.SCREENS.LOG, { renderFn });
    }

    navigateToMap(options = {}) {
        const renderFn = () => {
            // Render Conceptual Grid (Phase 4.3 Blueprint)
            this.ui.renderBlueprint(State.currentShelter);

            // Render current pins (sidebar/hud)
            this.ui.renderPinnedRooms(State);
        };
        return this.switchScreen(CONSTANTS.SCREENS.MAP, { ...options, renderFn });
    }

    navigateToMeditation() {
        this.switchScreen(CONSTANTS.SCREENS.MEDITATION, {
            renderFn: () => {
                if (this.ui.renderMeditationRoom) this.ui.renderMeditationRoom(State);
            }
        });
    }

    navigateToLab() {
        this.switchScreen(CONSTANTS.SCREENS.LAB, {
            renderFn: () => {
                if (this.ui.renderLab) this.ui.renderLab(State);
            }
        });
    }

    navigateToFuelRoom() {
        console.log("Navigating to Fuel Room...");
        const renderFn = () => {
            console.log("Rendering Fuel Room UI...");
            $('#fuel-hub-count').text(`${State.fuel} UNITS`);
            if (this.ui && this.ui.renderSectorPanel) {
                console.log("Rendering Fuel Sector Panel...");
                this.ui.renderSectorPanel('#fuel-guard-panel', 'fuel', State);
            }
        };
        this.switchScreen(CONSTANTS.SCREENS.FUEL_ROOM, { renderFn });
        console.log("Switch screen call sent.");
    }

    navigateToSuppliesHub() {
        const renderFn = () => {
            $('#supplies-hub-count').text(`${State.supplies} UNITS`);
            if (this.ui && this.ui.renderSectorPanel) {
                this.ui.renderSectorPanel('#supplies-guard-panel', 'supplies', State);
            }
        };
        this.switchScreen(CONSTANTS.SCREENS.SUPPLIES_HUB, { renderFn });
    }

    togglePinRoom(roomId) {
        const idx = State.pinnedRooms.indexOf(roomId);
        if (idx > -1) {
            // Unpin
            State.pinnedRooms.splice(idx, 1);
            this.ui.showFeedback(`SALA DESANCLADA: ${roomId.toUpperCase()}`, "normal", 2000);
        } else {
            // Pin
            if (State.pinnedRooms.length >= 5) {
                this.ui.showFeedback("MÁXIMO 5 SALAS ANCLADAS", "red", 3000);
                return;
            }
            State.pinnedRooms.push(roomId);
            this.ui.showFeedback(`SALA ANCLADA: ${roomId.toUpperCase()}`, "green", 2000);
        }

        // Refresh UI
        this.ui.renderPinnedRooms(State);
    }

    navigateToRoomByKey(key) {
        // Wrapper for external calls (e.g. from UIManager)
        const navMap = {
            game: this.navigateToGuard.bind(this),
            room: this.navigateToRoom.bind(this),
            security: this.navigateToRoom.bind(this), // Security maps to Room (Surveillance)
            shelter: this.navigateToShelter.bind(this),
            generator: this.navigateToGenerator.bind(this),
            supplies: this.navigateToSuppliesHub.bind(this),
            storage: this.navigateToSuppliesHub.bind(this), // Map storage to supplies
            'fuel-room': this.navigateToFuelRoom.bind(this),
            meditation: this.navigateToMeditation.bind(this),
            morgue: this.navigateToMorgue.bind(this),
            database: () => this.ui.showScreen(CONSTANTS.SCREENS.DATABASE),
            lab: this.navigateToLab.bind(this)
        };

        if (navMap[key]) {
            navMap[key]();
        } else {
            console.warn(`[EVENT] No navigation handler for key: ${key}`);
        }
    }

    handleSuppliesClick() {
        let suppliesNPCId = null;
        if (State.assignments && State.assignments.supplies) {
            suppliesNPCId = State.assignments.supplies.occupants[0];
        } else {
            suppliesNPCId = State.sectorAssignments?.supplies?.[0];
        }
        const npc = State.admittedNPCs.find(n => n.id === suppliesNPCId);

        if (!npc) {
            this.ui.showConfirm("SECTOR DE SUMINISTROS: NO HAY PERSONAL ASIGNADO PARA EXPEDICIONES.<br>¿ASIGNAR EN EL REFUGIO?", () => {
                this.navigateToShelter();
            }, null, 'normal');
            return;
        }

        this.ui.showConfirm(`¿DESPLEGAR A ${npc.name.toUpperCase()} PARA UNA EXPEDICIÓN DE SUMINISTROS?<br><span class="text-xs text-alert">RIESGO DE PÉRDIDA DEL SUJETO: MEDIO-ALTO</span>`, () => {
            this.game.mechanics.startScavengingExpedition(npc);
        }, null, 'warning');
    }

    handleFuelClick() {
        let fuelNPCId = null;
        if (State.assignments && State.assignments.fuel) {
            fuelNPCId = State.assignments.fuel.occupants[0];
        } else {
            fuelNPCId = State.sectorAssignments?.fuel?.[0];
        }
        const npc = State.admittedNPCs.find(n => n.id === fuelNPCId);

        if (!npc) {
            this.ui.showConfirm("DEPÓSITO DE COMBUSTIBLE: NO HAY PERSONAL ASIGNADO PARA EXTRACCIÓN.<br>¿ASIGNAR EN EL REFUGIO?", () => {
                this.navigateToShelter();
            }, null, 'normal');
            return;
        }

        this.ui.showConfirm(`¿DESPLEGAR A ${npc.name.toUpperCase()} PARA EXTRACCIÓN DE COMBUSTIBLE?<br><span class="text-xs text-alert">RIESGO DE PÉRDIDA DEL SUJETO: ALTO</span>`, () => {
            this.game.mechanics.startFuelExpedition(npc);
        }, null, 'warning');
    }

    bindAll() {
        // ... (existing bindings) ...

        // Ensure Fuel Room click binding is robust and separate
        // Use 'off' to prevent duplicate listeners if re-bound
        $(document).off('click', '#map-node-fuel').on('click', '#map-node-fuel', (e) => {
            e.preventDefault(); // Prevent default anchor behavior if any
            e.stopPropagation(); // Stop propagation to parent map handlers
            console.log('Fuel Room Clicked (Specific Handler)');
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5, overlap: true });
            this.navigateToFuelRoom();
        });

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
            $('#btn-pause').removeClass('hidden');
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
                await this.audio.preloadAll((progress) => {
                    const pct = Math.floor(progress * 100);
                    $text.text(`CARGANDO... ${pct}%`);
                });
            } catch (e) {
                console.error('Preload failed', e);
            } finally {
                $text.text('INICIAR PARTIDA');
                $btn.removeClass('loading opacity-50 cursor-wait');
                this.game.startGame();
            }
        });

        // Developer Apply Changes (Settings Screen)
        $('#btn-dev-apply').on('click', () => {
            if (!State.debug) return;

            // Update Config
            State.config.maxShelterCapacity = parseInt($('#dev-config-shelter').val()) || 10;
            State.config.dayLength = parseInt($('#dev-config-daylength').val()) || 5;

            const intrusionProb = parseInt($('#dev-config-intrusion').val());
            State.config.securityIntrusionProbability = !isNaN(intrusionProb) ? intrusionProb / 100 : 0.25;
            
            this.ui.showFeedback('CONFIGURACIÓN DE DESARROLLADOR APLICADA', 'green');
        });

        // Settings Modal Toggle
        $('#btn-settings-toggle').off('click').on('click', () => {
             // Audio Sliders Population
             $('#config-volume-master').val(Math.round(this.audio.master * 100));
             $('#label-volume-master').text(`${Math.round(this.audio.master * 100)}%`);

             $('#config-volume-ambient').val(Math.round(this.audio.levels.ambient * 100));
             $('#label-volume-ambient').text(`${Math.round(this.audio.levels.ambient * 100)}%`);

             $('#config-volume-sfx').val(Math.round(this.audio.levels.sfx * 100));
             $('#label-volume-sfx').text(`${Math.round(this.audio.levels.sfx * 100)}%`);

             $('#config-volume-lore').val(Math.round(this.audio.levels.lore * 100));
             $('#label-volume-lore').text(`${Math.round(this.audio.levels.lore * 100)}%`);

             $('#config-volume-generator').val(Math.round(this.audio.levels.generator * 100));
             $('#label-volume-generator').text(`${Math.round(this.audio.levels.generator * 100)}%`);
             
             // Developer Section Visibility & Population
             if (State.debug) {
                 $('#settings-dev-section').removeClass('hidden').addClass('flex');
                 $('#dev-config-intrusion').val(Math.round(State.config.securityIntrusionProbability * 100));
                 $('#dev-config-supplies').val(State.config.initialSupplies || 15);
                 $('#dev-config-paranoia').val(Math.round(State.config.initialParanoia || 0));
                 $('#dev-config-shelter').val(State.config.maxShelterCapacity);
                 $('#dev-config-daylength').val(State.config.dayLength);
             }

            $('#modal-settings').removeClass('hidden').addClass('flex');
            this.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });
        });

        // --- Audio Config Listeners ---
        const bindAudioSlider = (id, channelName) => {
            $(id).on('input', (e) => {
                const val = parseInt(e.target.value);
                $(id.replace('config-', 'label-')).text(`${val}%`);
                
                if (channelName === 'master') {
                    this.audio.setMasterVolume(val / 100);
                } else {
                    this.audio.setChannelLevel(channelName, val / 100);
                }

                // UX Feedback: Beep on change (throttled)
                if (this.audio && !this._volBeepThrottle) {
                    // Use higher volume (1.0) so it's clearly audible at current master level
                    this.audio.playSFXByKey('ui_hover', { volume: 1.0 }); 
                    this._volBeepThrottle = setTimeout(() => this._volBeepThrottle = null, 100);
                }
            });
        };

        bindAudioSlider('#config-volume-master', 'master');
        bindAudioSlider('#config-volume-ambient', 'ambient');
        bindAudioSlider('#config-volume-sfx', 'sfx');
        bindAudioSlider('#config-volume-lore', 'lore');
        bindAudioSlider('#config-volume-generator', 'generator');

        // Bind Pause Modal Sliders
        bindAudioSlider('#pause-config-volume-master', 'master');
        bindAudioSlider('#pause-config-volume-ambient', 'ambient');
        bindAudioSlider('#pause-config-volume-sfx', 'sfx');
        bindAudioSlider('#pause-config-volume-lore', 'lore');
        bindAudioSlider('#pause-config-volume-generator', 'generator');

        $('#btn-settings-apply').off('click').on('click', () => {
            // Only update game config if dev fields exist and are visible/active
            if (State.debug) {
                const shelterCap = parseInt($('#dev-config-shelter').val());
                if (!isNaN(shelterCap)) State.config.maxShelterCapacity = shelterCap;
                
                const dayLen = parseInt($('#dev-config-daylength').val());
                if (!isNaN(dayLen)) State.config.dayLength = dayLen;

                const intrusionProb = parseInt($('#dev-config-intrusion').val());
                if (!isNaN(intrusionProb)) State.config.securityIntrusionProbability = intrusionProb / 100;
            }

            // Save audio settings (values are already applied via sliders, but we save to persistence)
            const mv = Math.max(0, Math.min(100, parseInt($('#config-volume-master').val()))) / 100;
            const av = Math.max(0, Math.min(100, parseInt($('#config-volume-ambient').val()))) / 100;
            const lv = Math.max(0, Math.min(100, parseInt($('#config-volume-lore').val()))) / 100;
            const sv = Math.max(0, Math.min(100, parseInt($('#config-volume-sfx').val()))) / 100;
            const gv = Math.max(0, Math.min(100, parseInt($('#config-volume-generator').val()))) / 100;

            // Update audio manager one last time to be sure
            this.audio.setMasterVolume(mv);
            this.audio.setChannelLevel('ambient', av);
            this.audio.setChannelLevel('lore', lv);
            this.audio.setChannelLevel('sfx', sv);
            this.audio.setChannelLevel('generator', gv);

            State.audioSettings = { 
                master: mv, 
                ambient: av, 
                lore: lv, 
                sfx: sv, 
                generator: gv,
                heartbeat: this.audio.levels.heartbeat, // Persist heartbeat level
                muted: { ...this.audio.mutedChannels } // Persist mute state
            };
            State.savePersistentData();

            $('#modal-settings').addClass('hidden').removeClass('flex');
            
            // Also close pause modal if open (handling the "Apply & Close" from pause screen)
            if (!$('#modal-pause').hasClass('hidden')) {
                $('#modal-pause').addClass('hidden').removeClass('flex');
                State.paused = false;
                $('body').removeClass('paused');
                $('#screen-game').removeClass('is-paused');
            }

            this.audio.playSFXByKey('ui_confirm', { volume: 0.5 });
        });

        // Navigation & Tooltips
        $('#nav-guard').on('click', () => {
            this.navigateToGuard();
        });
        $('#nav-map').on('click', () => {
            this.navigateToMap();
        });
        $('#nav-room').on('click', () => {
            this.navigateToRoom();
        });
        $('#nav-shelter').on('click', () => {
            this.navigateToShelter();
        });
        $('#nav-morgue').on('click', () => {
            this.navigateToMorgue();
        });
        $('#nav-log').on('click', () => {
            this.navigateToLog();
        });

        // Map Nodes Click
        $(document).on('click', '.map-node-btn', (e) => {
            const room = $(e.currentTarget).data('room');
            // Removed redundant audio play to allow switchScreen to handle it contextually

            const navMap = {
                game: this.navigateToGuard.bind(this),
                room: this.navigateToRoom.bind(this),
                shelter: this.navigateToShelter.bind(this),
                generator: this.navigateToGenerator.bind(this),
                supplies: this.navigateToSuppliesHub.bind(this),
                'fuel-room': this.navigateToFuelRoom.bind(this),
                meditation: this.navigateToMeditation.bind(this),
                morgue: this.navigateToMorgue.bind(this),
                database: () => this.ui.showScreen(CONSTANTS.SCREENS.DATABASE),
                lab: this.navigateToLab.bind(this)
            };

            if (navMap[room]) {
                navMap[room]();
            }
        });

        // Pines del Mapa
        $('.map-node-pin-btn').on('click', (e) => {
            e.stopPropagation(); // Evitar navegar a la sala al pulsar el pin
            const roomId = $(e.currentTarget).data('room');
            this.togglePinRoom(roomId);
        });

        // Actividades de Meditación
        $('#btn-med-breath').on('click', () => {
            if (State.paranoia > 0) {
                State.updateParanoia(-2);
                this.ui.showFeedback("RESPIRACIÓN COMPLETADA: PARANOIA -2", "green", 3000);

                // Animation Trigger
                const visualizer = $('.meditation-visualizer');
                visualizer.removeClass('pulse-grow');
                void visualizer[0].offsetWidth; // trigger reflow
                visualizer.addClass('pulse-grow');
            } else {
                this.ui.showFeedback("MENTE EN CALMA", "blue", 2000);
            }
            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.3 });
            
            // UX: Actualizar UI en tiempo real
            if (this.ui.renderMeditationRoom) this.ui.renderMeditationRoom(State);
        });

        $('#btn-med-music').on('click', () => {
            if (State.sanity < 100) {
                State.updateSanity(2); // Reduced from +5 to balance
                this.ui.showFeedback("FRECUENCIAS Z: CORDURA +2", "blue", 3000);

                // Animation Trigger
                const visualizer = $('.meditation-visualizer');
                visualizer.removeClass('pulse-grow');
                void visualizer[0].offsetWidth; // trigger reflow
                visualizer.addClass('pulse-grow');
            } else {
                this.ui.showFeedback("ESTABILIDAD MENTAL MÁXIMA", "blue", 2000);
            }
            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.3 });
            
            // UX: Actualizar UI en tiempo real
            if (this.ui.renderMeditationRoom) this.ui.renderMeditationRoom(State);
        });

        $('#btn-start-expedition-hub').on('click', () => {
            this.handleSuppliesClick();
        });
        $('#btn-start-fuel-expedition').on('click', () => {
            this.handleFuelClick();
        });
        $('#hud-energy-container').on('click', () => this.navigateToGenerator());
        $('#btn-bitacora, #btn-open-log').on('click', () => this.navigateToLog());
        $('#btn-log-close-header, #btn-log-back').on('click', () => {
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.ui.showScreen('game');
        });
        $('#nav-morgue-stats').on('click', () => this.game.toggleMorgueStats());

        // Night Screen Actions
        $('#btn-night-sleep').on('click', () => {
            if (State.paused) return;
            this.audio.playSFXByKey('sleep_begin', { volume: 0.6 });
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
            this.audio.playSFXByKey('escape_attempt', { volume: 0.7 });
            this.game.mechanics.finishRun();
        });

        // Botón de pausa (Global)
        $('#btn-pause').on('click', () => {
            State.paused = true;
            $('body').addClass('paused');
            $('#screen-game').addClass('is-paused');
            $('#modal-pause').removeClass('hidden').addClass('flex');
            
            // Sync Pause Sliders with current audio state
            $('#pause-config-volume-master').val(Math.round(this.audio.master * 100));
            $('#pause-label-volume-master').text(`${Math.round(this.audio.master * 100)}%`);

            $('#pause-config-volume-ambient').val(Math.round(this.audio.levels.ambient * 100));
            $('#pause-label-volume-ambient').text(`${Math.round(this.audio.levels.ambient * 100)}%`);

            $('#pause-config-volume-sfx').val(Math.round(this.audio.levels.sfx * 100));
            $('#pause-label-volume-sfx').text(`${Math.round(this.audio.levels.sfx * 100)}%`);

            $('#pause-config-volume-lore').val(Math.round(this.audio.levels.lore * 100));
            $('#pause-label-volume-lore').text(`${Math.round(this.audio.levels.lore * 100)}%`);

            $('#pause-config-volume-generator').val(Math.round(this.audio.levels.generator * 100));
            $('#pause-label-volume-generator').text(`${Math.round(this.audio.levels.generator * 100)}%`);

            $('#toggle-mute-music').prop('checked', !this.audio.mutedChannels.ambient);
            $('#toggle-mute-sfx').prop('checked', !this.audio.mutedChannels.sfx);


            // Menu de Pausa simplificado (sin panel dev duplicado)
            if (State.debug) {
                // Si quisieras mantener algo en el menú de pausa, iría aquí, pero el usuario pidió moverlo al settings
            }
        });

        $('#btn-resume').on('click', () => {
            State.paused = false;
            $('body').removeClass('paused');
            $('#screen-game').removeClass('is-paused');
            $('#modal-pause').addClass('hidden').removeClass('flex');
        });

        // Mute controls in pause menu
        $('#toggle-mute-music').on('change', (e) => {
            const muted = !e.target.checked;
            this.audio.muteChannel('ambient', muted);
            State.audioSettings.muted.ambient = muted;
            State.savePersistentData();
        });

        $('#toggle-mute-sfx').on('change', (e) => {
            const muted = !e.target.checked;
            this.audio.muteChannel('sfx', muted);
            State.audioSettings.muted.sfx = muted;
            State.savePersistentData();
        });

        $('#btn-pause-restart-day').on('click', () => {
            this.ui.showConfirm('¿REINICIAR EL DÍA ACTUAL?<br>SE PERDERÁ TODO EL PROGRESO DE HOY.', () => {
                this.game.restartDay();
            }, null, 'warning');
        });


        $('#btn-pause-restart-game').on('click', () => {
            this.ui.showConfirm('<span class="text-red-400">¿REINICIAR TODA LA PARTIDA?</span><br>SE PERDERÁ EL PROGRESO.', () => {
                this.game.restartGame();
            }, null, 'warning');
        });


        $('#btn-pause-to-start').on('click', () => {
            this.ui.showConfirm('¿VOLVER AL MENÚ PRINCIPAL?<br>SE PERDERÁ EL PROGRESO NO GUARDADO.', () => {
                this.game.goToStart();
            }, null, 'warning');
        });

        // Fullscreen Toggle in Pause
        $('#btn-pause-fullscreen').on('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });

        // Inspection Tools (Delegated to document for maximum resilience)
        $(document).on('click', '#inspection-tools-container #tool-thermo', () => {
            if (State.paused) {
                return;
            }
            this.game.actions.inspect('thermometer');
        });
        $(document).on('click', '#inspection-tools-container #tool-flash', () => {
            if (State.paused) {
                return;
            }
            this.game.actions.inspect('flashlight');
        });
        $(document).on('click', '#inspection-tools-container #tool-pulse', () => {
            if (State.paused) {
                return;
            }
            this.game.actions.inspect('pulse');
        });
        $(document).on('click', '#inspection-tools-container #tool-pupils', () => {
            if (State.paused) {
                return;
            }
            this.game.actions.inspect('pupils');
        });

        $(document).on('click', '#inspection-tools-container #btn-goto-generator', () => {
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
            this.game.goToStart();
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

        $('#btn-pause-close').on('click', () => {
            this.saveAudioSettings();
            $('#modal-pause').addClass('hidden').removeClass('flex');
            State.paused = false;
            $('body').removeClass('paused');
            $('#screen-game').removeClass('is-paused');
        });

        // Developer Apply Changes (Settings Screen)
        $('#btn-dev-apply').on('click', () => {
            if (!State.debug) return;

            // Update Config
            State.config.maxShelterCapacity = parseInt($('#dev-config-shelter').val()) || 10;
            State.config.dayLength = parseInt($('#dev-config-daylength').val()) || 5;

            const intrusionProb = parseInt($('#dev-config-intrusion').val());
            State.config.securityIntrusionProbability = !isNaN(intrusionProb) ? intrusionProb / 100 : 0.25;
            
            State.config.initialSupplies = parseInt($('#dev-config-supplies').val()) || 15;
            State.config.initialParanoia = parseInt($('#dev-config-paranoia').val()) || 0;

            // Apply immediate changes if sensible
            State.supplies = State.config.initialSupplies;
            // Only force paranoia reset if explicitly changed, but let's just stick to update current

            // Energy Cost Logic
            const energyMode = $('#dev-config-energy-cost').val();
            if (energyMode === 'low') {
                State.config.generator.consumption = { save: 0, normal: 1, overload: 2 };
            } else if (energyMode === 'high') {
                State.config.generator.consumption = { save: 2, normal: 3, overload: 4 };
            } else {
                State.config.generator.consumption = { save: 1, normal: 2, overload: 3 }; // Normal
            }

            // Feedback
            const fb = $('#dev-feedback');
            fb.removeClass('hidden');

            if (this.audio) this.audio.playSFXByKey('ui_confirm', { volume: 0.5 });
            setTimeout(() => fb.addClass('hidden'), 2000);

            this.game.updateHUD();
            this.ui.showMessage('CONFIGURACIÓN DE DESARROLLADOR APLICADA', () => {}, 'success');
        });

        // Developer Apply Changes (Pause Modal)
        $('#pause-btn-dev-apply').on('click', () => {
            if (!State.debug) return;

            // Update Config
            State.config.maxShelterCapacity = parseInt($('#pause-dev-config-shelter').val()) || 10;
            State.config.dayLength = parseInt($('#pause-dev-config-daylength').val()) || 5;

            const intrusionProb = parseInt($('#pause-dev-config-intrusion').val());
            State.config.securityIntrusionProbability = !isNaN(intrusionProb) ? intrusionProb / 100 : 0.25;
            
            State.config.initialSupplies = parseInt($('#pause-dev-config-supplies').val()) || 15;
            State.config.initialParanoia = parseInt($('#pause-dev-config-paranoia').val()) || 0;

            // Apply immediate changes if sensible
            State.supplies = State.config.initialSupplies;

            // Energy Cost Logic
            const energyMode = $('#pause-dev-config-energy-cost').val();
            if (energyMode === 'low') {
                State.config.generator.consumption = { save: 0, normal: 1, overload: 2 };
            } else if (energyMode === 'high') {
                State.config.generator.consumption = { save: 2, normal: 3, overload: 4 };
            } else {
                State.config.generator.consumption = { save: 1, normal: 2, overload: 3 }; // Normal
            }

            // Feedback
            const fb = $('#pause-dev-feedback');
            fb.removeClass('hidden');

            if (this.audio) this.audio.playSFXByKey('ui_confirm', { volume: 0.5 });
            setTimeout(() => fb.addClass('hidden'), 2000);

            this.game.updateHUD();
            this.ui.showMessage('CONFIGURACIÓN DE DESARROLLADOR APLICADA', () => {}, 'success');
        });

        // Controles de potencia del generador
        $('.btn-generator-control').on('click', (e) => {
            const mode = $(e.currentTarget).attr('id').replace('btn-gen-', '');

            // Visual feedback: marcar activo
            $('.btn-generator-control').removeClass('active');
            $(e.currentTarget).addClass('active');

            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.game.actions.handleGeneratorControl(mode);
        });

        // Controles del Generador (Pantalla específica)
        $('#btn-gen-toggle').on('click', () => this.game.mechanics.toggleGenerator());
        $('#btn-gen-manual-toggle').on('click', () => {
            $('#generator-manual').toggleClass('hidden');
        });
    }
}
