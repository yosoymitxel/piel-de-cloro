import { State } from './State.js';

/**
 * ToolsRenderer handles the visual animations for the inspection tools.
 */
export class ToolsRenderer {
    constructor(elements) {
        this.elements = elements;
    }

    _getTargetContainer(container) {
        let target = container || this.elements.npcDisplay;

        // If the container is a string selector, wrap it
        if (typeof target === 'string') {
            target = $(target);
        }

        // If the jQuery object is empty or doesn't exist, try to find it by ID
        if (!target || (target.jquery && target.length === 0)) {
            target = $('#npc-display');
        }

        return target;
    }

    _scrollToAvatar(targetContainer) {
        const resolveElement = () => {
            const el = (targetContainer && targetContainer.length)
                ? targetContainer[0]
                : (typeof targetContainer === 'string' ? document.querySelector(targetContainer) : targetContainer);
            if (!el) return null;
            return el.querySelector ? (el.querySelector('.npc-view-container') || el) : el;
        };

        const scroll = () => {
            const avatar = resolveElement();
            if (!avatar || !avatar.getBoundingClientRect) return;

            // Walk up to the first ancestor that actually scrolls. Walking
            // instead of relying on scrollIntoView avoids dragging inner
            // overflow:hidden avatar frames and works inside the NPC modal.
            let scroller = avatar.parentElement;
            while (scroller && scroller !== document.body && scroller !== document.documentElement) {
                const style = getComputedStyle(scroller);
                if (/(auto|scroll)/.test(style.overflowY) && scroller.scrollHeight > scroller.clientHeight + 2) break;
                scroller = scroller.parentElement;
            }

            const rect = avatar.getBoundingClientRect();
            let margin = 12;

            // On the game screen the header is sticky and paints over the
            // scrolled content. Keep the avatar below it instead of behind it.
            if (scroller && scroller.querySelector) {
                const stickyHeader = scroller.querySelector(':scope > header');
                if (stickyHeader) {
                    const position = getComputedStyle(stickyHeader).position;
                    if (position === 'sticky' || position === 'fixed') {
                        margin += stickyHeader.getBoundingClientRect().height;
                    }
                }
            }

            if (scroller && scroller !== document.body) {
                const frame = scroller.getBoundingClientRect();
                const delta = rect.top - frame.top - margin;
                if (Math.abs(delta) > 8) {
                    try {
                        scroller.scrollTo({ top: Math.max(0, scroller.scrollTop + delta), behavior: 'smooth' });
                    } catch (e) {
                        scroller.scrollTop = Math.max(0, scroller.scrollTop + delta);
                    }
                }
                return;
            }

            try {
                avatar.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (e) {}
        };

        // Run once immediately and again after the tool grid/feedback has been
        // rebuilt: those reflows used to cancel the first smooth scroll.
        requestAnimationFrame(scroll);
        setTimeout(scroll, 180);
        setTimeout(scroll, 520);
    }

    /**
     * Animates the thermometer tool.
     */
    animateToolThermometer(value, container = null, isInfected = null) {
        const targetContainer = this._getTargetContainer(container);
        if (!targetContainer || targetContainer.length === 0) return;
        this._scrollToAvatar(targetContainer);

        if (isInfected === null) {
            isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;
        }

        targetContainer.css('position', 'relative');
        targetContainer.find('.tool-thermo').remove();

        const overlay = $('<div>', {
            class: 'tool-thermo',
            css: {
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 10
            }
        });

        const tube = $('<div>', {
            css: {
                width: '20px',
                height: '120px',
                background: State.colors.bgDark,
                border: '1px solid #555',
                position: 'relative',
                boxShadow: 'inset 0 0 8px #000'
            }
        });

        const fillColor = value < 35
            ? (isInfected ? State.colors.chlorineSutil : State.colors.safe)
            : (isInfected ? State.colors.chlorineLight : State.colors.blood);

        const fill = $('<div>', {
            css: {
                position: 'absolute',
                bottom: '0px',
                left: 0,
                width: '100%',
                height: '0%',
                background: fillColor,
                filter: isInfected ? `drop-shadow(0 0 4px ${State.colors.chlorineSutil})` : 'none'
            }
        });

        const ticks = $('<div>', { css: { position: 'absolute', inset: 0 } });
        for (let i = 0; i <= 6; i++) {
            ticks.append($('<div>', {
                css: {
                    position: 'absolute',
                    left: '20px',
                    bottom: `${i * 20}px`,
                    width: '10px',
                    height: '1px',
                    background: '#444'
                }
            }));
        }

        tube.append(fill, ticks);
        overlay.append(tube);
        targetContainer.append(overlay);

        const start = Date.now();
        const targetHeight = Math.max(0, Math.min(100, Math.round((value / 45) * 100)));

        const step = () => {
            const now = Date.now();
            const t = Math.min(1, (now - start) / 1800);
            const h = Math.floor(targetHeight * t);
            fill.css('height', `${h}%`);
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);

        if (isInfected) {
            this._addInfectionBubbles(overlay);
        }

        setTimeout(() => overlay.fadeOut(300, () => overlay.remove()), 2200);
    }

    /**
     * Animates the UV flashlight tool.
     */
    animateToolFlashlight(value, container = null, isInfected = null) {
        const targetContainer = this._getTargetContainer(container);
        if (!targetContainer || targetContainer.length === 0) return;
        this._scrollToAvatar(targetContainer);

        if (isInfected === null) {
            isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;
        }

        const overlay = $('<div>', {
            class: 'tool-flashlight-overlay',
            css: {
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, rgba(138, 43, 226, 0.4) 0%, rgba(0, 0, 0, 0) 70%)',
                mixBlendMode: 'screen',
                pointerEvents: 'none',
                zIndex: 15,
                opacity: 0
            }
        });

        targetContainer.append(overlay);

        // Flash effect
        overlay.animate({ opacity: 1 }, 200).delay(500).animate({ opacity: 0 }, 200, () => overlay.remove());

        // Bring the avatar into view so the test animation is visible.
        const viewContainer = targetContainer.find('.npc-view-container');
        if (viewContainer.length) {
            try { viewContainer[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
        }

        if (isInfected) {
            const avatar = targetContainer.find('.pixel-avatar');
            const portrait = targetContainer.find('.npc-pixel-portrait');
            const wrapper = targetContainer.find('.npc-content-wrapper');
            const container = targetContainer.find('.npc-view-container');
            avatar.addClass('uv-reveal');
            portrait.addClass('uv-reveal');
            wrapper.addClass('uv-reveal');
            container.addClass('uv-reveal');
            setTimeout(() => {
                avatar.removeClass('uv-reveal');
                portrait.removeClass('uv-reveal');
                wrapper.removeClass('uv-reveal');
                container.removeClass('uv-reveal');
            }, 900);
        }
    }

    /**
     * Animates the pupils tool.
     */
    animateToolPupils(type = 'normal', container = null, isInfected = false) {
        const targetContainer = this._getTargetContainer(container);
        if (!targetContainer || targetContainer.length === 0) return;
        this._scrollToAvatar(targetContainer);

        targetContainer.css('position', 'relative');
        targetContainer.find('.pupil-overlay-local').remove();

        const overlay = $('<div>', {
            class: 'pupil-overlay-local',
            css: {
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 40,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(1px)'
            }
        });

        const lensContainer = $('<div>', {
            css: {
                position: 'relative',
                width: '180px',
                height: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }
        });

        const lens = $('<div>', {
            css: {
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                border: '4px solid #444',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.9) 80%)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.1)',
                transform: 'scale(0.5)',
                opacity: 0,
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }
        });

