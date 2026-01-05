import { State } from './State.js';
export class UIManager {
    constructor(audio = null) {
        this.screens = {
            start: $('#screen-start'),
            game: $('#screen-game'),
            shelter: $('#screen-shelter'),
            morgue: $('#screen-morgue'),
            settings: $('#screen-settings'),
            night: $('#screen-night'),
            lore: $('#screen-lore'),
            room: $('#screen-room')
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
            morgueGrid: $('#morgue-grid'),
            securityGrid: $('#security-grid'),
            securityCount: $('#security-count'),
            shelterCount: $('#shelter-count'),
            sidebar: $('#sidebar-left'),
            settingsBtn: $('#btn-settings-toggle'),
            dayafterPanel: $('#dayafter-panel'),
            dayafterList: $('#dayafter-list'),
            dayafterTestsLeft: $('#dayafter-tests-left'),
            dayafterGroupLimit: $('#dayafter-group-limit'),
            dayafterValidatedCount: $('#dayafter-validated-count'),
            
            // Modal NPC
            modal: $('#modal-npc'),
            modalName: $('#modal-npc-name'),
            modalStatus: $('#modal-npc-status'),
            modalStats: $('#modal-npc-stats-content'),
            modalLog: $('#modal-npc-log'),
            modalPurgeBtn: $('#btn-modal-purge'),
            modalError: $('#modal-error'),
            
            // Shelter finalize button
            finalizeNoPurgeBtn: $('#btn-finalize-day-no-purge'),

            // Message Modal
            msgModal: $('#modal-message'),
            msgContent: $('#modal-message-content'),
            msgBtn: $('#btn-message-ok'),

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
        this.audio = audio;
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(s => s.addClass('hidden'));
        if (this.screens[screenName]) {
            this.screens[screenName].removeClass('hidden');
        }

        // Logic 1: Settings button only on start screen
        if (screenName === 'start') {
            this.elements.settingsBtn.removeClass('hidden');
        } else {
            this.elements.settingsBtn.addClass('hidden');
        }

        // Logic 2: Sidebar only on Game, Shelter, Morgue, Room (unless day end overlay is active)
        if (['game', 'shelter', 'morgue', 'room'].includes(screenName)) {
            this.elements.sidebar.removeClass('hidden');
        } else {
            this.elements.sidebar.addClass('hidden');
        }

        // Toggle finalize button visibility in Shelter
        if (screenName === 'shelter') {
            const shouldShow = State.isDayOver() && !State.isNight;
            this.elements.finalizeNoPurgeBtn.toggleClass('hidden', !shouldShow);
        } else {
            this.elements.finalizeNoPurgeBtn.addClass('hidden');
        }

        // Clear global feedback on screen change
        this.hideFeedback();
        // Update active state in sidebar
        $('.group').removeClass('active text-black bg-chlorine opacity-100').addClass('text-chlorine-light opacity-60');
        
        const activeClass = 'active text-black bg-chlorine opacity-100';
        const inactiveClass = 'text-chlorine-light opacity-60';

        if (screenName === 'game') $('#nav-guard').addClass(activeClass).removeClass(inactiveClass);
        if (screenName === 'shelter') $('#nav-shelter').addClass(activeClass).removeClass(inactiveClass);
        if (screenName === 'morgue') $('#nav-morgue').addClass(activeClass).removeClass(inactiveClass);
        if (screenName === 'room') $('#nav-room').addClass(activeClass).removeClass(inactiveClass);
        // Toggle visibility of morgue stats nav button
        $('#nav-morgue-stats').removeClass('hidden');
    }

    applyVHS(intensity = 0.6, duration = 1000) {
        const target = $('#screen-game').find('main.vhs-target');
        target.css('--vhs-intensity', intensity);
        target.css('--vhs-duration', `${duration}ms`);
        target.addClass('vhs-active');
        if (this.audio) this.audio.playSFXByKey('vhs_flicker', { volume: 0.5 });
        setTimeout(() => target.removeClass('vhs-active'), duration);
    }

    updateStats(paranoia, cycle, dayTime, dayLength, currentNPC) {
        this.elements.paranoia.text(`${paranoia}%`);
        this.elements.cycle.text(cycle);
        this.elements.time.text(`${dayTime}/${dayLength}`);
        
        if (paranoia > 70) {
            this.elements.paranoia.removeClass('text-chlorine-light').addClass('text-alert');
        } else {
            this.elements.paranoia.removeClass('text-alert').addClass('text-chlorine-light');
        }

        // Update Energy
        const energySpan = $('#scan-energy');
        if (currentNPC) {
            const scansLeft = currentNPC.maxScans - currentNPC.scanCount;
            let bolts = '';
            for(let i=0; i<scansLeft; i++) bolts += '⚡';
            energySpan.text(bolts);
            
            if (scansLeft > 0) {
                energySpan.removeClass('text-gray-500').addClass('text-cyan-400');
            } else {
                energySpan.removeClass('text-cyan-400').addClass('text-gray-500');
            }

            // Update Tools State
            if (scansLeft <= 0) {
                this.elements.tools.forEach(btn => btn.addClass('btn-disabled'));
            } else {
                this.elements.tools.forEach(btn => btn.removeClass('btn-disabled'));
            }
        } else {
            energySpan.text('---');
            this.elements.tools.forEach(btn => btn.addClass('btn-disabled'));
        }
    }

    renderAvatar(npc, sizeClass = 'lg') {
        // We stick to vanilla JS creation for the complex structure or rewrite to template literals
        // Template literals are cleaner.
        
        let accessoryHTML = '';
        if (npc.visualFeatures.accessory !== 'none') {
            accessoryHTML = `
                <div class="avatar-accessory">
                    <div class="acc-${npc.visualFeatures.accessory}"></div>
                </div>
            `;
        }

        const html = `
            <div class="pixel-avatar ${sizeClass}">
                <div class="avatar-body">
                    <div class="clothes-detail"></div>
                </div>
                <div class="avatar-neck" style="background-color: ${npc.visualFeatures.skinColor};"></div>
                <div class="avatar-head" style="background-color: ${npc.visualFeatures.skinColor};">
                    <div class="avatar-eyes ${npc.visualFeatures.eyeType}">
                        <div class="eye"></div>
                        <div class="eye"></div>
                    </div>
                    <div class="avatar-mouth ${npc.visualFeatures.mouthType}"></div>
                </div>
                <div class="avatar-hair">
                    <div class="hair-style ${npc.visualFeatures.hair}"></div>
                </div>
                ${accessoryHTML}
            </div>
        `;
        
        return $(html);
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

    renderNPC(npc) {
        // Reset Visuals
        this.elements.npcDisplay.css({ transform: 'none', filter: 'none' });
        this.elements.npcDisplay.empty();

        // Use new Render System
        const avatar = this.renderAvatar(npc, 'lg');
        this.elements.npcDisplay.append(avatar);

        // Initial Dialogue
        this.updateDialogueBox(npc.dialogueTree.root, npc);
        
        // Glitch
        if (Math.random() < npc.visualFeatures.glitchChance) {
            this.triggerGlitch();
            this.applyVHS(0.8, 1000);
        }
    }

    updateDialogueBox(node, npc) {
        this.elements.dialogue.html(`<span class="npc-name font-bold text-chlorine">SUJETO ${npc.name}:</span> <span class="npc-text"></span>`);
        const textEl = this.elements.dialogue.find('.npc-text');
        this.typeText(textEl, node.text, 18);
        this.elements.dialogueOptions.empty();
        
        node.options.forEach(opt => {
            const btn = $('<button>', {
                class: 'option-btn border border-chlorine-light text-chlorine-light px-2 py-1 hover:bg-chlorine-light hover:text-black transition-colors text-left text-sm',
                text: `> ${opt.label}`
            });
            
            btn.on('click', () => {
                if (npc.dialogueTree[opt.next]) {
                    this.updateDialogueBox(npc.dialogueTree[opt.next], npc);
                    if (!npc.history) npc.history = [];
                    npc.history.push(`Q: ${opt.label} | A: ${npc.dialogueTree[opt.next].text}`);
                    State.dialoguesCount++;
                    if (opt.next === 'end') this.hideOmitOption();
                }
            });
            
            this.elements.dialogueOptions.append(btn);
        });
        if (!npc.optOut && npc.scanCount === 0) {
            const omitBtn = $('<button>', {
                class: 'option-btn option-omit border border-[#7a5a1a] text-[#ffcc66] px-2 py-1 hover:bg-[#7a5a1a] hover:text-black transition-colors text-left text-sm',
                text: '> Omitir test'
            });
            omitBtn.on('click', () => {
                npc.optOut = true;
                npc.scanCount = npc.maxScans;
                if (!npc.history) npc.history = [];
                npc.history.push('Se eligió omitir el test.');
                State.dialoguesCount++;
                this.showFeedback('TEST OMITIDO POR DIÁLOGO', 'yellow');
                this.updateStats(State.paranoia, State.cycle, State.dayTime, State.config.dayLength, State.currentNPC);
                omitBtn.remove();
            });
            this.elements.dialogueOptions.append(omitBtn);
        }
    }
    
    typeText(el, text, speed = 20) {
        if (this.typingTimer) {
            clearInterval(this.typingTimer);
            this.typingTimer = null;
        }
        el.text('');
        if (this.audio) this.audio.playSFXByKey('ui_dialogue_type', { volume: 0.4 });
        let i = 0;
        this.typingTimer = setInterval(() => {
            el.text(el.text() + text.charAt(i));
            i++;
            if (i >= text.length) {
                clearInterval(this.typingTimer);
                this.typingTimer = null;
            }
        }, Math.max(5, speed));
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
            npc.optOut = true;
            npc.scanCount = npc.maxScans;
            if (!npc.history) npc.history = [];
            npc.history.push('El sujeto omitió el test mediante diálogo.');
            overlay.addClass('hidden').removeClass('flex');
            this.updateStats(State.paranoia, State.cycle, State.dayTime, State.config.dayLength, State.currentNPC);
            this.showFeedback('TEST OMITIDO POR DIÁLOGO', 'yellow');
            this.hideOmitOption();
        });
    }

