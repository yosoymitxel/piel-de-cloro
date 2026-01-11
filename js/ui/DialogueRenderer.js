import { parseDialogueMarkup, escapeHtml } from '../markup.js';
import { State } from '../State.js';

/**
 * DialogueRenderer handles rendering the dialogue box, options, and interaction.
 */
export class DialogueRenderer {
    constructor(ui, typingEngine) {
        this.ui = ui;
        this.typingEngine = typingEngine;
        this.elements = ui.elements;
    }

    /**
     * Updates the dialogue box for the current NPC.
     */
    update(npc) {
        if (!npc || !npc.conversation) return;

        const convNode = npc.conversation.getCurrentNode();
        if (!convNode) return;

        // Ensure dialogue box is visible
        this.elements.dialogue.removeClass('hidden');

        // Prepare text
        const textEl = this.elements.dialogue.find('.npc-text');
        const nameEl = this.elements.dialogue.find('.npc-name');

        // Set name (can include epithet if not already shown in dialogue text)
        const displayName = npc.getDisplayName();
        const [name, epithet] = displayName.split(' — ');
        nameEl.html(name);

        // Prepare text
        let fullText = convNode.text;
        const isFirstVisit = npc.conversation.history.length === 0;
        if (epithet && isFirstVisit) {
            fullText = `*${epithet}* ${fullText}`;
        }

        // Parse and type text
        const parsedText = parseDialogueMarkup(fullText);
        this.typingEngine.typeText(textEl, parsedText, 18);

        // Play node audio
        if (convNode.audio && this.ui.audio) {
            this.ui.audio.playSFXByKey(convNode.audio, { volume: 0.6 });
        }

        // Render options
        this._renderOptions(npc, convNode);
    }

    _renderOptions(npc, convNode) {
        this.elements.dialogueOptions.empty();

        if (convNode.options && convNode.options.length > 0) {
            convNode.options.forEach((opt, idx) => {
                // Check requirements
                let disabled = false;
                if (opt.requires) {
                    const reqs = Array.isArray(opt.requires) ? opt.requires : [opt.requires];
                    if (!reqs.every(r => State.hasFlag(r))) {
                        disabled = true;
                    }
                }

                const btn = $('<button>', {
                    class: `horror-btn-dialogue ${opt.cssClass || ''} ${disabled ? 'btn-disabled' : ''}`,
                    html: `&gt; ${opt.label}`,
                    disabled: disabled
                });

                if (!disabled) {
                    btn.on('click', () => {
                        const res = npc.conversation.getNextDialogue(opt.id);
                        if (res.error) return;

                        // Log if the option has a log entry
                        if (opt.log) {
                            State.addLogEntry('note', opt.log.text, { icon: opt.log.icon });
                        }

                        // Play option audio
                        if (opt.audio && this.ui.audio) {
                            this.ui.audio.playSFXByKey(opt.audio, { volume: 0.6 });
                        }
                        if (res.audio && res.audio !== opt.audio && this.ui.audio) {
                            this.ui.audio.playSFXByKey(res.audio, { volume: 0.6 });
                        }

                        if (res.end) {
                            this.ui.showFeedback('FIN DE DIÁLOGO', 'green');
                            this.elements.dialogueOptions.empty();
                            if (res.message) {
                                const parsedMsg = parseDialogueMarkup(res.message);
                                this.typingEngine.typeText(this.elements.dialogue.find('.npc-text'), parsedMsg, 18);
                            }
                            this.ui.updateInspectionTools();
                            return;
                        }

                        // Render next node
                        this.update(npc);
                        if (State.paranoia > 70) this.ui.applyVHS(0.6, 600);
                        this.ui.updateInspectionTools();
                    });
                }

                this.elements.dialogueOptions.append(btn);
            });
        }

        // Omit option
        if (!npc.optOut && npc.scanCount === 0) {
            const optionsCount = convNode.options?.length || 0;
            const spanClass = optionsCount === 2 ? 'col-span-2' : '';
            
            const omitBtn = $('<button>', {
                class: `horror-btn-dialogue option-omit w-full mt-2 ${spanClass}`,
                html: '&gt; Omitir por diálogo'
            });
            omitBtn.on('click', () => {
                this.handleOmitTest(npc);
                npc.dialogueStarted = true;
            });
            this.elements.dialogueOptions.append(omitBtn);
        }
    }

    handleOmitTest(npc) {
        if (!npc) return;
        npc.optOut = true;
        npc.scanCount = 99; 
        
        if (!npc.history) npc.history = [];
        npc.history.push({ 
            text: 'Test omitido voluntariamente mediante protocolo de diálogo.', 
            type: 'warning' 
        });

        this.ui.showFeedback('TEST OMITIDO: SIN EVIDENCIA MÉDICA', 'yellow');
        this.ui.updateInspectionTools();
        this.elements.dialogueOptions.find('.option-omit').addClass('hidden');
        this.elements.dialogueOptions.empty();
        
        this.ui.updateStats(State.paranoia, State.cycle, State.dayTime, State.config.dayLength, State.currentNPC);
    }
}
