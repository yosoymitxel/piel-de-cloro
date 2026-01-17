let UIManager, parseDialogueMarkup, State;

beforeAll(async () => {
    // Minimal '$' stub to emulate jQuery-like API used by UIManager.updateDialogueBox
    global.$ = function (sel) {
        if (typeof sel === 'object' && sel !== null) {
            // If it already has jQuery-like methods (fake element), return it
            if (typeof sel.on === 'function') return sel;
            // Otherwise wrap it (e.g. document, window)
            return {
                on: jest.fn().mockReturnThis(),
                off: jest.fn().mockReturnThis(),
                ready: jest.fn(cb => cb()),
                trigger: jest.fn(),
                0: sel,
                length: 1
            };
        }
        // Simple mock for jQuery attributes
        if (arguments.length > 1 && typeof arguments[1] === 'object' && typeof sel === 'string' && sel.trim().startsWith('<')) {
            const attrs = arguments[1];
            const obj = {
                _html: attrs.html || '',
                _click: null,
                html(h) { if (h === undefined) return this._html; this._html = h; return this; },
                on(evt, h) { if (evt === 'click') this._click = h; return this; },
                off() { return this; },
                addClass() { return this; },
                removeClass() { return this; },
                addClass() { return this; },
                removeClass() { return this; },
                data(k) {
                    if (k === 'index' && attrs['data-index'] !== undefined) return attrs['data-index'];
                    return 0;
                },
                attr(k) { return attrs[k] || ''; },
                is() { return true; } // Added mock
            };
            return obj;
        }

        const createFakeElement = (sel) => {
            const key = sel.replace(/[#.]/g, '');
            global.__fakeDOM = global.__fakeDOM || {};
            if (!global.__fakeDOM[key]) {
                global.__fakeDOM[key] = {
                    _html: '',
                    _children: [],
                    _inner: '',
                    _text: '',
                    is() { return true; }, // Added mock
                    html(h) {
                        if (h === undefined) {
                            if (this._html && this._html.includes('<span class="npc-text"></span>')) {
                                return (this._html && this._inner) ? this._html.replace('<span class="npc-text"></span>', `<span class="npc-text">${this._inner}</span>`) : this._html;
                            }
                            return this._html;
                        }
                        if (this._lastFind && this._lastFind.includes('.npc-text')) {
                            this._inner = h;
                            this._lastFind = null;
                            return this;
                        }
                        this._html = h;
                        return this;
                    },
                    find(f) {
                        if (f && f.includes('.npc-text')) {
                            const parent = this;
                            return {
                                html(h) { if (h === undefined) return parent._inner; parent._inner = h; return this; },
                                text(t) { if (t === undefined) return parent._innerText || ''; parent._innerText = t; parent._inner = t; return this; }
                            };
                        }
                        this._lastFind = f;
                        return this;
                    },
                    empty() { this._html = ''; this._children = []; this._inner = ''; return this; },
                    append(node) { this._children.push(node); return this; },
                    append(node) { this._children.push(node); return this; },
                    on(evt, arg2, arg3) {
                        // Support delegation: on('click', selector, handler) or on('click', handler)
                        const handler = typeof arg2 === 'function' ? arg2 : arg3;
                        if (evt === 'click' && typeof handler === 'function') this._click = handler;
                        return this;
                    },
                    off() { return this; },
                    parent() { return this; },
                    addClass() { return this; },
                    removeClass() { return this; },
                    toggleClass() { return this; },
                    css() { return this; },
                    prop() { return this; },
                    eq() { return this; },
                    eq() { return this; },
                    text(t) { if (t === undefined) return this._text; this._text = t; return this; },
                    data() { return 0; },
                    attr() { return ''; },
                    length: 1
                };
            }
            return global.__fakeDOM[key];
        };

        if (typeof sel === 'string' && (sel.startsWith('#') || sel.startsWith('.'))) {
            return createFakeElement(sel);
        }

        if (typeof sel === 'string' && sel.trim().startsWith('<')) {
            return {
                on(e, h) { if (e === 'click') this._click = h; return this; },
                html(h) { this._html = h; return this; },
                _html: '',
                addClass() { return this; },
                removeClass() { return this; },
                data() { return 0; }, // Default return index 0
                attr() { return ''; }
            };
        }

        // Expanded fallback to support chaining
        const fallback = {
            html: () => '',
            find: () => fallback,
            empty: () => fallback,
            append: () => fallback,
            on: () => fallback,
            addClass: () => fallback,
            removeClass: () => fallback,
            toggleClass: () => fallback,
            css: () => fallback,
            prop: () => fallback,
            eq: () => fallback,
            text: () => '',
            off: () => fallback,
            data: () => 0,
            attr: () => '',
            length: 0
        };
        return fallback;
    };

    ({ UIManager } = await import('../js/UIManager.js'));
    ({ parseDialogueMarkup } = await import('../js/markup.js'));
    ({ State } = await import('../js/State.js'));

    // Stub window and game to avoid ReferenceError in UIManager click handlers
    global.window = global;
    global.window.game = {
        checkSecurityDegradation: jest.fn()
    };
});

beforeEach(() => {
    // Reset fake DOM
    global.__fakeDOM = {};
    State.reset();

    // Minimal animation frame polyfill for Node
    // Keep async RAF but override UIManager.typeText to render immediately in tests
    if (typeof global.requestAnimationFrame === 'undefined') {
        global.requestAnimationFrame = (cb) => setTimeout(() => cb(typeof performance !== 'undefined' ? performance.now() : Date.now()), 0);
        global.cancelAnimationFrame = (id) => clearTimeout(id);
    }

    // Mock elements that UIManager expects
    const ui = new UIManager();
    ui.elements = {
        paranoia: $('#stat-paranoia'),
        cycle: $('#stat-cycle'),
        time: $('#stat-time'),
        dialogue: $('#npc-dialogue'),
        genWarningGame: $('#gen-warning-game'),
        genWarningShelter: $('#gen-warning-shelter'),
        crtMonitor: $('#crt-monitor')
    };
    global.__uiInstance = ui;

    // Make typing deterministic in tests by overriding the heavy animation path
    // Save original to restore if needed
    if (!UIManager.prototype._typeText_original) {
        UIManager.prototype._typeText_original = UIManager.prototype.typeText;
    }
    UIManager.prototype.typeText = function (el, text) {
        // Simple immediate rendering: if HTML, set as HTML; else set plain text
        const containsHtml = /<[^>]+>/.test(text);
        if (containsHtml && el && typeof el.html === 'function') el.html(text);
        else if (el && typeof el.text === 'function') el.text(typeof text === 'string' ? text : (text || ''));
        // Ensure typing sfx stops if present
        if (this.audio && this.audio.channels && this.audio.channels.sfx && typeof this.audio.channels.sfx.pause === 'function') {
            try { this.audio.channels.sfx.pause(); } catch (e) { }
        }
    };

});

test('UIManager renders dialogue markup and plays node audio (no real DOM)', async () => {
    const ui = global.__uiInstance;
    const audioStub = { playSFXByKey: jest.fn(), stopLore: jest.fn() };
    ui.audio = audioStub;

    // Stub updateStats to avoid paranoia parent issues in this simple test
    ui.updateStats = jest.fn();

    ui.elements = {
        dialogue: $('#npc-dialogue'),
        dialogueOptions: $('#dialogue-options'),
        feedback: $('#inspection-feedback')
    };

    const npc = {
        name: 'UI_NPC',
        getDisplayName: () => 'UI_NPC',
        conversation: {
            getCurrentNode: () => ({ id: 't1', text: '*Se arrastra* "Hola" Se dice que alguien habló.', audio: 'ui_node_audio', options: [{ id: 'o1', label: 'Opt1', audio: 'opt_audio', next: null }] }),
            history: [],
            getNextDialogue: jest.fn().mockReturnValue({ end: true, audio: 'result_audio', message: 'Fin' })
        }
    };
    State.currentNPC = npc; // Required for handleDialogueOptionClick to work

    await ui.updateDialogueBox(npc);

    // Node audio played on enter
    expect(audioStub.playSFXByKey).toHaveBeenCalledWith('ui_node_audio', expect.any(Object));

    // Markup rendered (check stored HTML). Some parts render asynchronously (typing), so wait a short tick.
    const htmlNow = $('#npc-dialogue').html();
    // action/epithet should be present immediately
    expect(htmlNow.includes('<span class=\"action')).toBe(true);

    // Wait a short tick for speech/rumor wrappers to appear
    return new Promise((res) => setTimeout(() => {
        const html = $('#npc-dialogue').html();
        // DEBUG
        // console.log('DEBUG - #npc-dialogue HTML (after):', html);
        expect(html.includes('<span class=\"speech')).toBe(true);
        expect(html.includes('<span class=\"rumor')).toBe(true);

        // Option button exists in dialogueOptions
        const opts = $('#dialogue-options')._children;
        expect(opts.length).toBeGreaterThan(0);
        // Simulate click on first appended button
        const btn = opts[0];
        // Simulate click via delegation on parent
        const parent = $('#dialogue-options');
        if (typeof parent._click === 'function') {
            // Mock event with currentTarget pointing to button
            const $btn = global.$(btn);
            parent._click({ currentTarget: btn });
        }
        // if (btn && typeof btn._click === 'function') btn._click();
        expect(audioStub.playSFXByKey).toHaveBeenCalledWith('opt_audio', expect.any(Object));
        expect(audioStub.playSFXByKey).toHaveBeenCalledWith('result_audio', expect.any(Object));

        res();
    }, 30));
});


test('Actions show instantly, speeches type, rumors fade; name vs epithet displayed once', (done) => {
    const audioStub = { playSFXByKey: jest.fn(), channels: { sfx: { pause: jest.fn() } } };
    const ui = global.__uiInstance;
    ui.audio = audioStub;
    ui.updateStats = jest.fn(); // avoid nested DOM issues in stub
    ui.elements = {
        dialogue: $('#npc-dialogue'),
        dialogueOptions: $('#dialogue-options'),
        feedback: $('#inspection-feedback')
    };

    const npc = {
        name: 'Ciro Sierra',
        getDisplayName: () => 'Ciro Sierra — Pupilas de Sal',
        conversation: {
            getCurrentNode: () => ({ id: 't2', text: '*Se arrastra* "Hola" *Se agita* "Otra frase" Se dice que alguien habló.', audio: null, options: [] }),
            history: [],
            getNextDialogue: jest.fn()
        }
    };
    State.currentNPC = npc;

    ui.updateDialogueBox(npc);

    // Name header should show only base name
    const html = $('#npc-dialogue').html();
    expect(html.includes('Ciro Sierra')).toBe(true);
    // The epithet should appear inside .npc-text and the base name should NOT be repeated there
    // Extract content specifically inside the .npc-text span
    const dialogHtml = $('#npc-dialogue').html();
    const match = dialogHtml.match(/<span class=\"npc-text\">([\s\S]*?)<\/span>/);
    const inner = match ? match[1] : '';

    expect(inner.includes('Pupilas de Sal')).toBe(true);
    expect(inner.includes('Ciro Sierra')).toBe(false);

    // The action spans should be present (instant epithets/actions are flushed synchronously)
    // but some parts like speech/rumor may take a tick; wait briefly to observe the full rendered content
    setTimeout(() => {
        const htmlNow = $('#npc-dialogue').html();
        const innerNowMatch = htmlNow.match(/<span class=\"npc-text\">([\s\S]*?)<\/span>/);
        const innerNow = innerNowMatch ? innerNowMatch[1] : '';
        console.log('DEBUG after tick inner:', innerNow);
        // Ensure something was rendered inside npc-text and typing sfx was paused
        expect(innerNow.length).toBeGreaterThan(0);
        expect(audioStub.channels.sfx.pause).toHaveBeenCalled();
        done();
    }, 500);
});
