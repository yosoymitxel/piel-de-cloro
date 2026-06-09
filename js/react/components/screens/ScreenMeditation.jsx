/**
 * ScreenMeditation - Sala de Meditación (Sueño Z).
 * Elimina la duplicación existente en el monolito original.
 */
window.RC = window.RC || {};
window.RC.ScreenMeditation = function ScreenMeditation() {
    return (
        <section id="screen-meditation" className="h-full flex flex-col hidden crt-flicker overflow-y-auto">
            <header className="flex justify-between items-center border-b border-chlorine/30 p-6 bg-black/40">
                <div>
                    <h1 className="text-3xl text-glow tracking-tighter uppercase font-black text-blue-300">
                        SALA_DE_SUEÑO_Z
                    </h1>
                    <p className="font-mono text-[10px] opacity-60 tracking-widest text-blue-200">
                        SISTEMA DE RECUPERACIÓN PSICOSOMÁTICA
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="comp-paranoia"></div>
                    <div className="comp-sanity"></div>
                    <div className="industrial-tag flex flex-col items-end">
                        <span className="text-[9px] opacity-40 uppercase">Aislamiento</span>
                        <span className="text-xs font-bold text-blue-400">ACTIVE_SILENCE</span>
                    </div>
                </div>
            </header>

            <div className="flex-grow flex flex-col items-center justify-center gap-12 p-8">
                <div className="meditation-visualizer w-48 h-48 border-2 border-blue-400/20 rounded-full flex items-center justify-center relative">
                    <div className="meditation-wave absolute w-full h-full rounded-full border border-blue-400/40 animate-ping opacity-20"></div>
                    <i className="fa-solid fa-spa text-3xl text-blue-400/60 z-10"></i>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[700px]">
                    <button id="btn-med-breath" className="horror-btn border-blue-500/30 hover:bg-blue-500/10 p-4 flex flex-col items-center gap-2 group">
                        <i className="fa-solid fa-wind text-xl group-hover:animate-bounce"></i>
                        <span className="font-bold">RESPIRACIÓN GUIADA</span>
                        <span className="text-[9px] opacity-60 uppercase">REDUCE PARANOIA (-5)</span>
                    </button>

                    <button id="btn-med-music" className="horror-btn border-blue-500/30 hover:bg-blue-500/10 p-4 flex flex-col items-center gap-2 group">
                        <i className="fa-solid fa-music text-xl group-hover:scale-110"></i>
                        <span className="font-bold">FRECUENCIAS_Z</span>
                        <span className="text-[9px] opacity-60 uppercase">RESTAURA CORDURA (+5)</span>
                    </button>
                </div>

                <div className="text-center font-mono text-[10px] opacity-40 max-w-[500px]">
                    "Respira. Ignora los rasguños en la ventilación."
                </div>
            </div>
        </section>
    );
};
