/**
 * ScreenFinalStats - Informe final de misión / estadísticas finales.
 */
window.RC = window.RC || {};
window.RC.ScreenFinalStats = function ScreenFinalStats() {
    const PanelScrews = window.RC.PanelScrews;
    return (
        <section id="screen-final-stats" className="h-full flex flex-col p-8 gap-6 hidden crt-flicker">
            <div className="industrial-panel flex-grow flex flex-col p-8 m-0 relative overflow-hidden">
                <PanelScrews />

                {/* Scanlines effect specific to this panel */}
                <div className="scanline"></div>

                <header className="text-center space-y-2 mb-6 relative z-20">
                    <h2 className="text-4xl font-bold text-terminal-green tracking-tighter glitch-effect" data-text="INFORME DE MISIÓN">
                        INFORME DE MISIÓN
                    </h2>
                    <p className="text-xs font-mono opacity-50 text-terminal-green/70">
                        REGISTRO FINAL DE OPERACIONES - SECTOR RUTA-01
                    </p>
                </header>

                <div className="stats-grid-container relative z-20">
                    {/* POBLACIÓN */}
                    <div className="stat-card-retro">
                        <h3 className="text-terminal-green border-b border-terminal-green/20 mb-3 text-sm font-bold uppercase tracking-widest flex justify-between">
                            <span>RESUMEN DE POBLACIÓN</span>
                            <i className="fa-solid fa-users"></i>
                        </h3>
                        <div className="space-y-3 text-sm font-mono">
                            <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="opacity-60">Sujetos procesados:</span>
                                <span id="final-stat-total" className="text-white font-bold">0</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="opacity-60">Admitidos:</span>
                                <span id="final-stat-admitted" className="text-terminal-green">0</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="opacity-60">Purgados:</span>
                                <span id="final-stat-purged" className="text-alert">0</span>
                            </div>
                        </div>
                    </div>

                    {/* SEGURIDAD BIOLÓGICA */}
                    <div className="stat-card-retro">
                        <h3 className="text-alert border-b border-alert/20 mb-3 text-sm font-bold uppercase tracking-widest flex justify-between">
                            <span>SEGURIDAD BIOLÓGICA</span>
                            <i className="fa-solid fa-biohazard"></i>
                        </h3>
                        <div className="space-y-3 text-sm font-mono">
                            <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="opacity-60">Infectados detectados:</span>
                                <span id="final-stat-infected" className="text-white">0</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="opacity-60">Infectados filtrados:</span>
                                <span id="final-stat-leaked" class="text-alert">0</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="opacity-60">Civiles caídos:</span>
                                <span id="final-stat-deaths" className="text-alert">0</span>
                            </div>
                        </div>
                    </div>

                    {/* RESULTADO FINAL */}
                    <div className="final-outcome-box">
                        <div className="text-sm font-mono opacity-40 uppercase tracking-[0.5em] mb-2">VERDICTO DEL SISTEMA</div>
                        <div className="flex flex-col gap-2">
                            <div id="final-stat-outcome" className="text-5xl font-black tracking-tighter uppercase glitch-effect" data-text="PENDIENTE">
                                PENDIENTE
                            </div>
                            <div id="final-stat-ending-title" className="text-xs font-bold text-white uppercase tracking-[0.2em] opacity-80">
                                ---
                            </div>
                        </div>
                        <div id="final-stat-notes" className="mt-4 text-xs font-mono text-gray-500 max-w-lg mx-auto leading-relaxed italic border-l border-white/10 pl-4 text-left">
                            {/* Notas dinámicas */}
                        </div>
                    </div>
                </div>

                <footer className="mt-auto flex justify-center pb-4 z-20">
                    <button id="btn-final-to-start" className="horror-btn horror-btn-primary px-10 py-3 text-sm tracking-[0.3em]">
                        VOLVER AL INICIO
                    </button>
                </footer>
            </div>
        </section>
    );
};
