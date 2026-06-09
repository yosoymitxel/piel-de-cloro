/**
 * ModalSettings - Configuración principal del menú de inicio.
 * Integra controles de audio y panel dev.
 */
window.RC = window.RC || {};
window.RC.ModalSettings = function ModalSettings() {
    const ModalShell = window.RC.ModalShell;
    const AudioSettings = window.RC.AudioSettings;
    const DevConfigPanel = window.RC.DevConfigPanel;

    return (
        <ModalShell
            id="modal-settings"
            title="SISTEMA_CONFIGURACIÓN"
            overlayClass="z-[200]"
            showFooter={true}
        >
            <div className="p-8 flex flex-col gap-6 bg-[#050505]">
                <div className="text-center">
                    <h3 className="text-2xl font-mono tracking-[0.2em] text-chlorine-light glitch-effect" data-text="CONFIG">
                        CONFIGURACIÓN
                    </h3>
                    <div className="text-[10px] font-mono opacity-40 mt-1 uppercase">
                        AJUSTES DEL SISTEMA // RUTA-01
                    </div>
                </div>

                {/* Configuración de Audio */}
                <AudioSettings prefix="" />

                {/* Developer Config (Hidden by default) */}
                <DevConfigPanel id="settings-dev-section" prefix="dev-config" showEnergyCost={false} showApplyButton={false} />

                <div className="flex flex-col gap-4">
                    <button id="btn-settings-apply" className="horror-btn horror-btn-primary py-4 text-sm uppercase tracking-widest">
                        <i className="fa-solid fa-check mr-2"></i> APLICAR Y CERRAR
                    </button>
                </div>
            </div>
        </ModalShell>
    );
};
