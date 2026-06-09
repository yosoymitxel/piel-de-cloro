/**
 * ModalShell - Wrapper genérico de modal para la interfaz industrial.
 * Proporciona overlay, panel horror animado, tornillos decorativos, cabecera y pie.
 */
window.RC = window.RC || {};
window.RC.ModalShell = function ModalShell({ id, overlayClass, panelClass, title, onClose, children, showFooter = true }) {
    const PanelScrews = window.RC.PanelScrews;
    return (
        <div id={id} className={`modal-overlay-base z-[100] hidden p-4 backdrop-blur-sm flex items-center justify-center ${overlayClass || ''}`}>
            <div className={`horror-panel-modal max-w-2xl w-full p-0 flex flex-col animate__animated animate__zoomIn animate__faster overflow-hidden ${panelClass || ''}`}>
                <PanelScrews />
                <header className="flex justify-between items-center p-4 border-b border-chlorine/30">
                    <div className="text-[10px] font-mono text-chlorine-light uppercase tracking-[0.3em]">
                        {title}
                    </div>
                    {onClose && (
                        <button id={onClose.id} className="text-gray-400 hover:text-white transition-colors">
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                    )}
                </header>

                {children}

                {showFooter && (
                    <footer>
                        <span className="app-version-full"></span>
                    </footer>
                )}
            </div>
        </div>
    );
};
