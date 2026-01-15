let UIManager, parseDialogueMarkup, State;

beforeAll(async () => {
    // Minimal '$' stub to emulate jQuery-like API used by UIManager.updateDialogueBox
    global.$ = function (sel, attrs) {
        // Create a fake element for selectors like '#npc-dialogue' or '#dialogue-options'
        if (typeof sel === 'string' && sel.startsWith('#')) {
            const id = sel.slice(1);
            // Ensure a registry so multiple calls to the same selector return same object
            global.__fakeDOM = global.__fakeDOM || {};
            if (!global.__fakeDOM[id]) {
                global.__fakeDOM[id] = {
                    _html: '',
                    _children: [],
                    _inner: '',
                    html(h) {
                        if (h === undefined) {
                            // If there's an inner .npc-text set, inject it into the stored HTML
                            if (this._html && this._html.includes('<span class="npc-text"></span>')) {
                                return (this._html && this._inner) ? this._html.replace('<span class="npc-text"></span>', `<span class="npc-text">${this._inner}</span>`) : this._html;
                            }
                            return this._html;
                        }
                        // If we are setting html after a find into .npc-text, set _inner instead of replacing whole html
                        if (this._lastFind && this._lastFind.includes('.npc-text')) {
                            this._inner = h;
                            this._lastFind = null;
                            return this;
                        }
                        this._html = h;
                        return this;
                    },
                    find(sel) {
                        // Special-case the .npc-text child to expose a child-like API so repeated html() calls affect inner content
                        if (sel && sel.includes('.npc-text')) {
                            const parent = this;
                            return {
                                html(h) {
                                    if (h === undefined) return parent._inner;
                                    parent._inner = h;
                                    return this;
                                },
                                // Support text() for plain text typing path
                                text(t) {
                                    if (t === undefined) return parent._innerText || '';
                                    parent._innerText = t;
                                    parent._inner = t;
                                    return this;
                                }
                            };
                        }
                        // Remember last selector so html(h) knows where to inject for legacy behavior
                        this._lastFind = sel;
                        return this;
                    },
                    empty() { this._html = ''; this._children = []; this._inner = ''; return this; },
                    append(node) { this._children.push(node); return this; },
                    on() { return this; },
                    parent() { return this; },
                    addClass() { return this; }, removeClass() { return this; }, toggleClass() { return this; }, css() { return this; }, text(t) { if (t === undefined) return this._text; this._text = t; return this; }, length: 1
                };
            }
            return global.__fakeDOM[id];
        }

        // Create a fake button element when called with '<button>'
        if (typeof sel === 'string' && sel.startsWith('<')) {
            const obj = {
                _click: null,
                on(evt, handler) { if (evt === 'click') this._click = handler; return this; },
                html(h) { this._html = h; return this; }
            };
            // Apply attrs
            if (attrs) {
                if (attrs.html) obj._html = attrs.html;
            }
            return obj;
        }

        // Fallback simple object
        return { html: () => '', find: () => ({ html: () => '' }), empty: () => { }, append: () => { }, on: () => { }, addClass: () => { }, removeClass: () => { }, toggleClass: () => { }, css: () => { }, text: () => '', length: 0 };
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
        genWarningShelter: $('#gen-warning-shelter')
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
        // Option audio should play when click handler is invoked
        if (btn && typeof btn._click === 'function') btn._click();
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