        // Reflejo de luz médica
        const medicalLight = $('<div>', {
            css: {
                position: 'absolute',
                top: '20%',
                right: '20%',
                width: '30px',
                height: '15px',
                background: 'rgba(255,255,255,0.4)',
                borderRadius: '50%',
                transform: 'rotate(-45deg)',
                filter: 'blur(2px)'
            }
        });

        const pupilSize = type === 'dilated' ? '70px' : '30px';
        const pupil = $('<div>', {
            css: {
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: pupilSize,
                height: pupilSize,
                background: isInfected ? State.colors.chlorine : State.colors.bgBlack,
                borderRadius: '50%',
                transition: 'all 0.8s ease-in-out',
                boxShadow: isInfected ? `0 0 25px ${State.colors.chlorine}` : 'inset 0 0 10px rgba(255,255,255,0.1)'
            }
        });

        lens.append(medicalLight, pupil);
        lensContainer.append(lens);
        overlay.append(lensContainer);
        targetContainer.append(overlay);

        // Animación de entrada
        setTimeout(() => {
            lens.css({ transform: 'scale(1)', opacity: 1 });
        }, 50);

        // Reacción pupilar (contracción por la luz)
        setTimeout(() => {
            const reactionSize = type === 'dilated' ? '55px' : '12px';
            pupil.css({ width: reactionSize, height: reactionSize });

            // Si es infectado, pequeño parpadeo de color
            if (isInfected) {
                setTimeout(() => {
                    pupil.css('background', State.colors.chlorineLight);
                    setTimeout(() => pupil.css('background', State.colors.chlorine), 200);
                }, 400);
            }
        }, 800);

