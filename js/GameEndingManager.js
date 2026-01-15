import { State } from './State.js';
import { CONSTANTS } from './Constants.js';

export class GameEndingManager {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
    }

    triggerEnding(endingId) {
        // Bloquear cualquier otra acción
        this.game.isAnimating = true;
        State.endingTriggered = true;

        // Ocultar cualquier overlay o modal activo inmediatamente
        if (this.ui.hideFeedback) this.ui.hideFeedback();
        $('.modal-overlay-base').addClass('hidden');

        // Bloquear navegación permanentemente
        this.ui.setNavLocked(true);

        // Guardar el final desbloqueado persistentemente
        State.unlockEnding(endingId);
        this.game.lastEndingId = endingId;

        // Si es un final de peligro, añadir efecto visual
        const isDanger = endingId.includes('death') || endingId.includes('corrupted') || endingId.includes('off') || endingId.includes('abandonment');
        
        if (isDanger) {
            this.audio.playSFXByKey('glitch_burst', { volume: 0.8 });
            if (this.ui.applyVHS) this.ui.applyVHS(1.0, 2000);
        }

        // Animación de cierre de sistema antes de mostrar el lore
        const protocolOptions = {
            title: isDanger ? 'FALLO CRÍTICO' : 'TURNO FINALIZADO',
            statusUpdates: isDanger 
                ? ['CORRUPCIÓN DETECTADA...', 'FALLO DE INTEGRIDAD...', 'SISTEMA COMPROMETIDO.']
                : ['GUARDANDO REGISTROS...', 'CERRANDO TERMINAL...', 'SESIÓN FINALIZADA.'],
            sfx: isDanger ? 'alarm_activate' : 'purge_confirm',
            type: 'ending',
            onComplete: () => {
                // Mostrar primero la resonancia (post_final) y luego el lore del final específico
                this.ui.showLore('post_final', () => {
                    this.ui.showLore(endingId, () => {
                        this.endGame();
                    });
                });
            }
        };

        this.ui.triggerFullscreenProtocol(protocolOptions);
    }

    endGame() {
        this.audio.stopAmbient({ fadeOut: 1000 });
        
        const renderFn = () => {
            if (typeof this.ui.renderFinalStats === 'function') {
                this.ui.renderFinalStats(State, this.game.lastEndingId);
            }
        };

        this.game.events.switchScreen(CONSTANTS.SCREENS.FINAL_STATS, {
            force: true,
            renderFn: renderFn
        });
    }
}
