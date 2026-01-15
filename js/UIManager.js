import { State } from './State.js';
import { CONSTANTS } from './Constants.js';
import { LoreData } from './LoreData.js';
import { LoreManager } from './LoreManager.js';
import { ModalManager } from './ModalManager.js';
import { AvatarRenderer } from './AvatarRenderer.js';
import { ScreenManager } from './ScreenManager.js';
import { GeneratorManager } from './GeneratorManager.js';
import { StatsManager } from './StatsManager.js';
import { ToolsRenderer } from './ToolsRenderer.js';
import { parseDialogueMarkup, escapeHtml } from './markup.js';

export class UIManager {
    constructor(audio = null, customModules = {}) {
        this.audio = audio;
        this.game = customModules.game || null;
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
            log: $('#screen-log'),
            database: $('#screen-database')
        };
        this.elements = {
            paranoia: $('#paranoia-level'),
            sanity: $('#sanity-level'),
            cycle: $('#cycle-count'),
            time: $('#time-display'),
            supplies: $('#supplies-level'),
            feedback: $('#inspection-feedback'),
            npcDisplay: $('#npc-display'),
            dialogue: $('#npc-dialogue'),
            dialogueOptions: $('#dialogue-options'),
            dialogueHistory: $('#dialogue-history-list'),
            tabDialogue: $('#tab-dialogue'),
            tabHistory: $('#tab-history'),
            contentDialogue: $('#content-dialogue'),
            contentHistory: $('#content-history'),
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

            // Modales de Guía y Finales
            modalEndings: $('#modal-endings'),
            endingsList: $('#endings-list'),
            btnOpenEndings: $('#endings-record'),
            btnCloseEndings: $('#btn-close-endings'),
            modalGuide: $('#modal-guide'),
            btnOpenGuide: $('#btn-help-guide'),
            btnCloseGuide: $('#btn-close-guide'),

            // HUD Clickable Stats
            hudParanoia: $('#paranoia-level').parent(),
            hudSanity: $('#sanity-level').parent(),
            hudSupplies: $('#hud-supplies-container'),
            hudEnergy: $('#hud-energy-container'),

            // Modal NPC
            modal: $('#modal-npc'),
            modalName: $('#modal-npc-name'),
            modalTrait: $('#modal-npc-trait'),
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

            // Tutorial Inicial
            modalTutorial: $('#modal-tutorial'),
            btnStartGame: $('#btn-tutorial-start'),

            // Base de Datos
            btnOpenDatabase: $('#nav-database'),
            dbNavBtns: $('.db-nav-btn'),
            dbSections: $('.db-section'),

            // Confirm Modal
            confirmModal: $('#modal-confirm'),
            confirmContent: $('#modal-confirm-content'),
            confirmYes: $('#btn-confirm-yes'),
            confirmCancel: $('#btn-confirm-cancel'),

            // Puesto Console Elements (use function wrapper for safer test access)
            miniMonitorBio: typeof $ !== 'undefined' && $('.mini-monitor').length > 0 ? $('.mini-monitor').eq(0) : $(),
            miniMonitorEnv: typeof $ !== 'undefined' && $('.mini-monitor').length > 1 ? $('.mini-monitor').eq(1) : $(),
            knobs: typeof $ !== 'undefined' ? $('.knob') : $(),

            // Tools
            tools: [
                $('#tool-thermo'),
                $('#tool-flash'),
                $('#tool-pulse'),
                $('#tool-pupils')
            ]
        };
        this.currentModalNPC = null;
        this.infectionEffectActive = false;
        this.typingTimer = null;
        this.typingAudio = null;

        this.timings = {
            vhsDuration: 1000,
            loreFadeOut: 500,
            modalBloodFlash: 700,
            validationOpen: 0,
            precloseOpen: 0
        };

        this.colors = State.colors;

        // Initialize Specialized Managers (Allowing Injection)
        this.avatarRenderer = customModules.avatarRenderer || AvatarRenderer;
        this.screenManager = customModules.screenManager || new ScreenManager(this);
        this.loreManager = customModules.loreManager || new LoreManager(this, audio);
        this.modalManager = customModules.modalManager || new ModalManager(this, audio);
        this.generatorManager = customModules.generatorManager || new GeneratorManager(this, audio, this.game);
        this.statsManager = customModules.statsManager || new StatsManager();
        this.toolsRenderer = new ToolsRenderer({
            npcDisplay: this.elements.npcDisplay,
            gameScreen: this.screens.game
        });

        // For backward compatibility while refactoring
        this.modules = {
            lore: this.loreManager,
            modal: this.modalManager,
            generator: this.generatorManager,
            screen: this.screenManager,
            tools: this.toolsRenderer
        };

        this.initGuides();
        this.initDatabaseNavigation();
        this.initDialogueTabs();
        this.initGlobalEffects();
        this.initUIScaling();
        this.initConsoleUpdates();

        // Populate version labels
        this.updateVersionLabels();

