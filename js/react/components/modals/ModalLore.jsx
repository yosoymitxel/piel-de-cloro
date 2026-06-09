/**
 * ModalLore - Modal de fragmento de lore recuperado.
 */
window.RC = window.RC || {};
window.RC.ModalLore = function ModalLore() {
    const ModalShell = window.RC.ModalShell;
    return (
        <ModalShell
            id="lore-overlay"
            title="REGISTRO_RECUPERADO"
            overlayClass="z-[250]"
            showFooter={false}
        >
            <div className="p-10 flex flex-col gap-8 bg-[#050505]">
                <div className="border-l-2 border-blue-500/30 pl-6">
                    <h3 id="lore-title" className="text-2xl font-bold text-white tracking-[0.1em] uppercase mb-4"></h3>
                    <div id="lore-content" className="font-mono text-sm text-gray-300 leading-relaxed italic"></div>
                </div>
                <div className="flex justify-center">
                    <button id="btn-lore-continue" className="horror-btn horror-btn-primary px-12 py-4 text-sm uppercase tracking-[0.3em]">
                        <i className="fa-solid fa-book-open mr-2"></i>CONTINUAR_LECTURA
                    </button>
                </div>
            </div>
            <footer className="p-4 bg-black border-t border-white/5 text-[10px] text-gray-500 text-center font-mono">
                ENCRIPTACIÓN MILITAR // SISTEMA R-01
            </footer>
        </ModalShell>
    );
};
