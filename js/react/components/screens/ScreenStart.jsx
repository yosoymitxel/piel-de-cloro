/**
 * ScreenStart - Pantalla de inicio del juego.
 */
window.RC = window.RC || {};
window.RC.ScreenStart = function ScreenStart() {
    const PanelScrews = window.RC.PanelScrews;
    return (
        <section id="screen-start" className="h-full flex flex-col justify-center items-center gap-6 p-4 crt-flicker">
            <div className="industrial-panel w-full max-w-[600px] flex flex-col items-center py-12">
                <PanelScrews />

                <h1 className="text-6xl font-bold text-chlorine text-glow glitch-effect mb-2" data-text="PIEL DE CLORO">
                    PIEL DE CLORO
                </h1>
                <h2 className="text-xl tracking-[0.5em] opacity-80 mb-8">PROTOCOLO DE SEGURIDAD</h2>

                <div className="italic text-center text-sm opacity-60 font-mono mb-12 max-w-[400px]">
                    "Identifica a los infectados. Protege el refugio."
                </div>

                <div className="flex flex-col gap-4 w-full max-w-[300px] relative z-10">
                    <button id="btn-start-game" className="horror-btn horror-btn-primary p-6 text-2xl group relative overflow-hidden">
                        <span className="relative z-10" id="btn-start-game-text">INICIAR PARTIDA</span>
                        <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                    </button>

                    <button id="btn-toggle-fullscreen" className="font-mono text-sm text-gray-500 hover:text-white transition-colors uppercase tracking-widest mt-2">
                        <i className="fa-solid fa-expand mr-1"></i> Pantalla Completa
                    </button>
                </div>

                {/* Record de finales */}
                <div id="endings-record" className="mt-12 text-sm font-mono opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="uppercase tracking-[0.2em]">Archivos Recuperados:</span>
                    <span id="endings-count" className="text-white ml-2">0/0</span>
                    <div id="endings-dots" className="flex justify-center gap-1 mt-2">
                        {/* Dots dinámicos */}
                    </div>
                </div>
            </div>
        </section>
    );
};