    showLore(type, onClose) {
        const title = $('#lore-screen-title');
        const content = $('#lore-screen-content');
        const panel = $('#screen-lore .lore-panel');
        let t = '';
        let c = '';
        title.removeClass('text-alert glitch-effect');
        panel.removeClass('animate__shakeX lore-danger lore-calm');
        if (type === 'initial') {
            t = 'Protocolo del Refugio';
            c = `
                <p>Los piel de cloro son portadores. La piel se reseca, los ojos se dilatan y el pulso baja.</p>
                <p>Herramientas: usa TERMÓMETRO, LINTERNA UV, PULSO y PUPILAS para revelar señales.</p>
                <p>Decisiones: admitir aumenta riesgo; purgar reduce amenaza pero sube la paranoia si era civil.</p>
                <p>Al caer la noche, si hay cloro dentro, alguien muere. Si no, descansas o afrontas un riesgo leve.</p>
            `;
            if (this.audio) this.audio.playLoreByKey('lore_intro_track', { loop: false, volume: 0.22, crossfade: 600 });
        } else if (type === 'intermediate') {
            const variants = [
                { kind: 'radio', text: '“No somos individuos”. La señal se corta. Luego silencio.' },
                { kind: 'oido', text: 'Golpes: dos cortos y uno largo. Alguien sabe el patrón.' },
                { kind: 'vista', text: 'Una sombra cruzó el pasillo. Por un instante, todos respiramos igual.' },
                { kind: 'registro', text: 'Anotación: la piel reseca aparece con luz UV y olor metálico.' },
                { kind: 'radio', text: 'Se rumorea que se alimentan de humedad y agua estancada.' },
                { kind: 'oido', text: 'Susurros a través de las tuberías. La casa tiene garganta.' },
                { kind: 'vista', text: 'Los espejos del pasillo empañan cuando alguien miente sobre su piel.' },
                { kind: 'radio', text: 'Transmisión interceptada: “El cloro recuerda quién abrió la puerta”.' },
                { kind: 'oido', text: 'Un reloj de péndulo marca 7 latidos por segundo. No es el tiempo.' },
                { kind: 'registro', text: 'Nota olvidada: “Si la sed despierta tras beber, no bebas más”.' },
                { kind: 'vista', text: 'Las luces parpadean en código Morse: “AGUA NO”.' },
                { kind: 'radio', text: 'Estática que murmura nombres que aún no has dicho en voz alta.' },
                { kind: 'oido', text: 'Pasos sobre cristal mojado. Nadie lleva zapatos.' },
                { kind: 'registro', text: 'Página arrancada: “La piel se desprende si miras de frente demasiado rato”.' },
                { kind: 'vista', text: 'Una mancha verde en el techo crece cuando nadie la observa.' },
                { kind: 'radio', text: 'Voz infantil: “El agua de la ducha sabe a cloro y a recuerdos ajenos”.' },
                { kind: 'oido', text: 'Goteo que imita tu ritmo cardíaco hasta que cambias de ritmo.' },
                { kind: 'registro', text: 'Aviso: “Sellad las grietas con sal; el cloro odia el mar”.' },
                { kind: 'vista', text: 'Siluetas en la niebla interior que señalan puertas que no existen.' },
                { kind: 'radio', text: 'Última frecuencia: “No duermas con la boca abierta; entran las ideas”.' }
            ];
            t = 'Interludio';
            const pick = variants[Math.floor(Math.random() * variants.length)];
            const icon = pick.kind === 'radio' ? 'fa-tower-broadcast' : pick.kind === 'vista' ? 'fa-eye' : pick.kind === 'oido' ? 'fa-ear-listen' : 'fa-book-open';
            const label = pick.kind === 'radio' ? 'RADIO' : pick.kind === 'vista' ? 'VISTO' : pick.kind === 'oido' ? 'ESCUCHADO' : 'REGISTRO';
            c = `<p class="mb-2"><i class="fa-solid ${icon} mr-2"></i><span class="font-bold">${label}</span></p><p>${pick.text}</p>`;
            if (this.audio) {
                if (pick.kind === 'radio') this.audio.playLoreByKey('lore_interlude_radio', { loop: false, volume: 0.22, crossfade: 500 });
                else if (pick.kind === 'vista') this.audio.playLoreByKey('lore_interlude_seen', { loop: false, volume: 0.22, crossfade: 500 });
                else if (pick.kind === 'oido') this.audio.playLoreByKey('lore_interlude_heard', { loop: false, volume: 0.22, crossfade: 500 });
            }
        } else if (type === 'pre_final') {
            t = 'Umbral';
            c = 'Antes de decidir, recuerda: sin pruebas, solo queda la palabra. El refugio no olvida.';
        } else if (type === 'post_final') {
            t = 'Resonancia';
            c = 'El refugio recuerda. Las decisiones dejan marcas invisibles que la noche ilumina.';
        } else if (type === 'night_tranquil') {
            t = 'Noche tranquila';
            c = 'El silencio fue real. Nadie habló y nadie cayó.';
            panel.addClass('lore-calm');
        } else if (type === 'night_civil_death') {
            t = 'Noche de sangre';
            c = 'Alguien fue encontrado sin pulso. El cloro respiró entre nosotros.';
            title.addClass('text-alert');
            panel.addClass('animate__shakeX lore-danger');
            title.addClass('glitch-effect').attr('data-text', t);
            if (this.audio) this.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
        } else if (type === 'night_player_death') {
            t = 'Última guardia';
            c = 'El refugio te consumió. El cloro no duerme. Tú tampoco.';
            title.addClass('text-alert');
            panel.addClass('animate__shakeX lore-danger');
            title.addClass('glitch-effect').attr('data-text', t);
            if (this.audio) this.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
        } else if (type === 'final_clean') {
            t = 'Salida limpia';
            c = 'Escapaste con humanidad intacta. Por ahora, el ciclo descansa.';
            panel.addClass('lore-calm');
            if (this.audio) this.audio.playLoreByKey('lore_final_clean', { loop: false, volume: 0.22, crossfade: 600 });
        } else if (type === 'final_corrupted') {
            t = 'Salida contaminada';
            c = 'Escapaste, pero el agua os sigue. El ciclo no termina.';
            title.addClass('text-alert');
            panel.addClass('animate__shakeX lore-danger');
            title.addClass('glitch-effect').attr('data-text', t);
            if (this.audio) this.audio.playLoreByKey('lore_final_corrupted', { loop: false, volume: 0.22, crossfade: 600 });
        } else if (type === 'final_death_alone') {
            t = 'Soledad terminal';
            c = 'Nadie sobrevivió contigo. Nadie te escuchó. Fin.';
            title.addClass('text-alert');
            panel.addClass('animate__shakeX lore-danger');
            title.addClass('glitch-effect').attr('data-text', t);
            if (this.audio) this.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
        } else if (type === 'final_death_all_infected') {
            t = 'Refugio tomado';
            c = 'Todos eran cloro. No hubo salida posible.';
            title.addClass('text-alert');
            panel.addClass('animate__shakeX lore-danger');
            title.addClass('glitch-effect').attr('data-text', t);
            if (this.audio) this.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
        } else if (type === 'final_death_paranoia') {
            t = 'La paranoia te alcanzó';
            c = 'Al intentar huir, el ruido te encontró primero.';
            title.addClass('text-alert');
            panel.addClass('animate__shakeX lore-danger');
            title.addClass('glitch-effect').attr('data-text', t);
            if (this.audio) this.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
        } else if (type === 'final_player_infected_escape') {
            t = 'Salida portadora';
            c = 'No era el refugio. Eras tú. Lo llevaste contigo.';
            title.addClass('text-alert');
            panel.addClass('animate__shakeX lore-danger');
            title.addClass('glitch-effect').attr('data-text', t);
            if (this.audio) this.audio.playSFXByKey('glitch_burst', { volume: 0.5 });
        }
        title.text(t);
        content.html(c);
        this.showScreen('lore');
        if (this.audio) this.audio.duckAmbient(0.12);
        $('#btn-lore-continue-screen').off('click').on('click', () => {
            if (this.audio) {
                this.audio.stopLore({ fadeOut: 500 });
                this.audio.unduckAmbient(300, 0.28);
            }
            if (onClose) onClose();
            else this.showScreen('game');
        });
    }

