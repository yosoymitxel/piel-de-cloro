import { State } from './State.js';
import { CONSTANTS } from './Constants.js';

export class GameEndingManager {
    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.audio = game.audio;
    }

    triggerEnding(endingId, loreName = null) {
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

        // Store lore NPC name if applicable
        if (loreName) {
            this.loreNPCName = loreName;
        }

        // Si es un final de peligro, añadir efecto visual
        const isDanger = endingId.includes('death') || endingId.includes('corrupted') || endingId.includes('off') || endingId.includes('abandonment');

        if (isDanger) {
            this.audio.playSFXByKey('glitch_burst', { volume: 0.8 });
            if (this.ui.applyVHS) this.ui.applyVHS(1.0, 2000);
        }

        // --- ORQUESTACIÓN DE FINAL ---
        // Limpiar cola previa para asegurar que el final tiene prioridad absoluta
        if (this.game.orchestrator) {
            this.game.orchestrator.clear();

            // 1. Animación de Protocolo
            this.game.orchestrator.add({
                id: 'ending-protocol',
                type: 'sequence',
                priority: 10,
                execute: () => new Promise(resolve => {
                    const protocolOptions = {
                        title: isDanger ? 'FALLO CRÍTICO' : 'TURNO FINALIZADO',
                        statusUpdates: isDanger
                            ? ['CORRUPCIÓN DETECTADA...', 'FALLO DE INTEGRIDAD...', 'SISTEMA COMPROMETIDO.']
                            : ['GUARDANDO REGISTROS...', 'CERRANDO TERMINAL...', 'SESIÓN FINALIZADA.'],
                        sfx: isDanger ? 'alarm_activate' : 'purge_confirm',
                        type: 'ending',
                        onComplete: resolve // Conectar con la promesa
                    };
                    this.ui.triggerFullscreenProtocol(protocolOptions);
                })
            });

            // 2. Lore: Resonancia (Post-Final)
            this.game.orchestrator.add({
                id: 'lore-post-final',
                type: 'modal',
                priority: 9,
                execute: () => new Promise(resolve => {
                    this.ui.showLore('post_final', resolve);
                })
            });

            // 3. Lore: Final Específico
            this.game.orchestrator.add({
                id: `lore-${endingId}`,
                type: 'modal',
                priority: 9,
                execute: () => new Promise(resolve => {
                    this.ui.showLore(endingId, resolve, { loreName: this.loreNPCName });
                })
            });

            // 4. Pantalla de Estadísticas
            this.game.orchestrator.add({
                id: 'final-screen-switch',
                type: 'action',
                priority: 8,
                execute: async () => {
                    this.endGame();
                }
            });

        } else {
            // Fallback por si no hay orquestador (legacy)
            console.warn("Orchestrator not found, using legacy ending flow");
            const protocolOptions = {
                title: isDanger ? 'FALLO CRÍTICO' : 'TURNO FINALIZADO',
                statusUpdates: isDanger
                    ? ['CORRUPCIÓN DETECTADA...', 'FALLO DE INTEGRIDAD...', 'SISTEMA COMPROMETIDO.']
                    : ['GUARDANDO REGISTROS...', 'CERRANDO TERMINAL...', 'SESIÓN FINALIZADA.'],
                sfx: isDanger ? 'alarm_activate' : 'purge_confirm',
                type: 'ending',
                onComplete: () => {
                    this.ui.showLore('post_final', () => {
                        this.ui.showLore(endingId, () => {
                            this.endGame();
                        }, { loreName: this.loreNPCName });
                    });
                }
            };
            this.ui.triggerFullscreenProtocol(protocolOptions);
        }
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
