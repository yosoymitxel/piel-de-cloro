/**
 * ModalValidation - Validación biométrica/diálogo requerida.
 */
window.RC = window.RC || {};
window.RC.ModalValidation = function ModalValidation() {
    const ModalShell = window.RC.ModalShell;
    return (
        <ModalShell
            id="validation-overlay"
            title="VALIDACIÓN_PENDIENTE"
            overlayClass="z-[250]"
            showFooter={false}
        >
            <div className="p-8 flex flex-col gap-6 bg-[#050505]">
                <div className="text-center">
                    <i className="fa-solid fa-triangle-exclamation text-3xl text-alert mb-4"></i>
                    <p className="font-mono text-xs text-gray-400 leading-relaxed uppercase tracking-tight">
                        Debes realizar un <span className="text-white font-bold">test biométrico</span> o participar en un <span className="text-white font-bold">diálogo profundo</span> antes de continuar.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <button id="btn-do-test" className="horror-btn horror-btn-primary py-3 text-xs uppercase tracking-[0.2em]">
                        <i className="fa-solid fa-microscope mr-2"></i>REALIZAR TEST
                    </button>
                    <button id="btn-omit-test" className="horror-btn horror-btn-warning py-3 text-xs uppercase tracking-[0.2em] opacity-60 hover:opacity-100">
                        <i className="fa-solid fa-forward mr-2"></i>OMITIR POR DIÁLOGO
                    </button>
                </div>
            </div>
            <footer className="p-4 bg-black border-t border-white/5 text-[10px] text-gray-500 text-center font-mono">
                PROTOCOLO DE BIO-SEGURIDAD ACTIVADO
            </footer>
        </ModalShell>
    );
};
