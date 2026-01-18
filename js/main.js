import { State } from './State.js';
import { Game } from './Game.js';
import { VisualRoomInterface } from './VisualRoomInterface.js';

// Inicialización de la instancia global del juego
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos persistentes antes de iniciar el juego
    State.loadPersistentData();

    window.game = new Game();
    window.visualRoom = new VisualRoomInterface();
    console.log('Ruta-01: Sistema inicializado.');
});