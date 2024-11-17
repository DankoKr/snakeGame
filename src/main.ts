import { Game } from './game';

const game = new Game();

document
  .getElementById('restart-btn')
  ?.addEventListener('click', () => game.restartGame());
