/**
 * ModalRelocate - Selección de sujetos para mudanza de sector.
 */
window.RC = window.RC || {};
window.RC.ModalRelocate = function ModalRelocate() {
    const PanelScrews = window.RC.PanelScrews;
    return (
        <div id="modal-relocate" className="modal-overlay-base z-[150] hidden p-4 backdrop-blur-md flex items-center justify-center">
            <div className="horror-panel-modal w-full max-w-[650px] p-0 flex flex-col animate__animated animate__fadeInDown overflow-hidden relative">
                <PanelScrews />
                <header className="p-4 border-b border-chlorine/30">
                    <div className="text-[10px] font-mono text-warning uppercase tracking-[0.3em]">
                        PROTOCOLO_LOGÍSTICO_MUDANZA
                    </div>
                </header>

                <div className="p-8 bg-[#050505] flex flex-col gap-6">
                    <div className="text-center mb-2">
                        <h3 className="text-3xl font-mono tracking-[0.2em] text-warning glitch-effect uppercase" data-text="MUDANZA DE SECTOR">
                            MUDANZA DE SECTOR
                        </h3>
                        <p className="text-sm font-mono text-gray-500 mt-2 uppercase">
                            Selecciona a los sujetos que mantendrás en el transporte
                        </p>
                    </div>

                    <div className="bg-black/60 border border-warning/20 p-4 relative">
                        <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-black px-2 text-[10px] font-mono text-warning uppercase">
                            AVISO_IMPORTANTE
                        </div>
                        <p id="relocate-restrictions-text" className="text-[11px] font-mono text-gray-400 leading-relaxed uppercase">
                            RESTRICCIONES: El transporte es limitado. Solo puedes llevar contigo a un número limitado de sujetos. <span className="text-warning font-bold">Los no seleccionados serán abandonados en el sector actual.</span>
                        </p>
                    </div>

                    <div id="relocate-selection-grid" className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto custom-scrollbar p-2 bg-black/40 border border-white/5">
                        {/* NPCs to select will be injected here */}
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex justify-between items-center px-4 py-2 bg-warning/5 border border-warning/20">
                            <span className="text-sm font-mono text-gray-500 uppercase">SUJETOS SELECCIONADOS PARA EVACUACIÓN:</span>
                            <span id="relocate-count" className="text-xl font-bold font-mono text-warning">0 / -</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button id="btn-relocate-cancel" className="horror-btn border-gray-600 text-gray-400 py-4 text-xs uppercase tracking-[0.2em] hover:bg-white/5">
                                <i className="fa-solid fa-xmark mr-2"></i>ABORTAR
                            </button>
                            <button id="btn-relocate-confirm" className="horror-btn horror-btn-primary py-4 text-xs uppercase tracking-[0.2em] bg-warning/20 border-warning text-warning hover:bg-warning hover:text-black disabled:opacity-20 disabled:grayscale disabled:pointer-events-none" disabled>
                                <i className="fa-solid fa-truck-ramp-box mr-2"></i>INICIAR TRASLADO
                            </button>
                        </div>
                    </div>
                </div>

                <footer>
                    <span className="app-version-full"></span>
                </footer>
            </div>
        </div>
    );
};
