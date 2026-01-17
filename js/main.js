import { Game } from './Game.js';
import { VisualRoomInterface } from './VisualRoomInterface.js';

// Inicialización de la instancia global del juego
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    window.visualRoom = new VisualRoomInterface();
    console.log('Ruta-01: Sistema inicializado.');
});