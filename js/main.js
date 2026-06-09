import { State } from './State.js';
import { Game } from './Game.js';
import { VisualRoomInterface } from './VisualRoomInterface.js';

// Inicialización de la instancia global del juego
const initGame = () => {
    // Cargar datos persistentes antes de iniciar el juego
    State.loadPersistentData();

    window.game = new Game();
    window.visualRoom = new VisualRoomInterface();
    console.log('Ruta-01: Sistema inicializado.');
};

// Si react-ready ya se disparó o si no hay reactReady definido (por ejemplo, en tests fuera del navegador)
if (window.reactReady || typeof window === 'undefined') {
    initGame();
} else {
    document.addEventListener('react-ready', initGame);
}