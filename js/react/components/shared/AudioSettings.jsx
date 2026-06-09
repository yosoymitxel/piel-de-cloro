/**
 * AudioSettings - Controles de volumen reutilizables.
 * Unifica los sliders duplicados en modal-settings y modal-pause.
 * 
 * Props:
 *   prefix: string - Prefijo para IDs ('' para settings, 'pause' para pause)
 */
window.RC = window.RC || {};
window.RC.AudioSettings = function AudioSettings({ prefix }) {
    var p = prefix ? prefix + '-' : '';
    return (
        <div className="flex flex-col gap-4 p-4 border border-white/5 bg-black/40">
            <label className="flex flex-col gap-2 font-mono text-xs cursor-pointer group">
                <div className="flex justify-between">
                    <span className="group-hover:text-chlorine-light transition-colors uppercase">Volumen Maestro</span>
                    <span id={p + 'label-volume-master'} className="text-gray-500">100%</span>
                </div>
                <input type="range" id={p + 'config-volume-master'} className="horror-range w-full" min="0" max="100" defaultValue="100" />
            </label>

            <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 font-mono text-xs cursor-pointer group">
                    <div className="flex justify-between">
                        <span className="group-hover:text-chlorine-light transition-colors uppercase">Ambiente</span>
                        <span id={p + 'label-volume-ambient'} className="text-gray-500">30%</span>
                    </div>
                    <input type="range" id={p + 'config-volume-ambient'} className="horror-range w-full" min="0" max="100" defaultValue="30" />
                </label>

                <label className="flex flex-col gap-2 font-mono text-xs cursor-pointer group">
                    <div className="flex justify-between">
                        <span className="group-hover:text-chlorine-light transition-colors uppercase">SFX / Interfaz</span>
                        <span id={p + 'label-volume-sfx'} className="text-gray-500">60%</span>
                    </div>
                    <input type="range" id={p + 'config-volume-sfx'} className="horror-range w-full" min="0" max="100" defaultValue="60" />
                </label>

                <label className="flex flex-col gap-2 font-mono text-xs cursor-pointer group">
                    <div className="flex justify-between">
                        <span className="group-hover:text-chlorine-light transition-colors uppercase">Voces / Lore</span>
                        <span id={p + 'label-volume-lore'} className="text-gray-500">25%</span>
                    </div>
                    <input type="range" id={p + 'config-volume-lore'} className="horror-range w-full" min="0" max="100" defaultValue="25" />
                </label>

                <label className="flex flex-col gap-2 font-mono text-xs cursor-pointer group">
                    <div className="flex justify-between">
                        <span className="group-hover:text-chlorine-light transition-colors uppercase">Maquinaria</span>
                        <span id={p + 'label-volume-generator'} className="text-gray-500">15%</span>
                    </div>
                    <input type="range" id={p + 'config-volume-generator'} className="horror-range w-full" min="0" max="100" defaultValue="15" />
                </label>
            </div>
        </div>
    );
};
