let UIManager;

beforeAll(async () => {
    // Custom fake $ that records classes and attrs for simple assertions
    global.__fakeDOM = global.__fakeDOM || {};

    function makeEl(id) {
        if (!global.__fakeDOM[id]) {
            global.__fakeDOM[id] = {
                _classes: new Set(),
                _attrs: {},
                addClass(name) { name.split(/\s+/).forEach(n => { if (n) this._classes.add(n); }); return this; },
                removeClass(name) { if (!name) { this._classes.clear(); return this; } name.split(/\s+/).forEach(n => this._classes.delete(n)); return this; },
                attr(k, v) { if (v === undefined) return this._attrs[k]; this._attrs[k] = v; return this; },
                removeAttr(k) { delete this._attrs[k]; return this; },
                find() { return { css() { return this; } }; },
                length: 1
            };
        }
        return global.__fakeDOM[id];
    }

    global.$ = function (sel) {
        if (typeof sel === 'string' && sel.startsWith('#')) {
            const id = sel.slice(1);
            return makeEl(id);
        }
        // Fallback minimal element
        return { addClass() { return this; }, removeClass() { return this; }, attr() { return this; }, removeAttr() { return this; }, length: 0 };
    };

    ({ UIManager } = await import('../js/UIManager.js'));
});

beforeEach(() => {
    global.__fakeDOM = {};
});

test('setNavItemStatus applies per-item class and removes global sidebar status', () => {
    const ui = Object.create(UIManager.prototype);

    // Simulate a pre-existing global sidebar alert
    const sidebar = $('#sidebar-left');
    sidebar.addClass('status-level-4');
    sidebar.attr('data-status', '4');

    // Ensure nav generator exists
    const navGen = $('#nav-generator');

    // Call the helper to mark generator as critical
    ui.setNavItemStatus('nav-generator', 4);

    // Sidebar should have been cleared
    expect($('#sidebar-left')._classes.has('status-level-4')).toBe(false);
    expect($('#sidebar-left')._attrs['data-status']).toBeUndefined();

    // Nav generator should have status-level-4 and data-status set
    expect($('#nav-generator')._classes.has('status-level-4')).toBe(true);
    expect(String($('#nav-generator')._attrs['data-status'])).toBe('4');

    // Clearing the nav item should remove class and attr
    ui.setNavItemStatus('nav-generator', null);
    expect($('#nav-generator')._classes.has('status-level-4')).toBe(false);
    expect($('#nav-generator')._attrs['data-status']).toBeUndefined();
});