        setTimeout(() => {
            lens.css({ transform: 'scale(1.2)', opacity: 0 });
            overlay.fadeOut(400, () => overlay.remove());
        }, 2200);
    }

    /**
     * Animates the pulse tool (EKG).
     */
    animateToolPulse(bpm, container = null, isInfected = null) {
        const targetContainer = this._getTargetContainer(container);
        if (!targetContainer || targetContainer.length === 0) return;
        this._scrollToAvatar(targetContainer);

        if (isInfected === null) {
            isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;
        }

        const overlay = $('<div>', {
            class: 'tool-pulse-overlay',
            css: {
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '200px',
                height: '60px',
                background: 'rgba(0, 20, 0, 0.8)',
                border: '1px solid #0f0',
                borderRadius: '4px',
                overflow: 'hidden',
                zIndex: 25,
                boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)'
            }
        });

        const canvas = $('<canvas>', {
            css: { width: '100%', height: '100%' }
        })[0];

        overlay.append(canvas);
        targetContainer.append(overlay);

        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 60;

        let x = 0;
        const points = [];
        const speed = 2;
        const color = isInfected ? State.colors.chlorine : '#0f0';

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 10, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);

            // Simular pulso EKG
            const period = (60 / bpm) * 1000;
            const now = Date.now();
            const phase = (now % period) / period;

            let y = canvas.height / 2;
            if (phase > 0.1 && phase < 0.15) y -= 10; // P wave
            if (phase > 0.2 && phase < 0.22) y -= 5;  // Q
            if (phase > 0.22 && phase < 0.25) y -= 30; // R
            if (phase > 0.25 && phase < 0.28) y += 15; // S
            if (phase > 0.4 && phase < 0.5) y -= 8;   // T

            // If infected, add some noise
            if (isInfected) y += (Math.random() - 0.5) * 10;

            points.push(y);
            if (points.length > canvas.width / speed) points.shift();

            ctx.beginPath();
            for (let i = 0; i < points.length; i++) {
                ctx.lineTo(i * speed, points[i]);
            }
            ctx.stroke();

            if (overlay.parent().length > 0) requestAnimationFrame(draw);
        };

        requestAnimationFrame(draw);
        setTimeout(() => overlay.fadeOut(400, () => overlay.remove()), 2600);
    }

    _addInfectionBubbles(overlay) {
        const bubbleLayer = $('<div>', { css: { position: 'absolute', inset: 0, overflow: 'hidden' } });
        overlay.append(bubbleLayer);
        const bubbles = [];
        for (let i = 0; i < 6; i++) {
            const b = $('<div>', {
                css: {
                    position: 'absolute',
                    bottom: '0',
                    left: `${2 + Math.random() * 14}px`,
                    width: '3px',
                    height: '3px',
                    background: State.colors.chlorine,
                    borderRadius: '50%',
                    opacity: 0.0
                }
            });
            bubbles.push(b);
            bubbleLayer.append(b);
        }

        const bStart = Date.now();
        const bStep = () => {
            const now = Date.now();
            const elapsed = now - bStart;
            bubbles.forEach((b, idx) => {
                const y = (elapsed / 12 + idx * 20) % 120;
                b.css({ bottom: `${y}px`, opacity: y > 20 ? 0.25 : 0.0 });
            });
            if (elapsed < 2000) requestAnimationFrame(bStep);
        };
        requestAnimationFrame(bStep);
    }

    /**
     * Oximeter: large finger clip with flickering light + ECG trace. Analog, no numeric readout.
     */
    animateToolOximeter(value, container = null, isInfected = null) {
        const targetContainer = this._getTargetContainer(container);
        if (!targetContainer || targetContainer.length === 0) return;
        this._scrollToAvatar(targetContainer);
        if (isInfected === null) isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;

        targetContainer.css('position', 'relative');
        targetContainer.find('.tool-oximeter').remove();

        const overlay = $('<div>', { class: 'tool-oximeter', css: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10, gap: '10px' } });

        const clip = $('<div>', { css: { width: '150px', height: '60px', background: '#0a0a0a', border: '3px solid #444', borderRadius: '10px', position: 'relative', boxShadow: 'inset 0 0 12px #000, 0 0 20px rgba(0,0,0,0.5)' } });
        const light = $('<div>', { css: { position: 'absolute', top: '18px', left: '20px', width: '24px', height: '24px', borderRadius: '50%', background: isInfected ? State.colors.chlorine : '#ff2a2a', boxShadow: `0 0 18px ${isInfected ? State.colors.chlorine : '#ff2a2a'}` } });
        const label = $('<div>', { css: { position: 'absolute', top: '8px', right: '12px', fontFamily: 'monospace', fontSize: '9px', color: '#888', letterSpacing: '0.1em' }, text: 'ESCANEANDO' });

        clip.append(light, label);
        overlay.append(clip);

        // ECG trace
        const trace = $('<canvas>', { css: { width: '150px', height: '40px', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', borderRadius: '4px' } });
        const ctx = trace[0].getContext('2d');
        trace[0].width = 150; trace[0].height = 40;
        overlay.append(trace);

        targetContainer.append(overlay);

        const start = Date.now();
        const duration = 2500;
        const step = () => {
            const now = Date.now();
            const elapsed = now - start;
            const t = Math.min(1, elapsed / duration);
            // flicker the light
            const flicker = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(elapsed / 120) * Math.sin(elapsed / 37));
            light.css('opacity', flicker);
            // draw ECG
            ctx.clearRect(0, 0, 150, 40);
            ctx.strokeStyle = isInfected ? State.colors.chlorine : '#00ff41';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let x = 0; x < 150; x++) {
                const phase = (x + elapsed * 0.15) % 150;
                let y = 20;
                if (phase > 60 && phase < 75) y = 20 - 12 * Math.sin((phase - 60) / 15 * Math.PI);
                else if (phase > 75 && phase < 90) y = 20 + 6 * Math.sin((phase - 75) / 15 * Math.PI);
                y += (Math.random() - 0.5) * (isInfected ? 4 : 1.5);
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);

        setTimeout(() => overlay.fadeOut(400, () => overlay.remove()), duration + 300);
    }

    /**
     * Skin turgor: large skin patch pinched, returns slowly. Analog, no text readout.
     */
    animateToolSkinTurgor(value, container = null, isInfected = null) {
        const targetContainer = this._getTargetContainer(container);
        if (!targetContainer || targetContainer.length === 0) return;
        this._scrollToAvatar(targetContainer);
        if (isInfected === null) isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;

        targetContainer.css('position', 'relative');
        targetContainer.find('.tool-turgor').remove();

        const overlay = $('<div>', { class: 'tool-turgor', css: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 } });
        const skin = $('<div>', { css: { width: '170px', height: '90px', background: 'linear-gradient(135deg, rgba(210,170,130,0.4), rgba(180,140,100,0.25))', border: '2px solid rgba(200,160,120,0.7)', borderRadius: '40px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 16px rgba(0,0,0,0.4)' } });
        const fold = $('<div>', { css: { position: 'absolute', top: '20px', left: '60px', width: '50px', height: '50px', background: 'rgba(170,130,90,0.55)', borderRadius: '50%', transform: 'scaleY(1) scaleX(1)', transformOrigin: 'center' } });
        const label = $('<div>', { css: { position: 'absolute', bottom: '6px', left: '0', width: '100%', textAlign: 'center', fontFamily: 'monospace', fontSize: '9px', color: '#aaa', letterSpacing: '0.1em' }, text: 'PINZANDO' });

        skin.append(fold, label);
        overlay.append(skin);
        targetContainer.append(overlay);

        const slow = value === 'slow';
        const duration = slow ? 2200 : 700;
        const start = Date.now();
        const step = () => {
            const t = Math.min(1, (Date.now() - start) / duration);
            // pinch in (0-0.3), hold (0.3-0.4), return (0.4-1)
            let scale = 1;
            if (t < 0.3) scale = 1 - 0.55 * (t / 0.3);
            else if (t < 0.4) scale = 0.45;
            else {
                const rt = (t - 0.4) / 0.6;
                const ease = 1 - Math.pow(1 - rt, 3);
                scale = 0.45 + 0.55 * ease;
                // wobble on return for infected
                if (isInfected && rt < 0.9) scale += 0.05 * Math.sin(rt * Math.PI * 6);
            }
            fold.css('transform', `scaleY(${Math.max(0.4, scale)}) scaleX(${1 - (1 - scale) * 0.3})`);
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);

        setTimeout(() => overlay.fadeOut(400, () => overlay.remove()), duration + 400);
    }

    /**
     * Glucose: large colorimetric strip that shifts color. Analog, no numeric readout.
     */
    animateToolGlucose(value, container = null, isInfected = null) {
        const targetContainer = this._getTargetContainer(container);
        if (!targetContainer || targetContainer.length === 0) return;
        this._scrollToAvatar(targetContainer);
        if (isInfected === null) isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;

        targetContainer.css('position', 'relative');
        targetContainer.find('.tool-glucose').remove();

        const overlay = $('<div>', { class: 'tool-glucose', css: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10, gap: '12px' } });

        // color chart reference
        const chart = $('<div>', { css: { display: 'flex', gap: '6px', alignItems: 'center' } });
        const swatches = [
            { color: '#e8d9a0', label: 'BAJO' },
            { color: '#d4a84b', label: 'NORMAL' },
            { color: '#b85c3a', label: 'ALTO' },
            { color: '#8a2a1a', label: 'CRÍTICO' }
        ];
        swatches.forEach(s => {
            const sw = $('<div>', { css: { width: '28px', height: '18px', background: s.color, border: '1px solid #555', borderRadius: '3px' } });
            const lb = $('<div>', { css: { fontSize: '7px', color: '#888', textAlign: 'center', marginTop: '2px' }, text: s.label });
            const col = $('<div>', { css: { display: 'flex', flexDirection: 'column', alignItems: 'center' } });
            col.append(sw, lb);
            chart.append(col);
        });
        overlay.append(chart);

        const strip = $('<div>', { css: { width: '160px', height: '36px', background: '#e8d9a0', border: '2px solid #555', borderRadius: '6px', position: 'relative', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4)', transition: 'background 0.1s linear' } });
        const label = $('<div>', { css: { position: 'absolute', top: '8px', left: '0', width: '100%', textAlign: 'center', fontFamily: 'monospace', fontSize: '9px', color: '#222', letterSpacing: '0.1em', mixBlendMode: 'difference' }, text: 'REACCIONANDO' });
        strip.append(label);
        overlay.append(strip);

        targetContainer.append(overlay);

        const start = Date.now();
        const duration = 2200;
        const target = Math.max(0, parseInt(value) || 0);
        // map value to color: low glucose -> pale, high -> deep red
        const colorFor = (v) => {
            if (v < 100) return [232, 217, 160];
            if (v < 140) return [212, 168, 75];
            if (v < 180) return [184, 92, 58];
            return [138, 42, 26];
        };
        const step = () => {
            const t = Math.min(1, (Date.now() - start) / duration);
            const eased = 1 - Math.pow(1 - t, 2);
            const [r, g, b] = colorFor(target);
            // interpolate from pale (232,217,160) to target color
            const rr = Math.round(232 + (r - 232) * eased);
            const gg = Math.round(217 + (g - 217) * eased);
            const bb = Math.round(160 + (b - 160) * eased);
            strip.css('background', `rgb(${rr},${gg},${bb})`);
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);

        setTimeout(() => overlay.fadeOut(400, () => overlay.remove()), duration + 300);
    }
}