    showPreCloseFlow(onAction) {
        const overlay = $('#preclose-overlay');
        const step1 = $('#preclose-step1');
        const step2 = $('#preclose-step2');
        step2.addClass('hidden');
        step1.removeClass('hidden');
        overlay.removeClass('hidden').addClass('flex');
        if (this.audio) this.audio.playSFXByKey('preclose_overlay_open', { volume: 0.5 });
        // Hide sidebar while end-of-day flow is active
        this.elements.sidebar.addClass('hidden');
        $('#btn-preclose-open-shelter').off('click').on('click', () => {
            overlay.addClass('hidden').removeClass('flex');
            if (onAction) onAction('purge');
        });
        // Skip intermediate step: continue goes straight to Night
        $('#btn-preclose-continue').off('click').on('click', () => {
            overlay.addClass('hidden').removeClass('flex');
            if (onAction) onAction('finalize');
        });
        $('#btn-preclose-finish').off('click').on('click', () => {
            overlay.addClass('hidden').removeClass('flex');
            if (onAction) onAction('finalize');
        });
        $('#btn-preclose-stay').off('click').on('click', () => {
            overlay.addClass('hidden').removeClass('flex');
            if (onAction) onAction('stay');
        });
    }

    showFeedback(text, color = 'yellow') {
        const colorMap = {
            'yellow': 'text-warning',
            'red': 'text-alert',
            '#aaffaa': 'text-green-400'
        };
        
        // Remove old color classes
        this.elements.feedback.removeClass('text-warning text-alert text-green-400');
        
        // Add new color class or style if not mapped
        if (colorMap[color]) {
            this.elements.feedback.addClass(colorMap[color]);
        } else {
            this.elements.feedback.css('color', color);
        }

        this.elements.feedback.text(text).removeClass('hidden');
    }

