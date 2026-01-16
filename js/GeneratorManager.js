import { State } from './State.js';

export class GeneratorManager {
    constructor(uiManager, audioManager, game = null) {
        this.ui = uiManager;
        this.audio = audioManager;
        this.game = game;
        this.elements = uiManager.elements;
    }

    renderGeneratorRoom(state) {
        state.generatorCheckedThisTurn = true;

        // Update active state of mode buttons
        $('.btn-generator-control').removeClass('active');
        if (state.generator.isOn) {
            $(`#btn-gen-${state.generator.mode}`).addClass('active');
        }

        this.setupHeaderEvents(state);

        // Update warnings immediately
        if (this.elements.genWarningGame) this.elements.genWarningGame.addClass('hidden');
        if (this.elements.genWarningShelter) this.elements.genWarningShelter.addClass('hidden');

        // El panel de advertencia ahora tiene un estilo CRT
        const warningPanel = $('#generator-warning-panel');
        if (warningPanel.length) {
            warningPanel.toggleClass('hidden', state.generator.isOn);
        }

        // Update nav status based on state (Persistent Status)
        if (this.ui && typeof this.ui.updateGeneratorNavStatus === 'function') {
            this.ui.updateGeneratorNavStatus(state);
        }

        // Refresh game actions to restore normal buttons
        this.ui.updateGameActions();
        this.ui.updateInspectionTools();
        this.ui.updateStats(state.paranoia, state.sanity, state.cycle, state.dayTime, state.config.dayLength, state.currentNPC);
        const modeLabel = $('#generator-mode-label');
        const loadPercent = (state.generator.load / state.generator.capacity) * 100;

        modeLabel.text(`LOAD: ${Math.floor(loadPercent)}%`);

        this.updateDial(loadPercent, state.generator.isOn);
        this.updateCables(loadPercent, state.generator.isOn);
        this.updateScreenEffects(state);

        // --- NEW UI UPDATES (Header & Battery) ---
        const batLevel = Math.floor(Math.min(100, Math.max(0, state.generator.power || 0)));

        // Header Status
        $('#header-gen-status').text(state.generator.isOn ? 'ONLINE' : 'OFFLINE').toggleClass('text-alert', !state.generator.isOn);
        $('#header-bat-level').text(`${batLevel}%`);
        $('#header-load-level').text(`${Math.floor(loadPercent)}%`);

        // Visual Battery Fill (Animated via CSS transition + classes)
        const batteryFill = $('#gen-battery-visual-fill');
        batteryFill.css('height', `${batLevel}%`);
        $('#gen-battery-text').text(`${batLevel}%`);

        // Manage animation classes
        batteryFill.removeClass('charging low');
        if (state.generator.isOn) {
            batteryFill.addClass('charging');
        }

        if (batLevel < 20) {
            batteryFill.removeClass('bg-terminal-green bg-amber-500 charging').addClass('bg-red-600 low');
            $('#gen-battery-text').addClass('text-alert animate-pulse');
        } else if (batLevel < 50) {
            batteryFill.removeClass('bg-terminal-green bg-red-600 low').addClass('bg-amber-500');
            $('#gen-battery-text').removeClass('text-alert animate-pulse').addClass('text-amber-500');
        } else {
            batteryFill.removeClass('bg-red-600 bg-amber-500 low').addClass('bg-terminal-green');
            $('#gen-battery-text').removeClass('text-alert animate-pulse text-amber-500').addClass('text-terminal-green');
        }

        // Color mapping based on load
        let color = State.colors.terminalGreen;
        if (loadPercent > 90) color = State.colors.alert;
        else if (loadPercent > 70) color = State.colors.overload;
        modeLabel.css('color', color);
        modeLabel.css('text-shadow', state.generator.isOn ? `0 0 10px ${color}` : 'none');

        this.updateToggleButton(state);
        this.renderSystemsGrid(state);
        this.renderGuardPanel(state); // New Guard UI
        this.updateStatusSummary(state);
        this.updateModeButtons(state); // Ensure visual state is sync'd
        this.setupToggleEvent(state);
        this.setupModeButtons(state);

        // Sincronizar estado del cristal
        const glassCover = $('#gen-glass-cover');
        if (state.generator.isOn) {
            glassCover.addClass('broken');
        } else {
            glassCover.removeClass('broken cracked');
        }

        // Update cross-room indicators (Generator Watch in SALA & REFUGIO)
        const updateIndicator = (prefix, colorClass) => {
            const statusEl = $(`#${prefix}-gen-watch-status`);
            const guardEl = $(`#${prefix}-gen-watch-guard`);
            const guardNameEl = $(`#${prefix}-gen-watch-guard-name`);

            if (statusEl.length) {
                statusEl.text(state.generator.isOn ? 'ONLINE' : 'OFFLINE')
                    .toggleClass('text-alert', !state.generator.isOn)
                    .toggleClass(colorClass, state.generator.isOn);

                if (state.generator.isOn && state.generator.assignedGuardId) {
                    const guard = state.admittedNPCs.find(n => n.id === state.generator.assignedGuardId);
                    if (guard) {
                        guardEl.removeClass('hidden');
                        guardNameEl.text(guard.name);
                    } else {
                        guardEl.addClass('hidden');
                    }
                } else {
                    guardEl.addClass('hidden');
                }
            }
        };

        updateIndicator('gen-watch', 'text-terminal-green'); // SALA
        updateIndicator('shelter', 'text-shelter-blue');    // REFUGIO

        // Volver al puesto
        $('#btn-gen-back').off('click').on('click', () => {
            const game = this.game || window.game;
            if (game && game.events && typeof game.events.navigateToRoom === 'function') {
                game.events.navigateToRoom();
            }
        });
    }

