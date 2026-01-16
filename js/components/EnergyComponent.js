import { BaseComponent } from './BaseComponent.js';

export class EnergyComponent extends BaseComponent {
    constructor(containerId, config) {
        super(containerId, config);
    }

    getTemplate() {
        return `
            <div class="hud-component component-energy" title="Estado del Generador">
                <div class="stat-header">
                    <span class="stat-label">GENERADOR</span>
                    <span class="text-[8px] font-mono text-chlorine-light tracking-tighter" id="comp-energy-tests">0 TST</span>
                </div>
                
                <!-- Battery Bar -->
                <div class="flex justify-between items-end mt-1">
                     <span class="energy-sub-label">BATERÍA</span>
                     <i class="fa-solid fa-bolt text-[8px] text-yellow-500/50"></i>
                </div>
                <div class="energy-battery-segment w-full bg-black/50 border border-white/10 p-[1px] h-3 rounded-sm">
                    <div id="comp-energy-fill" class="h-full bg-chlorine-light w-full transition-all duration-300"></div>
                </div>

                <!-- Footer Stats: Load & Bat % -->
                <div class="flex justify-between items-end mt-1 font-mono text-[9px] leading-none">
                    <div class="flex flex-col">
                         <span class="energy-sub-label">USO</span>
                         <span id="comp-energy-load" class="text-gray-400">0%</span>
                    </div>
                    <div class="flex flex-col items-end">
                         <span class="energy-sub-label">NIVEL</span>
                         <span id="comp-energy-percent" class="text-chlorine-light">100%</span>
                    </div>
                </div>
            </div>
        `;
    }

    update(state) {
        if (!this.isRendered) this.render();

        const gen = state.generator;
        const batteryLevel = Math.min(100, Math.max(0, gen.power || 0));
        const loadPercent = Math.min(100, Math.floor((gen.load / gen.capacity) * 100));

        // Select Elements
        const fill = this.container.find('#comp-energy-fill');
        const loadTxt = this.container.find('#comp-energy-load');
        const batTxt = this.container.find('#comp-energy-percent');
        const testsTxt = this.container.find('#comp-energy-tests');

        // Update visuals
        fill.css('width', `${batteryLevel}%`);
        batTxt.text(`${Math.floor(batteryLevel)}%`);
        loadTxt.text(`${loadPercent}%`);

        // Battery Colors
        fill.removeClass('bg-green-500 bg-yellow-500 bg-red-600 shadow-[0_0_10px_currentColor]');
        batTxt.removeClass('text-chlorine-light text-warning text-alert animate-pulse');

        if (batteryLevel < 20) {
            fill.addClass('bg-red-600 shadow-[0_0_10px_#dc2626]');
            batTxt.addClass('text-alert animate-pulse');
        } else if (batteryLevel < 50) {
            fill.addClass('bg-yellow-500');
            batTxt.addClass('text-warning');
        } else {
            fill.addClass('bg-green-500');
            batTxt.addClass('text-chlorine-light');
        }

        // Load Colors
        loadTxt.removeClass('text-gray-400 text-warning text-alert animate-pulse');
        if (loadPercent > 90) loadTxt.addClass('text-alert animate-pulse');
        else if (loadPercent > 70) loadTxt.addClass('text-warning');
        else loadTxt.addClass('text-gray-400');

        // Tests Calculation
        const estTests = Math.floor(batteryLevel / 15);
        testsTxt.text(`${estTests} TST`);
        testsTxt.removeClass('text-chlorine-light text-alert');
        if (estTests < 1) testsTxt.addClass('text-alert');
        else testsTxt.addClass('text-chlorine-light');
    }
}