    hideFeedback() {
        this.elements.feedback.addClass('hidden');
    }

    renderShelterGrid(npcs, max, onPurgeClick, onDetailClick) {
        this.elements.shelterCount.text(`${npcs.length}/${max}`);
        this.elements.shelterGrid.empty();
        
        npcs.forEach(npc => {
            const card = $('<div>', {
                class: 'bg-[#080808] border border-[#333] p-2 flex flex-col items-center cursor-pointer hover:border-chlorine-light hover:bg-[#111] transition-all'
            });
            
            const avatar = this.renderAvatar(npc, 'sm');
            const name = $('<span>', { text: npc.name, class: 'mt-2 text-xs' });

            card.append(avatar, name);
            card.on('click', () => onDetailClick(npc, true));
            
            this.elements.shelterGrid.append(card);
        });
    }

    updateDayAfterSummary(npcs) {
        const testsLeft = State.dayAfter.testsAvailable;
        this.elements.dayafterTestsLeft.text(testsLeft);
        const validatedCount = npcs.filter(n => n.dayAfter && n.dayAfter.validated).length;
        this.elements.dayafterValidatedCount.text(validatedCount);
    }

    renderMorgueGrid(npcs, onDetailClick) {
        this.elements.morgueGrid.empty();
        
        npcs.forEach(npc => {
            const statusColorClass = npc.death && npc.death.revealed && npc.isInfected ? 'infected' : '';
            
            const card = $('<div>', {
                class: `horror-card p-2 flex flex-col items-center cursor-pointer ${statusColorClass}`
            });
            
            const avatar = this.renderAvatar(npc, 'sm');
            if (npc.death && npc.death.revealed && npc.isInfected) {
                avatar.addClass('infected');
                if (!this.infectionEffectActive && Math.random() < 0.12) {
                    this.flashInfectionEffect(avatar);
                }
            }
            const name = $('<span>', { text: npc.name, class: 'mt-2 text-xs' });

            card.append(avatar, name);
            card.on('click', () => onDetailClick(npc, false));
            
            this.elements.morgueGrid.append(card);
        });
    }