    updateCables(power, isOn) {
        const cables = $('.cable');
        if (isOn && power > 20) {
            cables.addClass('vibrating-cable');
            // La velocidad de vibración podría depender de la potencia si quisiéramos ser pro
            cables.each((i, el) => {
                const rot = $(el).css('transform'); // Mantener su rotación original
                $(el).css('--rot', rot);
            });
        } else {
            cables.removeClass('vibrating-cable');
        }
    }

    updateDial(percent, isOn) {
        const needle = $('#generator-needle');
        if (!needle.length) return;

        // Load 0-100 mapped to -90 to 90 degrees
        const degrees = (percent * 1.8) - 90;

        if (isOn) {
            needle.css('transform', `rotate(${degrees}deg)`);
            needle.css('--deg', `${degrees}deg`);
            needle.css('stroke', percent > 90 ? State.colors.alert : State.colors.terminalGreen);

            // Temblor en carga alta (>90)
            if (percent > 90) {
                needle.addClass('needle-vibration');
            } else {
                needle.removeClass('needle-vibration');
            }
        } else {
            needle.css('transform', `rotate(-90deg)`);
            needle.css('--deg', `-90deg`);
            needle.css('stroke', '#333');
            needle.removeClass('needle-vibration');
        }
    }

    updateScreenEffects(state) {
        const monitor = $('.crt-monitor');
        const lowStability = state.generator.isOn && state.generator.stability < 50;

        if (lowStability) {
            monitor.addClass('system-flicker');
            if (state.generator.stability < 20 && Math.random() < 0.3) {
                this.ui.triggerGlitch(); // Efecto de salto de píxel/glitch térmico
            }
        } else {
            monitor.removeClass('system-flicker');
        }

        // Carga extrema (>95%) causa vibración física del monitor
        const loadPercent = (state.generator.load / state.generator.capacity) * 100;
        if (loadPercent > 95) {
            monitor.addClass('overload-vibration');
        } else {
            monitor.removeClass('overload-vibration');
        }
    }

