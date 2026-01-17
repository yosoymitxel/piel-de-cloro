export class VisualRoomInterface {
    constructor(containerId = 'visual-room-overlay') {
        this.containerId = containerId;
        this.container = $(`#${containerId}`);
        if (!this.container.length) {
            this.container = $(`<div id="${containerId}" class="visual-room-overlay hidden"></div>`);
            $('body').append(this.container);
        }
    }

    /**
     * Opens the visual interface with provided content
     * @param {string} htmlContent - HTML string to render
     * @param {object} options - Configuration options
     */
    open(htmlContent, options = {}) {
        this.container.html(htmlContent).removeClass('hidden');

        if (options.onRender && typeof options.onRender === 'function') {
            options.onRender(this.container);
        }

        // Add close button if requested
        if (options.showClose) {
            const closeBtn = $(`<button class="absolute top-4 right-4 text-white hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-2xl"></i></button>`);
            closeBtn.on('click', () => this.close());
            this.container.append(closeBtn);
        }
    }

    /**
     * Closes the visual interface
     */
    close() {
        this.container.addClass('hidden').empty();
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    }

    /**
     * Override this to implement custom logic
     */
    onClose(callback) {
        this.onCloseCallback = callback;
    }
}
