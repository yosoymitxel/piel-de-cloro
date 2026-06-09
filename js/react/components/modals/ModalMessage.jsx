/**
 * ModalMessage - Modal genérico para notificaciones simples.
 */
window.RC = window.RC || {};
window.RC.ModalMessage = function ModalMessage() {
    const ModalShell = window.RC.ModalShell;
    return (
        <ModalShell
            id="modal-message"
            title="SISTEMA_NOTIFICACIÓN"
            showFooter={true}
        >
            <div className="p-8 flex flex-col gap-6">
                <div id="modal-message-content" className="text-center font-mono text-sm leading-relaxed text-gray-300 uppercase tracking-tight text-center">
                </div>
                <button id="btn-message-ok" className="horror-btn horror-btn-primary py-3 text-xs uppercase tracking-[0.2em]">
                    <i className="fa-solid fa-check mr-2"></i>ENTENDIDO
                </button>
            </div>
        </ModalShell>
    );
};
