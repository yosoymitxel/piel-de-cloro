/**
 * NavManager handles the state and visual indicators of the sidebar navigation.
 */
export class NavManager {
    constructor() {
        this.navItems = ['nav-guard', 'nav-room', 'nav-shelter', 'nav-morgue', 'nav-generator', 'btn-open-log'];
    }

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

    clearAllNavStatuses() {
        this.navItems.forEach(id => this.setNavItemStatus(id, null));
    }

    setNavLocked(locked) {
        this.navItems.forEach(id => {
            const btn = $(`#${id}`);
            if (locked) btn.addClass('nav-locked').prop('disabled', true);
            else btn.removeClass('nav-locked').prop('disabled', false);
        });
    }
}
