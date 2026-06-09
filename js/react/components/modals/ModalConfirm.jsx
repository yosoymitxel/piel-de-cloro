/**
 * ModalConfirm - Modal de confirmación para acciones críticas (ej. purgar, reiniciar).
 */
window.RC = window.RC || {};
window.RC.ModalConfirm = function ModalConfirm() {
    const ModalShell = window.RC.ModalShell;
    return (
        <ModalShell
            id="modal-confirm"
            title="CONFIRMACIÓN_REQUERIDA"
            overlayClass="z-[210]"
            showFooter={true}
        >
            <div className="p-8 flex flex-col gap-6 bg-[#050505]">
                <div className="text-center">
                    <i className="fa-solid fa-circle-question text-3xl text-warning mb-4"></i>
                    <div id="modal-confirm-content" className="font-mono text-sm leading-relaxed text-gray-300 uppercase tracking-tight">
                        ¿ESTÁ SEGURO DE REALIZAR ESTA ACCIÓN?
                    </div>
                </div>

                <div className="flex gap-4">
                    <button id="btn-confirm-yes" className="horror-btn horror-btn-alert flex-1 py-3 text-xs uppercase tracking-widest">
                        <i className="fa-solid fa-check mr-2"></i>CONFIRMAR
                    </button>
                    <button id="btn-confirm-cancel" className="horror-btn flex-1 py-3 text-xs uppercase tracking-widest border-gray-600 text-gray-400">
                        <i className="fa-solid fa-xmark mr-2"></i>CANCELAR
                    </button>
                </div>
            </div>
        </ModalShell>
    );
};
