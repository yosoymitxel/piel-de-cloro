/**
 * ScreenMorgue - Registro del perímetro (bajas, fugas, etc.).
 */
window.RC = window.RC || {};
window.RC.ScreenMorgue = function ScreenMorgue() {
    const PanelScrews = window.RC.PanelScrews;
    return (
        <section id="screen-morgue" className="h-full flex flex-col p-4 gap-4 hidden crt-flicker">
            <div className="industrial-panel flex-grow flex flex-col gap-4 overflow-hidden relative">
                <PanelScrews />

                {/* Radar Sweep Effect */}
                <div className="radar-sweep"></div>

                <header className="flex justify-between items-center border-b border-yellow-500/30 pb-2 relative z-20">
                    <h2 className="text-2xl text-glow font-mono tracking-wider">LOG_PERIMETRO_V4.0</h2>
                    <div className="flex gap-4 text-sm font-mono opacity-70">
                        <span className="text-alert"><i className="fa-solid fa-skull mr-1"></i> BAJAS</span>
                        <span className="text-yellow-500"><i class="fa-solid fa-person-running mr-1"></i> FUGAS</span>
                        <span className="text-blue-400"><i className="fa-solid fa-moon mr-1"></i> NOCTURNOS</span>
                    </div>
                </header>

                <div className="flex-grow flex flex-col gap-4 overflow-hidden z-20">
                    {/* TOP: PURGED */}
                    <div className="flex-1 flex flex-col min-h-0 perimeter-log-section cat-purged relative">
                        <div className="section-label">REGISTRO_PURGAS</div>
                        <div id="morgue-grid-purged" className="flex-grow grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2 overflow-y-auto custom-scrollbar p-3 pt-6"></div>
                    </div>

                    {/* MIDDLE: ESCAPED */}
                    <div className="flex-1 flex flex-col min-h-0 perimeter-log-section cat-escaped relative">
                        <div className="section-label">REGISTRO_INTRUSIONES</div>
                        <div id="morgue-grid-escaped" className="flex-grow grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2 overflow-y-auto custom-scrollbar p-3 pt-6"></div>
                    </div>

                    {/* BOTTOM: NIGHT */}
                    <div className="flex-1 flex flex-col min-h-0 perimeter-log-section cat-night relative">
                        <div className="section-label">ACTIVIDAD_NOCTURNA</div>
                        <div id="morgue-grid-night" className="flex-grow grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2 overflow-y-auto custom-scrollbar p-3 pt-6"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};