    renderSecurityRoom(items, onToggle) {
        this.elements.securityGrid.empty();
        this.elements.securityCount.text(items.length);
        items.forEach((it, idx) => {
            const icon = it.type === 'alarma' ? 'fa-bell' : it.type === 'puerta' ? 'fa-door-closed' : it.type === 'ventana' ? 'fa-window-maximize' : 'fa-water';
            const activeOrSecured = it.type === 'alarma' ? it.active : it.secured;
            const card = $('<div>', {
                class: `bg-[#080808] border ${activeOrSecured ? 'border-chlorine' : 'border-[#333]'} p-3 flex flex-col gap-2 items-center hover:border-chlorine-light hover:bg-[#111] transition-all`
            });
            card.append($('<i>', { class: `fa-solid ${icon} text-3xl ${activeOrSecured ? 'text-chlorine' : 'text-chlorine-light'}` }));
            const label = it.type === 'alarma' ? 'ALARMA' : (it.type === 'tuberias' ? 'TUBERÍAS' : it.type.toUpperCase());
            card.append($('<span>', { text: label, class: 'text-xs font-mono' }));
            const btnText = it.type === 'alarma' ? (it.active ? 'ACTIVADA' : 'ACTIVAR') : (activeOrSecured ? 'ASEGURADO' : 'ASEGURAR');
            const btn = $('<button>', { class: 'horror-btn horror-btn-primary w-full py-1 text-xs', text: btnText });
            if (activeOrSecured) btn.addClass('opacity-60');
            btn.on('click', () => {
                if (it.type === 'alarma') {
                    if (!it.active) it.active = true;
                    if (this.audio) this.audio.playSFXByKey('alarm_activate', { volume: 0.6, priority: 1 });
                } else {
                    if (!it.secured) it.secured = true;
                    if (this.audio) {
                        if (it.type === 'puerta') this.audio.playSFXByKey('door_secure', { volume: 0.6, priority: 1 });
                        if (it.type === 'ventana') this.audio.playSFXByKey('window_secure', { volume: 0.6, priority: 1 });
                        if (it.type === 'tuberias') this.audio.playSFXByKey('pipes_whisper', { volume: 0.4, priority: 1 });
                    }
                }
                if (onToggle) onToggle(idx, it);
                this.renderSecurityRoom(items, onToggle);
            });
            card.append(btn);
            this.elements.securityGrid.append(card);
        });
    }
    openModal(npc, allowPurge, onPurgeConfirm) {
        this.elements.modal.removeClass('hidden').addClass('flex');
        if (this.audio) this.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });
        this.elements.modalName.text(`SUJETO ${npc.name}`);
        // Visual in Modal
        const visualContainer = $('#modal-npc-visual');
        visualContainer.empty().append(this.renderAvatar(npc, 'sm'));
        // Fix styles for mini visual in modal since we are appending 'sm' avatar
        visualContainer.css('background', 'transparent');
        // Diferenciar infectados en modal
        const avatarEl = visualContainer.find('.pixel-avatar');
        if (npc.death && npc.death.revealed && npc.isInfected) {
            avatarEl.addClass('infected');
        }

        if (allowPurge) {
            this.elements.modalStatus.text("EN REFUGIO").css('color', '#fff');
        } else {
            let statusText = 'POR DETERMINAR';
            let color = '#cccccc';
            if (npc.death && npc.death.revealed) {
                if (npc.death.reason === 'purga') {
                    statusText = npc.isInfected ? 'PURGADO — CLORO' : 'PURGADO — CIVIL';
                    color = npc.isInfected ? "#2d5a27" : "#ff3333";
                } else if (npc.death.reason === 'asesinado') {
                    statusText = npc.isInfected ? 'ASESINADO — CLORO' : 'ASESINADO — CIVIL';
                    color = npc.isInfected ? "#2d5a27" : "#ff3333";
                }
            }
            this.elements.modalStatus.text(statusText).css('color', color);
        }

        // Ensure day-after state
        if (!npc.dayAfter) {
            npc.dayAfter = { dermis: false, pupils: false, temperature: false, pulse: false, usedNightTests: 0, validated: false };
        }

        // Show data if known from admission OR learned at night
        const showStat = (key, label, value) => {
            const knownByDay = npc.revealedStats && npc.revealedStats.includes(key);
            const knownByNight = npc.dayAfter && npc.dayAfter[key];
            if (knownByDay || knownByNight) {
                return `<p>${label}: <span class="text-white">${value}</span></p>`;
            }
            return `<p>${label}: <span class="text-gray-600">???</span></p>`;
        };

        const dermisTxt = this.translateValue('skinTexture', npc.attributes.skinTexture);
        const pupilsTxt = this.translateValue('pupils', npc.attributes.pupils);
        const stayCycles = npc.enterCycle != null && npc.death ? Math.max(0, npc.death.cycle - npc.enterCycle) : (npc.enterCycle != null ? Math.max(0, State.cycle - npc.enterCycle) : 0);
        const extraDeathInfo = npc.death ? `<p>MUERTE: <span class="text-white">CICLO ${npc.death.cycle}</span></p><p>TIEMPO EN REFUGIO: <span class="text-white">${stayCycles} ciclos</span></p>` : '';
        this.elements.modalStats.html(`
            ${showStat('temperature', 'TEMP', `${npc.attributes.temperature}°C`)}
            ${showStat('pulse', 'PULSO', `${npc.attributes.pulse} BPM`)}
            ${showStat('skinTexture', 'DERMIS', dermisTxt)}
            ${showStat('pupils', 'PUPILAS', pupilsTxt)}
            ${extraDeathInfo}
        `);
        
        // Remove old tests grid if present to avoid duplication
        this.elements.modal.find('.dayafter-tests').remove();
        // Inject tests UI when in shelter
        if (allowPurge) {
            const testsGrid = $('<div>', { class: 'dayafter-tests mt-3' });
            const purgeBtnRef = this.elements.modalPurgeBtn;
            const handleAfterClick = () => {
                const complete = npc.dayAfter.dermis && npc.dayAfter.pupils && npc.dayAfter.temperature && npc.dayAfter.pulse;
                npc.dayAfter.validated = complete;
                this.updateDayAfterSummary(State.admittedNPCs);
                const dermisTxt2 = this.translateValue('skinTexture', npc.attributes.skinTexture);
                const pupilsTxt2 = this.translateValue('pupils', npc.attributes.pupils);
                const stayCycles2 = npc.enterCycle != null && npc.death ? Math.max(0, npc.death.cycle - npc.enterCycle) : (npc.enterCycle != null ? Math.max(0, State.cycle - npc.enterCycle) : 0);
                const extraDeathInfo2 = npc.death ? `<p>MUERTE: <span class="text-white">CICLO ${npc.death.cycle}</span></p><p>TIEMPO EN REFUGIO: <span class="text-white">${stayCycles2} ciclos</span></p>` : '';
                this.elements.modalStats.html(`
                    ${showStat('temperature', 'TEMP', `${npc.attributes.temperature}°C`)}
                    ${showStat('pulse', 'PULSO', `${npc.attributes.pulse} BPM`)}
                    ${showStat('skinTexture', 'DERMIS', dermisTxt2)}
                    ${showStat('pupils', 'PUPILAS', pupilsTxt2)}
                    ${extraDeathInfo2}
                `);
            };
            const makeSlot = (key, label) => {
                const knownByDay = npc.revealedStats && npc.revealedStats.includes(key);
                const doneNight = npc.dayAfter[key];
                const slot = $('<div>', { class: `slot ${knownByDay || doneNight ? 'done blocked' : ''}`, text: label });
                slot.on('click', () => {
                    if (knownByDay || npc.dayAfter[key]) return;
                    if (npc.dayAfter.usedNightTests >= 1) {
                        this.showModalError('SOLO 1 TEST NOCTURNO POR SUJETO');
                        return;
                    }
                    if (State.dayAfter.testsAvailable <= 0) {
                        this.showModalError('SIN TESTS DISPONIBLES');
                        return;
                    }
                    State.dayAfter.testsAvailable--;
                    npc.dayAfter[key] = true;
                    npc.dayAfter.usedNightTests++;
                    slot.addClass('done');
                    // Bloquear el resto de slots para este sujeto
                    testsGrid.find('.slot').addClass('blocked');
                    this.elements.dayafterTestsLeft.text(State.dayAfter.testsAvailable);
                    handleAfterClick();
                    this.clearModalError();
                });
                return slot;
            };
            testsGrid.append(
                makeSlot('skinTexture', 'DERMIS'),
                makeSlot('pupils', 'PUPILAS'),
                makeSlot('temperature', 'TEMP'),
                makeSlot('pulse', 'PULSO')
            );
            this.elements.modalStats.after(testsGrid);
        }
        
        // Logs
        this.elements.modalLog.empty();
        if (npc.history && npc.history.length > 0) {
            npc.history.forEach(entry => {
                this.elements.modalLog.append($('<div>', { class: 'mb-1 border-b border-gray-900 pb-1', text: entry }));
            });
        } else {
            this.elements.modalLog.text("Sin registro de diálogo.");
        }

        // Action
        if (allowPurge) {
            this.elements.modalPurgeBtn.removeClass('hidden');
            // Remove previous handlers to avoid multiple clicks
            this.elements.modalPurgeBtn.off('click').on('click', () => {
                const panel = $('#modal-npc .horror-panel');
                panel.addClass('modal-blood-flash');
                setTimeout(() => panel.removeClass('modal-blood-flash'), 700);
                if (this.audio) {
                    this.audio.playSFXByKey('purge_blood_flash', { volume: 0.6 });
                    this.audio.playEvent('purge');
                }
                onPurgeConfirm(npc);
                this.closeModal();
            });
        } else {
            this.elements.modalPurgeBtn.addClass('hidden');
        }

        // Close logic
        $('.close-modal').off('click').on('click', () => this.closeModal());
    }

    showModalError(text) {
        this.elements.modalError.text(text).removeClass('hidden');
    }
    clearModalError() {
        this.elements.modalError.text('').addClass('hidden');
    }
    closeModal(silent = false) {
        this.clearModalError();
        this.elements.modal.addClass('hidden').removeClass('flex');
        this.elements.msgModal.addClass('hidden').removeClass('flex');
        if (!silent && this.audio) this.audio.playSFXByKey('ui_modal_close', { volume: 0.5, priority: 0 });
    }

    showMessage(text, onClose) {
        this.elements.msgContent.text(text);
        this.elements.msgModal.removeClass('hidden').addClass('flex');
        if (this.audio) this.audio.playSFXByKey('ui_modal_open', { volume: 0.5 });
        
        this.elements.msgBtn.off('click').on('click', () => {
            this.elements.msgModal.addClass('hidden').removeClass('flex');
            if (this.audio) this.audio.playSFXByKey('ui_modal_close', { volume: 0.5 });
            if (onClose) onClose();
        });
    }

    updateRunStats(state) {
        const admitted = state.admittedNPCs.length;
        const ignored = state.ignoredNPCs.length;
        const purgedInfected = state.purgedNPCs.filter(n => n.isInfected).length;
        const purgedCivil = state.purgedNPCs.filter(n => !n.isInfected).length;
        const civilesMuertos = state.purgedNPCs.filter(n => n.death && n.death.reason === 'asesinado' && !n.isInfected).length;
        const clorosFuera = state.ignoredNPCs.filter(n => n.isInfected).length;
        const showSensitive = !!(state.lastNight && state.lastNight.occurred);

        $('#stat-run-dialogues').text(state.dialoguesCount);
        $('#stat-run-verifications').text(state.verificationsCount);
        $('#stat-run-admitted').text(admitted);
        $('#stat-run-ignored').text(ignored);
        $('#stat-run-cloros-vistos').text(showSensitive ? state.infectedSeenCount : '—');
        $('#stat-run-cloros-fuera').text(showSensitive ? clorosFuera : '—');
        $('#stat-run-cloros-purgados').text(showSensitive ? purgedInfected : '—');
        $('#stat-run-civiles-muertos').text(civilesMuertos);
        $('#stat-run-civiles-purgados').text(showSensitive ? purgedCivil : '—');
        $('#stat-run-last-night').text(showSensitive ? (state.lastNight.message || '—') : '—');
    }

    flashInfectionEffect(avatar) {
        this.infectionEffectActive = true;
        const head = avatar.find('.avatar-head');
        const eyes = avatar.find('.eye');
        const origHeadColor = head.css('background-color');
        const origEyeColor = eyes.css('background-color');
        avatar.css({ filter: 'hue-rotate(90deg) contrast(130%)' });
        head.css('background-color', '#2d5a27');
        eyes.css('background-color', '#ff0000');
        if (this.audio) this.audio.playSFXByKey('morgue_reveal_infected', { volume: 0.5 });
        setTimeout(() => {
            head.css('background-color', origHeadColor);
            eyes.css('background-color', origEyeColor);
            avatar.css({ filter: 'none' });
            this.infectionEffectActive = false;
        }, 120);
    }
}

