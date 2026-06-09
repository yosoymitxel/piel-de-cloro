/**
 * ModalTutorial - Tutorial de bienvenida e inducción.
 */
window.RC = window.RC || {};
window.RC.ModalTutorial = function ModalTutorial() {
    const PanelScrews = window.RC.PanelScrews;
    return (
        <div id="modal-tutorial" className="fixed inset-0 bg-black/95 z-[300] hidden items-center justify-center p-4 backdrop-blur-xl">
            <div className="horror-panel-modal w-full max-w-2xl p-0 flex flex-col relative overflow-hidden animate__animated animate__fadeIn border-t-4 border-t-chlorine">
                <PanelScrews />
                <header className="p-6 border-b border-white/10 bg-white/5 text-center">
                    <div className="text-chlorine text-4xl font-bold tracking-[0.3em] uppercase glitch-effect" data-text="BIENVENIDO, GUARDIÁN">
                        BIENVENIDO, GUARDIÁN
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-2">
                        Protocolo de Inducción RUTA-01 // Ciclo de Emergencia
                    </div>
                </header>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 font-mono bg-[#050505]">
                    <section className="space-y-4">
                        <h3 className="text-chlorine-light font-bold border-b border-chlorine/30 pb-1 text-sm uppercase">Tu Misión</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Eres el último filtro. Debes inspeccionar a cada civil que llegue al puesto.
                            <br /><br />
                            Tu objetivo es <span className="text-white font-bold">ADMITIR</span> a los sanos y <span className="text-alert font-bold uppercase">PURGAR</span> a los infectados por "Piel de Cloro".
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 class="text-chlorine-light font-bold border-b border-chlorine/30 pb-1 text-sm uppercase">Los Síntomas</h3>
                        <ul className="text-sm text-gray-400 space-y-2">
                            <li><i className="fa-solid fa-temperature-low text-blue-400 mr-2"></i> <span className="text-white">HIPOTERMIA:</span> Menos de 35°C.</li>
                            <li><i className="fa-solid fa-eye text-green-400 mr-2"></i> <span className="text-white">PUPILAS:</span> Dilatación fija o formas raras.</li>
                            <li><i className="fa-solid fa-droplet text-purple-400 mr-2"></i> <span className="text-white">PIEL:</span> Sequedad extrema o manchas UV.</li>
                            <li><i className="fa-solid fa-heart-crack text-red-500 mr-2"></i> <span className="text-white">PULSO:</span> Muy lento o errático.</li>
                        </ul>
                    </section>
                </div>

                <div className="px-8 py-4 bg-black border-t border-white/5 text-sm text-center text-gray-500 italic font-mono">
                    "Si dudas, consulta la <span className="text-blue-400 font-bold">BASE DE DATOS</span> en el panel lateral. Cada error sube la Paranoia del sector."
                </div>

                <footer className="p-6 bg-[#0a0a0a] border-t border-white/10">
                    <button id="btn-tutorial-start" className="horror-btn horror-btn-primary w-full py-4 text-xl font-bold tracking-widest uppercase">
                        INICIAR OPERACIONES
                    </button>
                </footer>
            </div>
        </div>
    );
};
