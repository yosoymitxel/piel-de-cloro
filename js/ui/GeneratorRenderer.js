
export class GeneratorRenderer {
    constructor(elements, colors) {
        this.elements = elements;
        this.colors = colors;
    }

    renderPowerBar(power, isOn, color, mode) {
        const bar = this.elements.generatorPowerBar;
        bar.empty();
        bar.css({
            background: '#050505',
            border: '1px solid #333',
            position: 'relative',
            display: 'flex',
            gap: '2px',
            padding: '2px',
            overflow: 'hidden',
            boxShadow: isOn ? `0 0 10px ${color}33` : 'none'
        });

        const totalBlocks = 20;
        const activeBlocks = Math.ceil((power / 100) * totalBlocks);

        for (let i = 0; i < totalBlocks; i++) {
            const isActive = i < activeBlocks;
            const blockColor = isOn ? color : '#1a1a1a';
            const delay = i * 25;

            const block = $('<div>', {
                css: {
                    flex: '1',
                    height: '100%',
                    background: blockColor,
                    opacity: 0,
                    boxShadow: isActive && isOn ? `0 0 5px ${color}` : 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'scaleY(0.4)',
                    filter: isActive && isOn ? 'brightness(1.2)' : 'none'
                }
            });

            bar.append(block);

            setTimeout(() => {
                block.css({
                    opacity: isActive ? 1 : 0.1,
                    transform: 'scaleY(1)'
                });

                if (isOn && isActive) {
                    this.startFlicker(block, mode);
                }
            }, delay);
        }
    }

    startFlicker(block, mode) {
        const flicker = () => {
            // Usamos una variable externa o verificamos el estado del DOM
            // para saber si debemos seguir parpadeando
            if (!block.parent().length) return; 

            let chance = 0.97;
            let minOpacity = 0.6;
            let duration = 50;

            if (mode === 'overload') {
                chance = 0.92;
                minOpacity = 0.3;
                duration = 80;
            } else if (mode === 'save') {
                chance = 0.99;
            }

            if (Math.random() > chance) {
                const originalShadow = block.css('box-shadow');
                block.css({
                    opacity: minOpacity,
                    filter: 'brightness(2) saturate(2)',
                    boxShadow: `0 0 15px white`
                });
                
                setTimeout(() => {
                    block.css({
                        opacity: 1,
                        filter: 'brightness(1.2)',
                        boxShadow: originalShadow
                    });
                }, duration + Math.random() * 100);
            }
            
            setTimeout(flicker, 500 + Math.random() * 2000);
        };
        flicker();
    }

    updateModeLabel(isOn, mode, color) {
        const modeLabel = this.elements.generatorModeLabel;
        modeLabel.text(isOn ? mode.toUpperCase() : 'APAGADO');
        modeLabel.css('color', color);
    }

    updateToggleButton(isOn, blackoutUntil) {
        const toggleBtn = $('#btn-gen-toggle');
        const isLocked = blackoutUntil > Date.now();

        if (isLocked) {
            toggleBtn.prop('disabled', true).addClass('opacity-50 grayscale cursor-wait');
            toggleBtn.html('<i class="fa-solid fa-plug-circle-exclamation"></i> BLOQUEADO');
        } else {
            toggleBtn.prop('disabled', false).removeClass('opacity-50 grayscale cursor-wait');
            toggleBtn.html(isOn ? '<i class="fa-solid fa-power-off"></i> APAGAR' : '<i class="fa-solid fa-bolt"></i> ENCENDER');
        }

        toggleBtn.toggleClass('horror-btn-primary', isOn);
        toggleBtn.removeClass('btn-off btn-on');

        if (!isLocked) {
            if (isOn) {
                toggleBtn.addClass('btn-on');
                toggleBtn.css('color', '#000');
                toggleBtn.find('i').css('color', this.colors.CHLORINE_DARK);
            } else {
                toggleBtn.addClass('btn-off');
                toggleBtn.css('color', '#000');
                toggleBtn.find('i').css('color', this.colors.OFF);
            }
        } else {
            toggleBtn.css('color', '');
        }
    }

    updateStatusSummary(isOn, mode) {
        const statusSummary = $('#generator-status-summary');
        if (statusSummary.length) {
            const statusHtml = `
                <span>ESTADO: <span class="${isOn ? 'text-chlorine-light' : 'text-alert'}">${isOn ? 'OPERATIVO' : 'OFF'}</span></span>
                <span>MODO: <span class="text-white">${isOn ? mode.toUpperCase() : 'N/A'}</span></span>
            `;
            statusSummary.html(statusHtml);
        }
    }

    updateModeButtons(activeMode, actionTaken, currentMax, overclockCooldown) {
        const btnSave = $('#btn-gen-save');
        const btnNormal = $('#btn-gen-normal');
        const btnOver = $('#btn-gen-over');

        const updateBtnState = (btn, targetCap, isCooldown = false) => {
            const isBlocked = (actionTaken && targetCap > currentMax) || isCooldown;
            if (isBlocked) {
                btn.prop('disabled', true).addClass('opacity-30 grayscale cursor-not-allowed border-dashed');
                btn.attr('title', isCooldown ? 'BLOQUEADO: Enfriamiento' : 'BLOQUEADO: Restricción de potencia');
            } else {
                btn.prop('disabled', false).removeClass('opacity-30 grayscale cursor-not-allowed border-dashed');
                btn.attr('title', '');
            }
        };

        updateBtnState(btnNormal, 2);
        updateBtnState(btnOver, 3, overclockCooldown);

        btnSave.toggleClass('horror-btn-save-active', activeMode === 'save');
        btnNormal.toggleClass('horror-btn-normal-active', activeMode === 'normal');
        btnOver.toggleClass('horror-btn-overload-active', activeMode === 'overload');
    }

    hideWarnings() {
        if (this.elements.genWarningGame) this.elements.genWarningGame.addClass('hidden');
        if (this.elements.genWarningShelter) this.elements.genWarningShelter.addClass('hidden');
        if (this.elements.genWarningPanel) this.elements.genWarningPanel.addClass('hidden');
    }
}
