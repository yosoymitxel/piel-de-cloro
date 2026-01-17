export class BaseComponent {
    /**
     * @param {string} containerId - ID of the container element
     * @param {object} config - Configuration options
     */
    constructor(containerId, config = {}) {
        this.containerId = containerId;
        this.config = config;
        // Support for flexible selectors (IDs, classes, etc)
        const selector = (containerId.startsWith('#') || containerId.startsWith('.') || containerId.includes('['))
            ? containerId
            : `#${containerId}`;
        this.container = $(selector);
        this.isRendered = false;
    }

    /**
     * Renders the component structure
     */
    render() {
        if (!this.container.length) return;
        this.container.html(this.getTemplate());
        this.isRendered = true;
        this.postRender();
    }

    /**
     * Returns HTML string for the component
     * @returns {string}
     */
    getTemplate() {
        return '<div>Base Component</div>';
    }

    /**
     * Logic to execute after rendering (adding listeners, etc)
     */
    postRender() {
        // Override me
    }

    /**
     * Updates the component state
     * @param {object} state - Global state object
     */
    update(state) {
        // Override me
    }

    show() {
        this.container.removeClass('hidden');
    }

    hide() {
        this.container.addClass('hidden');
    }
}
