/**
 * DevConfigPanel - Panel de configuración para desarrolladores.
 * Unifica los paneles duplicados en modal-settings y modal-pause.
 *
 * Props:
 *   id: string - ID del contenedor
 *   prefix: string - Prefijo para IDs de inputs (e.g. 'dev-config' o 'pause-dev-config')
 *   showEnergyCost: boolean - Mostrar el select de coste de energía (solo en pause)
 *   showApplyButton: boolean - Mostrar botón de aplicar (solo en pause)
 */
window.RC = window.RC || {};
window.RC.DevConfigPanel = function DevConfigPanel({ id, prefix, showEnergyCost, showApplyButton }) {
    var inputClass = "bg-black/50 border border-red-900/30 text-red-400 text-xs p-1 font-mono focus:border-red-500 outline-none";
    return (
        <div id={id} className="hidden flex-col gap-3 p-3 border border-red-900/30 bg-red-900/5">
            <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest border-b border-red-900/30 pb-1 mb-1">
                <i className="fa-solid fa-code mr-1"></i> PARAMETROS DEL NUCLEO
            </h4>

            <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                    <span className="text-[9px] opacity-60 uppercase text-gray-400">Capacidad</span>
                    <input type="number" id={prefix + '-shelter'} className={inputClass} min="1" max="50" />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-[9px] opacity-60 uppercase text-gray-400">Sujetos/Día</span>
                    <input type="number" id={prefix + '-daylength'} className={inputClass} min="1" max="20" />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-[9px] opacity-60 uppercase text-gray-400">Prob. Intrusión</span>
                    <input type="number" id={prefix + '-intrusion'} className={inputClass} min="0" max="100" step="5" />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-[9px] opacity-60 uppercase text-gray-400">Suministros Ini.</span>
                    <input type="number" id={prefix + '-supplies'} className={inputClass} min="0" max="100" />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-[9px] opacity-60 uppercase text-gray-400">Paranoia Ini.</span>
                    <input type="number" id={prefix + '-paranoia'} className={inputClass} min="0" max="100" />
                </label>

                {showEnergyCost && (
                    <label className="flex flex-col gap-1">
                        <span className="text-[9px] opacity-60 uppercase text-gray-400">Coste Energía</span>
                        <select id={prefix + '-energy-cost'} className={inputClass}>
                            <option value="low">Bajo</option>
                            <option value="normal">Normal</option>
                            <option value="high">Alto</option>
                        </select>
                    </label>
                )}
            </div>

            {showApplyButton && (
                <React.Fragment>
                    <button id={prefix.replace('dev-config', 'btn-dev-apply')}
                        className="mt-2 text-[10px] w-full py-2 uppercase border border-red-500/50 text-red-500 hover:bg-red-900/20 transition-colors font-bold tracking-wider">
                        <i className="fa-solid fa-microchip mr-1"></i> INYECTAR PARAMETROS
                    </button>
                    <div id={prefix.replace('dev-config', 'dev-feedback')} className="text-[9px] text-center h-4 text-green-400 font-mono hidden">
                        PARAMETROS ACTUALIZADOS
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};
