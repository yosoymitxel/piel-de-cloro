import { State } from '../State.js';

/**
 * SectorRenderer handles rendering the grids for different game sectors (Shelter, Morgue, Security).
 */
export class SectorRenderer {
    constructor(ui) {
        this.ui = ui;
        this.elements = ui.elements;
    }

    renderShelterGrid(npcs, max, onPurgeClick, onDetailClick) {
        this.elements.shelterCount.text(`${npcs.length}/${max}`);
        this.elements.shelterGrid.empty();

        // Clear nav status on view
        this.ui.setNavItemStatus('nav-shelter', null);

        const batch = [];
        npcs.forEach(npc => {
            const isValidated = npc.dayAfter?.validated;
            const isPurgeLocked = npc.purgeLockedUntil && State.cycle < npc.purgeLockedUntil;
            const canTest = !isValidated && !isPurgeLocked && (npc.dayAfter?.usedNightTests < 1);
            
            let borderClass = 'border-[#333]';
            let bgClass = 'bg-[#080808]';
            let statusIcon = '';

            if (isValidated) {
                if (npc.isInfected) {
                    borderClass = 'border-alert bg-alert/10';
                    statusIcon = '<i class="fa-solid fa-biohazard text-alert text-xs absolute top-1 right-1"></i>';
                } else {
                    borderClass = 'border-green-500/50 bg-green-500/10';
                    statusIcon = '<i class="fa-solid fa-shield-check text-green-500 text-xs absolute top-1 right-1"></i>';
                }
            } else if (isPurgeLocked) {
                borderClass = 'border-gray-600 border-dashed';
                statusIcon = '<i class="fa-solid fa-lock text-gray-500 text-xs absolute top-1 right-1"></i>';
            } else if (canTest) {
                borderClass = 'border-save';
                bgClass = 'bg-save/5';
            }

            const card = $('<div>', {
                class: `${bgClass} border ${borderClass} p-2 flex flex-col items-center cursor-pointer hover:border-chlorine-light hover:bg-[#111] transition-all relative`
            });

            const avatar = this.ui.renderAvatar(npc, 'sm', isValidated ? 'perimeter' : 'normal');
            const name = $('<span>', { text: npc.name, class: 'mt-2 text-xs' });

            if (statusIcon) card.append($(statusIcon));
            card.append(avatar, name);
            card.on('click', () => onDetailClick(npc, true));

            batch.push(card[0]);
        });
        if (batch.length) this.elements.shelterGrid.append(batch);
    }

    renderMorgueGrid(purged, escaped, night, onDetailClick) {
        this.ui.setNavItemStatus('nav-morgue', null);

        const renderList = (list, container, type) => {
            container.empty();
            if (!list || list.length === 0) {
                container.append($('<div>', { class: 'text-xs text-gray-600 italic p-2', text: 'Sin registros.' }));
                return;
            }

            const batch = [];
            list.forEach(npc => {
                let borderClass = 'border-chlorine/20';
                let hoverClass = 'hover:border-chlorine hover:bg-chlorine/5';

                if (type === 'purged') {
                    borderClass = 'border-alert/30';
                    hoverClass = 'hover:border-alert hover:bg-alert/10';
                } else if (type === 'escaped') {
                    borderClass = 'border-yellow-500/30';
                    hoverClass = 'hover:border-yellow-500 hover:bg-yellow-500/10';
                } else if (type === 'night') {
                    borderClass = 'border-blue-500/30';
                    hoverClass = 'hover:border-blue-500 hover:bg-blue-500/10';
                }

                let isRevealedInfected = false;
                if (type === 'purged') {
                    isRevealedInfected = npc.death?.revealed && npc.isInfected;
                } else {
                    const isIgnoredRevealed = npc.exitCycle && npc.exitCycle < State.cycle;
                    const isNightRevealed = npc.left?.cycle <= State.cycle;
                    if ((isIgnoredRevealed || isNightRevealed) && npc.isInfected) {
                        isRevealedInfected = true;
                    }
                }

                const statusColorClass = isRevealedInfected ? 'border-alert shadow-[0_0_10px_rgba(255,0,0,0.2)]' : borderClass;
                const card = $('<div>', {
                    class: `self-start relative p-2 border bg-black/40 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 group ${statusColorClass} ${hoverClass}`
                });

                const avatar = this.ui.renderAvatar(npc, 'sm', 'perimeter');
                if (isRevealedInfected) {
                    avatar.addClass('infected');
                    card.append($('<div>', {
                        class: 'absolute top-1 right-1 text-alert text-xs animate-pulse',
                        html: '<i class="fa-solid fa-biohazard"></i>'
                    }));
                }

                const name = $('<span>', { text: npc.name, class: 'text-xs font-mono text-gray-400 group-hover:text-white truncate w-full text-center' });
                card.append(avatar, name);
                card.on('click', () => onDetailClick(npc));
                batch.push(card[0]);
            });
            container.append(batch);
        };

        renderList(purged, this.elements.morgueGridPurged, 'purged');
        renderList(escaped, this.elements.morgueGridEscaped, 'escaped');
        renderList(night, this.elements.morgueGridNight, 'night');
    }

