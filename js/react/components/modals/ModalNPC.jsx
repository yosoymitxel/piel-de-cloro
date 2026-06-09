/**
 * ModalNPC - Ficha de detalle e historial del NPC (Sujeto).
 */
window.RC = window.RC || {};
window.RC.ModalNPC = function ModalNPC() {
    const PanelScrews = window.RC.PanelScrews;
    return (
        <div id="modal-npc" className="modal-overlay-base z-[200] hidden p-4 backdrop-blur-sm flex items-center justify-center">
            <div className="horror-panel-modal w-full max-w-4xl max-h-[95vh] p-0 flex flex-col animate__animated animate__zoomIn overflow-hidden bg-[#050505] relative">
                <PanelScrews />
                <header className="shrink-0 p-4 border-b border-white/10">
                    <div className="text-[10px] font-mono text-chlorine-light uppercase tracking-[0.3em]">DETALLE_SUJETO</div>
                    <span className="close-modal absolute top-2 right-6 text-3xl cursor-pointer text-gray-500 hover:text-white z-30 leading-none">&times;</span>
                </header>

                <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
                    {/* Columna Izquierda: Identidad y Visual */}
                    <div className="lg:w-2/5 flex flex-col border-r border-white/10 bg-black/20 shrink-0">
                        {/* Visual Feed */}
                        <div id="modal-visual-container" className="relative w-full h-[220px] bg-black flex justify-center items-end border-b border-white/5 overflow-hidden shrink-0">
                            <div className="absolute top-3 left-6 text-sm font-mono text-gray-400 z-20 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_5px_red]"></span>
                                <span>LIVE_FEED</span>
                            </div>
                            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)", backgroundSize: "100% 3px" }}>
                            </div>
                        </div>

                        {/* Identity Info */}
                        <div className="p-6 flex flex-col gap-4 flex-1">
                            <div className="flex flex-col gap-1">
                                <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">EXPEDIENTE_SUJETO</div>
                                <h2 id="modal-npc-name" className="text-2xl font-bold text-white tracking-[0.2em] uppercase glitch-effect" data-text="X">X</h2>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span id="modal-npc-occupation" className="text-xs font-mono text-cyan-400 px-2 py-1 border border-cyan-500/30 bg-cyan-500/5 uppercase hidden">
                                        <i className="fa-solid fa-briefcase mr-1"></i><span className="value">---</span>
                                    </span>
                                    <span id="modal-npc-trait" className="text-sm font-mono text-amber-500 px-2 py-1 border border-amber-500/30 bg-amber-500/5">---</span>
                                    <span id="modal-npc-status" className="text-xs font-mono text-gray-400 px-2 py-1 border border-white/10 bg-white/5">ESTADO: PENDIENTE</span>
                                </div>
                            </div>

                            {/* Spacer */}
                            <div className="flex-1"></div>

                            {/* Primary Actions */}
                            <div className="pt-4 border-t border-white/10">
                                <button id="btn-modal-purge" className="horror-btn horror-btn-alert w-full py-4 text-sm font-bold tracking-[0.4em] uppercase">
                                    <i className="fa-solid fa-biohazard mr-2"></i> PROTOCOLO_EXPULSIÓN
                                </button>
                                <div id="modal-error" className="text-alert text-center text-sm hidden font-mono mt-3 uppercase animate-pulse">
                                    <i className="fa-solid fa-triangle-exclamation mr-1"></i> ERROR DE SISTEMA: RECURSOS INSUFICIENTES
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Análisis y Datos */}
                    <div className="lg:w-3/5 flex flex-col overflow-y-auto custom-scrollbar p-6 gap-6 bg-[#050505]">
                        {/* Test Grid */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <h4 className="text-sm font-mono text-gray-500 uppercase tracking-[0.2em]">ANÁLISIS_BIOMÉTRICO_ACTIVO</h4>
                                <span className="text-[10px] font-mono text-cyan-500/50 uppercase">R01-X99_SYS_CORE</span>
                            </div>
                            <div id="modal-tests-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-2 hidden">
                                {/* Buttons injected here */}
                            </div>
                        </div>

                        {/* Stats Results */}
                        <div className="flex flex-col gap-3">
                            <h4 className="text-sm font-mono text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">RESULTADOS_ANALÍTICA</h4>
                            <div id="modal-npc-stats-content" className="dossier-stats-grid"></div>
                        </div>

                        {/* Log */}
                        <div className="flex flex-col gap-3 flex-1 min-h-[200px]">
                            <h4 className="text-sm font-mono text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">HISTORIAL_INTERACCIÓN</h4>
                            <div id="modal-npc-log" className="flex-1 dossier-log-container !h-full custom-scrollbar bg-black/40 border border-white/5 p-3">
                                {/* History */}
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="p-3 bg-black border-t border-white/5 text-[10px] text-gray-700 text-center uppercase font-mono tracking-widest shrink-0">
                    PROPIEDAD DE LA CORPORACIÓN RUTA-01 // ACCESO RESTRINGIDO
                </footer>
            </div>
        </div>
    );
};
