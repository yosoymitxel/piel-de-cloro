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

    navigateToMap(options = {}) {
        const renderFn = () => {
            // --- ACTUALIZACIÓN DE INFORMACIÓN DETALLADA ---

            // 1. Refugio
            const admittedPercent = (State.admittedNPCs.length / State.config.maxShelterCapacity) * 100;
            $('#map-status-shelter-count').text(`${State.admittedNPCs.length}/${State.config.maxShelterCapacity}`);
            $('#map-status-shelter-cap').text(`${Math.round(admittedPercent)}%`)
                .toggleClass('text-alert', admittedPercent >= 90)
                .toggleClass('text-critical', admittedPercent >= 100);
                
            $('#map-status-shelter-threat').text(State.infectedSeenCount > 0 ? 'DETECTADA' : 'BAJA')
                .toggleClass('text-alert', State.infectedSeenCount > 0);
                
            this.ui.setMapNodeStatus('refugio', this.ui.getRoomStatusClass('shelter'));

            // 2. Seguridad
            const guardId = State.sectorAssignments?.security?.[0];
            const guard = State.admittedNPCs.find(n => n.id === guardId);
            $('#map-status-security-guard').text(guard ? guard.name.toUpperCase() : 'VACANTE');
            $('#map-status-security-alerts').text(State.infectedSeenCount || 0)
                .toggleClass('text-alert', (State.infectedSeenCount || 0) > 0);
            
            // Security Systems Status
            const activeSystems = State.securityItems ? State.securityItems.filter(i => (i.type === 'alarma' && i.active) || (i.type !== 'alarma' && i.secured)).length : 0;
            const totalSystems = State.securityItems ? State.securityItems.length : 0;
            $('#map-status-security-sys').text(`${activeSystems}/${totalSystems}`)
                .toggleClass('text-alert', activeSystems < totalSystems);
                
            this.ui.setMapNodeStatus('sala', this.ui.getRoomStatusClass('security')); // Updated to 'security'

            // 3. Suministros
            $('#map-status-supplies-count').text(State.supplies);
            
            // Estimate days left (supplies / consumption per day)
            // Assuming consumption ~ shelter population (min 1)
            const consumption = Math.max(1, State.admittedNPCs.length);
            const daysLeft = Math.floor(State.supplies / consumption);
            $('#map-status-supplies-days').text(`${daysLeft} DÍAS`)
                .toggleClass('text-alert', daysLeft < 3);
            
            this.ui.setMapNodeStatus('suministros', this.ui.getRoomStatusClass('supplies'));

            const suppliesNode = $('#map-node-suministros');
            suppliesNode.find('.map-info-value:last').text(State.supplies < 5 ? 'RESERVAS BAJAS' : 'RESERVAS OK')
                .toggleClass('text-alert', State.supplies < 5)
                .toggleClass('text-orange-400', State.supplies >= 5 && State.supplies < 10);

            // 4. Combustible
            const fuelConsumption = State.generator.isOn ? (State.generator.mode === 'overload' ? 2 : 1) : 0;
            $('#map-status-fuel-count').text(`${State.fuel} UNITS`);
            $('#map-status-fuel-drain').text(`${fuelConsumption}/DÍA`);
            
            $('#map-status-fuel-press').text(State.fuel > 5 ? 'ESTABLE' : 'BAJA')
                .toggleClass('text-alert', State.fuel <= 5);
                
            this.ui.setMapNodeStatus('fuel', this.ui.getRoomStatusClass('fuel'));

            // 5. Generador
            const genLoad = State.generator.isOn ? Math.round((State.generator.load / State.generator.capacity) * 100) : 0;
            const batLevel = Math.round(Math.max(0, State.generator.power || 0));
            
            $('#map-status-gen-load').text(`${genLoad}%`);
            $('#map-status-gen-bat').text(`${batLevel}%`)
                .toggleClass('text-alert', batLevel < 20);
                
            /* Remove old stab text if it doesn't exist anymore or update if needed. 
               We replaced the stab line with Battery and Mode in HTML.
            */
                
            const genMode = State.generator.mode === 'overload' ? 'SOBRECARGA' : (State.generator.mode === 'save' ? 'AHORRO' : 'NORMAL');
            
            const genNode = $('#map-node-generador');
            // Update MODO text color based on mode
            genNode.find('.map-info-line:last .map-info-value').text(genMode)
                .removeClass('text-blue-400 text-orange-500 text-green-500')
                .addClass(State.generator.mode === 'overload' ? 'text-orange-500' : (State.generator.mode === 'save' ? 'text-blue-400' : 'text-green-500'));

            // Use centralized status logic
            this.ui.setMapNodeStatus('generador', this.ui.getRoomStatusClass('generator'));

            // 6. Otros
            this.ui.setMapNodeStatus('puesto', 1);
            this.ui.setMapNodeStatus('database', 1);
            this.ui.setMapNodeStatus('meditacion', 1);

            // Renderizar pines actuales
            this.ui.renderPinnedRooms(State);
        };
        return this.switchScreen(CONSTANTS.SCREENS.MAP, { ...options, renderFn });
    }

    navigateToMeditation() {
        this.switchScreen(CONSTANTS.SCREENS.MEDITATION);
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
        const config = CONSTANTS.ROOM_CONFIG[key];
        if (!config) return;

        if (config.method && typeof this[config.method] === 'function') {
            this[config.method]();
        } else if (config.screen) {
            this.ui.showScreen(config.screen);
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

        this.ui.showConfirm(`¿ORDENAR A ${npc.name.toUpperCase()} LA EXTRACCIÓN DE COMBUSTIBLE?<br><br><span class="text-xs text-alert font-bold animate-pulse">ADVERTENCIA: LETALIDAD EXTREMA - RIESGO DE PÉRDIDA CRÍTICO</span>`, () => {
            this.game.mechanics.startFuelExpedition(npc);
        }, null, 'danger');
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
            $('#config-volume-lore').val(Math.round(this.audio.levels.lore * 100));
            $('#config-volume-sfx').val(Math.round(this.audio.levels.sfx * 100));

            // Developer Section Visibility & Population
            if (State.debug) {
                $('#settings-dev-section').removeClass('hidden').addClass('flex');

                // Populate dev fields
                $('#dev-config-intrusion').val(Math.round(State.config.securityIntrusionProbability * 100));
                $('#dev-config-supplies').val(State.config.initialSupplies || 15);
                $('#dev-config-paranoia').val(State.config.initialParanoia || 0);

                // Energy cost mapping
                let energyMode = 'normal';
                if (State.config.generator.consumption.normal === 1) energyMode = 'low';
                else if (State.config.generator.consumption.normal === 3) energyMode = 'high';
                $('#dev-config-energy-cost').val(energyMode);
            } else {
                $('#settings-dev-section').addClass('hidden').removeClass('flex');
            }

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
        $('#nav-guard').on('click', () => {
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.navigateToGuard();
        });
        $('#nav-map').on('click', () => {
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5, overlap: true });
            this.navigateToMap();
        });
        $('#nav-room').on('click', () => {
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.navigateToRoom();
        });
        $('#nav-shelter').on('click', () => {
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.navigateToShelter();
        });
        $('#nav-morgue').on('click', () => {
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.navigateToMorgue();
        });
        $('#nav-log').on('click', () => {
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5 });
            this.navigateToLog();
        });

        // Map Nodes Click
        $(document).on('click', '.map-node-btn', (e) => {
            const room = $(e.currentTarget).data('room');
            this.audio.playSFXByKey('ui_button_click', { volume: 0.5, overlap: true });

            switch (room) {
                case 'game': this.navigateToGuard(); break;
                case 'room': this.navigateToRoom(); break;
                case 'shelter': this.navigateToShelter(); break;
                case 'generator': this.navigateToGenerator(); break;
                case 'supplies': this.navigateToSuppliesHub(); break;
                case 'fuel-room': this.navigateToFuelRoom(); break;
                case 'meditation': this.navigateToMeditation(); break;
                case 'morgue': this.navigateToMorgue(); break;
                case 'database': this.ui.showScreen(CONSTANTS.SCREENS.DATABASE); break;
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

        // Botón de pausa (Global)
        $('#btn-pause').on('click', () => {
            State.paused = true;
            $('body').addClass('paused');
            $('#screen-game').addClass('is-paused');
            $('#modal-pause').removeClass('hidden').addClass('flex');
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

        // Al cerrar pausa
        $('#btn-pause-close').on('click', () => {
            $('#modal-pause').addClass('hidden').removeClass('flex');
            State.paused = false;
            $('body').removeClass('paused');
            $('#screen-game').removeClass('is-paused');
        });

        // Developer Apply Changes
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
