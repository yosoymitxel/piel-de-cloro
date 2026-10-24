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
     * Oximeter: finger clip with pulsing red light and SpO2 readout.
     */
    animateToolOximeter(value, container = null, isInfected = null) {
        const targetContainer = this._getTargetContainer(container);
        if (!targetContainer || targetContainer.length === 0) return;
        this._scrollToAvatar(targetContainer);
        if (isInfected === null) isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;

        targetContainer.css('position', 'relative');
        targetContainer.find('.tool-oximeter').remove();

        const overlay = $('<div>', { class: 'tool-oximeter', css: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 } });

        const clip = $('<div>', { css: { width: '60px', height: '30px', background: '#1a1a1a', border: '2px solid #555', borderRadius: '6px', position: 'relative', boxShadow: 'inset 0 0 6px #000' } });
        const light = $('<div>', { css: { position: 'absolute', top: '8px', left: '8px', width: '14px', height: '14px', borderRadius: '50%', background: isInfected ? State.colors.chlorine : '#ff3b3b', boxShadow: `0 0 10px ${isInfected ? State.colors.chlorine : '#ff3b3b'}` } });
        const readout = $('<div>', { css: { position: 'absolute', top: '4px', right: '6px', fontFamily: 'monospace', fontSize: '11px', color: isInfected ? State.colors.chlorine : '#00ff41', fontWeight: 'bold' }, text: '0%' });

        clip.append(light, readout);
        overlay.append(clip);
        targetContainer.append(overlay);

        const start = Date.now();
        const target = Math.max(0, Math.min(100, parseInt(value) || 0));
        const step = () => {
            const t = Math.min(1, (Date.now() - start) / 1500);
            readout.text(`${Math.floor(target * t)}%`);
            light.css('opacity', 0.4 + 0.6 * Math.abs(Math.sin((Date.now() - start) / 200)));
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);

        setTimeout(() => overlay.fadeOut(300, () => overlay.remove()), 2000);
    }

    /**
     * Skin turgor: pinch that returns slowly.
     */
    animateToolSkinTurgor(value, container = null, isInfected = null) {
        const targetContainer = this._getTargetContainer(container);
        if (!targetContainer || targetContainer.length === 0) return;
        this._scrollToAvatar(targetContainer);
        if (isInfected === null) isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;

        targetContainer.css('position', 'relative');
        targetContainer.find('.tool-turgor').remove();

        const overlay = $('<div>', { class: 'tool-turgor', css: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 } });
        const skin = $('<div>', { css: { width: '80px', height: '40px', background: 'rgba(200,160,120,0.35)', border: '1px solid rgba(200,160,120,0.6)', borderRadius: '20px', position: 'relative', overflow: 'hidden' } });
        const fold = $('<div>', { css: { position: 'absolute', top: '10px', left: '30px', width: '20px', height: '20px', background: 'rgba(180,140,100,0.6)', borderRadius: '50%', transform: 'scaleY(1)' } });

        skin.append(fold);
        overlay.append(skin);
        targetContainer.append(overlay);

        const slow = value === 'slow';
        const duration = slow ? 1200 : 400;
        const start = Date.now();
        const step = () => {
            const t = Math.min(1, (Date.now() - start) / duration);
            const scale = slow ? 1 - 0.6 * (1 - Math.pow(1 - t, 3)) : 1 - 0.6 * Math.sin(t * Math.PI);
            fold.css('transform', `scaleY(${Math.max(0.4, scale)})`);
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);

        setTimeout(() => overlay.fadeOut(300, () => overlay.remove()), duration + 400);
    }

    /**
     * Glucose: glucometer with strip and numeric readout.
     */
    animateToolGlucose(value, container = null, isInfected = null) {
        const targetContainer = this._getTargetContainer(container);
        if (!targetContainer || targetContainer.length === 0) return;
        this._scrollToAvatar(targetContainer);
        if (isInfected === null) isInfected = (State && State.currentNPC && State.currentNPC.isInfected) ? true : false;

        targetContainer.css('position', 'relative');
        targetContainer.find('.tool-glucose').remove();

        const overlay = $('<div>', { class: 'tool-glucose', css: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 } });
        const device = $('<div>', { css: { width: '90px', height: '50px', background: '#0d1117', border: '2px solid #333', borderRadius: '8px', position: 'relative', boxShadow: 'inset 0 0 8px #000' } });
        const strip = $('<div>', { css: { position: 'absolute', bottom: '-12px', left: '30px', width: '30px', height: '20px', background: '#e8e0d0', border: '1px solid #999', borderRadius: '2px' } });
        const readout = $('<div>', { css: { position: 'absolute', top: '12px', left: '0', width: '100%', textAlign: 'center', fontFamily: 'monospace', fontSize: '14px', color: isInfected ? State.colors.chlorine : '#00ff41', fontWeight: 'bold' }, text: '0' });

        device.append(readout);
        overlay.append(device, strip);
        targetContainer.append(overlay);

        const start = Date.now();
        const target = Math.max(0, parseInt(value) || 0);
        const step = () => {
            const t = Math.min(1, (Date.now() - start) / 1200);
            readout.text(Math.floor(target * t));
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);

        setTimeout(() => overlay.fadeOut(300, () => overlay.remove()), 1800);
    }
}
