/**
 * ScreenLog - Bitácora de eventos y rumores.
 */
window.RC = window.RC || {};
window.RC.ScreenLog = function ScreenLog() {
    return (
        <section id="screen-log" className="h-full flex flex-col p-4 gap-4 hidden animate__animated animate__fadeIn bg-black/95">
            <header className="flex justify-between items-center border-b border-chlorine pb-2">
                <div>
                    <h2 className="text-2xl text-glow">BITÁCORA DE RUTA</h2>
                    <span className="font-mono text-xs opacity-70">REGISTRO CRONOLÓGICO</span>
                </div>
                <button id="btn-log-close-header" className="text-chlorine hover:text-alert text-3xl transition-colors px-2">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </header>

            {/* TABS BITÁCORA */}
            <div className="flex border-b border-chlorine/20 mt-2 mb-2">
                <button id="tab-log-events" className="log-tab active px-6 py-2 font-mono text-xs uppercase tracking-widest border-b-2 border-chlorine">Eventos</button>
                <button id="tab-log-rumors" className="log-tab px-6 py-2 font-mono text-xs uppercase tracking-widest border-b-2 border-transparent opacity-60 hover:opacity-100">Rumores</button>
            </div>

            <div id="log-container" className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-3 font-mono bg-black/40 border border-chlorine/20">
                {/* Entries injected by JS */}
            </div>

            <div id="rumors-container" className="hidden flex-grow overflow-y-auto custom-scrollbar p-2 space-y-3 font-mono bg-black/40 border border-chlorine/20">
                {/* Rumors injected by JS (State.rumors) */}
                <div className="text-gray-500 italic text-center p-4">Sin rumores registrados.</div>
            </div>

            <div className="flex justify-center pt-2">
                <button id="btn-log-back" className="horror-btn horror-btn-primary px-8 py-3 text-lg">
                    <i className="fa-solid fa-arrow-left mr-2"></i> VOLVER AL PUESTO
                </button>
            </div>
        </section>
    );
};
