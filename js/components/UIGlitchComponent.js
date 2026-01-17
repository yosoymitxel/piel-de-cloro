import { BaseComponent } from './BaseComponent.js';

export class UIGlitchComponent extends BaseComponent {
    constructor(uiManager) {
        // Pass a dummy selector or 'body' since this component affects multiple elements
        super('body');
        this.uiManager = uiManager;
        // Elements will be accessed lazily or checked before use
        this.elements = {};
        this.glitchChars = ['†', '×', 'ø', '∆', '§', '?', '!', '#', '%'];
    }

    update(state) {
        // Refresh elements reference in case they were updated/rendered late
        this.elements = {
            workstation: $('.workstation-status-panel'),
            console: $('.center-console'),
            cycle: this.uiManager.elements ? this.uiManager.elements.cycle : null
        };

        const paranoia = state.paranoia;
        const sanity = state.sanity;

        if (paranoia > 60 || sanity < 40) {
            const intensity = Math.max((paranoia - 60) / 40, (40 - sanity) / 40);
            this.triggerHallucinations(intensity);
        }

        // Global Class Effects
        if (sanity < 30) {
            $('body').addClass('sanity-shaken');
        } else {
            $('body').removeClass('sanity-shaken');
        }

        if (paranoia > 80) {
            $('body').addClass('paranoia-vision');
            // Trigger randomness for the glitch effect on the vision
            if (Math.random() > 0.5) $('body').addClass('vision-active');
            else $('body').removeClass('vision-active');
        } else {
            $('body').removeClass('paranoia-vision vision-active');
        }
    }

    triggerHallucinations(intensity) {
        if (!this.elements.cycle) return; // Safety check

        // 1. Border Glitches
        if (Math.random() < 0.05 * intensity) {
            this.elements.workstation.addClass('glitch-border-red');
            setTimeout(() => this.elements.workstation.removeClass('glitch-border-red'), 150);
        }

        // 2. Shake/Transform
        if (Math.random() < 0.05 * intensity) {
            const x = (Math.random() * 4 - 2) * intensity;
            const y = (Math.random() * 4 - 2) * intensity;
            this.elements.console.css('transform', `translate(${x}px, ${y}px)`);
            setTimeout(() => this.elements.console.css('transform', 'none'), 100);
        }

        // 3. Text Corruption
        if (Math.random() < 0.02 * intensity) {
            const originalText = this.elements.cycle.text();
            const corrupted = this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)] + 'ERROR' + this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)];
            this.elements.cycle.text(corrupted);
            // Color flash
            this.elements.cycle.css('color', 'red');
            setTimeout(() => {
                this.elements.cycle.text(originalText);
                this.elements.cycle.css('color', '');
            }, 200);
        }

        // 4. Ghost Elements (New)
        // Occasionally show a "ghost" element that disappears quickly
        if (Math.random() < 0.01 * intensity) {
            const ghost = $('<div class="ghost-overlay fixed inset-0 bg-black/50 z-50 pointer-events-none flex items-center justify-center"><h1 class="text-6xl text-red-600 font-bold opacity-50">NO MIRES</h1></div>');
            $('body').append(ghost);
            setTimeout(() => ghost.remove(), 50 + Math.random() * 100);
        }
    }
}
