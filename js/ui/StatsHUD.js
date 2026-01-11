import { State } from '../State.js';

/**
 * StatsHUD handles updating the main game HUD elements like Paranoia, Cycle, and Time.
 */
export class StatsHUD {
    constructor(elements, colors) {
        this.elements = elements;
        this.colors = colors;
    }

    /**
     * Updates the HUD with current game state.
     */
    update(paranoia, cycle, dayTime, dayLength, currentNPC) {
        this.elements.paranoia.text(`${Math.round(paranoia)}%`);
        this.elements.cycle.text(cycle);
        this.elements.time.text(`${dayTime}/${dayLength}`);

        const generatorOk = State.generator?.isOn && (State.generator?.power > 10);
        const needsCheck = !generatorOk;

        this.elements.genWarningGame?.toggleClass('hidden', !needsCheck);
        this.elements.genWarningShelter?.toggleClass('hidden', !needsCheck);

        this._updateParanoiaColors(paranoia);
        this._updateEnergy(currentNPC);
    }

    _updateParanoiaColors(paranoia) {
        const paranoiaIcon = this.elements.paranoia.parent().find('i.fa-brain');
        let paranoiaColor = '#a8d5a2'; // Default chlorine-light

        const isPulsing = paranoia >= 100;
        this.elements.paranoia.toggleClass('animate-pulse', isPulsing);
        paranoiaIcon.toggleClass('animate-pulse', isPulsing);

        if (paranoia >= 100) paranoiaColor = '#ff0000';
        else if (paranoia > 75) paranoiaColor = '#ff3333';
        else if (paranoia > 50) paranoiaColor = '#ff8c00';
        else if (paranoia > 25) paranoiaColor = '#e2e254';

        this.elements.paranoia.css('color', paranoiaColor);
        paranoiaIcon.css('color', paranoiaColor);
        
        if (this.elements.dialogue) {
            this.elements.dialogue.css('--paranoia-color', paranoiaColor);
            this.elements.dialogue.find('.npc-text').css('color', paranoiaColor);
            this.elements.dialogue.find('.npc-name').css('color', paranoiaColor);
        }

        if (paranoia > 50) {
            this.elements.paranoia.css('text-shadow', `0 0 8px ${paranoiaColor}`);
            paranoiaIcon.css('filter', `drop-shadow(0 0 5px ${paranoiaColor})`);
            this.elements.dialogue?.css('text-shadow', `0 0 4px ${paranoiaColor}44`);
        } else {
            this.elements.paranoia.css('text-shadow', 'none');
            paranoiaIcon.css('filter', 'none');
            this.elements.dialogue?.css('text-shadow', 'none');
        }
    }

    _updateEnergy(currentNPC) {
        const energySpan = $('#scan-energy');
        const energyIcon = $('#hud-energy-container i');

        if (!currentNPC) {
            energySpan.text('---').css({ color: '#555', textShadow: 'none' });
            energyIcon.css('color', '#555').removeClass('text-cyan-400 text-alert');
            this.elements.tools?.forEach(btn => btn.addClass('btn-disabled'));
            return;
        }

        const mode = State.generator.mode.toUpperCase();
        const maxEnergy = State.config.generator.consumption[mode] || 2;
        const currentEnergy = (!State.generator.isOn) ? 0 : Math.max(0, maxEnergy - currentNPC.scanCount);

        // Renderizar rayos de energía en lugar de texto si se prefiere visual
        let energyHTML = '';
        for (let i = 0; i < maxEnergy; i++) {
            const isActive = i < currentEnergy;
            const colorClass = isActive ? (mode === 'SAVE' ? 'text-cyan-400' : (mode === 'OVERLOAD' ? 'text-orange-500' : 'text-green-400')) : 'text-gray-800';
            const glowClass = isActive ? 'text-glow-sm' : '';
            energyHTML += `<i class="fa-solid fa-bolt ${colorClass} ${glowClass} mr-0.5"></i>`;
        }
        energySpan.html(energyHTML);

        if (currentEnergy > 0) {
            let color = this.colors.ENERGY;
            if (mode === 'SAVE') color = this.colors.SAVE;
            if (mode === 'OVERLOAD') color = this.colors.OVERLOAD;

            energySpan.css({ color: '', textShadow: '' }).removeClass('text-alert animate-pulse text-cyan-400');
            energyIcon.css('color', color).removeClass('text-cyan-400 text-alert');
            this.elements.tools?.forEach(btn => btn.removeClass('btn-disabled'));
        } else {
            energySpan.css({ color: '', textShadow: '' }).removeClass('text-cyan-400');
            if (State.generator.isOn) {
                energySpan.addClass('opacity-50');
            } else {
                energySpan.addClass('text-alert animate-pulse');
            }
            energyIcon.css('color', '').removeClass('text-cyan-400').addClass('text-alert');
            this.elements.tools?.forEach(btn => btn.addClass('btn-disabled'));
        }
    }
}
