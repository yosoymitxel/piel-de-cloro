/**
 * ModalEndings - Modal de finales recuperados / archivos.
 */
window.RC = window.RC || {};
window.RC.ModalEndings = function ModalEndings() {
    const PanelScrews = window.RC.PanelScrews;
    return (
        <div id="modal-endings" className="modal-overlay-base z-[100] hidden p-4 backdrop-blur-sm flex items-center justify-center">
            <div className="horror-panel-modal w-full max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
                <PanelScrews />
                <header className="flex justify-between items-center p-4 border-b border-chlorine/30">
                    <div className="text-[10px] font-mono text-chlorine-light uppercase tracking-[0.3em]">
                        BASE_DATOS: FINALES_RECUPERADOS
                    </div>
                    <button id="btn-close-endings" className="text-gray-400 hover:text-white transition-colors">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </header>

                <div id="endings-list" className="p-8 overflow-y-auto flex flex-col gap-4 font-mono custom-scrollbar bg-[#050505] flex-1">
                    {/* Finales se renderizan aquí */}
                </div>

                <footer>
                    <span className="app-version-full"></span>
                </footer>
            </div>
        </div>
    );
};