    renderSecurityRoom(items, onToggle) {
        this.elements.securityGrid.empty();
        this.elements.securityCount.text(items.length);

        const hasPower = State.generator?.isOn;
        this.elements.roomPowerWarning?.toggleClass('hidden', hasPower);

        const batch = [];
        items.forEach((it, idx) => {
            const icon = this._getSecurityIcon(it.type);
            const activeOrSecured = it.type === 'alarma' ? it.active : it.secured;
            const borderColor = activeOrSecured ? '#00FF00' : '#ff2b2b';
            const stateClass = activeOrSecured ? 'secured' : 'unsecured';
            
            const card = $('<div>', {
                class: `security-item bg-[#080808] p-3 flex flex-col gap-2 items-center hover:bg-[#111] transition-all h-full ${stateClass}`,
                css: { border: `1px solid ${borderColor}` }
            });

            if (!hasPower) {
                card.addClass('opacity-50 grayscale').css({ border: '1px solid #333' });
            }

            card.append($('<i>', { class: `fa-solid ${icon} text-3xl`, css: { color: borderColor } }));
            const label = it.type === 'alarma' ? 'ALARMA' : (it.type === 'tuberias' ? 'TUBERÍAS' : it.type.toUpperCase());
            card.append($('<span>', { text: label, class: 'text-xs font-mono' }));

            const btnText = this._getSecurityBtnText(it, activeOrSecured, hasPower);
            const btnClass = `horror-btn horror-btn-security ${activeOrSecured ? 'secured' : 'unsecured'}`;
            const btn = $('<button>', { class: btnClass, text: btnText, disabled: !hasPower });

            if (!hasPower) btn.addClass('opacity-20 cursor-not-allowed');

            btn.on('click', () => {
                if (!hasPower) return;
                this._handleSecurityToggle(it);
                if (onToggle) onToggle(idx, it);
                this.renderSecurityRoom(items, onToggle);
            });
            
            card.append(btn);
            batch.push(card[0]);
        });
        
        if (batch.length) this.elements.securityGrid.append(batch);
        this.updateSecurityNavStatus(items);
    }

    updateDayAfterSummary(npcs, state) {
        const testsLeft = state.dayAfter.testsAvailable;
        this.elements.dayafterTestsLeft.text(testsLeft);
        const validatedCount = npcs.filter(n => n.dayAfter?.validated).length;
        const pendingCount = npcs.length - validatedCount;
        this.elements.dayafterValidatedCount.text(validatedCount);
        this.elements.dayafterPendingCount.text(pendingCount);

        // La revisión solo es "obligatoria" si no hay energía o está apagado
        const generatorOk = state.generator && state.generator.isOn && (state.generator.power > 10);
        const needsCheck = !generatorOk;

        if (this.elements.genWarningShelter) this.elements.genWarningShelter.toggleClass('hidden', !needsCheck);

        // Update nav indicator for generator
        if (needsCheck) this.ui.setNavItemStatus('nav-generator', 3);
        else this.ui.setNavItemStatus('nav-generator', null);

        // Si necesita revisión, podemos añadir un botón temporal en el panel de tests
        const testsPanel = this.elements.dayafterPanel;
        if (needsCheck) {
            if ($('#btn-shelter-goto-gen').length === 0) {
                const btn = $('<button>', {
                    id: 'btn-shelter-goto-gen',
                    class: 'horror-btn horror-btn-alert px-3 py-2 text-xs flex items-center justify-center gap-2 animate-pulse mt-2 w-full',
                    html: '<i class="fa-solid fa-bolt"></i> IR AL GENERADOR'
                }).on('click', () => {
                    if (window.game) window.game.openGenerator();
                });
                testsPanel.append(btn);
            }
        } else {
            $('#btn-shelter-goto-gen').remove();
        }
    }

    _getSecurityIcon(type) {
        const icons = {
            alarma: 'fa-bell',
            puerta: 'fa-door-closed',
            ventana: 'fa-window-maximize',
            tuberias: 'fa-water'
        };
        return icons[type] || 'fa-question';
    }

    _getSecurityBtnText(it, activeOrSecured, hasPower) {
        if (!hasPower) return 'SIN ENERGÍA';
        if (it.type === 'alarma') return activeOrSecured ? 'ACTIVADA' : 'ACTIVAR';
        return activeOrSecured ? 'ASEGURADO' : 'ASEGURAR';
    }

    _handleSecurityToggle(it) {
        if (it.type === 'alarma') {
            it.active = !it.active;
            if (it.active) this.ui.audio?.playSFXByKey('alarm_activate', { volume: 0.6, priority: 1 });
        } else {
            it.secured = !it.secured;
            if (this.ui.audio && it.secured) {
                const sfx = { puerta: 'door_secure', ventana: 'window_secure', tuberias: 'pipes_whisper' };
                if (sfx[it.type]) this.ui.audio.playSFXByKey(sfx[it.type], { volume: 0.6, priority: 1 });
            } else if (this.ui.audio) {
                const sfx = { puerta: 'door_unsecure', ventana: 'window_unsecure' };
                if (sfx[it.type]) this.ui.audio.playSFXByKey(sfx[it.type], { volume: 0.6, priority: 1 });
            }
        }
    }

    updateSecurityNavStatus(items) {
        if (!items || items.length === 0) {
            this.ui.setNavItemStatus('nav-room', null);
            return;
        }
        const unsecuredCount = items.filter(it => it.type === 'alarma' ? !it.active : !it.secured).length;
        if (unsecuredCount === items.length) this.ui.setNavItemStatus('nav-room', 4);
        else if (unsecuredCount > 0) this.ui.setNavItemStatus('nav-room', 3);
        else this.ui.setNavItemStatus('nav-room', null);
    }

    updateRoomStatus(state) {
        const hasPower = state.generator.isOn && state.generator.power > 0;
        this.elements.roomPowerWarning.toggleClass('hidden', hasPower);
    }
}
