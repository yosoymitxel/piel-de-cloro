/**
 * ScreenExpedition - Pantalla de expedición activa de suministros/combustible.
 */
window.RC = window.RC || {};
window.RC.ScreenExpedition = function ScreenExpedition() {
    return (
        <section id="screen-expedition" className="h-full flex flex-col p-8 items-center justify-center gap-8 hidden crt-flicker bg-[#050505]">
            <div className="industrial-panel max-w-2xl w-full p-12 flex flex-col items-center gap-8 relative">
                <i className="fa-solid fa-person-walking-luggage text-6xl text-amber-500 animate-pulse"></i>

                <div className="text-center">
                    <h2 className="text-4xl text-glow text-amber-500 tracking-tighter mb-2">
                        OPERACIÓN_EXTERNA_ACTIVA
                    </h2>
                    <p id="expedition-npc-name" className="font-mono text-gray-400">
                        PERSONAL REPLEGADO: <span className="text-white">---</span>
                    </p>
                </div>

                {/* Barra de Progreso */}
                <div className="w-full space-y-2">
                    <div className="flex justify-between font-mono text-xs text-amber-600">
                        <span>ESTADO: BUSCANDO EN EL PERÍMETRO</span>
                        <span id="expedition-progress-text">0%</span>
                    </div>
                    <div className="w-full h-4 bg-black border border-amber-900/30 p-0.5">
                        <div id="expedition-progress-fill" className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-300" style={{ width: "0%" }}></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 w-full">
                    <div className="bg-black/40 border border-red-900/20 p-4 flex flex-col items-center">
                        <span className="text-[10px] font-mono text-gray-500 uppercase">Riesgo de Letalidad</span>
                        <span id="expedition-risk-value" className="text-2xl font-bold text-red-500">0%</span>
                    </div>
                    <div className="bg-black/40 border border-green-900/20 p-4 flex flex-col items-center">
                        <span className="text-[10px] font-mono text-gray-500 uppercase">Suministros Estimados</span>
                        <span id="expedition-loot-value" className="text-2xl font-bold text-green-500">0</span>
                    </div>
                </div>

                <div className="italic text-xs text-gray-600 font-mono text-center">
                    ADVERTENCIA: INTERRUPCIÓN DE LA SEÑAL DURANTE LA EXTRACCIÓN.
                </div>
            </div>
        </section>
    );
};