        // Actualizar el record de finales al inicio para evitar el 0/0 inicial
        if (this.screenManager && typeof this.screenManager.updateEndingsRecord === 'function') {
            this.screenManager.updateEndingsRecord(State);
        }
    }

    updateVersionLabels() {
        $('.app-version').text(CONSTANTS.VERSION);
        $('.app-version-full').text(`${CONSTANTS.VERSION_LABEL} v${CONSTANTS.VERSION}`);
    }

    resetUI() {
        this.updateVersionLabels();
        if (this.screenManager) {
            this.screenManager.updateEndingsRecord(State);
        }
        this.hideFeedback();
        this.clearModalError();
        // Reset any other UI states if necessary
    }

    initGlobalEffects() {
        // Efecto de Glitch al hacer click en cualquier parte de la pantalla (CRT feedback)
        $(document).on('mousedown', () => {
            const monitor = $('.crt-monitor');
            monitor.addClass('glitch-click');
            setTimeout(() => {
                monitor.removeClass('glitch-click');
            }, 100);
        });

        // Simulación de ruido estático ocasional
        setInterval(() => {
            if (Math.random() > 0.95) {
                const monitor = $('.crt-monitor');
                monitor.addClass('glitch-click');
                setTimeout(() => {
                    monitor.removeClass('glitch-click');
                }, 200);
            }
        }, 5000);
    }

    initConsoleUpdates() {
        if (typeof setInterval !== 'undefined') {
            setInterval(() => {
                if (this.screens.game && typeof this.screens.game.is === 'function' && this.screens.game.is(':visible')) {
                    this.updateConsoleData();
                }
            }, 3000);
        }
    }

    updateConsoleData() {
        // Rotar knobs aleatoriamente
        if (this.elements.knobs && this.elements.knobs.length > 0) {
            this.elements.knobs.each((i, el) => {
                const rotation = Math.floor(Math.random() * 360);
                $(el).css('transform', `rotate(${rotation}deg)`);
            });
        }

        // Actualizar barras de mini monitor bio
        if (this.elements.miniMonitorBio && this.elements.miniMonitorBio.length > 0) {
            const bars = this.elements.miniMonitorBio.find('.bg-chlorine');
            bars.each((i, el) => {
                const height = 20 + Math.random() * 60;
                $(el).css('height', `${height}%`);
            });
        }

        // Actualizar datos de mini monitor env
        if (this.elements.miniMonitorEnv && this.elements.miniMonitorEnv.length > 0) {
            const spans = this.elements.miniMonitorEnv.find('span');
            // Actualizar TEMP (segundo span del primer div de datos)
            if (spans.length >= 2) {
                const temp = (18 + Math.random() * 2).toFixed(1);
                $(spans[1]).text(`${temp}°C`);
            }
            // Actualizar HUM (segundo span del segundo div de datos)
            if (spans.length >= 4) {
                const hum = Math.floor(40 + Math.random() * 10);
                $(spans[3]).text(`${hum}%`);
            }
        }
    }

    initUIScaling() {
        const scaleMap = {
            small: { width: '1000px', height: '650px', label: '80%' },
            normal: { width: '1400px', height: '900px', label: '100%' },
            large: { width: '1800px', height: '1100px', label: '120%' },
            full: { width: '100vw', height: '100vh', label: 'FULL' }
        };

        const updateScale = (scale) => {
            const config = scaleMap[scale];
            if (!config) return;

            // Use optional chaining for environment where document might be missing (like some tests)
            if (typeof document !== 'undefined' && document.documentElement && document.documentElement.style) {
                if (typeof document.documentElement.style.setProperty === 'function') {
                    document.documentElement.style.setProperty('--terminal-max-width', config.width);
                    document.documentElement.style.setProperty('--terminal-max-height', config.height);
                }
            }

            if (typeof $ !== 'undefined' && typeof $ === 'function') {
                const $scaleValue = $('#scale-value');
                if ($scaleValue.length) $scaleValue.text(config.label);

                const $btnScale = $('.btn-scale');
                if ($btnScale.length) {
                    $btnScale.removeClass('text-chlorine-light border-white/20').addClass('border-white/10');
                    $(`.btn-scale[data-scale="${scale}"]`).addClass('text-chlorine-light border-white/20').removeClass('border-white/10');
                }

                const $body = $('body');
                if ($body.length) $body.toggleClass('is-full-ui', scale === 'full');
            }

            // Save preference if localStorage exists
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('ruta01_ui_scale', scale);
            }
        };

        $('.btn-scale').on('click', (e) => {
            const scale = $(e.currentTarget).data('scale');
            updateScale(scale);
            if (this.audio) this.audio.playSFXByKey('ui_click', { volume: 0.2 });
        });

        // Load saved preference
        const savedScale = localStorage.getItem('ruta01_ui_scale') || 'normal';
        updateScale(savedScale);
    }

    initGuides() {
        // Modal de Tutorial Inicial
        if (this.elements.btnStartGame) {
            this.elements.btnStartGame.on('click', () => {
                this.elements.modalTutorial.addClass('hidden').removeClass('flex');
                if (this.audio) this.audio.playSFXByKey('ui_click', { volume: 0.5 });
                // Iniciar música o ambiente si es necesario
                if (this.game && this.game.startFirstDay) {
                    this.game.startFirstDay();
                }
            });
        }

        // Modal de Finales Recuperados
        if (this.elements.btnOpenEndings) {
            this.elements.btnOpenEndings.on('click', () => this.showEndingsModal());
        }
        if (this.elements.btnCloseEndings) {
            this.elements.btnCloseEndings.on('click', () => this.elements.modalEndings.addClass('hidden').removeClass('flex'));
        }

        // Botón de Guía (ahora abre el Manual Rápido)
        if (this.elements.btnOpenGuide) {
            this.elements.btnOpenGuide.on('click', () => {
                this.elements.modalGuide.removeClass('hidden').addClass('flex');
                if (this.audio) this.audio.playSFXByKey('ui_hover', { volume: 0.3 });
            });
        }

        if (this.elements.btnCloseGuide) {
            this.elements.btnCloseGuide.on('click', () => {
                this.elements.modalGuide.addClass('hidden').removeClass('flex');
                if (this.audio) this.audio.playSFXByKey('ui_click', { volume: 0.2 });
            });
        }

        // Vincular iconos del HUD a la Base de Datos (excepto suministros)
        const hudElements = [
            { el: this.elements.hudParanoia, section: 'db-hud' },
            { el: this.elements.hudSanity, section: 'db-hud' },
            { el: this.elements.hudEnergy, section: 'db-hud' }
        ];

        hudElements.forEach(item => {
            if (item.el && item.el.length) {
                item.el.addClass('cursor-pointer hover:opacity-80 transition-opacity');
                item.el.on('click', () => {
                    this.showScreen(CONSTANTS.SCREENS.DATABASE);
                    $(`.db-nav-btn[data-target="${item.section}"]`).click();
                    if (this.audio) this.audio.playSFXByKey('ui_click', { volume: 0.3 });
                });
            }
        });

        // Comportamiento especial para Suministros (Solicitar emergencia)
        if (this.elements.hudSupplies && this.elements.hudSupplies.length) {
            this.elements.hudSupplies.on('click', () => {
                if (this.game && this.game.actions) {
                    this.game.actions.handleSupplyRequest();
                }
            });
        }

        // Cerrar modales con ESC
        $(document).on('keydown', (e) => {
            if (e.key === 'Escape') {
                this.elements.modalEndings.addClass('hidden').removeClass('flex');
                this.elements.modalGuide.addClass('hidden').removeClass('flex');
                this.elements.modalTutorial.addClass('hidden').removeClass('flex');
            }
        });
    }

    initDialogueTabs() {
        if (!this.elements.tabDialogue || !this.elements.tabHistory) return;

        const switchTab = (target) => {
            if (target === 'dialogue') {
                this.elements.tabDialogue.addClass('text-chlorine-light border-chlorine-light bg-chlorine/10').removeClass('text-gray-500 border-transparent bg-white/5');
                this.elements.tabHistory.addClass('text-gray-500 border-transparent').removeClass('text-chlorine-light border-chlorine-light bg-chlorine/10');
                this.elements.contentDialogue.removeClass('hidden').addClass('flex');
                this.elements.contentHistory.addClass('hidden').removeClass('flex');
            } else {
                this.elements.tabHistory.addClass('text-chlorine-light border-chlorine-light bg-chlorine/10').removeClass('text-gray-500 border-transparent bg-white/5');
                this.elements.tabDialogue.addClass('text-gray-500 border-transparent').removeClass('text-chlorine-light border-chlorine-light bg-chlorine/10');
                this.elements.contentHistory.removeClass('hidden').addClass('flex');
                this.elements.contentDialogue.addClass('hidden').removeClass('flex');
                this.renderDialogueHistory(State.currentNPC);
            }
            if (this.audio) this.audio.playSFXByKey('ui_click', { volume: 0.2 });
        };

        this.elements.tabDialogue.on('click', () => switchTab('dialogue'));
        this.elements.tabHistory.on('click', () => switchTab('history'));
    }

    renderDialogueHistory(npc) {
        if (!this.elements.dialogueHistory || !npc) return;
        this.elements.dialogueHistory.empty();

        if (!npc.history || npc.history.length === 0) {
            this.elements.dialogueHistory.append('<p class="opacity-30 italic text-center py-4">Sin registros de comunicación...</p>');
            return;
        }

        npc.history.forEach(entry => {
            const isUser = entry.speaker === 'user';
            const item = $(`
                <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'}">
                    <span class="text-[10px] uppercase tracking-tighter opacity-40 mb-1">${isUser ? 'TÚ' : (npc.name || 'SUJETO')}</span>
                    <div class="p-2 rounded ${isUser ? 'bg-chlorine/20 border border-chlorine/30 text-chlorine-light' : 'bg-white/5 border border-white/10 text-gray-300'} max-w-[90%]">
                        ${entry.text}
                    </div>
                </div>
            `);
            this.elements.dialogueHistory.append(item);
        });

        // Scroll to bottom
        this.elements.dialogueHistory.scrollTop(this.elements.dialogueHistory[0].scrollHeight);
    }

    initDatabaseNavigation() {
        if (this.elements.btnOpenDatabase) {
            this.elements.btnOpenDatabase.on('click', () => {
                this.showScreen(CONSTANTS.SCREENS.DATABASE);
                if (this.audio) this.audio.playSFXByKey('ui_click', { volume: 0.3 });
            });
        }

        this.elements.dbNavBtns.on('click', (e) => {
            const target = $(e.currentTarget).data('target');

            // UI Update
            this.elements.dbNavBtns.removeClass('active');
            $(e.currentTarget).addClass('active');

            // Content Update
            this.elements.dbSections.addClass('hidden');
            $(`#${target}`).removeClass('hidden');

            if (this.audio) this.audio.playSFXByKey('ui_hover', { volume: 0.2 });
        });
    }

    showEndingsModal() {
        if (!this.elements.modalEndings || !this.elements.endingsList) return;

        const allEndings = Object.keys(LoreData).filter(key => key.startsWith('final_'));
        // Asegurar que solo mostramos finales únicos y válidos
        const uniqueUnlocked = Array.from(new Set((State.unlockedEndings || []).filter(key => allEndings.includes(key))));

        // Actualizar contador en el header del modal si existe un lugar
        const titleEl = this.elements.modalEndings.find('h3');
        titleEl.html(`Base de Datos: Finales Recuperados <span class="text-xs ml-2 opacity-50">(${uniqueUnlocked.length}/${allEndings.length})</span>`);

        this.elements.endingsList.empty();

        if (uniqueUnlocked.length === 0) {
            this.elements.endingsList.append(`
                <div class="text-center p-8 border border-dashed border-gray-800 opacity-50">
                    <i class="fa-solid fa-lock text-4xl mb-4 block"></i>
                    <p class="text-sm">No se han recuperado archivos en este terminal aún.</p>
                </div>
            `);
        } else {
            // Ordenar por ID para que sea consistente
            const sortedUnlocked = [...uniqueUnlocked].sort();

            sortedUnlocked.forEach((id, index) => {
                const lore = LoreData[id];
                if (!lore) return;

                const card = $(`
                    <div class="p-4 border border-chlorine/40 bg-chlorine/5 hover:bg-chlorine/10 transition-all group">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="text-chlorine font-bold uppercase tracking-wider text-sm">${index + 1}. ${lore.title}</h4>
                            <span class="text-sm text-gray-500 font-mono">ID: ${id.toUpperCase()}</span>
                        </div>
                        <p class="text-xs text-gray-300 leading-relaxed italic border-l-2 border-chlorine/20 pl-3">
                            "${lore.content}"
                        </p>
                    </div>
                `);
                this.elements.endingsList.append(card);
            });
        }

        this.elements.modalEndings.removeClass('hidden').addClass('flex');
        if (this.audio) this.audio.playSFXByKey('ui_click', { volume: 0.5 });
    }

    showScreen(screenName) {
        this.cancelPurgeAnimation();
        this.screenManager.showScreen(screenName, State);
    }

    renderFinalStats(state, endingId) {
        this.screenManager.renderFinalStats(state, endingId);
    }

    applyVHS(intensity = 0.6, duration = 1000) {
        const target = $('#screen-game').find('main.vhs-target');
        target.css('--vhs-intensity', intensity);
        target.css('--vhs-duration', `${duration}ms`);
        target.addClass('vhs-active');
        if (this.audio) this.audio.playSFXByKey('vhs_flicker', { volume: 0.5 });
        setTimeout(() => target.removeClass('vhs-active'), duration);
    }

    /**
     * Lanza una animación de protocolo a pantalla completa (usado para purgas y finales)
     * @param {Object} options - Configuración de la animación
     */
    triggerFullscreenProtocol(options = {}) {
        const {
            title = 'PURGA',
            statusUpdates = ['EXTRAYENDO...', 'LIMPIANDO...', 'FINALIZADO.'],
            sfx = 'purge_confirm',
            onComplete = null,
            type = 'purge'
        } = options;

        const overlay = $('#purge-screen-overlay');
        const progressBar = overlay.find('.purge-progress-bar');
        const statusText = overlay.find('#purge-status-text');
        const titleEl = overlay.find('.purge-glitch-text');

        if (!overlay.length) {
            if (onComplete) onComplete();
            return;
        }

        this.cancelPurgeAnimation();

        // Configurar contenido según tipo
        titleEl.text(title);
        if (type === 'ending') {
            overlay.addClass('protocol-ending').removeClass('protocol-purge');
        } else {
            overlay.addClass('protocol-purge').removeClass('protocol-ending');
        }

        overlay.removeClass('hidden').addClass('flex').css({
            'opacity': '1',
            'z-index': '9999'
        });

        progressBar.css('width', '0%');
        statusText.text('INICIANDO...').removeClass('animate-pulse');

        if (this.audio) {
            this.audio.playSFXByKey(sfx, { volume: 0.6, priority: 2, overlap: true }); // Allow overlap so clicks don't cut it
        }

        this.purgeTimers = this.purgeTimers || [];

        // Animación más rápida (tiempos reducidos a la mitad)
        this.purgeTimers.push(setTimeout(() => {
            progressBar.css('width', '100%');

            statusUpdates.forEach((text, i) => {
                this.purgeTimers.push(setTimeout(() => {
                    statusText.text(text).addClass('animate-pulse');
                    if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.2, overlap: true });
                }, i * 175));
            });

            // Finalizar
            this.purgeTimers.push(setTimeout(() => {
                overlay.animate({ opacity: 0 }, 200, () => {
                    overlay.addClass('hidden');
                    if (onComplete) onComplete();
                });
            }, (statusUpdates.length * 175) + 250));
        }, 100));
    }

    triggerPurgeAnimation(onComplete) {
        this.triggerFullscreenProtocol({
            title: 'PURGA',
            statusUpdates: [
                'EXTRAYENDO SUJETO...',
                'LIMPIEZA EN CURSO...',
                'COMPLETADO.'
            ],
            sfx: 'purge_confirm',
            onComplete: onComplete,
            type: 'purge'
        });
    }

    cancelPurgeAnimation() {
        const overlay = $('#purge-screen-overlay');
        if (overlay.length) {
            overlay.stop(true, true).addClass('hidden').css('opacity', '0');
        }
        if (this.purgeTimers) {
            this.purgeTimers.forEach(t => clearTimeout(t));
            this.purgeTimers = [];
        }
    }

    applySanityEffects(sanity) {
        const intensity = (40 - sanity) / 40; // 0 a 1 (empieza a los 40)

        if (Math.random() < intensity * 0.15) {
            const hue = Math.random() * (30 * intensity) - (15 * intensity);
            const saturate = 1 + (Math.random() * intensity);
            const contrast = 1 + (Math.random() * intensity * 0.5);
            const blur = intensity > 0.6 ? `blur(${intensity * 0.5}px)` : '';

            $('body').css('filter', `hue-rotate(${hue}deg) saturate(${saturate}) contrast(${contrast}) ${blur}`);

            // Glitch auditivo ocasional si hay AudioManager
            if (this.audio && Math.random() < 0.1) {
                this.audio.playSFXByKey('glitch_burst', { volume: 0.15 * intensity });
            }
        }

        // Efecto de viñeta roja si la cordura es muy baja
        if (sanity < 25) {
            const opacity = (25 - sanity) / 50;
            if (!$('#sanity-vignette').length) {
                $('body').append('<div id="sanity-vignette" class="fixed inset-0 pointer-events-none z-[9999] shadow-[inset_0_0_150px_rgba(153,27,27,0.5)] opacity-0 transition-opacity duration-1000"></div>');
            }
            $('#sanity-vignette').css('opacity', opacity).removeClass('hidden');
        } else {
            $('#sanity-vignette').addClass('hidden');
        }
    }

    updateStats(paranoia, sanity, cycle, dayTime, dayLength, currentNPC, supplies) {
        // MECÁNICA PARANOIA: Viñeta de vigilancia
        if (paranoia > 50) {
            const pIntensity = (paranoia - 50) / 100;
            if (!$('#paranoia-vignette').length) {
                $('body').append('<div id="paranoia-vignette" class="fixed inset-0 pointer-events-none z-[9998] shadow-[inset_0_0_120px_rgba(45,90,39,0.4)] opacity-0 transition-opacity duration-700"></div>');
            }
            $('#paranoia-vignette').css('opacity', pIntensity).removeClass('hidden');
        } else {
            $('#paranoia-vignette').addClass('hidden');
        }

        // MECÁNICA CORDURA: Interfaz mentirosa
        // Si la cordura es baja, los valores del HUD pueden fluctuar erróneamente
        const isHallucinatingUI = sanity < 30 && Math.random() < 0.2;

        let displayParanoia = paranoia;
        let displaySanity = sanity;
        let displaySupplies = supplies !== undefined ? supplies : State.supplies;

        if (isHallucinatingUI) {
            // Mostrar valores falsos momentáneamente
            displayParanoia = Math.min(100, paranoia + (Math.random() > 0.5 ? 20 : -20));
            displaySanity = Math.max(0, sanity + (Math.random() > 0.5 ? 15 : -15));
            displaySupplies = Math.max(0, displaySupplies + (Math.random() > 0.5 ? 2 : -2));

            // Efecto visual de glitch en el texto
            this.elements.paranoia.addClass('glitch-text');
            if (this.elements.sanity) this.elements.sanity.addClass('glitch-text');

            setTimeout(() => {
                this.elements.paranoia.removeClass('glitch-text');
                if (this.elements.sanity) this.elements.sanity.removeClass('glitch-text');
            }, 500);
        }

        this.elements.paranoia.text(`${Math.floor(displayParanoia)}%`);
        if (this.elements.sanity) {
            this.elements.sanity.text(`${Math.floor(displaySanity)}%`);
            if (sanity < 30) {
                this.elements.sanity.addClass('animate-pulse text-rose-600').removeClass('text-rose-300');
                this.applySanityEffects(sanity);
            } else {
                this.elements.sanity.removeClass('animate-pulse text-rose-600').addClass('text-rose-300');
                $('body').css('filter', 'none');
            }
        }
        if (this.elements.supplies) {
            this.elements.supplies.text(displaySupplies);
            if (displaySupplies <= 2) {
                this.elements.supplies.addClass('animate-pulse text-alert').removeClass('text-amber-300');
            } else {
                this.elements.supplies.removeClass('animate-pulse text-alert').addClass('text-amber-300');
            }
        }
        this.elements.cycle.text(cycle);
        this.elements.time.text(`${dayTime}/${dayLength}`);

        // Time-tint integration
        const dayProgress = dayTime / dayLength;
        $('body').toggleClass('is-night', dayProgress > 0.75);
        $('body').toggleClass('is-late-night', dayProgress > 0.9);

        // La revisión solo es "obligatoria" si no hay energía o está apagado
        const generatorOk = State.generator && State.generator.isOn;
        const needsCheck = !generatorOk;

        if (this.elements.genWarningGame) this.elements.genWarningGame.toggleClass('hidden', !needsCheck);
        if (this.elements.genWarningShelter) this.elements.genWarningShelter.toggleClass('hidden', !needsCheck);

        // Actualizar colores de paranoia (texto e icono)
        const paranoiaIcon = this.elements.paranoia.parent().find('i.fa-brain');
        let paranoiaColor = this.colors.chlorineLight; // Default: chlorine-light

        if (paranoia >= 100) {
            paranoiaColor = this.colors.critical;
            this.elements.paranoia.addClass('animate-pulse');
            paranoiaIcon.addClass('animate-pulse');
        } else if (paranoia > 75) {
            paranoiaColor = this.colors.alert; // Alert red
            this.elements.paranoia.removeClass('animate-pulse');
            paranoiaIcon.removeClass('animate-pulse');
        } else if (paranoia > 50) {
            paranoiaColor = this.colors.orange; // Orange
            this.elements.paranoia.removeClass('animate-pulse');
            paranoiaIcon.removeClass('animate-pulse');
        } else if (paranoia > 25) {
            paranoiaColor = this.colors.yellow; // Yellowish
            this.elements.paranoia.removeClass('animate-pulse');
            paranoiaIcon.removeClass('animate-pulse');
        } else {
            this.elements.paranoia.removeClass('animate-pulse');
            paranoiaIcon.removeClass('animate-pulse');
        }

        this.elements.paranoia.css('color', paranoiaColor);
        paranoiaIcon.css('color', paranoiaColor);

        // Aplicar color al texto de diálogo si existe
        if (this.elements.dialogue) {
            this.elements.dialogue.css('--paranoia-color', paranoiaColor);
            this.elements.dialogue.find('.npc-text').css('color', paranoiaColor);
            // También al nombre del NPC para que todo el bloque de diálogo se sienta "contaminado"
            this.elements.dialogue.find('.npc-name').css('color', paranoiaColor);
        }

        // Brillo sutil si la paranoia es alta
        if (paranoia > 50) {
            this.elements.paranoia.css('text-shadow', `0 0 8px ${paranoiaColor}`);
            paranoiaIcon.css('filter', `drop-shadow(0 0 5px ${paranoiaColor})`);
            if (this.elements.dialogue) {
                this.elements.dialogue.css('text-shadow', `0 0 4px ${paranoiaColor}44`);
            }
        } else {
            this.elements.paranoia.css('text-shadow', 'none');
            paranoiaIcon.css('filter', 'none');
            if (this.elements.dialogue) {
                this.elements.dialogue.css('text-shadow', 'none');
            }
        }

        // Update Energy
        this.updateGeneratorNavStatus();
        const energySpan = $('#scan-energy');
        const energyIcon = $('#hud-energy-container i');

        if (currentNPC) {
            // Definir límite máximo según modo
            const mode = State.generator.mode;
            const maxEnergy = State.config.generator.consumption[mode] || 2;

            // Calcular energía actual (0 si está apagado o fallo)
            const scanCount = currentNPC.scanCount || 0;
            const currentEnergy = (!State.generator.isOn || scanCount >= 90) ? 0 : Math.max(0, maxEnergy - scanCount);

            energySpan.text(`${currentEnergy}/${maxEnergy}`).removeClass('hidden');
            $('#hud-energy-container').removeClass('hidden');

            if (currentEnergy > 0) {
                let color = this.colors.energy;
                if (mode === 'save') color = this.colors.save;
                if (mode === 'overload') color = this.colors.overload;

                energySpan.css('color', color);
                energySpan.css('text-shadow', `0 0 5px ${color}`);
                energySpan.removeClass('text-alert animate-pulse text-cyan-400');

                energyIcon.css('color', color);
                energyIcon.removeClass('text-cyan-400 text-alert');
            } else {
                energySpan.css('color', ''); // Reset para usar clase
                energySpan.css('text-shadow', '');
                energySpan.removeClass('text-cyan-400').addClass('text-alert animate-pulse');

                energyIcon.css('color', '');
                energyIcon.removeClass('text-cyan-400').addClass('text-alert');
            }

            if (currentEnergy <= 0) {
                this.elements.tools.forEach(btn => btn.addClass('btn-disabled'));
            } else {
                this.elements.tools.forEach(btn => btn.removeClass('btn-disabled'));
            }
        } else {
            // No hay NPC: ocultar o mostrar estado genérico
            energySpan.text('--/--');
            $('#hud-energy-container').addClass('opacity-50');
            energyIcon.css('color', '#555');
            this.elements.tools.forEach(btn => btn.addClass('btn-disabled'));
        }
    }

    updateGeneratorNavStatus(state = State) {
        if (!this.setNavItemStatus) return;

        if (!state.generator.isOn) {
            this.setNavItemStatus('nav-generator', 4);
        } else if (state.generator.power <= 10) {
            this.setNavItemStatus('nav-generator', 3);
        } else if (state.generator.mode === 'save') {
            this.setNavItemStatus('nav-generator', 'save');
        } else if (state.generator.mode === 'overload') {
            this.setNavItemStatus('nav-generator', 'overload');
        } else {
            this.setNavItemStatus('nav-generator', null);
        }
    }

    renderAvatar(npc, sizeClass = 'lg', modifier = 'normal') {
        return AvatarRenderer.render(npc, sizeClass, modifier);
    }

    translateValue(type, value) {
        if (type === 'skinTexture') {
            return value === 'dry' ? 'SECA' : 'NORMAL';
        }
        if (type === 'pupils') {
            return value === 'dilated' ? 'DILATADAS' : 'NORMAL';
        }
        return (value ?? '').toString();
    }

    updateGameActions() {
        if (!this.elements.gameActionsContainer) return;

        // La revisión solo es "obligatoria" visualmente si no hay energía o está apagado
        const generatorOk = State.generator && State.generator.isOn && (State.generator.power > 10);
        const needsCheck = !generatorOk;

        if (this.elements.genWarningGame) this.elements.genWarningGame.toggleClass('hidden', !needsCheck);

        // Los botones de admitir/ignorar ya no se reemplazan aquí.
        // Se asume que el HTML inicial de index.html es el correcto.
    }

    updateInspectionTools(npc = State.currentNPC) {
        if (!this.elements.inspectionToolsContainer) return;

        // npc already defined via parameter

        if (!State.generator.isOn) {
            if (this.elements.genWarningPanel) this.elements.genWarningPanel.removeClass('hidden');

            const admitBtn = `
                <div class="tool-wrapper col-span-2">
                    <button id="btn-admit" class="horror-btn-admit horror-tool-btn--main btn-interactive w-full py-4">
                        <i class="fa-solid fa-check mr-2"></i> ADMITIR
                    </button>
                </div>`;

            const ignoreBtn = `
                <div class="tool-wrapper col-span-2">
                    <button id="btn-ignore" class="horror-btn-ignore horror-tool-btn--main btn-interactive w-full py-4">
                        <i class="fa-solid fa-xmark mr-2"></i> OMITIR
                    </button>
                </div>`;

            // Caso 1: Generador apagado - AHORA MANTIENE BOTONES DE DECISIÓN
            this.elements.inspectionToolsContainer
                .removeClass('flex flex-col grid-cols-1 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-cols-6')
                .addClass('grid grid-cols-4');

            this.elements.inspectionToolsContainer.html(`
                <button id="btn-goto-generator" class="col-span-4 horror-btn horror-btn-alert w-full p-4 text-lg flex items-center justify-center gap-3 animate-pulse mb-2">
                    <i class="fa-solid fa-bolt"></i>
                    <span>SISTEMA ELÉCTRICO INESTABLE: REVISAR GENERADOR</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
                ${admitBtn}
                ${ignoreBtn}
            `);

            // Forzar layout
            this.elements.inspectionToolsContainer.css({
                'display': 'grid',
                'grid-template-columns': 'repeat(4, minmax(0, 1fr))',
                'gap': '0.75rem'
            });

            this.refreshToolsReferences();
            return;
        }

        // Determinar el límite de energía actual según el modo
        const currentMode = State.generator.mode;
        const maxEnergy = State.config.generator.consumption[currentMode] || 2;

        const admitBtn = `
            <div class="tool-wrapper col-span-2">
                <button id="btn-admit" class="horror-btn-admit horror-tool-btn--main btn-interactive w-full py-4">
                    <i class="fa-solid fa-check mr-2"></i> ADMITIR
                </button>
            </div>`;

        const ignoreBtn = `
            <div class="tool-wrapper col-span-2">
                <button id="btn-ignore" class="horror-btn-ignore horror-tool-btn--main btn-interactive w-full py-4">
                    <i class="fa-solid fa-xmark mr-2"></i> OMITIR
                </button>
            </div>`;

        if (npc && npc.optOut) {
            // Caso Especial: Test omitido voluntariamente
            this.elements.inspectionToolsContainer
                .removeClass('flex flex-col grid-cols-1 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-cols-6')
                .addClass('grid grid-cols-4');

            this.elements.inspectionToolsContainer.html(`
                <div class="col-span-4 system-status-bar w-full p-4 text-center opacity-70 cursor-not-allowed border-dashed mb-2">
                    <i class="fa-solid fa-comment-slash mr-2"></i>
                    TEST OMITIDO: PROCEDER CON DECISIÓN
                </div>
                ${admitBtn}
                ${ignoreBtn}
            `);
            this.refreshToolsReferences();
        } else if (npc && npc.scanCount >= maxEnergy) {
            // Caso 3: Sin energías por el límite del modo actual
            this.elements.inspectionToolsContainer
                .removeClass('flex flex-col grid-cols-1 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:grid-cols-6')
                .addClass('grid grid-cols-4');

            this.elements.inspectionToolsContainer.html(`
                <div class="col-span-4 system-status-bar w-full p-4 text-center opacity-70 cursor-not-allowed border-dashed mb-2">
                    <i class="fa-solid fa-battery-empty mr-2"></i>
                    BATERÍAS AGOTADAS: SOLO DIÁLOGO O DECISIÓN
                </div>
                ${admitBtn}
                ${ignoreBtn}
            `);
            this.refreshToolsReferences();
        } else {
            // Caso Normal con energía disponible
            this.elements.inspectionToolsContainer
                .removeClass('flex flex-col grid-cols-1 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6')
                .addClass('grid grid-cols-4');

            const modeMap = {
                'save': 'Ahorro: Máx 1',
                'normal': 'Normal: Máx 2',
                'overload': 'Overclock: Máx 3'
            };
            const modeLabel = modeMap[currentMode] || `Modo ${currentMode}`;

            let extraLabel = `<div class="col-span-4 text-center text-xs text-chlorine-light mb-1 opacity-80 uppercase tracking-widest">
                <i class="fa-solid fa-bolt mr-1"></i> ${modeLabel}
            </div>`;

            this.elements.inspectionToolsContainer.html(`
                ${extraLabel}
                <div class="tool-wrapper col-span-1">
                    <div class="spiral-cable"></div>
                    <button id="tool-thermo" class="horror-tool-btn horror-tool-btn--main btn-interactive ${npc && npc.revealedStats.includes('temperature') ? 'btn-disabled opacity-20 grayscale' : ''}">
                        <i class="fa-solid fa-temperature-half"></i> TERMÓMETRO
                    </button>
                </div>
                <div class="tool-wrapper col-span-1">
                    <div class="spiral-cable"></div>
                    <button id="tool-flash" class="horror-tool-btn horror-tool-btn--main btn-interactive ${npc && npc.revealedStats.includes('skinTexture') ? 'btn-disabled opacity-20 grayscale' : ''}">
                        <i class="fa-solid fa-lightbulb"></i> LINTERNA UV
                    </button>
                </div>
                <div class="tool-wrapper col-span-1">
                    <div class="spiral-cable"></div>
                    <button id="tool-pulse" class="horror-tool-btn horror-tool-btn--main btn-interactive ${npc && npc.revealedStats.includes('pulse') ? 'btn-disabled opacity-20 grayscale' : ''}">
                        <i class="fa-solid fa-heart-pulse"></i> PULSO
                    </button>
                </div>
                <div class="tool-wrapper col-span-1">
                    <div class="spiral-cable"></div>
                    <button id="tool-pupils" class="horror-tool-btn horror-tool-btn--main btn-interactive ${npc && npc.revealedStats.includes('pupils') ? 'btn-disabled opacity-20 grayscale' : ''}">
                        <i class="fa-solid fa-eye"></i> PUPILAS
                    </button>
                </div>
                ${admitBtn}
                ${ignoreBtn}
            `);

            // Forzar layout de grid y gap
            this.elements.inspectionToolsContainer.css({
                'display': 'grid',
                'grid-template-columns': 'repeat(4, minmax(0, 1fr))',
                'gap': '0.75rem'
            });

            this.refreshToolsReferences();
        }
    }

    refreshToolsReferences() {
        this.elements.tools = [
            $('#tool-thermo'),
            $('#tool-flash'),
            $('#tool-pulse'),
            $('#tool-pupils')
        ];

        if (!this.game) return;
        const events = this.game.events;
        if (events && typeof events.bindInspectionTools === 'function') {
            events.bindInspectionTools();
        }

        // Los botones de admitir/ignorar se manejan vía delegación en GameEventManager.js
        // para evitar ejecuciones duplicadas y problemas con la recreación de elementos.
    }

    resetUI() {
        // Cerrar cualquier modal abierto
        this.closeModal(true);
        this.closeRelocationModal();
        if (this.elements.modalTutorial) this.elements.modalTutorial.addClass('hidden').removeClass('flex');

        // Resetear navegación de base de datos
        this.elements.dbNavBtns.removeClass('active');
        this.elements.dbNavBtns.first().addClass('active');
        this.elements.dbSections.addClass('hidden');
        this.elements.dbSections.first().removeClass('hidden');

        // Limpiar contenedores principales
        if (this.elements.npcDisplay) this.elements.npcDisplay.empty();
        if (this.elements.dialogue) this.elements.dialogue.html('Esperando sujeto...');
        if (this.elements.dialogueOptions) this.elements.dialogueOptions.empty();
        if (this.elements.logContainer) this.elements.logContainer.empty();
        if (this.elements.shelterGrid) this.elements.shelterGrid.empty();
        if (this.elements.morgueGridPurged) this.elements.morgueGridPurged.empty();
        if (this.elements.morgueGridEscaped) this.elements.morgueGridEscaped.empty();
        if (this.elements.morgueGridNight) this.elements.morgueGridNight.empty();
        if (this.elements.securityGrid) this.elements.securityGrid.empty();

        // Resetear contadores de UI
        if (this.elements.shelterCount) this.elements.shelterCount.text('0/0');
        if (this.elements.securityCount) this.elements.securityCount.text('0');
        if (this.elements.dayafterTestsLeft) this.elements.dayafterTestsLeft.text('0');
        if (this.elements.dayafterPendingCount) this.elements.dayafterPendingCount.text('0');
        if (this.elements.dayafterValidatedCount) this.elements.dayafterValidatedCount.text('0');

        // Resetear estados visuales de navegación
        this.clearAllNavStatuses();
        this.updateSecurityNavStatus([]);

        // Resetear HUD a valores iniciales (usando State ya reseteado)
        this.updateStats(
            State.paranoia,
            State.sanity,
            State.cycle,
            State.dayTime,
            State.config.dayLength,
            null,
            State.supplies
        );

        // Resetear herramientas
        this.updateInspectionTools(null);

        // Quitar filtros globales y efectos
        $('body').css('filter', 'none');
        $('.vhs-target').removeClass('vhs-active');
        $('#screen-game').removeClass('is-paused');

        // Resetear feedback
        this.hideFeedback();
    }

    renderNPC(npc) {
        // Update action buttons and tools based on generator status
        this.updateGameActions();

        // Limpiamos el estado visual de herramientas antes de renderizar
        if (this.elements.inspectionToolsContainer) {
            this.elements.inspectionToolsContainer.css('opacity', '0').html('');
        }

        // Poblamos el contenedor con el estado inicial del nuevo NPC (pero oculto)
        this.updateInspectionTools(npc);

        // Reset Visuals
        this.elements.npcDisplay.css({ transform: 'none', filter: 'none' });
        this.elements.npcDisplay.empty().removeClass('glitch-fade');

        // Trigger small glitch-fade animation for NPC change
        setTimeout(() => {
            this.elements.npcDisplay.addClass('glitch-fade');
        }, 10);

        // Use new Render System
        const avatar = this.renderAvatar(npc, 'lg');
        this.elements.npcDisplay.append(avatar);

        // Initial Dialogue (Conversation engine)
        if (npc.history && npc.history.length === 0 && npc.conversation) {
            const initialNode = npc.conversation.getCurrentNode();
            if (initialNode) {
                // Filtrar acciones (*texto*) para el historial inicial
                const cleanText = initialNode.text.replace(/\*.*?\*/g, '').trim();
                if (cleanText) npc.history.push({ speaker: 'npc', text: cleanText });
            }
        }
        this.updateDialogueBox(npc);

        // Glitch
        const glitchChance = Math.min(0.9, (npc.visualFeatures.glitchChance || 0) * (State.getGlitchModifier ? State.getGlitchModifier() : 1));
        if (Math.random() < glitchChance) {
            this.triggerGlitch();
            this.applyVHS(0.8, 1000);
        }
    }

    updateDialogueBox(npc) {
        if (!npc || !npc.conversation) return;

        // Reset tools animation flag if it's a completely new NPC interaction (no history)
        if (npc.history && npc.history.length === 0) {
            npc._toolsAnimated = false;
        }

        const convNode = npc.conversation.getCurrentNode();
        const nodeText = convNode ? convNode.text : '...';

        const displayNameFull = npc.getDisplayName ? npc.getDisplayName() : npc.name;
        // Split full display name into base name and epithet (apodo) if present (separator em-dash '—' or hyphen)
        const nameParts = displayNameFull.split(/\s*[—\-]\s*/);
        const baseName = nameParts[0].trim();
        const epithet = nameParts.slice(1).join(' — ').trim();

        const nameHtml = `<span class="npc-name font-bold text-chlorine">${baseName}</span>`;
        this.elements.dialogue.html(`${nameHtml} <span class="npc-text"></span>`);

        // Re-aplicar colores de paranoia al nuevo contenido del diálogo
        this.updateStats(State.paranoia, State.sanity, State.cycle, State.dayTime, State.config.dayLength, State.currentNPC);

        const textEl = this.elements.dialogue.find('.npc-text');
        this.elements.dialogueOptions.empty();

        // Helper to safely escape regex for display name removal (prefer removing the full displayNameFull or at least the baseName)
        const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Avoid repeating the NPC display name: remove leading or any redundant mentions inside the node text
        let raw = nodeText || '';
        // Remove leading displayNameFull or baseName as before
        const fullPattern = new RegExp('^\\s*' + escapeRegExp(displayNameFull) + '\\s*(?:[\\u2014\\-:\\s])*', 'i');
        if (fullPattern.test(raw)) {
            raw = raw.replace(fullPattern, '').trim();
        } else {
            const basePattern = new RegExp('^\\s*' + escapeRegExp(baseName) + '\\s*(?:[\\u2014\\-:\\s])*', 'i');
            raw = raw.replace(basePattern, '').trim();
        }
        // Also remove any further occurrences of the base name or full name inside the dialogue (to avoid redundancy).
        // Use word boundaries and case-insensitive match. Be careful with accented characters — use simple replace for now.
        try {
            const innerRemoveFull = new RegExp('\\b' + escapeRegExp(displayNameFull) + '\\b', 'gi');
            raw = raw.replace(innerRemoveFull, '').trim();
        } catch (e) { /* ignore if regex fails */ }
        try {
            const innerRemoveBase = new RegExp('\\b' + escapeRegExp(baseName) + '\\b', 'gi');
            raw = raw.replace(innerRemoveBase, '').trim();
        } catch (e) { /* ignore */ }


        // If the epithet exists and is not included in the raw text, prepend it once to the dialogue text
        let parsed = '';

        // Play node audio on enter
        if (convNode && convNode.audio && this.audio) {
            if (convNode.audio.startsWith('lore_')) {
                // Play as music (lore channel) with loop and fade
                this.audio.playLoreByKey(convNode.audio, { loop: true, volume: 0.25, crossfade: 1000 });
            } else {
                this.audio.playSFXByKey(convNode.audio, { volume: 0.5 });
            }
        }

        // Ocultar herramientas inicialmente para sincronizar (si el generador está OK)
        if (this.elements.inspectionToolsContainer && !npc._toolsAnimated && State.generator.isOn) {
            this.elements.inspectionToolsContainer.css('opacity', '0');
        } else if (this.elements.inspectionToolsContainer) {
            this.elements.inspectionToolsContainer.css('opacity', '1');
        }

        // Botones de acción (Admitir/Ignorar) y Diálogo siempre visibles
        if (this.elements.gameActionsContainer) {
            this.elements.gameActionsContainer.css('opacity', '1');
        }
        this.elements.dialogueOptions.css('opacity', '1');

        const showActions = () => {
            // Animación de entrada solo para las herramientas (si el generador está OK)
            if (this.elements.inspectionToolsContainer && !npc._toolsAnimated && State.generator.isOn) {
                this.elements.inspectionToolsContainer.css('opacity', '1').addClass('animate-button-in');
                npc._toolsAnimated = true;
                setTimeout(() => this.elements.inspectionToolsContainer.removeClass('animate-button-in'), 400);
            } else if (this.elements.inspectionToolsContainer) {
                this.elements.inspectionToolsContainer.css('opacity', '1');
            }
        };

        const needsMarkup = /\*.*?\*|".*?"|Se dice que|Dicen que|comentaba que/.test(raw);
        if (needsMarkup) {
            parsed = (typeof parseDialogueMarkup === 'function') ? parseDialogueMarkup(raw) : raw;
            if (epithet && !raw.includes(epithet)) {
                parsed = `<span class="npc-epithet"> ${escapeHtml(epithet)}</span> ` + parsed;
            }
            // Use sequenced rendering that respects actions/speeches/rumors
            this.typeText(textEl, parsed, 18, showActions);
        } else {
            // Plain text: optionally include epithet
            let finalText = raw;
            if (epithet && !raw.includes(epithet)) finalText = `— ${epithet} ${raw}`;
            this.typeText(textEl, finalText, 18, showActions);
        }

        // Build option buttons
        if (convNode && convNode.options && convNode.options.length) {
            const optionsCount = convNode.options.length;

            // Pre-calculate if any option is a tooltip (interaction)
            const hasTooltip = convNode.options.some(opt => {
                const label = (opt.label || '').toLowerCase();
                const fnName = opt.onclick ? opt.onclick.name : '';
                return opt.onclick && (
                    fnName.includes('test') ||
                    label.includes('analizar') ||
                    label.includes('termómetro') ||
                    label.includes('pulso') ||
                    label.includes('pupilas') ||
                    label.includes('uv')
                );
            });

            // Layout rules: 
            // - If only 1 option, or if ANY option is a tooltip, use a full-width column layout.
            // - Otherwise, if exactly 2 options, use the 2-column grid.
            const forceFullWidth = optionsCount === 1 || hasTooltip;

            this.elements.dialogueOptions.removeClass('grid grid-cols-1 grid-cols-2 flex flex-col gap-2');

            if (optionsCount === 2 && !forceFullWidth) {
                this.elements.dialogueOptions.addClass('grid grid-cols-2 gap-2');
            } else {
                this.elements.dialogueOptions.addClass('grid grid-cols-1 gap-2');
            }

            convNode.options.forEach((opt, idx) => {
                const label = opt.label.toLowerCase();
                const fnName = opt.onclick ? opt.onclick.name : '';

                // Determinar si es un botón de tooltip (inspección)
                const isTooltip = opt.onclick && (
                    fnName === 'testUV' ||
                    fnName === 'testThermo' ||
                    fnName === 'testPulse' ||
                    fnName === 'testPupils' ||
                    fnName === 'test' ||
                    label.includes('analizar') ||
                    label.includes('termómetro') ||
                    label.includes('pulso') ||
                    label.includes('pupilas') ||
                    label.includes('uv')
                );

                const tooltipIcon = isTooltip ? (
                    (fnName === 'testThermo' || label.includes('termómetro')) ? 'fa-temperature-half' :
                        (fnName === 'testPulse' || label.includes('pulso')) ? 'fa-heart-pulse' :
                            (fnName === 'testPupils' || label.includes('pupilas')) ? 'fa-eye' : 'fa-lightbulb'
                ) : null;

                // Asignar clases automáticas según la acción para restaurar estilos perdidos
                let autoClass = '';
                if (opt.onclick || isTooltip) {
                    if (fnName === 'ignore' || label.includes('ignorar') || label.includes('omitir')) {
                        autoClass = 'option-omit';
                    }
                    else if (fnName === 'admit' || label.includes('admitir')) autoClass = 'horror-btn-admit';
                    else if (isTooltip || fnName.includes('test') || label.includes('analizar')) autoClass = 'horror-btn-analyze';
                }

                // If forceFullWidth is active, every item gets col-span-2 to ensure layering on the grid
                const spanClass = forceFullWidth ? 'col-span-2' : '';

                const btn = $('<button>', {
                    class: `${isTooltip ? 'horror-tool-btn horror-tool-btn--dialogue' : 'horror-btn-dialogue'} ${opt.cssClass || ''} ${autoClass} animate-dialogue-in w-full ${spanClass}`,
                    html: `${tooltipIcon ? `<i class="fa-solid ${tooltipIcon}"></i>` : '&gt; '} ${escapeHtml(opt.label)}`,
                    style: `animation-delay: ${idx * 0.1}s`
                });

                btn.on('click', () => {
                    // Prevenir clics si ya estamos procesando una decisión
                    if (this.game && this.game.actions && this.game.actions.processingDecision) return;

                    // Mark dialogue started and hide omit (tracking interaction)
                    npc.dialogueStarted = true;

                    // Riesgo de degradación de seguridad durante el diálogo
                    const game = this.game || window.game;
                    if (game && game.mechanics && typeof game.mechanics.checkSecurityDegradation === 'function') {
                        game.mechanics.checkSecurityDegradation();
                    }

                    // Registrar evidencia en bitácora si la opción lo requiere
                    if (opt.log) {
                        State.addLogEntry('evidence', opt.log.text, { icon: opt.log.icon });
                        this.setNavItemStatus('btn-open-log', 2);
                    }

                    // Log choice to NPC history - Filtrar acciones (*texto*) para el historial
                    if (!npc.history) npc.history = [];
                    const cleanLabel = opt.label.replace(/\*.*?\*/g, '').trim();
                    npc.history.push({ speaker: 'user', text: `> ${cleanLabel}` });

                    // Play optional sfx tied to option
                    if (opt.audio && this.audio) this.audio.playSFXByKey(opt.audio, { volume: 0.6 });

                    // Execute custom onclick if defined
                    if (opt.onclick) {
                        try {
                            opt.onclick(this.game || window.game);
                        } catch (e) {
                            console.warn("Dialogue onclick failed:", e);
                        }
                        if (State.currentNPC !== npc) return;
                    }

                    const res = npc.conversation.getNextDialogue(idx);

                    if (res.error) {
                        this.showMessage(res.error, () => { }, 'warning');
                        return;
                    }

                    if (res.audio && this.audio) this.audio.playSFXByKey(res.audio, { volume: 0.6 });

                    if (res.end) {
                        this.showFeedback('FIN DE DIÁLOGO', 'green', 2500);
                        this.elements.dialogueOptions.empty();

                        // Stop ongoing lore audio if it was a lore dialogue
                        if (this.audio) this.audio.stopLore({ fadeOut: 1000 });

                        // Si es la opción de salida dinámica o fin automático, tratarla como omisión de test
                        if (res.id === 'exit_conversation' || res.id === 'auto_end') {
                            this.handleOmitTest(npc);
                        }

                        if (res.message) {
                            const parsedMsg = (typeof parseDialogueMarkup === 'function') ? parseDialogueMarkup(res.message) : res.message;
                            this.typeText(textEl, parsedMsg, 18);
                            // Filtrar acciones (*texto*) para el historial
                            const cleanMsg = res.message.replace(/\*.*?\*/g, '').trim();
                            if (cleanMsg) npc.history.push({ speaker: 'npc', text: cleanMsg });
                        }
                        // update inspection tools after final choice
                        this.updateInspectionTools(npc);
                        return;
                    }

                    // Otherwise render the next node
                    this.updateDialogueBox(npc);

                    const nextNode = npc.conversation.getCurrentNode();
                    if (nextNode) {
                        // Filtrar acciones (*texto*) para el historial
                        const cleanNext = nextNode.text.replace(/\*.*?\*/g, '').trim();
                        if (cleanNext) npc.history.push({ speaker: 'npc', text: cleanNext });
                    }

                    // Slight VHS effect if paranoia high
                    if (State.paranoia > 70) this.applyVHS(0.6, 600);

                    npc.dialogueStarted = true;
                    // Ensure inspection tools reflect interaction
                    this.updateInspectionTools(npc);
                });

                this.elements.dialogueOptions.append(btn);
            });
        }

        // Omit option: show if not already present as a dynamic option
        const hasDynamicExit = convNode && convNode.options && convNode.options.some(o => o.id === 'exit_conversation');

        // Temporarily persistent as requested by user
        if (!npc.optOut && !hasDynamicExit) {
            const omitBtn = $('<button>', {
                class: `horror-btn-dialogue option-omit w-full my-2 col-span-2`,
                html: '&gt; Omitir por diálogo'
            });
            omitBtn.on('click', (e) => {
                // Prevenir clics si ya estamos procesando una decisión
                if (this.game && this.game.actions && this.game.actions.processingDecision) return;

                e.preventDefault();
                e.stopPropagation();
                this.handleOmitTest(npc);
                npc.dialogueStarted = true;
            });
            this.elements.dialogueOptions.append(omitBtn);
        }
    }

    handleOmitTest(npc) {
        if (!npc || npc.optOut) return;
        npc.optOut = true;
        npc.dialogueStarted = true;
        // Agotamos las energías mecánicamente
        npc.scanCount = 99;

        if (!npc.history) npc.history = [];
        npc.history.push({
            text: 'Test omitido voluntariamente mediante protocolo de diálogo.',
            type: 'warning'
        });

        if (this.audio) this.audio.stopLore({ fadeOut: 1000 });

        this.showFeedback('TEST OMITIDO: SIN EVIDENCIA MÉDICA', 'yellow', 3000);
        this.updateInspectionTools(npc);
        this.hideOmitOption();
        this.elements.dialogueOptions.empty();

        // Limpiar el texto de diálogo para reflejar el cambio de estado
        const textEl = this.elements.dialogue.find('.npc-text');
        if (textEl.length) {
            const statusMsg = '<span class="text-warning italic">* Protocolo de inspección omitido. El sujeto espera una decisión final. *</span>';
            this.typeText(textEl, statusMsg, 10);
        }

        // Actualizar estadísticas HUD
        this.updateStats(State.paranoia, State.sanity, State.cycle, State.dayTime, State.config.dayLength, State.currentNPC);
    }

    typeText(el, text, speed = 20, onComplete = null) {
        // Cancel any ongoing typing
        if (this.typingTimer) {
            cancelAnimationFrame(this.typingTimer);
            this.typingTimer = null;
        }

        const stopTypingSFX = () => {
            if (this.typingAudio) {
                try {
                    this.typingAudio.pause();
                    this.typingAudio.currentTime = 0;
                } catch (e) { }
                this.typingAudio = null;
            }
        };

        const finish = () => {
            this.typingTimer = null;
            stopTypingSFX();
            if (onComplete) onComplete();
        };

        // Stop any previous typing audio
        stopTypingSFX();

        // Handle typing SFX as a loop
        if (this.audio) {
            this.typingAudio = this.audio.playSFXByKey('ui_dialogue_type', { volume: 0.3, loop: true, lockMs: 0 });
        }

        // Helper to detect if the incoming text is HTML (from parseDialogueMarkup)
        const containsHtml = /<[^>]+>/.test(text);

        // If text is plain (no markup), keep the old behaviour (char-by-char)
        if (!containsHtml) {
            el.text('');
            let i = 0;
            const minStep = Math.max(5, speed);
            const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            const step = (now) => {
                const elapsed = now - start;
                const shouldBe = Math.floor(elapsed / minStep);
                while (i <= shouldBe && i < text.length) {
                    el.text(el.text() + text.charAt(i));
                    i++;
                }
                if (i >= text.length) {
                    finish();
                    return;
                }
                this.typingTimer = requestAnimationFrame(step);
            };
            this.typingTimer = requestAnimationFrame(step);
            return;
        }

        // If we received HTML, render it but animate text nodes; actions (.action) will be shown instantly
        // Build tokens from HTML. Prefer DOM parsing if available for accuracy
        let tokens = [];
        const buildTokensFromNode = (node) => {
            const nodeTokens = [];
            // Node can be text or element
            if (typeof node === 'string') {
                // fallback string content
                nodeTokens.push({ type: 'text', value: node });
                return nodeTokens;
            }
            if (node.nodeType === 3 || node.nodeType === undefined) {
                // Text node or fallback plain string
                const txt = (node.textContent || node.nodeValue || node).toString();
                nodeTokens.push({ type: 'text', value: txt });
                return nodeTokens;
            }
            if (node.nodeType === 1) {
                const cls = (node.getAttribute && node.getAttribute('class')) || '';
                // If action, add as instant outerHTML
                if (/\baction\b/.test(cls) || /npc-epithet|epithet/.test(cls)) {
                    nodeTokens.push({ type: 'instant', html: node.outerHTML || (`<span class="action">${node.textContent}</span>`) });
                    return nodeTokens;
                }
                // For other elements, construct token with open/close and children tokens
                const openTag = (() => {
                    let tag = `<${node.tagName.toLowerCase()}`;
                    for (const attr of node.attributes || []) {
                        tag += ` ${attr.name}="${attr.value}"`;
                    }
                    tag += '>';
                    return tag;
                })();
                nodeTokens.push({ type: 'open', html: openTag });
                // children
                const children = node.childNodes || [];
                for (let i = 0; i < children.length; i++) {
                    nodeTokens.push(...buildTokensFromNode(children[i]));
                }
                nodeTokens.push({ type: 'close', html: `</${node.tagName.toLowerCase()}>` });
                return nodeTokens;
            }
            return nodeTokens;
        };

        if (typeof document !== 'undefined' && document.createElement) {
            try {
                const cont = document.createElement('div');
                cont.innerHTML = text;
                for (let i = 0; i < cont.childNodes.length; i++) {
                    tokens.push(...buildTokensFromNode(cont.childNodes[i]));
                }
            } catch (e) {
                // Fallback to naive tokenization if DOM parsing fails
                tokens = text.split(/(<span[^>]*>.*?<\/span>)/g).filter(Boolean).map(seg => {
                    if (/^<span/.test(seg)) return { type: 'instant', html: seg };
                    return { type: 'text', value: seg };
                });
            }
        } else {
            // Node environment (tests), use simple regex tokenization
            const parts = text.split(/(<span[^>]*>.*?<\/span>)/g).filter(Boolean);
            for (const p of parts) {
                if (/^<span/.test(p)) {
                    // If inner contains an action or an epithet, expose it as instant
                    if (/class=\".*?(action|npc-epithet|epithet).*?\"/.test(p)) {
                        tokens.push({ type: 'instant', html: p });
                    } else {
                        // treat as element open, inner text, close
                        const innerMatch = p.match(/^<span[^>]*>([\s\S]*?)<\/span>$/);
                        const open = p.replace(innerMatch[1], '').replace(/<\/?span>/g, m => m); // crude
                        tokens.push({ type: 'open', html: p.replace(innerMatch[1], '').replace(/<\/span>$/, '') });
                        tokens.push({ type: 'text', value: innerMatch[1] });
                        tokens.push({ type: 'close', html: '</span>' });
                    }
                } else {
                    tokens.push({ type: 'text', value: p });
                }
            }
        }

        // Now iterate tokens and animate
        let acc = '';
        // Flush leading instant tokens and open tags immediately so epithets/actions and wrappers appear at once
        while (tokens.length && (tokens[0].type === 'instant' || tokens[0].type === 'open')) {
            const t0 = tokens.shift();
            acc += t0.html;
        }
        el.html(acc);

        let tokenIdx = 0; // index relative to remaining tokens array
        let charIdx = 0;
        const minStep = Math.max(5, speed);
        const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());

        const nextFrame = (now) => {
            while (tokenIdx < tokens.length) {
                const t = tokens[tokenIdx];
                if (t.type === 'instant') {
                    acc += t.html;
                    tokenIdx++;
                    charIdx = 0;
                    // Update immediately (actions appear at once)
                    el.html(acc);
                    continue; // process next token immediately
                }
                if (t.type === 'open') {
                    acc += t.html;
                    tokenIdx++; continue;
                }
                if (t.type === 'close') {
                    acc += t.html;
                    tokenIdx++; continue;
                }
                if (t.type === 'text') {
                    // type characters of this text token
                    const elapsed = now - start;
                    const shouldBe = Math.floor(elapsed / minStep);
                    while (charIdx <= shouldBe && charIdx < t.value.length) {
                        acc += t.value.charAt(charIdx);
                        charIdx++;
                    }
                    el.html(acc);
                    if (charIdx >= t.value.length) {
                        tokenIdx++; charIdx = 0; continue;
                    }
                    // still typing this token
                    break;
                }

                // rumor handling: if token has type 'rumor' use fade-in (tokenization should treat rumor as open/text/close or instant in fallback)
                if (t.type === 'rumor') {
                    // append container with zero opacity and then animate
                    acc += `<span class="rumor" style="opacity:0; transition:opacity 360ms ease">${t.text}</span>`;
                    el.html(acc);
                    // trigger fade
                    const fadeIndex = tokenIdx;
                    setTimeout(() => {
                        // change the last appended rumor span to opacity 1
                        // In real DOM we'd do querySelector; for fake DOM, replace by updating the inner string
                        const cur = el.html();
                        el.html(cur.replace('opacity:0', 'opacity:1'));
                        // continue after fade completes
                        setTimeout(() => {
                            tokenIdx = fadeIndex + 1;
                            requestAnimationFrame(nextFrame);
                        }, 380);
                    }, 10);
                    return; // wait for fade
                }
            }

            if (tokenIdx >= tokens.length) {
                finish();
                return;
            }

            this.typingTimer = requestAnimationFrame(nextFrame);
        };

        this.typingTimer = requestAnimationFrame(nextFrame);
    }

    hideOmitOption() {
        const btn = this.elements.dialogueOptions.find('.option-omit');
        if (btn.length) btn.addClass('hidden');
    }

    triggerGlitch() {
        this.elements.npcDisplay.css({
            transform: 'skewX(10deg)',
            filter: 'invert(1)'
        });
        setTimeout(() => {
            this.elements.npcDisplay.css({
                transform: 'none',
                filter: 'none'
            });
        }, 150);
    }

    showValidationGate(npc) {
        const overlay = $('#validation-overlay');
        overlay.removeClass('hidden').addClass('flex');
        if (this.audio) this.audio.playSFXByKey('validation_gate_open', { volume: 0.5 });
        $('#btn-do-test').off('click').on('click', () => {
            overlay.addClass('hidden').removeClass('flex');
        });
        $('#btn-omit-test').off('click').on('click', () => {
            if (!npc.optOut) {
                this.handleOmitTest(npc);
            }
            overlay.addClass('hidden').removeClass('flex');
        });
    }

    showLore(type, onClose, options = {}) { return this.modules.lore.showLore(type, onClose, options); }

    renderNightScreen(state) {
        const count = state.admittedNPCs.length;
        const max = state.config.maxShelterCapacity;
        const isFull = count >= max;

        $('#night-shelter-status').text(`${count}/${max}`);
        $('#night-paranoia-status').text(`${Math.round(state.paranoia)}%`);

        if (isFull) {
            $('#night-shelter-status').removeClass('text-white').addClass('text-alert animate-pulse');
        } else {
            $('#night-shelter-status').removeClass('text-alert animate-pulse').addClass('text-white');
        }

        // Enable/Disable escape button
        $('#btn-night-escape').prop('disabled', !isFull);

        // Hide manage option if already purged
        if (state.nightPurgePerformed) {
            $('#btn-night-shelter').addClass('hidden');
            $('#screen-night .grid').removeClass('sm:grid-cols-2').addClass('sm:grid-cols-1 max-w-sm');
        } else {
            $('#btn-night-shelter').removeClass('hidden');
            $('#screen-night .grid').addClass('sm:grid-cols-2').removeClass('sm:grid-cols-1 max-w-sm');
        }

        $('#btn-finalize-day-no-purge').addClass('hidden');

        this.showScreen('night');
    }

    showFeedback(text, color = 'yellow', duration = 0) {
        const colorMap = {
            'yellow': 'text-warning',
            'warning': 'text-warning',
            'red': 'text-alert',
            'alert': 'text-alert',
            'green': 'text-green-400',
            'success': 'text-green-400',
            '#aaffaa': 'text-green-400',
            'orange': 'text-orange-400',
            'rose': 'text-rose-400'
        };

        // Limpiar cualquier timer previo
        if (this.feedbackTimer) {
            clearTimeout(this.feedbackTimer);
            this.feedbackTimer = null;
        }

        // Remove old color classes
        this.elements.feedback.removeClass('text-warning text-alert text-green-400 text-orange-400 text-rose-400');

        // Add new color class or style if not mapped
        if (colorMap[color]) {
            this.elements.feedback.addClass(colorMap[color]);
        } else {
            this.elements.feedback.css('color', color);
        }

        this.elements.feedback.text(text).removeClass('hidden');

        // Si se especifica duración, ocultar automáticamente
        if (duration > 0) {
            this.feedbackTimer = setTimeout(() => {
                this.hideFeedback();
            }, duration);
        }
    }

    hideFeedback() {
        if (this.feedbackTimer) {
            clearTimeout(this.feedbackTimer);
            this.feedbackTimer = null;
        }
        this.elements.feedback.addClass('hidden');
    }

    renderShelterGrid(npcs, max, onPurgeClick, onDetailClick) {
        this.elements.shelterCount.text(`${npcs.length}/${max}`);
        this.elements.shelterGrid.empty();

        // Clear nav status on view (acknowledgement of new entrants)
        if (this.setNavItemStatus) this.setNavItemStatus('nav-shelter', null);

        const batch = [];
        npcs.forEach(npc => {
            // Lógica de deducción visual
            const isValidated = npc.dayAfter && npc.dayAfter.validated;
            const isPurgeLocked = npc.purgeLockedUntil && State.cycle < npc.purgeLockedUntil;
            const canTest = !isValidated && !isPurgeLocked && (npc.dayAfter && npc.dayAfter.usedNightTests < 1);

            let extraClasses = '';
            let statusIcon = '';

            if (isValidated) {
                if (npc.isInfected) {
                    extraClasses = 'infected-alert';
                    statusIcon = '<i class="fa-solid fa-biohazard text-alert text-xs absolute top-1 right-1"></i>';
                } else {
                    extraClasses = 'validated';
                    statusIcon = '<i class="fa-solid fa-shield-check text-green-500 text-xs absolute top-1 right-1"></i>';
                }
            } else if (isPurgeLocked) {
                extraClasses = 'locked';
                statusIcon = '<i class="fa-solid fa-lock text-gray-500 text-xs absolute top-1 right-1"></i>';
            } else if (canTest) {
                extraClasses = 'test-ready';
            }

            // Add unique NPC styling
            if (npc.uniqueType) {
                extraClasses += ` npc-card-unique unique-${npc.uniqueType}`;
            }

            const card = $('<div>', {
                class: `survivor-card ${extraClasses}`
            });

            const avatar = this.renderAvatar(npc, 'sm', isValidated ? 'perimeter' : 'normal');
            const name = $('<span>', { text: npc.name, class: 'mt-2 text-xs' });

            // Add unique badge if applicable
            if (npc.uniqueBadge) {
                const badge = $(`<div class="npc-unique-badge badge-${npc.uniqueType}">
                    <i class="fas ${npc.uniqueBadge.icon}"></i>
                    <span>${npc.uniqueBadge.label}</span>
                </div>`);
                card.append(badge);
            }

            if (statusIcon) card.append($(statusIcon));
            card.append(avatar, name);
            card.on('click', () => onDetailClick(npc, true));

            batch.push(card[0]);
        });
        if (batch.length) this.elements.shelterGrid.append(batch);
    }

    updateDayAfterSummary(npcs) {
        const testsLeft = State.dayAfter.testsAvailable;
        this.elements.dayafterTestsLeft.text(testsLeft);

        const validatedCount = npcs.filter(n => n.dayAfter && n.dayAfter.validated).length;
        const pendingCount = npcs.length - validatedCount;

        this.elements.dayafterValidatedCount.text(validatedCount);
        this.elements.dayafterPendingCount.text(pendingCount);

        // La revisión solo es "obligatoria" si no hay energía o está apagado
        const generatorOk = State.generator && State.generator.isOn && (State.generator.power > 10);
        const needsCheck = !generatorOk;

        if (this.elements.genWarningShelter) this.elements.genWarningShelter.toggleClass('hidden', !needsCheck);

        // Update nav indicator for generator
        this.updateGeneratorNavStatus();

        // Si necesita revisión, podemos añadir un botón temporal en el panel de tests
        const testsPanel = this.elements.dayafterPanel;
        if (needsCheck) {
            if ($('#btn-shelter-goto-gen').length === 0) {
                const btn = $('<button>', {
                    id: 'btn-shelter-goto-gen',
                    class: 'horror-btn horror-btn-alert px-3 py-2 text-xs flex items-center justify-center gap-2 animate-pulse mt-2 w-full',
                    html: '<i class="fa-solid fa-bolt"></i> IR AL GENERADOR'
                }).on('click', () => {
                    const game = this.game || window.game;
                    if (game && game.events && typeof game.events.navigateToGenerator === 'function') {
                        game.events.navigateToGenerator();
                    }
                });
                testsPanel.append(btn);
            }
        } else {
            $('#btn-shelter-goto-gen').remove();
        }
    }

    renderMorgueGrid(purged, escaped, night, onDetailClick) {
        // Viewing the morgue clears its attention marker
        if (this.setNavItemStatus) this.setNavItemStatus('nav-morgue', null);

        // Helper para renderizar una lista en un contenedor específico
        const renderList = (list, container, type) => {
            container.empty();
            if (!list || list.length === 0) {
                container.append($('<div>', {
                    class: 'text-sm text-gray-800 italic p-4 font-mono uppercase text-center w-full col-span-full',
                    text: '// SIN REGISTROS EN ESTA CATEGORÍA //'
                }));
                return;
            }

            const batch = [];
            list.forEach(npc => {
                // Estilos según tipo
                let typeClass = '';
                let statusIcon = '';

                if (type === 'purged') {
                    typeClass = 'cat-purged';
                    statusIcon = '<i class="fa-solid fa-skull text-alert/50 text-[10px] absolute top-1 right-1"></i>';
                } else if (type === 'escaped') {
                    typeClass = 'cat-escaped';
                    statusIcon = '<i class="fa-solid fa-person-running text-yellow-500/50 text-[10px] absolute top-1 right-1"></i>';
                } else if (type === 'night') {
                    typeClass = 'cat-night';
                    statusIcon = '<i class="fa-solid fa-moon text-blue-400/50 text-[10px] absolute top-1 right-1"></i>';
                }

                let isRevealedInfected = false;
                if (type === 'purged') {
                    isRevealedInfected = npc.death && npc.death.revealed && npc.isInfected;
                } else {
                    const isIgnoredRevealed = npc.exitCycle && npc.exitCycle < State.cycle;
                    const isNightRevealed = npc.left && npc.left.cycle <= State.cycle;
                    if ((isIgnoredRevealed || isNightRevealed) && npc.isInfected) {
                        isRevealedInfected = true;
                    }
                }

                const statusColorClass = isRevealedInfected ? 'infected-alert' : typeClass;

                let cardClasses = `morgue-card ${statusColorClass} group`;
                // Add unique NPC styling
                if (npc.uniqueType) {
                    cardClasses += ` npc-card-unique unique-${npc.uniqueType}`;
                }

                const card = $('<div>', {
                    class: cardClasses
                });

                const avatar = this.renderAvatar(npc, 'sm', 'perimeter');

                if (isRevealedInfected) {
                    avatar.addClass('infected');
                    // Badge de infectado (reemplaza al icono de estado normal)
                    statusIcon = '<i class="fa-solid fa-biohazard text-alert text-xs absolute top-1 right-1 animate-pulse"></i>';
                }

                const infoContainer = $('<div>', { class: 'flex flex-col items-center mt-2 w-full overflow-hidden' });
                const name = $('<span>', {
                    text: npc.name,
                    class: 'name text-sm font-mono text-gray-400 group-hover:text-white truncate w-full text-center uppercase tracking-tighter'
                });

                const role = $('<span>', {
                    text: npc.occupation || 'DESCONOCIDO',
                    class: 'text-[10px] font-mono text-gray-600 truncate w-full text-center uppercase opacity-60'
                });


                if (statusIcon) card.append($(statusIcon));

                // Add unique badge if applicable
                if (npc.uniqueBadge) {
                    const badge = $(`<div class="npc-unique-badge badge-${npc.uniqueType}">
                        <i class="fas ${npc.uniqueBadge.icon}"></i>
                        <span>${npc.uniqueBadge.label}</span>
                    </div>`);
                    card.append(badge);
                }

                // Add DEAD stamp for purged
                if (type === 'purged') {

                    card.append($('<div>', { class: 'stamp-dead', text: 'DEAD' }));
                }

                infoContainer.append(name, role);
                card.append(avatar, infoContainer);

                card.on('click', () => {
                    if (onDetailClick) onDetailClick(npc);
                });

                batch.push(card[0]);
            });
            container.append(batch);
        };

        renderList(purged, this.elements.morgueGridPurged, 'purged');
        renderList(escaped, this.elements.morgueGridEscaped, 'escaped');
        renderList(night, this.elements.morgueGridNight, 'night');
    }

    updateSecurityNavStatus(items) {
        if (!this.setNavItemStatus) return;
        if (!items || items.length === 0) {
            this.setNavItemStatus('nav-room', null);
            return;
        }

        const unsecuredCount = items.filter(it => it.type === 'alarma' ? !it.active : !it.secured).length;

        if (unsecuredCount === items.length) {
            this.setNavItemStatus('nav-room', 4); // Critical (Red) - Todos apagados
        } else if (unsecuredCount > 0) {
            this.setNavItemStatus('nav-room', 3); // Warning (Yellow) - Al menos uno apagado
        } else {
            this.setNavItemStatus('nav-room', null); // Clear
        }
    }

    renderSecurityRoom(items, onToggle) {
        this.elements.securityGrid.empty();
        this.elements.securityCount.text(items.length);

        const hasPower = State.generator && State.generator.isOn;
        if (this.elements.roomPowerWarning) {
            this.elements.roomPowerWarning.toggleClass('hidden', hasPower);
        }

        const batch = [];
        items.forEach((it, idx) => {
            const icon = it.type === 'alarma' ? 'fa-bell' : it.type === 'puerta' ? 'fa-door-closed' : it.type === 'ventana' ? 'fa-window-maximize' : it.type === 'tuberias' ? 'fa-water' : 'fa-question';
            const activeOrSecured = it.type === 'alarma' ? it.active : it.secured;
            const stateClass = activeOrSecured ? 'secured' : 'unsecured';

            const card = $('<div>', {
                class: `security-item-card ${stateClass} relative overflow-hidden group flex flex-col items-center justify-between p-4 min-h-[140px] cursor-pointer hover:bg-white/5 transition-colors`
            });

            // Static noise overlay
            card.append('<div class="static-noise"></div>');

            if (!hasPower) {
                card.addClass('opacity-50 grayscale cursor-not-allowed');
            }

            // Click interaction for the whole card
            card.on('click', () => {
                if (!hasPower) {
                    if (this.audio) this.audio.playSFXByKey('ui_error', { volume: 0.4 });
                    return;
                }

                if (it.type === 'alarma') {
                    it.active = !it.active;
                    if (it.active && this.audio) this.audio.playSFXByKey('alarm_activate', { volume: 0.6, priority: 1 });
                } else {
                    it.secured = !it.secured;
                    if (this.audio) {
                        if (it.secured) {
                            if (it.type === 'puerta') this.audio.playSFXByKey('door_secure', { volume: 0.6, priority: 1 });
                            if (it.type === 'ventana') this.audio.playSFXByKey('window_secure', { volume: 0.6, priority: 1 });
                            if (it.type === 'tuberias') this.audio.playSFXByKey('pipes_whisper', { volume: 0.4, priority: 1 });
                        } else {
                            if (it.type === 'puerta') this.audio.playSFXByKey('door_unsecure', { volume: 0.6, priority: 1 });
                            if (it.type === 'ventana') this.audio.playSFXByKey('window_unsecure', { volume: 0.6, priority: 1 });
                        }
                    }
                }
                if (onToggle) onToggle(idx, it);
                this.renderSecurityRoom(items, onToggle);
            });

            // Screws for each card
            card.append('<div class="panel-screw screw-tl" style="width:4px;height:4px;top:2px;left:2px;"></div>');
            card.append('<div class="panel-screw screw-tr" style="width:4px;height:4px;top:2px;right:2px;"></div>');
            card.append('<div class="panel-screw screw-bl" style="width:4px;height:4px;bottom:2px;left:2px;"></div>');
            card.append('<div class="panel-screw screw-br" style="width:4px;height:4px;bottom:2px;right:2px;"></div>');

            const statusColor = activeOrSecured ? this.colors.safe : this.colors.offStatus;

            // Visual Animation Box
            const visualBox = $('<div>', { class: 'security-visual-box', style: `color: ${statusColor}` });

            if (it.type === 'alarma') {
                visualBox.append($('<div>', { class: `visual-alarm-ring ${it.active ? 'active' : ''}` }));
                visualBox.append($('<i>', { class: 'fa-solid fa-tower-broadcast absolute text-sm opacity-40' }));
            } else if (it.type === 'puerta') {
                visualBox.append($('<div>', { class: `visual-door-hatch ${it.secured ? 'secured' : 'unsecured'}` }));
            } else if (it.type === 'ventana') {
                visualBox.append($('<div>', { class: `visual-window-shutter ${it.secured ? 'secured' : 'unsecured'}` }));
            } else if (it.type === 'tuberias') {
                visualBox.append($('<div>', { class: 'visual-pipe-gauge' }).append($('<div>', { class: `visual-pipe-flow ${it.secured ? 'active' : ''}` })));
            } else {
                visualBox.append($('<i>', { class: `fa-solid ${icon} text-2xl opacity-20` }));
            }

            card.append(visualBox);

            const label = it.type === 'alarma' ? 'ALARMA' : (it.type === 'tuberias' ? 'TUBERÍAS' : it.type.toUpperCase());
            card.append($('<span>', { text: label, class: 'text-sm font-mono font-bold tracking-widest text-white/80' }));

            // LED status light
            card.append($('<div>', {
                class: 'absolute top-2 right-2 w-1.5 h-1.5 rounded-full',
                style: `background: ${statusColor}; box-shadow: 0 0 5px ${statusColor}; ${!activeOrSecured ? 'animation: blink-fast 0.5s steps(2) infinite;' : ''}`
            }));

            // Status label where the button used to be
            const statusText = !hasPower ? 'OFFLINE' : (it.type === 'alarma' ? (it.active ? 'SISTEMA ACTIVO' : 'SISTEMA INACTIVO') : (activeOrSecured ? 'CANAL ASEGURADO' : 'CANAL EXPUESTO'));
            const statusClass = `mt-2 w-full text-[9px] py-1 uppercase font-mono tracking-tighter text-center ${activeOrSecured ? 'text-green-500' : 'text-alert animate-pulse'}`;
            const statusIndicator = $('<div>', { class: statusClass, text: statusText });

            card.append(statusIndicator);
            batch.push(card[0]);
        });
        if (batch.length) this.elements.securityGrid.append(batch);

        // Update nav status: if any unsecured channels exist, set warning; otherwise clear
        this.updateSecurityNavStatus(items);
    }

    renderLog(state) {
        const container = this.elements.logContainer;
        container.empty();

        // Al abrir la bitácora, quitamos la animación de notificación
        this.setNavItemStatus('btn-open-log', null);

        if (!state.gameLog || state.gameLog.length === 0) {
            container.append($('<div>', { class: 'text-gray-500 italic text-center p-4', text: 'Sin registros disponibles.' }));
            return;
        }

        state.gameLog.forEach(entry => {
            const typeClass = `log-${entry.type}`; // log-lore, log-system, log-note
            let icon = 'fa-pen';
            if (entry.meta && entry.meta.icon) {
                icon = entry.meta.icon;
            } else {
                icon = entry.type === 'lore' ? 'fa-book-open' :
                    entry.type === 'system' ? 'fa-terminal' : 'fa-pen';
            }

            const isNew = entry.isNew ? 'log-entry-new' : '';
            if (entry.isNew) delete entry.isNew;

            const html = `
                <div class="log-entry ${typeClass} ${isNew} animate__animated animate__fadeInUp animate__faster">
                    <div class="log-meta flex justify-between">
                        <span><i class="fa-solid ${icon} mr-1"></i> CICLO ${entry.cycle} // HORA ${entry.dayTime}</span>
                    </div>
                    <div class="log-content">${entry.text}</div>
                </div>
            `;
            container.append(html);
        });

        // Auto-scroll al final
        container.scrollTop(container[0].scrollHeight);
    }

    renderGeneratorRoom() {
        this.generatorManager.renderGeneratorRoom(State);
    }

    // Modal management delegators
    openModal(npc, allowPurge, onPurgeConfirm) {
        // Verificar si el NPC tiene bloqueo de purga (intruso reciente)
        const isPurgeLocked = npc.purgeLockedUntil && State.cycle < npc.purgeLockedUntil;

        this.modalManager.openModal(npc, allowPurge, onPurgeConfirm, State);

        if (isPurgeLocked && allowPurge) {
            const btn = $('#btn-modal-purge');
            btn.prop('disabled', true);
            btn.addClass('opacity-50 cursor-not-allowed grayscale');
            btn.html('<i class="fa-solid fa-lock mr-2"></i> PURGA BLOQUEADA (INTRUSO RECIENTE)');
            this.showModalError("Protocolo de seguridad: Los intrusos recientes deben ser procesados en el siguiente ciclo.");
        }
    }

    openRelocationModal(npcs, onConfirm) {
        const grid = $('#relocate-selection-grid');
        const countLabel = $('#relocate-count');
        const confirmBtn = $('#btn-relocate-confirm');
        const restrictionLabel = $('#relocate-restrictions-text');

        // Dinámico: Máximo de la mitad de la capacidad O menos del total de sujetos que llegan al día
        // Aseguramos que siempre haya espacio para los nuevos sujetos del siguiente nivel
        const halfCapacity = Math.floor(State.config.maxShelterCapacity / 2);
        const nextDaySpace = State.config.maxShelterCapacity - State.config.dayLength;
        const maxSelection = Math.min(halfCapacity, nextDaySpace);

        let selected = [];

        grid.empty();
        countLabel.text(`0 / ${maxSelection}`);
        confirmBtn.prop('disabled', false);

        // Actualizar el texto de restricciones dinámicamente
        restrictionLabel.text(`RESTRICCIONES: El transporte es limitado. Solo puedes llevar contigo a un máximo de ${maxSelection} sujetos. Los no seleccionados serán abandonados en el sector actual.`);

        npcs.forEach((npc, index) => {
            const isValidated = npc.dayAfter && npc.dayAfter.validated;
            const card = $('<div>', {
                class: 'bg-black/60 border border-chlorine/20 p-2 flex flex-col items-center gap-2 cursor-pointer hover:border-warning/50 transition-all group relative',
                html: `
                    <div class="relocate-avatar-container scale-75 origin-top"></div>
                    <span class="text-sm font-mono text-gray-400 group-hover:text-white truncate w-full text-center">${npc.name}</span>
                    <div class="selection-indicator absolute top-1 right-1 w-4 h-4 border border-warning/30 flex items-center justify-center">
                        <i class="fa-solid fa-check text-sm text-warning opacity-0"></i>
                    </div>
                `
            });

            const avatar = this.renderAvatar(npc, 'sm', isValidated ? 'perimeter' : 'normal');
            card.find('.relocate-avatar-container').append(avatar);

            card.on('click', () => {
                const idx = selected.indexOf(npc);
                if (idx > -1) {
                    selected.splice(idx, 1);
                    card.removeClass('border-warning selected-card bg-warning/10');
                    card.find('.fa-check').addClass('opacity-0');
                } else if (selected.length < maxSelection) {
                    selected.push(npc);
                    card.addClass('border-warning selected-card bg-warning/10');
                    card.find('.fa-check').removeClass('opacity-0');
                }

                countLabel.text(`${selected.length} / ${maxSelection}`);
            });

            grid.append(card);
        });

        $('#modal-relocate').removeClass('hidden').addClass('flex');

        // Desvincular eventos previos y vincular el nuevo
        confirmBtn.off('click').on('click', () => {
            onConfirm(selected);
        });

        $('#btn-relocate-cancel').off('click').on('click', () => {
            this.closeRelocationModal();
        });
    }

    closeRelocationModal() {
        $('#modal-relocate').addClass('hidden').removeClass('flex');
    }

    closeModal(silent = false) {
        this.modalManager.closeModal(silent);
    }

    showMessage(text, onClose, type = 'normal') {
        this.modalManager.showMessage(text, onClose, type);
    }

    showConfirm(text, onYes, onCancel, type) {
        this.modalManager.showConfirm(text, onYes, onCancel, type);
    }

    showModalError(text) {
        this.modalManager.showModalError(text);
    }

    clearModalError() {
        this.modalManager.clearModalError();
    }

    applyBlackout(ms = 1200) {
        const target = $('#screen-game').find('main.vhs-target');
        const overlay = $('<div>', { class: 'blackout', css: { position: 'fixed', inset: 0, background: '#000', opacity: 0.0, pointerEvents: 'none', zIndex: 9999 } });
        $('body').append(overlay);
        const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const step = (now) => {
            const t = Math.min(1, (now - start) / ms);
            overlay.css('opacity', t < 0.5 ? t * 0.8 : (1 - t) * 1.6);
            if (t < 1) requestAnimationFrame(step);
            else overlay.remove();
        };
        requestAnimationFrame(step);
    }

    setNavStatus(level) {
        if (!this.elements.sidebar) return;
        const el = this.elements.sidebar;
        el.removeClass('status-level-1 status-level-2 status-level-3 status-level-4 status-level-5');
        if (level) {
            el.addClass(`status-level-${level}`);
            el.attr('data-status', level);
        } else {
            el.removeAttr('data-status');
        }
    }

    setNavItemStatus(navId, level) {
        const btn = $(`#${navId}`);
        if (!btn.length) return;

        // Clear any global sidebar status to prefer per-item indicators
        if (this.elements.sidebar) {
            this.elements.sidebar.removeClass('status-level-1 status-level-2 status-level-3 status-level-4 status-level-5');
            this.elements.sidebar.removeAttr('data-status');
        }

        // Si es el botón de log, manejar la animación específica
        if (navId === 'btn-open-log') {
            if (level === 2) {
                btn.addClass('log-notify-active');
            } else {
                btn.removeClass('log-notify-active');
            }
        }

        btn.removeClass('status-level-1 status-level-2 status-level-3 status-level-4 status-level-5 status-level-save status-level-overload');
        if (level) {
            btn.addClass(`status-level-${level}`);
            btn.attr('data-status', level);
        } else {
            btn.removeAttr('data-status');
        }
        // Ensure icons take current color (clear any inline color)
        btn.find('i').css('color', '');
    }

    clearAllNavStatuses() {
        Object.values(CONSTANTS.NAV_ITEMS).forEach(id => this.setNavItemStatus(id, null));
    }

    setNavLocked(locked) {
        State.navLocked = locked;
        Object.values(CONSTANTS.NAV_ITEMS).forEach(id => {
            const $el = $(`#${id}`);
            if (locked) {
                // Durante el bloqueo en la noche (gestión de refugio), solo permitimos interactuar con el refugio
                if (id === CONSTANTS.NAV_ITEMS.SHELTER && State.isNight) {
                    $el.prop('disabled', false).removeClass('nav-locked').addClass('active');
                } else {
                    $el.prop('disabled', true).addClass('nav-locked').removeClass('active');
                }
            } else {
                $el.prop('disabled', false).removeClass('nav-locked active');
            }
        });

        if (this.elements.sidebar) {
            this.elements.sidebar.toggleClass('nav-locked', locked);
            if (locked) {
                this.elements.sidebar.addClass('border-gray-700').removeClass('border-chlorine/20');
            } else {
                this.elements.sidebar.removeClass('border-gray-700').addClass('border-chlorine/20');
            }
        }
    }

    updateRunStats(state) {
        this.statsManager.updateRunStats(state);
    }

    flashInfectionEffect(avatar) {
        this.infectionEffectActive = true;
        const head = avatar.find('.avatar-head');
        const eyes = avatar.find('.eye');
        const origHeadColor = head.css('background-color');
        const origEyeColor = eyes.css('background-color');
        avatar.css({ filter: 'hue-rotate(90deg) contrast(130%)' });
        head.css('background-color', State.colors.chlorine);
        eyes.css('background-color', State.colors.critical);
        if (this.audio) this.audio.playSFXByKey('morgue_reveal_infected', { volume: 0.5 });
        setTimeout(() => {
            head.css('background-color', origHeadColor);
            eyes.css('background-color', origEyeColor);
            avatar.css({ filter: 'none' });
            this.infectionEffectActive = false;
        }, 120);
    }

    animateToolThermometer(value, container = null, isInfected = null) {
        this.toolsRenderer.animateToolThermometer(value, container, isInfected);
    }

    animateToolPupils(type = 'normal', container = null, isInfected = false) {
        this.toolsRenderer.animateToolPupils(type, container, isInfected);
    }

    animateToolFlashlight(skinTexture, container = null, isInfected = null) {
        this.toolsRenderer.animateToolFlashlight(skinTexture, container, isInfected);
    }

    animateToolPulse(bpm, container = null, isInfected = null) {
        this.toolsRenderer.animateToolPulse(bpm, container, isInfected);
    }
}
