const startGameBtn = document.getElementById(
  'start-game-btn'
) as HTMLButtonElement;

startGameBtn.addEventListener('click', () => {
  window.location.href = 'game.html';
});
