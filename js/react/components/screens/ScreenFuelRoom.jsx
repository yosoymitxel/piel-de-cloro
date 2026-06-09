/**
 * ScreenFuelRoom - Sala de Depósito de Combustible.
 */
window.RC = window.RC || {};
window.RC.ScreenFuelRoom = function ScreenFuelRoom() {
    return (
        <section id="screen-fuel-room" className="h-full flex flex-col hidden crt-flicker overflow-y-auto">
            <header className="flex justify-between items-center border-b border-chlorine/30 p-6 bg-black/40">
                <div>
                    <h1 className="text-3xl text-glow tracking-tighter uppercase font-black text-rose-400">
                        DEPÓSITO_B4_H3
                    </h1>
                    <p className="font-mono text-[10px] opacity-60 tracking-widest text-rose-200">
                        EXTRACCIÓN DE RECURSOS VOLÁTILES // ALTA LETALIDAD
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="comp-fuel"></div>
                    <div className="industrial-tag flex flex-col items-end">
                        <span className="text-[9px] opacity-40 uppercase">Reserva</span>
                        <span id="fuel-hub-count" className="text-xs font-bold text-rose-500">0 UNITS</span>
                    </div>
                </div>
            </header>

            <div className="flex-grow flex flex-col items-center justify-center p-12">
                <div className="industrial-panel p-12 border border-rose-500/20 bg-black/60 flex flex-col items-center gap-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none"></div>
                    <div className="grid grid-cols-3 gap-6 opacity-30">
                        <i className="fa-solid fa-gas-pump text-4xl"></i>
                        <i className="fa-solid fa-radiation text-4xl"></i>
                        <i className="fa-solid fa-gas-pump text-4xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-rose-500 uppercase tracking-[0.3em]">CONTROL DE EXTRACCIÓN</h2>
                    <p className="text-center text-sm opacity-60 max-w-[450px]">
                        Desplegar personal asignado para recuperar combustible del depósito externo.
                    </p>

                    <button id="btn-start-fuel-expedition" className="horror-btn border-rose-500/60 hover:bg-rose-500/20 px-16 py-6 font-black text-rose-400 tracking-widest transition-all">
                        INICIAR EXTRACCIÓN
                    </button>

                    <div id="fuel-guard-panel" className="w-full mt-4">
                        <div className="guard-card empty w-full flex items-center justify-between p-3 border border-dashed border-rose-500/30 bg-rose-500/5 group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center bg-black/60 rounded border border-rose-500/20">
                                    <i class="fa-solid fa-user-slash text-rose-500/50"></i>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-rose-500/70">PUESTO VACANTE</span>
                                    <span className="text-[9px] opacity-50">CLICK PARA ASIGNAR</span>
                                </div>
                            </div>
                            <button className="text-xs border border-rose-500/30 px-3 py-1 text-rose-400 hover:bg-rose-500/20 uppercase">
                                + Asignar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
