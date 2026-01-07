let UIManager, GeneratorManager, State;

beforeAll(async () => {
    // Minimal $ stub that returns simple objects with class/attr tracking
    global.__fakeDOM = {};

    function makeEl(id) {
        if (!global.__fakeDOM[id]) {
            global.__fakeDOM[id] = {
                _classes: new Set(),
                _attrs: {},
                _css: {},
                addClass(name) { name.split(/\s+/).forEach(n => n && this._classes.add(n)); return this; },
                removeClass(name) { if (!name) { this._classes.clear(); return this; } name.split(/\s+/).forEach(n => this._classes.delete(n)); return this; },
                toggleClass(name, cond) { if (cond === undefined) { if (this._classes.has(name)) this._classes.delete(name); else this._classes.add(name); } else { if (cond) this.addClass(name); else this.removeClass(name); } return this; },
                attr(k, v) { if (v === undefined) return this._attrs[k]; this._attrs[k] = v; return this; },
                removeAttr(k) { delete this._attrs[k]; return this; },
                css(k, v) { if (typeof k === 'string') { this._css[k] = v; } else Object.assign(this._css, k); return this; },
                prop() { return this; },
                html() { return this; },
                find() { return { css: () => this }; },
                length: 1
            };
        }
        return global.__fakeDOM[id];
    }

    global.$ = function (sel, attrs) {
        if (typeof sel === 'string' && sel.startsWith('#')) {
            const id = sel.slice(1);
            return makeEl(id);
        }
        // When called like $('<div>', {...}) return a minimal element object
        if (typeof sel === 'string' && sel.startsWith('<')) {
            const el = {
                _children: [],
                _classes: new Set(),
                _css: {},
                addClass(name) { name.split(/\s+/).forEach(n => n && this._classes.add(n)); return this; },
                removeClass(name) { if (!name) { this._classes.clear(); return this; } name.split(/\s+/).forEach(n => this._classes.delete(n)); return this; },
                append(node) { this._children.push(node); return this; },
                on() { return this; },
                css(k, v) { if (typeof k === 'string') { this._css[k] = v; } else Object.assign(this._css, k); return this; },
                find() { return { css: () => this }; },
                length: 1
            };
            // apply attributes if provided
            if (attrs && attrs.css) el.css(attrs.css);
            return el;
        }
        // Fallback simple object
        return { addClass() { return this; }, removeClass() { return this; }, toggleClass() { return this; }, css() { return this; }, find() { return this; }, length: 0 };
    };

    ({ UIManager } = await import('../js/UIManager.js'));
    ({ GeneratorManager } = await import('../js/GeneratorManager.js'));
    ({ State } = await import('../js/State.js'));
});

beforeEach(() => {
    global.__fakeDOM = {};
});

test('renderSecurityRoom marks nav-room warning while unsecured items exist and clears when secured', () => {
    const ui = Object.create(UIManager.prototype);
    ui.setNavItemStatus = jest.fn();

    // Two items, one secured and one unsecured
    const items = [{ type: 'puerta', secured: true }, { type: 'ventana', secured: false }];

    // Call renderSecurityRoom
    ui.elements = { securityGrid: { empty() { }, append() { } }, securityCount: { text() { } } };
    UIManager.prototype.renderSecurityRoom.call(ui, items, (idx, item) => {
        // Simulate toggling securing
        items[idx].secured = true;
    });

    // After initial render, since there is one unsecured, we should have asked to set nav-room to warning
    expect(ui.setNavItemStatus).toHaveBeenCalledWith('nav-room', 3);

    // Simulate securing the second item and re-render
    items[1].secured = true;
    ui.setNavItemStatus.mockClear();
    UIManager.prototype.renderSecurityRoom.call(ui, items, null);
    expect(ui.setNavItemStatus).toHaveBeenCalledWith('nav-room', null);
});

test('Generator updateToggleButton applies btn-off/btn-on and sets button color and icon color', () => {
    const ui = Object.create(UIManager.prototype);
    ui.colors = { safe: '#1aff1a', off: '#333333' };

    // Ensure btn exists in fake DOM
    const btn = $('#btn-gen-toggle');

    const gm = new GeneratorManager(ui, null);

    const state = { generator: { isOn: false, blackoutUntil: 0, mode: 'normal', power: 20, maxModeCapacityReached: 2, overclockCooldown: 0 } };

    // Call updateToggleButton with generator OFF
    gm.updateToggleButton(state);

    expect(btn._classes.has('btn-off')).toBe(true);
    expect(btn._css.color).toBe('#000');

    // Now set generator ON and re-invoke
    state.generator.isOn = true;
    gm.updateToggleButton(state);
    expect(btn._classes.has('btn-on')).toBe(true);
    expect(btn._css.color).toBe('#000');
});