    setupToggleEvent(state) {
        const toggleBtn = $('#btn-gen-toggle');
        toggleBtn.off('click').on('click', () => {
            const isLocked = state.generator.blackoutUntil > Date.now();
            if (isLocked) {
                if (this.audio) this.audio.playSFXByKey('ui_error', { volume: 0.5 });
                return;
            }

            const glassCover = $('#gen-glass-cover');
            const mushroomHead = $('#gen-mushroom-head');

            if (!state.generator.isOn && !glassCover.hasClass('broken')) {
                // Si está apagado y el cristal no está roto, primero romper cristal
                if (!glassCover.hasClass('cracked')) {
                    glassCover.addClass('cracked');
                    if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.5 }); // Sonido de cristal?
                    return;
                } else {
                    glassCover.addClass('broken');
                    if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.8 });
                    // No return, proceed to turn on
                }
            }

            // Delegar al controlador del juego
            const game = this.game || window.game;
            if (game && game.mechanics && typeof game.mechanics.toggleGenerator === 'function') {
                game.mechanics.toggleGenerator();

                // Audio mecánico
                if (this.audio) {
                    this.audio.playSFXByKey(state.generator.isOn ? 'ui_button_click' : 'glitch_low', { volume: 0.6 });
                }
            }
        });
    }

    updateModeButtons(state) {
        const btnSave = $('#btn-gen-save');
        const btnNormal = $('#btn-gen-normal');
        const btnOver = $('#btn-gen-over');

        const npc = state.currentNPC;
        const actionTaken = (npc && (npc.scanCount > 0 || npc.dialogueStarted)) || state.generator.restartLock;
        const currentMax = state.generator.maxModeCapacityReached;

        const updateBtn = (btn, targetCap, isCooldown = false) => {
            const isBlocked = (actionTaken && targetCap > currentMax) || isCooldown || !state.generator.isOn;

            // Remove previous lock overlays
            const overlays = btn.find('.mode-lock-overlay');
            if (overlays && typeof overlays.remove === 'function') {
                overlays.remove();
            }

            if (isBlocked) {
                btn.prop('disabled', false).addClass('opacity-50 cursor-not-allowed'); // Keep clickable but visually locked

                // Add lock icon overlay
                if (actionTaken && targetCap > currentMax) {
                    btn.append(`<div class="mode-lock-overlay absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <i class="fa-solid fa-lock text-xs text-alert/70"></i>
                    </div>`);
                }
            } else {
                btn.prop('disabled', false).removeClass('opacity-50 cursor-not-allowed');
            }
        };

        updateBtn(btnSave, 1);
        updateBtn(btnNormal, 2);
        updateBtn(btnOver, 3, state.generator.overclockCooldown);

        // Update Active State
        btnSave.toggleClass('active', state.generator.mode === 'save');
        btnNormal.toggleClass('active', state.generator.mode === 'normal');
        btnOver.toggleClass('active', state.generator.mode === 'overload');
    }

    setupModeButtons(state) {
        const btnSave = $('#btn-gen-save');
        const btnNormal = $('#btn-gen-normal');
        const btnOver = $('#btn-gen-over');

        const handleModeSwitch = (newMode) => {
            const game = this.game || window.game;
            const npc = state.currentNPC;
            const actionTaken = (npc && (npc.scanCount > 0 || npc.dialogueStarted)) || state.generator.restartLock;
            const currentMax = state.generator.maxModeCapacityReached;
            const capMap = { 'save': 1, 'normal': 2, 'overload': 3 };
            const targetCap = capMap[newMode] || 2;

            // Check if mode is locked
            if (actionTaken && targetCap > currentMax) {
                // Locked - show feedback
                if (this.audio) this.audio.playSFXByKey('ui_error', { volume: 0.5 });
                if (this.ui) this.ui.showFeedback("PROTOCOLO BLOQUEADO: SOLO PUEDE DISMINUIR", "red", 3000);
                return;
            }

            // IMMEDIATE visual feedback - toggle active class right away
            $('.btn-generator-control').removeClass('active');
            const modeMap = { 'save': 'btn-gen-save', 'normal': 'btn-gen-normal', 'overload': 'btn-gen-over' };
            $(`#${modeMap[newMode]}`).addClass('active');

            // Audio click effect
            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.3 });

            if (game && game.mechanics && typeof game.mechanics.setGeneratorProtocol === 'function') {
                const success = game.mechanics.setGeneratorProtocol(newMode);

                if (success) {
                    // Full UI Refresh (will also sync true state)
                    this.renderGeneratorRoom(State);

                    // Trigger level change animation
                    const monitor = $('.crt-monitor');
                    monitor.removeClass('glitch-level-change');
                    if (this._glitchTimeout) clearTimeout(this._glitchTimeout);

                    requestAnimationFrame(() => {
                        monitor.each((i, el) => void el.offsetWidth);
                        monitor.addClass('glitch-level-change');
                        this._glitchTimeout = setTimeout(() => {
                            monitor.removeClass('glitch-level-change');
                            this._glitchTimeout = null;
                        }, 400);
                    });
                }
                return success;
            }
            return false;
        };

        btnSave.off('click').on('click', () => handleModeSwitch('save'));
        btnNormal.off('click').on('click', () => handleModeSwitch('normal'));
        btnOver.off('click').on('click', () => {
            if (state.generator.overclockCooldown) return;
            if (handleModeSwitch('overload')) { // Removed explicit '3' passing as it wasn't used in handleModeSwitch signature above
                if (this.audio) this.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
                if (Math.random() < 0.35) {
                    state.generator.blackoutUntil = Date.now() + 1500;
                    this.ui.applyBlackout(1500);
                }
            }
        });

        // Initial update
        this.updateModeButtons(state);

        $('#btn-gen-manual-toggle').off('click').on('click', () => {
            $('#generator-manual').toggleClass('hidden');
            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.2 });
        });

        // Botón de Carga de Emergencia
        $('#btn-gen-emergency-charge').off('click').on('click', () => {
            if (this.game && this.game.mechanics && this.game.mechanics.manualEmergencyCharge) {
                this.game.mechanics.manualEmergencyCharge();
            }
        });
    }

    updateToggleButton(state) {
        const isLocked = state.generator.blackoutUntil > Date.now();
        const mushroomHead = $('#gen-mushroom-head');
        const wrapper = $('#btn-gen-toggle-wrapper');
        const toggleBtn = $('#btn-gen-toggle');

        if (isLocked) {
            wrapper.addClass('opacity-50 grayscale cursor-wait');
            setTimeout(() => this.renderGeneratorRoom(state), state.generator.blackoutUntil - Date.now() + 100);
        } else {
            wrapper.removeClass('opacity-50 grayscale cursor-wait');
        }

        if (state.generator.isOn) {
            mushroomHead.addClass('pressed');
            toggleBtn.addClass('btn-on').removeClass('btn-off').css('color', '#000');
        } else {
            mushroomHead.removeClass('pressed');
            toggleBtn.addClass('btn-off').removeClass('btn-on').css('color', '#000');
        }
    }

    setupHeaderEvents(state) {
        $('#btn-header-status').off('click').on('click', () => {
            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.3 });
            // Refresh/Navigate to Room View (Self)
            const game = this.game || window.game;
            if (game && game.events && typeof game.events.navigateToRoom === 'function') {
                game.events.navigateToRoom();
            }
        });

        $('#btn-header-battery').off('click').on('click', () => {
            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.3 });
            // Could trigger a toast or highlight battery
            this.ui.showFeedback(`CAPACIDAD DE BATERÍA: ${state.generator.power}%`, state.generator.power < 20 ? 'red' : 'green');
            $('#gen-battery-visual-fill').parent().addClass('animate-pulse');
            setTimeout(() => $('#gen-battery-visual-fill').parent().removeClass('animate-pulse'), 500);
        });

        $('#btn-header-load').off('click').on('click', () => {
            if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.3 });
            const loadStr = state.generator.load + '/' + state.generator.capacity;
            this.ui.showFeedback(`CARGA TOTAL DEL SISTEMA: ${loadStr} UNIDADES`, 'blue');
        });
    }

    updateStatusSummary(state) {
        const statusSummary = $('#generator-status-summary'); // Note: This is now the container for the grid
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // We use a separate element for the technical log if it still exists elsewhere
        // But for now, let's focus on the systems grid which replaced it in index.html
    }

    renderSystemsGrid(state) {
        const grid = $('#generator-systems-grid');
        if (!grid.length) return;

        grid.empty();

        if (!state.generator.isOn) {
            grid.append('<div class="text-alert font-mono text-center py-4 border border-alert/20 bg-alert/5 animate-pulse">CRITICAL: POWER_GRID_OFFLINE</div>');
            return;
        }

        if (state.generator.systems) {
            Object.entries(state.generator.systems).forEach(([id, sys]) => {
                const card = $(`
                    <div class="system-toggle-card ${sys.active ? 'active' : ''}" data-system-id="${id}">
                        <div class="flex items-center gap-3">
                            <div class="system-status-led ${sys.active ? 'on' : ''}"></div>
                            <div class="flex flex-col">
                                <span class="text-xs font-bold uppercase tracking-wider">${sys.label}</span>
                                <span class="text-[10px] opacity-40 font-mono">Consumo: ${sys.load}u</span>
                            </div>
                        </div>
                        <button class="horror-btn py-1 px-3 text-[10px] ${sys.active ? 'border-alert/50 text-alert' : 'border-chlorine/50 text-chlorine-light'}">
                            ${sys.active ? 'APAGAR' : 'ENCENDER'}
                        </button>
                    </div>
                `);

                card.find('button').on('click', () => {
                    sys.active = !sys.active;
                    if (this.audio) this.audio.playSFXByKey('ui_button_click', { volume: 0.4 });

                    // Recalcular carga inmediatamente
                    const game = this.game || window.game;

                    // Si se apaga la seguridad, desactivar ítems en la Sala
                    if (id === 'security' && !sys.active && game && game.mechanics && typeof game.mechanics.shutdownSecuritySystem === 'function') {
                        game.mechanics.shutdownSecuritySystem();
                        this.ui.showFeedback("SISTEMA DE SEGURIDAD DESACTIVADO", "red", 3000);
                    }

                    if (game && game.mechanics && typeof game.mechanics.calculateTotalLoad === 'function') {
                        game.mechanics.calculateTotalLoad();
                    }

                    this.renderGeneratorRoom(state);
                    this.ui.updateEnergyHUD();
                });

                grid.append(card);
            });
        }

        // Sistema especial: Analizador de Hemoglobina (solo visual si está activo)
        const isLabActive = state.generator && state.generator.systems && state.generator.systems.shelterLab.active;

        if (!isLabActive) {
            // Mostrar estado bloqueado si el laboratorio está apagado
            grid.append(`
                <div class="system-toggle-card opacity-40 border-red-500/20 bg-red-500/5">
                    <div class="flex items-center gap-3">
                        <div class="system-status-led !bg-red-900 shadow-none"></div>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold text-red-300 uppercase">Analizador Bloqueado</span>
                            <span class="text-[10px] text-red-500/60 font-mono">REQ. LABORATORIO ACTIVO</span>
                        </div>
                    </div>
                </div>
            `);
        } else if (state.generator.bloodTestCountdown > 0) {
            grid.append(`
                <div class="system-toggle-card active border-blue-500/50 bg-blue-500/5">
                    <div class="flex items-center gap-3">
                        <div class="system-status-led on !bg-blue-400"></div>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold text-blue-300 uppercase">Centrifugado Bio</span>
                            <span class="text-[10px] text-blue-400/60 font-mono">EN PROCESO: ${state.generator.bloodTestCountdown} ciclos</span>
                        </div>
                    </div>
                    <div class="text-[10px] text-blue-400 font-mono animate-pulse">CARGA MÁXIMA</div>
                </div>
            `);
        }
    }


    // NEW GUARD ASSIGNMENT LOGIC - Simplified and Clean
    renderGuardPanel(state) {
        const container = $('#generator-guard-panel');
        if (!container.length) {
            console.warn('[GuardPanel] Container #generator-guard-panel not found in DOM');
            return;
        }

        container.empty();

        // DEBUGGING: Check state
        console.log('[GuardPanel] Rendering with state:', {
            assignedGuardId: state?.generator?.assignedGuardId,
            globalStateId: State?.generator?.assignedGuardId,
            admittedNPCs: state?.admittedNPCs?.length
        });

        // Use the global State for consistency
        const guardId = State.generator.assignedGuardId;
        const guard = guardId ? State.admittedNPCs.find(n => n.id === guardId) : null;

        console.log('[GuardPanel] Guard lookup result:', { guardId, guardFound: !!guard, guardName: guard?.name });

        if (guard) {
            // GUARD ASSIGNED - Show active guard card
            const avatarEl = this.ui.renderAvatar(guard, 'sm');
            const avatarHtml = avatarEl && avatarEl.prop ? avatarEl.prop('outerHTML') : '<div class="text-xs">?</div>';

            const html = `
                <div class="guard-card active w-full animate__animated animate__fadeIn p-3 border border-terminal-green/20 bg-terminal-green/5 rounded">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 bg-black border border-terminal-green/30 overflow-hidden relative rounded">
                                ${avatarHtml}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm font-bold text-terminal-green">${guard.name}</span>
                                <span class="text-[9px] text-green-400 font-mono uppercase tracking-widest">● VIGILANCIA ACTIVA</span>
                            </div>
                        </div>
                        <button class="btn-reassign-guard text-[10px] opacity-60 hover:opacity-100 hover:text-terminal-green transition-all px-2 py-1 border border-transparent hover:border-terminal-green/30 rounded bg-black/30">
                            <i class="fa-solid fa-rotate mr-1"></i>CAMBIAR
                        </button>
                    </div>
                    <div class="mt-2 pt-2 border-t border-terminal-green/10">
                        <div class="text-[8px] font-mono text-gray-500 uppercase mb-1">Último registro</div>
                        <div class="text-[9px] font-mono text-terminal-green/70">CICLO ${state.cycle}: Vigilancia en curso</div>
                    </div>
                </div>
            `;

            container.html(html);

            // Attach event
            container.find('.btn-reassign-guard').one('click', () => {
                this.showGuardSelectionModal(state);
            });

        } else {
            // NO GUARD - Show vacant state
            const html = `
                <div class="guard-card empty w-full flex items-center justify-between p-3 border border-dashed border-white/20 hover:border-terminal-green/40 transition-all bg-white/5 group rounded cursor-pointer">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 flex items-center justify-center bg-black/60 rounded border border-white/10 group-hover:border-terminal-green/30">
                            <i class="fa-solid fa-user-shield text-lg opacity-30 group-hover:text-terminal-green group-hover:opacity-60 transition-all"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold opacity-70 group-hover:text-terminal-green transition-colors">PUESTO VACANTE</span>
                            <span class="text-[9px] opacity-40 font-mono uppercase">Click para asignar</span>
                        </div>
                    </div>
                    <button class="btn-assign-guard horror-btn-sm bg-terminal-green/10 hover:bg-terminal-green/20 border border-terminal-green/30 text-terminal-green text-[10px] py-1.5 px-3 uppercase">
                        <i class="fa-solid fa-plus mr-1"></i>Asignar
                    </button>
                </div>
            `;

            container.html(html);

            // Both card and button trigger assignment
            container.find('.guard-card, .btn-assign-guard').one('click', () => {
                this.showGuardSelectionModal(state);
            });
        }
    }

    showGuardSelectionModal(state) {
        // Filter eligible NPCs: must have been admitted BEFORE this cycle
        const currentCycle = state.cycle || 1;
        console.log('[GuardModal] Current cycle:', currentCycle, 'Admitted NPCs:', state.admittedNPCs?.length);

        const candidates = (state.admittedNPCs || []).filter(npc => {
            const admittedCycle = npc.admittedCycle || npc.cycle || 0;
            const eligible = admittedCycle < currentCycle;
            console.log(`[GuardModal] NPC ${npc.name}: admittedCycle=${admittedCycle}, eligible=${eligible}`);
            return eligible; // Exclude NPCs from current cycle
        });

        console.log('[GuardModal] Eligible candidates:', candidates.length);

        if (candidates.length === 0) {
            if (this.audio) this.audio.playSFXByKey('ui_error', { volume: 0.5 });
            if (this.ui && this.ui.showFeedback) {
                this.ui.showFeedback("NO HAY PERSONAL DISPONIBLE (Los NPCs deben esperar un turno)", "orange", 3000);
            }
            return;
        }

        // Store reference to this
        const self = this;

        // Remove any existing guard modal
        $('#guard-selection-modal').remove();

        // Build modal HTML candidates
        let candidatesHtml = '';
        candidates.forEach(npc => {
            console.log('[GuardModal] Building HTML for NPC:', npc.name, 'ID:', npc.id); // DEBUG
            const avatarEl = this.ui.renderAvatar ? this.ui.renderAvatar(npc, 'md') : null;
            const avatarHtml = avatarEl && avatarEl.prop ? avatarEl.prop('outerHTML') : '<div class="text-xs text-gray-500">?</div>';
            const isCurrentGuard = npc.id === State.generator.assignedGuardId;

            candidatesHtml += `
                <div class="guard-candidate-item cursor-pointer w-full flex items-center gap-3 p-3 ${isCurrentGuard ? 'bg-terminal-green/10 border-terminal-green/40' : 'bg-white/5 border-white/10'} border hover:bg-terminal-green/20 hover:border-terminal-green/50 transition-all rounded mb-2" data-npcid="${npc.id}">
                    <div class="w-10 h-10 border border-white/10 bg-black rounded overflow-hidden flex-shrink-0">
                        ${avatarHtml}
                    </div>
                    <div class="flex flex-col flex-1 min-w-0">
                        <span class="text-sm font-bold text-white truncate">${npc.name}</span>
                        <span class="text-[10px] opacity-50 font-mono">${npc.uniqueType === 'lore' ? 'Sujeto Especial' : 'Civil Admitido'}</span>
                    </div>
                    ${isCurrentGuard ? '<span class="text-[9px] text-terminal-green font-mono uppercase flex-shrink-0">● Actual</span>' : '<i class="fa-solid fa-chevron-right text-xs text-gray-500"></i>'}
                </div>
            `;
        });

        // Create modal overlay directly in DOM
        const modalHtml = `
            <div id="guard-selection-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                <div class="horror-panel-modal w-full max-w-sm p-0 overflow-hidden border border-terminal-green/30 bg-[#0a0a0a] rounded animate__animated animate__fadeIn animate__faster">
                    <div class="p-3 border-b border-terminal-green/20 flex justify-between items-center bg-terminal-green/5">
                        <h3 class="text-sm font-bold uppercase tracking-widest text-terminal-green">
                            <i class="fa-solid fa-user-shield mr-2"></i>Asignar Guardia
                        </h3>
                        <button id="guard-modal-close" class="text-gray-400 hover:text-white transition-colors">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                    <div class="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        ${candidatesHtml}
                    </div>
                </div>
            </div>
        `;

        // Append to body
        $('body').append(modalHtml);
        console.log('[GuardModal] Custom modal created and appended to body');

        // Bind close button
        $('#guard-modal-close').on('click', function () {
            console.log('[GuardModal] Close button clicked');
            $('#guard-selection-modal').fadeOut(150, function () {
                $(this).remove();
            });
        });

        // Bind overlay click to close
        $('#guard-selection-modal').on('click', function (e) {
            if (e.target === this) {
                console.log('[GuardModal] Overlay clicked, closing');
                $(this).fadeOut(150, function () {
                    $(this).remove();
                });
            }
        });

        // Bind candidate clicks
        $('.guard-candidate-item').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Use attr() for reliable attribute access (data() has issues with hyphenated names)
            const selectedId = $(this).attr('data-npcid');
            console.log('[GuardModal] CANDIDATE CLICKED! NPC ID:', selectedId, 'typeof:', typeof selectedId);

            // ASSIGN GUARD - USE GLOBAL STATE FOR PERSISTENCE
            State.generator.assignedGuardId = selectedId;
            console.log('[GuardModal] ASSIGNED! State.generator.assignedGuardId =', State.generator.assignedGuardId);

            const selectedNPC = State.admittedNPCs.find(n => n.id === selectedId);

            // UNIFY WITH SECTOR ASSIGNMENTS
            const game = self.game || window.game;
            if (game && game.mechanics && typeof game.mechanics.assignNPCToSector === 'function' && selectedNPC) {
                game.mechanics.assignNPCToSector(selectedNPC, 'generator');
                console.log('[GuardModal] Unified with SectorAssignments: generator');
            }

            // Play sound and show feedback
            if (self.audio) self.audio.playSFXByKey('ui_success', { volume: 0.5 });
            if (self.ui && self.ui.showFeedback) {
                self.ui.showFeedback(`✓ GUARDIA ASIGNADO: ${selectedNPC ? selectedNPC.name : 'NPC'}`, "green", 2000);
            }

            // Close modal
            $('#guard-selection-modal').fadeOut(150, function () {
                $(this).remove();
            });

            // Re-render guard panel with fresh State
            setTimeout(() => {
                self.renderGuardPanel(State);
            }, 200);
        });

        console.log('[GuardModal] All event handlers bound successfully');
    }
}

