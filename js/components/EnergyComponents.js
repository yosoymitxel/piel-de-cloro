import { BaseComponent } from './BaseComponent.js';

export class GenLoadComponent extends BaseComponent {
    constructor(containerId, config) {
        super(containerId, config);
    }

    getTemplate() {
        return `
            <div class="hud-component component-load" title="Carga del Generador - Click para ir al Generador">
                <div class="stat-header">
                    <span class="stat-label">GENERADOR</span>
                    <i class="fa-solid fa-bolt text-[8px] text-gray-500"></i>
                </div>
                <div class="flex flex-col items-center justify-center flex-1">
                    <span id="comp-gen-load-val" class="text-2xl font-bold font-mono text-gray-400">0%</span>
                    <span class="text-[7px] font-mono tracking-widest opacity-50 uppercase">Carga</span>
                </div>
            </div>
        `;
    }

    update(state) {
        if (!this.isRendered) this.render();
        const gen = state.generator;
        const loadPercent = Math.min(100, Math.floor((gen.load / gen.capacity) * 100));

        const el = this.container.find('#comp-gen-load-val');
        el.text(`${loadPercent}%`);

        // Colors
        el.removeClass('text-gray-400 text-warning text-alert animate-pulse');
        if (loadPercent > 90) el.addClass('text-alert animate-pulse');
        else if (loadPercent > 70) el.addClass('text-warning');
        else el.addClass('text-gray-400');
    }
}

export class GenBatteryComponent extends BaseComponent {
    constructor(containerId, config) {
        super(containerId, config);
    }

    getTemplate() {
        return `
            <div class="hud-component component-battery" title="Batería del Generador - Click para ir al Generador">
                <div class="stat-header">
                    <span class="stat-label">BAT</span>
                    <span id="comp-gen-bat-val" class="text-[8px] font-mono text-chlorine-light font-bold">100%</span>
                </div>
                <div class="flex items-center justify-center flex-1">
                    <div class="relative w-16 h-8 bg-black/50 border border-white/20 rounded-sm">
                        <div id="comp-gen-bat-fill"  class="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300" style="width: 100%;"></div>
                        <div id="comp-gen-charging" class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity z-10">
                            <i class="fa-solid fa-bolt text-[10px] text-black drop-shadow-[0_0_2px_yellow]"></i>
                        </div>
                        <!-- Battery terminal -->
                        <div class="absolute right-[-3px] top-[30%] h-[40%] w-[3px] bg-white/30 rounded-r-sm"></div>
                    </div>
                </div>
            </div>
        `;
    }

    update(state) {
        if (!this.isRendered) this.render();
        const gen = state.generator;
        const batLevel = Math.min(100, Math.max(0, gen.power || 0));

        const fill = this.container.find('#comp-gen-bat-fill');
        const txt = this.container.find('#comp-gen-bat-val');
        const chargingIcon = this.container.find('#comp-gen-charging');

        fill.css('width', `${batLevel}%`);
        txt.text(`${Math.floor(batLevel)}%`);

        // Charging status
        if (gen.isOn) {
            chargingIcon.removeClass('opacity-0').addClass('opacity-100');
        } else {
            chargingIcon.removeClass('opacity-100').addClass('opacity-0');
        }

        // Colors
        fill.removeClass('bg-green-500 bg-yellow-500 bg-red-600 animate-pulse');
        if (batLevel < 20) fill.addClass('bg-red-600 animate-pulse');
        else if (batLevel < 50) fill.addClass('bg-yellow-500');
        else fill.addClass('bg-green-500');
    }
}

export class GenStationComponent extends BaseComponent {
    constructor(containerId, config) {
        super(containerId, config);
    }

    getTemplate() {
        return `
            <div class="hud-component component-station" title="Energía del Puesto - Click para ir al Generador">
                <div class="stat-header">
                    <span class="stat-label">PUESTO</span>
                    <i class="fa-solid fa-plug text-[8px] text-cyan-400"></i>
                </div>
                <div class="flex flex-col items-center justify-center flex-1 gap-1">
                    <div class="flex items-center gap-1" id="comp-gen-energy-dots">
                        <!-- Dots generated here -->
                    </div>
                    <span id="comp-gen-tests-text" class="text-[7px] font-mono text-cyan-400 uppercase tracking-wider">TST</span>
                </div>
            </div>
        `;
    }

    update(state) {
        if (!this.isRendered) this.render();
        const gen = state.generator;
        const mode = gen.mode || 'normal';

        // Energy available based on mode
        const modeEnergy = {
            'save': 1,
            'normal': 2,
            'overload': 3
        };
        const maxEnergy = modeEnergy[mode] || 2;

        // Current NPC scan count to determine consumed energy
        const npc = state.currentNPC;
        const scanCount = (npc && npc.scanCount) || 0;
        const currentEnergy = (!gen.isOn || scanCount >= 90) ? 0 : Math.max(0, maxEnergy - scanCount);

        // Render energy dots
        const dotsContainer = this.container.find('#comp-gen-energy-dots');
        dotsContainer.empty();

        // Determine color based on mode
        let dotColorClass = 'bg-terminal-green shadow-[0_0_6px_#00ff41]'; // Normal
        if (mode === 'save') dotColorClass = 'bg-[#00ced1] shadow-[0_0_6px_#00ced1]';
        else if (mode === 'overload') dotColorClass = 'bg-[#ffaa00] shadow-[0_0_6px_#ffaa00]';

        for (let i = 0; i < maxEnergy; i++) {
            const isActive = i < currentEnergy;
            const dot = $(`<div class="w-3 h-3 rounded-full ${isActive ? dotColorClass : 'bg-gray-700 border border-gray-600'}"></div>`);
            dotsContainer.append(dot);
        }

        // Update text
        const textEl = this.container.find('#comp-gen-tests-text');
        textEl.text(`${currentEnergy} TST`);
        
        // Update text color too
        textEl.removeClass('text-cyan-400 text-[#00ced1] text-[#ffaa00] text-terminal-green');
        if (mode === 'save') textEl.addClass('text-[#00ced1]');
        else if (mode === 'overload') textEl.addClass('text-[#ffaa00]');
        else textEl.addClass('text-terminal-green');
    }
}
