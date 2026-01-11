export class EffectsRenderer {
    constructor(audio = null) {
        this.audio = audio;
    }

    applyVHS(intensity = 0.6, duration = 1000) {
        const target = $('#screen-game').find('main.vhs-target');
        target.css('--vhs-intensity', intensity);
        target.css('--vhs-duration', `${duration}ms`);
        target.addClass('vhs-active');
        if (this.audio) this.audio.playSFXByKey('vhs_flicker', { volume: 0.5 });
        setTimeout(() => target.removeClass('vhs-active'), duration);
    }

    triggerGlitch(container) {
        if (!container || (container.jquery && container.length === 0)) return;
        container.css({
            transform: 'skewX(10deg)',
            filter: 'invert(1)'
        });
        setTimeout(() => {
            container.css({
                transform: 'none',
                filter: 'none'
            });
        }, 150);
    }

    applyBlackout(ms = 1200) {
        const overlay = $('<div>', { 
            class: 'blackout', 
            css: { 
                position: 'fixed', 
                inset: 0, 
                background: '#000', 
                opacity: 0.0, 
                pointerEvents: 'none', 
                zIndex: 9999 
            } 
        });
        $('body').append(overlay);
        const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const step = (now) => {
            const t = Math.min(1, (now - start) / ms);
            overlay.css('opacity', t < 0.5 ? t * 0.8 : (1 - t) * 1.6);
            if (t < 1) requestAnimationFrame(step);
            else overlay.remove();
        };
        requestAnimationFrame(step);
    }

    flashInfectionEffect(avatar, colors) {
        if (!avatar || (avatar.jquery && avatar.length === 0)) return;
        
        const head = avatar.find('.avatar-head');
        const eyes = avatar.find('.eye');
        const origHeadColor = head.css('background-color');
        const origEyeColor = eyes.css('background-color');
        
        avatar.css({ filter: 'hue-rotate(90deg) contrast(130%)' });
        head.css('background-color', colors.chlorine);
        eyes.css('background-color', '#ff0000');
        
        if (this.audio) this.audio.playSFXByKey('morgue_reveal_infected', { volume: 0.5 });
        
        setTimeout(() => {
            head.css('background-color', origHeadColor);
            eyes.css('background-color', origEyeColor);
            avatar.css({ filter: 'none' });
        }, 120);
    }
}
