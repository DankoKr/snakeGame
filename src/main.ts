import { restartGame, initializeGame } from './game';

document.getElementById('restart-btn')?.addEventListener('click', restartGame);

initializeGame();
