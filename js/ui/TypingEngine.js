/**
 * TypingEngine handles the typewriter effect for dialogue text.
 * It supports plain text and parsed HTML markup with instant elements.
 */
export class TypingEngine {
    constructor(audio = null) {
        this.audio = audio;
        this.typingTimer = null;
    }

    /**
     * Types text into an element with a typewriter effect.
     * @param {jQuery} el - The target element.
     * @param {string} text - The text (or HTML) to type.
     * @param {number} speed - The speed in ms per character.
     */
    typeText(el, text, speed = 20) {
        // Cancel any ongoing typing
        this.cancel();

        // Helper to detect if the incoming text is HTML
        const containsHtml = /<[^>]+>/.test(text);

        // Start typing SFX
        if (this.audio) this.audio.playSFXByKey('ui_dialogue_type', { volume: 0.4 });

        if (!containsHtml) {
            this._typePlainText(el, text, speed);
        } else {
            this._typeHtml(el, text, speed);
        }
    }

    cancel() {
        if (this.typingTimer) {
            cancelAnimationFrame(this.typingTimer);
            this.typingTimer = null;
        }
    }

    _stopSfx() {
        if (this.audio?.channels?.sfx) {
            try { 
                this.audio.channels.sfx.pause(); 
            } catch (e) { 
                // Ignore audio errors in tests or edge cases
            }
        }
    }

    _typePlainText(el, text, speed) {
        el.text('');
        let i = 0;
        const minStep = Math.max(5, speed);
        const start = performance.now();
        
        const step = (now) => {
            const elapsed = now - start;
            const shouldBe = Math.floor(elapsed / minStep);
            while (i <= shouldBe && i < text.length) {
                el.text(el.text() + text.charAt(i));
                i++;
            }
            if (i >= text.length) {
                this.typingTimer = null;
                this._stopSfx();
                return;
            }
            this.typingTimer = requestAnimationFrame(step);
        };
        this.typingTimer = requestAnimationFrame(step);
    }

    _typeHtml(el, text, speed) {
        let tokens = this._buildTokens(text);
        
        // Now iterate tokens and animate
        let acc = '';
        // Flush leading instant tokens and open tags immediately
        while (tokens.length && (tokens[0].type === 'instant' || tokens[0].type === 'open')) {
            const t0 = tokens.shift();
            acc += t0.html;
        }
        el.html(acc);

        let tokenIdx = 0;
        let charIdx = 0;
        const minStep = Math.max(5, speed);
        const start = performance.now();

        const nextFrame = (now) => {
            while (tokenIdx < tokens.length) {
                const t = tokens[tokenIdx];
                
                if (t.type === 'instant') {
                    acc += t.html;
                    tokenIdx++;
                    charIdx = 0;
                    el.html(acc);
                    continue; 
                }
                
                if (t.type === 'open' || t.type === 'close') {
                    acc += t.html;
                    tokenIdx++;
                    continue;
                }
                
                if (t.type === 'text') {
                    const elapsed = now - start;
                    const shouldBe = Math.floor(elapsed / minStep);
                    while (charIdx <= shouldBe && charIdx < t.value.length) {
                        acc += t.value.charAt(charIdx);
                        charIdx++;
                    }
                    el.html(acc);
                    if (charIdx >= t.value.length) {
                        tokenIdx++; 
                        charIdx = 0; 
                        continue;
                    }
                    break;
                }

                if (t.type === 'rumor') {
                    acc += `<span class="rumor" style="opacity:0; transition:opacity 360ms ease">${t.text}</span>`;
                    el.html(acc);
                    const fadeIndex = tokenIdx;
                    setTimeout(() => {
                        const cur = el.html();
                        el.html(cur.replace('opacity:0', 'opacity:1'));
                        setTimeout(() => {
                            tokenIdx = fadeIndex + 1;
                            requestAnimationFrame(nextFrame);
                        }, 380);
                    }, 10);
                    return;
                }
            }

            if (tokenIdx >= tokens.length) {
                this.typingTimer = null;
                this._stopSfx();
                return;
            }

            this.typingTimer = requestAnimationFrame(nextFrame);
        };

        this.typingTimer = requestAnimationFrame(nextFrame);
    }

    _buildTokens(text) {
        const tokens = [];
        
        if (typeof document !== 'undefined' && document.createElement) {
            try {
                const cont = document.createElement('div');
                cont.innerHTML = text;
                const buildFromNode = (node) => {
                    const nodeTokens = [];
                    if (node.nodeType === 3) {
                        nodeTokens.push({ type: 'text', value: node.textContent });
                    } else if (node.nodeType === 1) {
                        const cls = node.getAttribute('class') || '';
                        if (/\baction\b/.test(cls) || /npc-epithet|epithet/.test(cls)) {
                            nodeTokens.push({ type: 'instant', html: node.outerHTML });
                        } else {
                            let openTag = `<${node.tagName.toLowerCase()}`;
                            for (const attr of node.attributes) {
                                openTag += ` ${attr.name}="${attr.value}"`;
                            }
                            openTag += '>';
                            nodeTokens.push({ type: 'open', html: openTag });
                            for (const child of node.childNodes) {
                                nodeTokens.push(...buildFromNode(child));
                            }
                            nodeTokens.push({ type: 'close', html: `</${node.tagName.toLowerCase()}>` });
                        }
                    }
                    return nodeTokens;
                };
                for (const child of cont.childNodes) {
                    tokens.push(...buildFromNode(child));
                }
                return tokens;
            } catch (e) {
                // Fallback handled below
            }
        }

        // Node environment or fallback regex
        const parts = text.split(/(<span[^>]*>.*?<\/span>)/g).filter(Boolean);
        for (const p of parts) {
            if (/^<span/.test(p)) {
                if (/class=\".*?(action|npc-epithet|epithet).*?\"/.test(p)) {
                    tokens.push({ type: 'instant', html: p });
                } else {
                    const innerMatch = p.match(/^<span[^>]*>([\s\S]*?)<\/span>$/);
                    const open = p.replace(innerMatch[1], '').replace(/<\/span>$/, '');
                    tokens.push({ type: 'open', html: open });
                    tokens.push({ type: 'text', value: innerMatch[1] });
                    tokens.push({ type: 'close', html: '</span>' });
                }
            } else {
                tokens.push({ type: 'text', value: p });
            }
        }
        return tokens;
    }
}
