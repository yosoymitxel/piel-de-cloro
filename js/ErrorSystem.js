/**
 * ErrorSystem handles global error capturing and display.
 */
export class ErrorSystem {
    constructor() {
        this.errors = [];
        this.panel = $('#error-log-panel');
        this.content = $('#error-log-content');
        this.closeBtn = $('#btn-close-error-log');

        this.init();
    }

    init() {
        // Global error handler
        window.onerror = (message, source, lineno, colno, error) => {
            this.logError({
                message,
                source: source ? source.split('/').pop() : 'unknown',
                lineno,
                colno,
                stack: error ? error.stack : null,
                timestamp: new Date().toLocaleTimeString()
            });
            return false; // Let it fall through to console
        };

        // Promise rejection handler
        window.onunhandledrejection = (event) => {
            this.logError({
                message: `Unhandled Rejection: ${event.reason}`,
                source: 'Promise',
                timestamp: new Date().toLocaleTimeString()
            });
        };

        // Close button
        this.closeBtn.on('click', () => {
            this.panel.addClass('hidden');
        });

        console.info('[ErrorSystem] Inicializado. Capturando errores globales.');
    }

    logError(err) {
        this.errors.push(err);
        
        const errorHtml = `
            <div class="border-l-2 border-alert pl-2 py-1 bg-alert/5 animate__animated animate__headShake">
                <div class="flex justify-between text-[10px] opacity-50 mb-1">
                    <span>${err.source}:${err.lineno || '?'}</span>
                    <span>${err.timestamp}</span>
                </div>
                <div class="text-alert font-bold">${err.message}</div>
                ${err.stack ? `<div class="mt-1 text-[9px] opacity-40 whitespace-pre-wrap overflow-x-hidden">${this.formatStack(err.stack)}</div>` : ''}
            </div>
        `;

        this.content.prepend(errorHtml);
        this.panel.removeClass('hidden');

        // Limit number of errors shown
        if (this.errors.length > 20) {
            this.content.children().last().remove();
        }
    }

    formatStack(stack) {
        // Simplify stack trace for display
        return stack.split('\n').slice(0, 3).join('\n');
    }
}

// Singleton instance
export const errorSystem = new ErrorSystem();