export class StatsManager {
    constructor() {
        this.dom = {
            rtUsers: $('#stat-rt-users'),
            rtTransactions: $('#stat-rt-transactions'),
            rtEvents: $('#stat-rt-events'),
            rtAlerts: $('#stat-rt-alerts'),
            nightConsolidated: $('#stat-night-consolidated'),
            nightAverage: $('#stat-night-average'),
            nightTrend: $('#stat-night-trend'),
            nightNextRefresh: $('#stat-night-next-refresh'),
            refreshBtn: $('#btn-stats-refresh'),
            panel: $('#stats-panel')
        };
        this.cacheKey = 'stats_cache_v1';
        this.cache = this.loadCache();
        this.realtimeTTL = 5000;
        this.nightlyTTL = 24 * 60 * 60 * 1000;
        this.pollIntervalMs = 5000;
        this.baseUrl = '/api';
        this.useMock = true;
        this.pollTimer = null;
        this.nightTimer = null;
    }

    loadCache() {
        try {
            const raw = localStorage.getItem(this.cacheKey);
            return raw ? JSON.parse(raw) : { realtime: {}, nightly: {} };
        } catch {
            return { realtime: {}, nightly: {} };
        }
    }
    saveCache() {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
        } catch {}
    }

    now() { return Date.now(); }
    isFresh(ts, ttl) { return ts && (this.now() - ts) < ttl; }

    async fetchJSON(url) {
        if (this.useMock) {
            return this.mockResponse(url);
        }
        try {
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            return this.mockResponse(url);
        }
    }

    mockResponse(url) {
        // Simple deterministic mock based on URL hash
        const seed = Array.from(url).reduce((a, c) => a + c.charCodeAt(0), 0);
        const rand = (min, max, s = seed) => {
            const x = Math.sin(s++) * 10000;
            return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
        };
        if (url.includes('/rt')) {
            return {
                users: rand(50, 150),
                transactions: rand(1000, 5000),
                events: rand(200, 800),
                alerts: rand(0, 20)
            };
        }
        if (url.includes('/nightly')) {
            const consolidated = rand(20000, 30000);
            const average = rand(18000, 26000);
            const trendPct = Math.round(((consolidated - average) / Math.max(1, average)) * 100);
            return {
                consolidated,
                average,
                trendPct
            };
        }
        return {};
    }

    formatNumber(n) {
        return new Intl.NumberFormat('es-ES').format(n);
    }

    async updateRealtime(force = false) {
        const c = this.cache.realtime;
        if (!force && this.isFresh(c.ts, this.realtimeTTL)) {
            this.updateUIRealtime(c.data);
            console.info('[Stats] Realtime from cache');
            return;
        }
        const data = await this.fetchJSON(`${this.baseUrl}/rt/counters`);
        this.cache.realtime = { ts: this.now(), data };
        this.saveCache();
        this.updateUIRealtime(data);
        console.info('[Stats] Realtime fetched', data);
    }

    updateUIRealtime(data) {
        this.dom.rtUsers.text(this.formatNumber(data.users ?? 0));
        this.dom.rtTransactions.text(this.formatNumber(data.transactions ?? 0));
        this.dom.rtEvents.text(this.formatNumber(data.events ?? 0));
        this.dom.rtAlerts.text(this.formatNumber(data.alerts ?? 0));
    }

    async updateNightly(force = false) {
        const n = this.cache.nightly;
        if (!force && this.isFresh(n.ts, this.nightlyTTL)) {
            this.updateUINightly(n.data);
            this.updateNextRefreshLabel();
            console.info('[Stats] Nightly from cache');
            return;
        }
        const data = await this.fetchJSON(`${this.baseUrl}/nightly/metrics`);
        this.cache.nightly = { ts: this.now(), data };
        this.saveCache();
        this.updateUINightly(data);
        this.updateNextRefreshLabel();
        console.info('[Stats] Nightly fetched', data);
    }

    updateUINightly(data) {
        const consolidated = data.consolidated ?? 0;
        const average = data.average ?? 0;
        const trendPct = data.trendPct ?? 0;
        this.dom.nightConsolidated.text(this.formatNumber(consolidated));
        this.dom.nightAverage.text(this.formatNumber(average));
        const sign = trendPct > 0 ? '+' : '';
        this.dom.nightTrend
            .text(`${sign}${trendPct}%`)
            .removeClass('trend-up trend-down')
            .addClass(trendPct >= 0 ? 'trend-up' : 'trend-down');
    }

    updateNextRefreshLabel() {
        const nextMidnight = this.computeNextMidnight();
        const fmt = nextMidnight.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' });
        this.dom.nightNextRefresh.text(fmt);
    }

    computeNextMidnight() {
        const d = new Date();
        d.setHours(24, 0, 0, 0);
        return d;
    }

    scheduleNightly() {
        if (this.nightTimer) clearTimeout(this.nightTimer);
        const ms = this.computeNextMidnight().getTime() - this.now();
        this.nightTimer = setTimeout(async () => {
            await this.updateNightly(true);
            this.scheduleNightly();
        }, Math.max(1000, ms));
        this.updateNextRefreshLabel();
        console.info('[Stats] Nightly scheduled in ms:', Math.max(1000, ms));
    }

    startPollingRealtime() {
        if (this.pollTimer) clearInterval(this.pollTimer);
        this.pollTimer = setInterval(() => this.updateRealtime(false), this.pollIntervalMs);
    }

    bindActions() {
        this.dom.refreshBtn.off('click').on('click', async () => {
            await this.updateRealtime(true);
            await this.updateNightly(true);
            console.info('[Stats] Manual refresh triggered');
        });
    }

    async start() {
        this.bindActions();
        await this.updateRealtime(true);
        await this.updateNightly(false);
        this.startPollingRealtime();
        this.scheduleNightly();
        this.applyResponsiveBehavior();
    }

    applyResponsiveBehavior() {
        const panel = this.dom.panel;
        const update = () => {
            const small = window.matchMedia('(max-width: 768px)').matches;
            panel.toggleClass('w-full', small);
            panel.toggleClass('border-l', !small);
            panel.toggleClass('border-t', small);
        };
        update();
        $(window).on('resize', update);
    }
}
