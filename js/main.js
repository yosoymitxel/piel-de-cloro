import { Game } from './Game.js';

// Inicialización de la instancia global del juego
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    console.log('Ruta-01: Sistema inicializado.');
});