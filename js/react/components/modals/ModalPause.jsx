/**
 * ModalPause - Menú de pausa del juego.
 * Integra controles de audio y panel dev.
 */
window.RC = window.RC || {};
window.RC.ModalPause = function ModalPause() {
    const ModalShell = window.RC.ModalShell;
    const AudioSettings = window.RC.AudioSettings;
    const DevConfigPanel = window.RC.DevConfigPanel;

    return (
        <ModalShell
            id="modal-pause"
            title="SISTEMA_PAUSA"
            overlayClass="z-[200]"
            showFooter={true}
        >
            <div className="p-8 flex flex-col gap-6 bg-[#050505]">
                <div className="text-center">
                    <h3 className="text-4xl font-mono tracking-[0.2em] text-chlorine-light glitch-effect" data-text="PAUSA">
                        PAUSA
                    </h3>
                    <div className="text-[10px] font-mono opacity-40 mt-1 uppercase">
                        SISTEMA EN ESPERA // RUTA-01
                    </div>
                </div>

                {/* Configuración Rápida */}
                <AudioSettings prefix="pause" />

                {/* Developer Config (Hidden by default) */}
                <DevConfigPanel id="dev-config-panel" prefix="pause-dev-config" showEnergyCost={true} showApplyButton={true} />

                <div className="flex flex-col gap-4">
                    <button id="btn-pause-close" className="horror-btn horror-btn-primary py-4 text-sm uppercase tracking-widest">
                        <i className="fa-solid fa-play mr-2"></i> CONTINUAR
                    </button>
                    <button id="btn-pause-fullscreen" className="horror-btn py-3 text-sm uppercase border-blue-900/50 text-blue-400 hover:bg-blue-600 hover:text-black transition-colors">
                        <i className="fa-solid fa-expand mr-2"></i> Pantalla Completa
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button id="btn-pause-restart-day" className="horror-btn py-3 text-sm uppercase border-amber-900/50 text-amber-500 hover:bg-amber-600 hover:text-black transition-colors">
                            <i class="fa-solid fa-rotate-left mr-1"></i> REINICIAR DÍA
                        </button>
                        <button id="btn-pause-restart-game" className="horror-btn py-3 text-sm uppercase border-red-900/50 text-red-500 hover:bg-red-600 hover:text-black transition-colors">
                            <i className="fa-solid fa-skull mr-1"></i> NUEVA PARTIDA
                        </button>
                    </div>
                    <button id="btn-pause-to-start" className="horror-btn py-3 text-sm uppercase border-gray-800 text-gray-500 hover:bg-gray-700 hover:text-white transition-colors">
                        <i className="fa-solid fa-house mr-2"></i> VOLVER AL INICIO
                    </button>
                </div>
            </div>
        </ModalShell>
    );
};
