import { restartGame, initializeGame } from './game';

document.getElementById('home-btn')?.addEventListener('click', () => {
  window.location.href = 'index.html';
});

document.getElementById('restart-btn')?.addEventListener('click', restartGame);

initializeGame();
