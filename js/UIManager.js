import { State } from './State.js';
import { LoreManager } from './LoreManager.js';
import { ModalManager } from './ModalManager.js';
import { AvatarRenderer } from './AvatarRenderer.js';
import { ScreenManager } from './ScreenManager.js';
import { GeneratorManager } from './GeneratorManager.js';
import { StatsManager } from './StatsManager.js';
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

        this.colors = {
            energy: '#1aff1a',
            overload: '#ff3333',
            off: '#333333',
            safe: '#1b571bff',
            chlorine: '#79ff79',
            chlorineSutil: '#3c8f3c',
            alert: '#ff3333'
        };

        // Initialize Specialized Managers
        this.avatarRenderer = AvatarRenderer; // Static class
        this.screenManager = new ScreenManager(this);
        this.loreManager = new LoreManager(this, audio);
        this.modalManager = new ModalManager(this, audio);
        this.generatorManager = new GeneratorManager(this, audio);
        this.statsManager = new StatsManager();

        // For backward compatibility while refactoring
        this.modules = {
            lore: this.loreManager,
            modal: this.modalManager,
            generator: this.generatorManager,
            screen: this.screenManager
        };
    }

    showScreen(screenName) {
        this.screenManager.showScreen(screenName, State);
    }

    renderFinalStats(state) {
        this.screenManager.renderFinalStats(state);
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

        // La revisión solo es "obligatoria" si no hay energía o está apagado
        const generatorOk = State.generator && State.generator.isOn;
        const needsCheck = !generatorOk;

        if (this.elements.genWarningGame) this.elements.genWarningGame.toggleClass('hidden', !needsCheck);
        if (this.elements.genWarningShelter) this.elements.genWarningShelter.toggleClass('hidden', !needsCheck);

        if (paranoia > 70) {
            this.elements.paranoia.removeClass('text-chlorine-light').addClass('text-alert');
        } else {
            this.elements.paranoia.removeClass('text-alert').addClass('text-chlorine-light');
        }

        // Update Energy
        const energySpan = $('#scan-energy');
        if (currentNPC) {
            // Definir límite máximo según modo
            const mode = State.generator.mode;
            const maxEnergy = State.config.generator.consumption[mode] || 2;

            // Calcular energía actual (0 si está apagado o fallo)
            const currentEnergy = (!State.generator.isOn || currentNPC.scanCount >= 90) ? 0 : Math.max(0, maxEnergy - currentNPC.scanCount);

            energySpan.text(`${currentEnergy}/${maxEnergy}`);

            if (currentEnergy > 0) {
                energySpan.removeClass('text-alert animate-pulse').addClass('text-cyan-400');
            } else {
                energySpan.removeClass('text-cyan-400').addClass('text-alert animate-pulse');
            }

            if (currentEnergy <= 0) {
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
        return AvatarRenderer.render(npc, sizeClass);
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

    updateInspectionTools() {
        if (!this.elements.inspectionToolsContainer) return;

        const npc = State.currentNPC;

        if (!State.generator.isOn) {
            if (this.elements.genWarningPanel) this.elements.genWarningPanel.removeClass('hidden');

            // Caso 1: Generador apagado
            this.elements.inspectionToolsContainer.removeClass('grid-cols-2 sm:grid-cols-2 lg:grid-cols-4').addClass('grid-cols-1');
            this.elements.inspectionToolsContainer.html(`
                <button id="btn-goto-generator" class="horror-btn horror-btn-alert w-full p-6 text-xl flex items-center justify-center gap-3 animate-pulse">
                    <i class="fa-solid fa-bolt"></i>
                    <span>SISTEMA ELÉCTRICO INESTABLE: REVISAR GENERADOR</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            `);

            return;
        }

        // Determinar el límite de energía actual según el modo
        const currentMode = State.generator.mode;
        const maxEnergy = State.config.generator.consumption[currentMode] || 2;

        if (npc && npc.scanCount >= maxEnergy) {
            // Caso 3: Sin energías por el límite del modo actual
            this.elements.inspectionToolsContainer.removeClass('grid-cols-2 sm:grid-cols-2 lg:grid-cols-4').addClass('grid-cols-1');
            this.elements.inspectionToolsContainer.html(`
                <div class="horror-btn horror-btn-disabled w-full p-4 text-center opacity-70 cursor-not-allowed border-dashed">
                    <i class="fa-solid fa-battery-empty mr-2"></i>
                    BATERÍAS AGOTADAS: SOLO DIÁLOGO O DECISIÓN
                </div>
            `);
        } else {
            // Caso Normal con energía disponible
            this.elements.inspectionToolsContainer.removeClass('grid-cols-1').addClass('grid-cols-2 sm:grid-cols-2 lg:grid-cols-4');

            const modeMap = {
                'save': 'Ahorro: Máx 1',
                'normal': 'Normal: Máx 2',
                'overload': 'Overclock: Máx 3'
            };
            const modeLabel = modeMap[currentMode] || `Modo ${currentMode}`;

            let extraLabel = `<div class="col-span-full text-center text-[10px] text-chlorine-light mb-1 opacity-80 uppercase tracking-widest">
                <i class="fa-solid fa-bolt mr-1"></i> ${modeLabel}
            </div>`;

            this.elements.inspectionToolsContainer.html(`
                ${extraLabel}
                <button id="tool-thermo" class="horror-btn horror-btn-tool btn-interactive ${npc && npc.revealedStats.includes('temperature') ? 'btn-disabled opacity-20 grayscale' : ''}">
                    <i class="fa-solid fa-temperature-half"></i> TERMÓMETRO
                </button>
                <button id="tool-flash" class="horror-btn horror-btn-tool btn-interactive ${npc && npc.revealedStats.includes('skinTexture') ? 'btn-disabled opacity-20 grayscale' : ''}">
                    <i class="fa-solid fa-lightbulb"></i> LINTERNA UV
                </button>
                <button id="tool-pulse" class="horror-btn horror-btn-tool btn-interactive ${npc && npc.revealedStats.includes('pulse') ? 'btn-disabled opacity-20 grayscale' : ''}">
                    <i class="fa-solid fa-heart-pulse"></i> PULSO
                </button>
                <button id="tool-pupils" class="horror-btn horror-btn-tool btn-interactive ${npc && npc.revealedStats.includes('pupils') ? 'btn-disabled opacity-20 grayscale' : ''}">
                    <i class="fa-solid fa-eye"></i> PUPILAS
                </button>
            `);
        }
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

    updateDialogueBox(npc) {
        if (!npc || !npc.conversation) return;
        const convNode = npc.conversation.getCurrentNode();
        const nodeText = convNode ? convNode.text : '...';

        const displayNameFull = npc.getDisplayName ? npc.getDisplayName() : npc.name;
        // Split full display name into base name and epithet (apodo) if present (separator em-dash '—' or hyphen)
        const nameParts = displayNameFull.split(/\s*[—\-]\s*/);
        const baseName = nameParts[0].trim();
        const epithet = nameParts.slice(1).join(' — ').trim();

        const nameHtml = `<span class="npc-name font-bold text-chlorine">${baseName}</span>`;
        this.elements.dialogue.html(`${nameHtml} <span class="npc-text"></span>`);
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
            this.audio.playSFXByKey(convNode.audio, { volume: 0.5 });
        }

        const needsMarkup = /\*.*?\*|".*?"|Se dice que|Dicen que|comentaba que/.test(raw);
        if (needsMarkup) {
            parsed = (typeof parseDialogueMarkup === 'function') ? parseDialogueMarkup(raw) : raw;
            if (epithet && !raw.includes(epithet)) {
                parsed = `<span class="npc-epithet"> ${escapeHtml(epithet)}</span> ` + parsed;
            }
            // Use sequenced rendering that respects actions/speeches/rumors
            this.typeText(textEl, parsed, 18);
        } else {
            // Plain text: optionally include epithet
            let finalText = raw;
            if (epithet && !raw.includes(epithet)) finalText = `— ${epithet} ${raw}`;
            this.typeText(textEl, finalText, 18);
        }

        // Build option buttons
        if (convNode && convNode.options && convNode.options.length) {
            convNode.options.forEach((opt, idx) => {
                const btn = $('<button>', {
                    class: `option-btn border border-chlorine-light text-chlorine-light px-2 py-1 hover:bg-chlorine-light hover:text-black transition-colors text-left text-sm ${opt.cssClass || ''}`,
                    html: `&gt; ${escapeHtml(opt.label)}`
                });

                btn.on('click', () => {
                    // Mark dialogue started and hide omit (tracking interaction)
                    npc.dialogueStarted = true;
                    this.hideOmitOption();

                    // Riesgo de degradación de seguridad durante el diálogo
                    if (window.game && typeof window.game.checkSecurityDegradation === 'function') {
                        window.game.checkSecurityDegradation();
                    }

                    // Registrar evidencia en bitácora si la opción lo requiere
                    if (opt.log) {
                        State.addLogEntry('evidence', opt.log.text, { icon: opt.log.icon });
                    }

                    // Log choice to NPC history
                    if (!npc.history) npc.history = [];
                    npc.history.push(`> ${opt.label}`);

                    // Play optional sfx tied to option
                    if (opt.audio && this.audio) this.audio.playSFXByKey(opt.audio, { volume: 0.6 });

                    // Execute custom onclick if defined
                    if (opt.onclick) {
                        try {
                            opt.onclick();
                        } catch (e) {
                            console.warn("Dialogue onclick failed:", e);
                        }
                        if (State.currentNPC !== npc) return;
                    }

                    const res = npc.conversation.getNextDialogue(idx);
                    State.dialoguesCount++;

                    if (res.error) {
                        this.showMessage(res.error, () => { }, 'warning');
                        return;
                    }

                    if (res.audio && this.audio) this.audio.playSFXByKey(res.audio, { volume: 0.6 });

                    if (res.end) {
                        this.showFeedback('FIN DE DIÁLOGO', 'green');
                        this.elements.dialogueOptions.empty();
                        if (res.message) {
                            const parsedMsg = (typeof parseDialogueMarkup === 'function') ? parseDialogueMarkup(res.message) : res.message;
                            this.typeText(textEl, parsedMsg, 18);
                        }
                        // update inspection tools after final choice
                        this.updateInspectionTools();
                        return;
                    }

                    // Otherwise render the next node
                    this.updateDialogueBox(npc);

                    // Slight VHS effect if paranoia high
                    if (State.paranoia > 70) this.applyVHS(0.6, 600);

                    // Ensure inspection tools reflect interaction
                    this.updateInspectionTools();
                });

                this.elements.dialogueOptions.append(btn);
            });
        }

        // Omit option: only if no interaction yet
        const hasInteracted = npc.dialogueStarted || npc.scanCount > 0 || (npc.conversation && npc.conversation.history.length > 0);

        if (!npc.optOut && !hasInteracted) {
            const omitBtn = $('<button>', {
                class: 'option-btn option-omit border border-[#7a5a1a] text-[#ffcc66] px-2 py-1 hover:bg-[#7a5a1a] hover:text-black transition-colors text-left text-sm',
                html: '&gt; Omitir por diálogo'
            });
            omitBtn.on('click', () => {
                npc.optOut = true;
                npc.scanCount = npc.maxScans;
                npc.dialogueStarted = true; // También cuenta como interacción
                if (!npc.history) npc.history = [];
                npc.history.push({ text: 'Test omitido por diálogo.', type: 'warning' });
                this.showFeedback('TEST OMITIDO POR DIÁLOGO', 'yellow');
                this.updateInspectionTools();
                this.elements.dialogueOptions.empty();
            });
            this.elements.dialogueOptions.append(omitBtn);
        }
    }

    typeText(el, text, speed = 20) {
        // Cancel any ongoing typing
        if (this.typingTimer) {
            cancelAnimationFrame(this.typingTimer);
            this.typingTimer = null;
        }

        // Helper to detect if the incoming text is HTML (from parseDialogueMarkup)
        const containsHtml = /<[^>]+>/.test(text);

        // If there's an audio manager, start the typing sfx (long sfx may need to be stopped on finish)
        if (this.audio) this.audio.playSFXByKey('ui_dialogue_type', { volume: 0.4 });

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
                    this.typingTimer = null;
                    // Stop typing sfx when finished
                    if (this.audio && this.audio.channels && this.audio.channels.sfx) {
                        try { this.audio.channels.sfx.pause(); this.audio.log && this.audio.log('[sfx] typing paused'); } catch (e) { }
                    }
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
                this.typingTimer = null;
                // Stop typing sfx
                if (this.audio && this.audio.channels && this.audio.channels.sfx) {
                    try { this.audio.channels.sfx.pause(); this.audio.log && this.audio.log('[sfx] typing paused'); } catch (e) { }
                }
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

    showLore(type, onClose) { return this.modules.lore.showLore(type, onClose); }

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

        // Clear nav status on view (acknowledgement of new entrants)
        if (this.setNavItemStatus) this.setNavItemStatus('nav-shelter', null);

        const batch = [];
        npcs.forEach(npc => {
            // Lógica de deducción visual
            const isValidated = npc.dayAfter && npc.dayAfter.validated;
            const isPurgeLocked = npc.purgeLockedUntil && State.cycle < npc.purgeLockedUntil;
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
                statusIcon = '<i class="fa-solid fa-lock text-gray-500 text-[10px] absolute top-1 right-1"></i>';
            }

            const card = $('<div>', {
                class: `${bgClass} border ${borderClass} p-2 flex flex-col items-center cursor-pointer hover:border-chlorine-light hover:bg-[#111] transition-all relative`
            });

            const avatar = this.renderAvatar(npc, 'sm');
            const name = $('<span>', { text: npc.name, class: 'mt-2 text-xs' });

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
        this.elements.dayafterValidatedCount.text(validatedCount);

        // La revisión solo es "obligatoria" si no hay energía o está apagado
        const generatorOk = State.generator && State.generator.isOn && (State.generator.power > 10);
        const needsCheck = !generatorOk;

        if (this.elements.genWarningShelter) this.elements.genWarningShelter.toggleClass('hidden', !needsCheck);

        // Update nav indicator for generator
        if (this.setNavItemStatus) {
            if (needsCheck) this.setNavItemStatus('nav-generator', 3);
            else this.setNavItemStatus('nav-generator', null);
        }

        // Si necesita revisión, podemos añadir un botón temporal en el panel de tests
        const testsPanel = this.elements.dayafterPanel.find('.flex.flex-wrap');
        if (needsCheck) {
            if ($('#btn-shelter-goto-gen').length === 0) {
                const btn = $('<button>', {
                    id: 'btn-shelter-goto-gen',
                    class: 'horror-btn horror-btn-alert px-3 py-1 text-xs flex items-center gap-2 animate-pulse',
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

    renderMorgueGrid(purged, escaped, night, onDetailClick) {
        // Viewing the morgue clears its attention marker
        if (this.setNavItemStatus) this.setNavItemStatus('nav-morgue', null);

        // Helper para renderizar una lista en un contenedor específico
        const renderList = (list, container, type) => {
            container.empty();
            if (!list || list.length === 0) {
                container.append($('<div>', { class: 'text-[10px] text-gray-600 italic p-2', text: 'Sin registros.' }));
                return;
            }

            const batch = [];
            list.forEach(npc => {
                // Estilos según tipo
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
                    isRevealedInfected = npc.death && npc.death.revealed && npc.isInfected;
                } else {
                    // Para escapados y nocturnos, revelamos si pertenecen a un ciclo anterior
                    // Ignorados (exitCycle): revelan al día siguiente (< State.cycle)
                    // Nocturnos (left.cycle): revelan esa misma mañana (<= State.cycle)
                    const isIgnoredRevealed = npc.exitCycle && npc.exitCycle < State.cycle;
                    const isNightRevealed = npc.left && npc.left.cycle <= State.cycle;

                    if ((isIgnoredRevealed || isNightRevealed) && npc.isInfected) {
                        isRevealedInfected = true;
                    }
                }

                const statusColorClass = isRevealedInfected ? 'border-alert shadow-[0_0_10px_rgba(255,0,0,0.2)]' : borderClass;

                const card = $('<div>', {
                    class: `self-start relative p-2 border bg-black/40 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 group ${statusColorClass} ${hoverClass}`
                });

                const avatar = this.renderAvatar(npc, 'sm');

                if (isRevealedInfected) {
                    avatar.addClass('infected');
                    // Badge de infectado
                    card.append($('<div>', {
                        class: 'absolute top-1 right-1 text-alert text-[10px] animate-pulse',
                        html: '<i class="fa-solid fa-biohazard"></i>'
                    }));
                }

                const name = $('<span>', { text: npc.name, class: 'text-[10px] font-mono text-gray-400 group-hover:text-white truncate w-full text-center' });
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
            const activeColor = '#00FF00';
            const inactiveColor = '#ff2b2b';
            const borderColor = activeOrSecured ? activeColor : inactiveColor;
            const iconColor = activeOrSecured ? activeColor : inactiveColor;
            const stateClass = activeOrSecured ? 'secured' : 'unsecured';
            const card = $('<div>', {
                class: `security-item bg-[#080808] p-3 flex flex-col gap-2 items-center hover:bg-[#111] transition-all ${stateClass}`,
                css: { border: `1px solid ${borderColor}` }
            });

            if (!hasPower) {
                card.addClass('opacity-50 grayscale');
                card.css({ border: '1px solid #333' });
            }

            card.append($('<i>', { class: `fa-solid ${icon} text-3xl`, css: { color: iconColor } }));
            const label = it.type === 'alarma' ? 'ALARMA' : (it.type === 'tuberias' ? 'TUBERÍAS' : it.type.toUpperCase());
            card.append($('<span>', { text: label, class: 'text-xs font-mono' }));
            {
                const btnText = it.type === 'alarma' ? (it.active ? 'ACTIVADA' : 'ACTIVAR') : (activeOrSecured ? 'ASEGURADO' : 'ASEGURAR');
                const btn = $('<button>', { class: 'horror-btn horror-btn-primary w-full py-1 text-xs', text: btnText });
                if (activeOrSecured) btn.addClass('opacity-60');

                if (!hasPower) {
                    btn.prop('disabled', true);
                    btn.addClass('opacity-20 cursor-not-allowed');
                    btn.text('SIN ENERGÍA');
                }

                btn.on('click', () => {
                    if (!hasPower) return;
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
                card.append(btn);
            }
            batch.push(card[0]);
        });
        if (batch.length) this.elements.securityGrid.append(batch);

        // Update nav status: if any unsecured channels exist, set warning; otherwise clear
        this.updateSecurityNavStatus(items);
    }

    renderLog(state) {
        const container = this.elements.logContainer;
        container.empty();

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

            const html = `
                <div class="log-entry ${typeClass}">
                    <div class="log-meta flex justify-between">
                        <span><i class="fa-solid ${icon} mr-1"></i> CICLO ${entry.cycle} // HORA ${entry.dayTime}</span>
                    </div>
                    <div class="log-content">${entry.text}</div>
                </div>
            `;
            container.append(html);
        });

        // Auto-scroll al final para ver lo más nuevo (ya que el orden es cronológico)
        container.scrollTop(container[0].scrollHeight);
    }

    renderGeneratorRoom() {
        this.generatorManager.renderGeneratorRoom(State);
    }

    // NAVBAR status helpers
    setNavStatus(level) {
        const el = $('#sidebar-left');
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
        const sidebar = $('#sidebar-left');
        sidebar.removeClass('status-level-1 status-level-2 status-level-3 status-level-4 status-level-5');
        sidebar.removeAttr('data-status');

        btn.removeClass('status-level-1 status-level-2 status-level-3 status-level-4 status-level-5');
        if (level) {
            btn.addClass(`status-level-${level}`);
            btn.attr('data-status', level);
        } else {
            btn.removeAttr('data-status');
        }
        // Ensure icons take current color (clear any inline color)
        btn.find('i').css('color', '');
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

    closeModal(silent = false) {
        this.modalManager.closeModal(silent);
    }

    showMessage(text, onClose, type = 'normal') {
        this.modalManager.showMessage(text, onClose, type);
    }

    showConfirm(text, onYes, onCancel) {
        this.modalManager.showConfirm(text, onYes, onCancel);
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
        eyes.css('background-color', '#ff0000');
        if (this.audio) this.audio.playSFXByKey('morgue_reveal_infected', { volume: 0.5 });
        setTimeout(() => {
            head.css('background-color', origHeadColor);
            eyes.css('background-color', origEyeColor);
            avatar.css({ filter: 'none' });
            this.infectionEffectActive = false;
        }, 120);
    }

    animateToolThermometer(value) {
        const container = this.elements.npcDisplay;
        container.css('position', 'relative');
        container.find('.tool-thermo').remove();
        const overlay = $('<div>', { class: 'tool-thermo', css: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 } });
        const tube = $('<div>', { css: { width: '20px', height: '120px', background: '#0a0a0a', border: '1px solid #555', position: 'relative', boxShadow: 'inset 0 0 8px #000' } });
        const isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;

        // Colores dinámicos basados en infección (cloro)
        const fillColor = value < 35
            ? (isInfected ? State.colors.chlorineSutil : State.colors.safe)
            : (isInfected ? State.colors.chlorineLight : '#a83232');

        const fill = $('<div>', { css: { position: 'absolute', bottom: '0px', left: 0, width: '100%', height: '0%', background: fillColor, filter: isInfected ? `drop-shadow(0 0 4px ${State.colors.chlorineSutil})` : 'none' } });
        const ticks = $('<div>', { css: { position: 'absolute', inset: 0 } });
        for (let i = 0; i <= 6; i++) {
            ticks.append($('<div>', { css: { position: 'absolute', left: '20px', bottom: `${i * 20}px`, width: '10px', height: '1px', background: '#444' } }));
        }
        tube.append(fill, ticks);
        overlay.append(tube);
        container.append(overlay);
        const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const target = Math.max(0, Math.min(100, Math.round((value / 45) * 100)));
        const step = (now) => {
            const t = Math.min(1, (now - start) / 1800);
            const h = Math.floor(target * t);
            fill.css('height', `${h}%`);
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        if (isInfected) {
            const bubbleLayer = $('<div>', { css: { position: 'absolute', inset: 0, overflow: 'hidden' } });
            overlay.append(bubbleLayer);
            const bubbles = [];
            for (let i = 0; i < 6; i++) {
                const b = $('<div>', { css: { position: 'absolute', bottom: '0', left: `${2 + Math.random() * 14}px`, width: '3px', height: '3px', background: '#2d5a27', borderRadius: '50%', opacity: 0.0 } });
                bubbles.push(b);
                bubbleLayer.append(b);
            }
            const bStart = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            const bStep = (now) => {
                const elapsed = now - bStart;
                bubbles.forEach((b, idx) => {
                    const y = (elapsed / 12 + idx * 20) % 120;
                    b.css({ bottom: `${y}px`, opacity: y > 20 ? 0.25 : 0.0 });
                });
                if (elapsed < 2000) requestAnimationFrame(bStep);
            };
            requestAnimationFrame(bStep);
        }
        setTimeout(() => overlay.remove(), 2200);
    }

    animateToolPupils(type = 'normal') {
        const overlay = $('#pupil-overlay');
        const container = overlay.find('.pupil-eye-container');
        const pupil = $('#giant-pupil');

        overlay.removeClass('hidden').addClass('flex');

        // Reset pupila
        pupil.css({ width: '40px', height: '40px' });

        // Animación de aparición
        setTimeout(() => {
            container.removeClass('scale-0').addClass('scale-100');

            // Reacción de la pupila
            setTimeout(() => {
                const size = type === 'dilated' ? '42px' : '40px';
                pupil.css({ width: size, height: size });

                // Efecto de parpadeo/reacción
                if (type === 'dilated') {
                    pupil.addClass('animate-pulse');
                    pupil.css('background', 'radial-gradient(circle, #3b0707 0%, #3bd853ff 100%)');
                } else {
                    pupil.css('background', '#3b0707');
                }
            }, 600);
        }, 50);

        // Desvanecimiento
        setTimeout(() => {
            container.removeClass('scale-100').addClass('scale-0');
            setTimeout(() => {
                overlay.removeClass('flex').addClass('hidden');
                pupil.removeClass('animate-pulse').css('background', '#3b0707');
            }, 500);
        }, 2200);
    }

    animateToolFlashlight(skinTexture, skinColor) {
        const container = this.elements.npcDisplay;
        container.css('position', 'relative');
        container.find('.tool-flash').remove();
        const flash = $('<div>', { class: 'tool-flash', css: { position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.18)', mixBlendMode: 'screen', pointerEvents: 'none', zIndex: 10 } });
        container.append(flash);
        const avatar = container.find('.pixel-avatar');
        const head = avatar.find('.avatar-head');
        const neck = avatar.find('.avatar-neck');
        const origHead = head.css('background-color');
        const origNeck = neck.css('background-color');
        if (skinTexture === 'dry') {
            const tint = 'hue-rotate(90deg) contrast(115%) saturate(110%)';
            avatar.css('filter', tint);
        }
        setTimeout(() => {
            flash.remove();
            avatar.css('filter', 'none');
            head.css('background-color', origHead);
            neck.css('background-color', origNeck);
        }, 900);
    }

    animateToolPulse(bpm) {
        const container = this.elements.npcDisplay;
        container.css('position', 'relative');
        container.find('.tool-pulse').remove();
        const overlay = $('<div>', { class: 'tool-pulse', css: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 } });
        const svg = $(document.createElementNS('http://www.w3.org/2000/svg', 'svg')).attr({ width: 220, height: 40 });
        const isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;

        // Color de pulso: verde sutil si es cloro
        const strokeColor = isInfected ? State.colors.chlorineSutil : State.colors.safe;

        const path = $(document.createElementNS('http://www.w3.org/2000/svg', 'path')).attr({ d: 'M0 20 L20 20 L25 10 L30 30 L35 20 L220 20', stroke: strokeColor, 'stroke-width': 2, fill: 'none' });
        path.css({ filter: `drop-shadow(0 0 4px ${strokeColor})`, transform: isInfected ? 'scaleY(1.08)' : 'none', transformOrigin: 'center' });
        svg.append(path);
        if (isInfected) {
            const pathGhost = $(document.createElementNS('http://www.w3.org/2000/svg', 'path')).attr({ d: 'M0 20 L20 20 L25 11 L30 29 L35 20 L220 20', stroke: '#79ff79', 'stroke-width': 1, fill: 'none', opacity: 0.3 });
            svg.append(pathGhost);
        }
        const dash = 260;
        path.attr({ 'stroke-dasharray': dash, 'stroke-dashoffset': dash });
        overlay.append(svg);
        container.append(overlay);
        const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const baseInterval = Math.max(280, Math.min(900, Math.round(60000 / Math.max(40, Math.min(160, bpm)))));
        let lastBeat = start;
        const step = (now) => {
            const elapsedSinceBeat = now - lastBeat;
            const t = Math.min(1, (now - start) / 2400);
            const offset = dash * (1 - t);
            path.attr({ 'stroke-dashoffset': offset });
            const variance = isInfected ? (Math.random() * 120 - 60) : 0;
            const intervalMs = Math.max(240, baseInterval + variance);
            if (elapsedSinceBeat >= intervalMs) {
                svg.css('opacity', 0.9);
                setTimeout(() => svg.css('opacity', 1), 120);
                lastBeat = now;
            }
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        setTimeout(() => overlay.remove(), 2600);
    }
}
