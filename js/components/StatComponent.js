import { BaseComponent } from './BaseComponent.js';

export class StatComponent extends BaseComponent {
    constructor(containerId, config) {
        super(containerId, config);
        // config expected: { label: 'PARA', icon: 'fa-brain', colorClass: 'text-chlorine-light', getValue: (state) => ... }
    }

    getTemplate() {
        const { label, icon, colorClass, title } = this.config;
        return `
            <div class="hud-component stat-component" title="${title || ''}">
                <div class="stat-header">
                    <span class="stat-label">${label}</span>
                </div>
                <div class="stat-body">
                    <div class="stat-icon-container">
                         <i class="fa-solid ${icon} stat-icon ${colorClass}"></i>
                    </div>
                    <div class="stat-value-container">
                        <span class="stat-value ${colorClass}">---</span>
                    </div>
                </div>
                <div class="stat-bar-bg">
                    <div class="stat-bar-fill ${colorClass}"></div>
                </div>
            </div>
        `;
    }

    update(state) {
        if (!this.isRendered) this.render();

        const value = this.config.getValue(state);
        const displayValue = this.config.formatValue ? this.config.formatValue(value) : value;

        const valEl = this.container.find('.stat-value');
        const barEl = this.container.find('.stat-bar-fill');

        valEl.text(displayValue);

        // Optional: Update bar width if max value is provided
        if (this.config.maxValue) {
            const percent = Math.min(100, Math.max(0, (value / this.config.maxValue) * 100));
            barEl.css('width', `${percent}%`);
        }

        // Handle Thresholds (Critical / Warning)
        if (this.config.thresholds) {
            this.applyThresholds(value, valEl, barEl);
        }
    }

    applyThresholds(value, valEl, barEl) {
        // Reset base classes
        const baseColor = this.config.colorClass;
        valEl.removeClass().addClass(`stat-value ${baseColor}`);
        barEl.removeClass().addClass(`stat-bar-fill ${baseColor}`);

        // Check thresholds
        // Expected config.thresholds = [{ val: 20, color: 'text-alert', barColor: 'bg-alert', direction: 'ascending'|'descending' }]
        // Example Paranoia: ascending (higher is bad)
        // Example Sanity: descending (lower is bad)

        for (const t of this.config.thresholds) {
            const condition = this.config.direction === 'descending' ? value <= t.val : value >= t.val;

            if (condition) {
                if (t.color) valEl.removeClass(baseColor).addClass(t.color);
                if (t.barColor) barEl.removeClass(baseColor.replace('text-', 'bg-')).addClass(t.barColor); // Naive replacement, but workable

                if (t.animate) valEl.addClass('animate-pulse');
                break; // Apply first matching threshold (order matters in config)
            }
        }
    }
}
