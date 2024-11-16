import { GameState } from './gameState';
import { Position, FoodItem } from './types';
import * as d3 from 'd3';
import cherryIcon from './static/icons/cherry.svg';
import mushroomIcon from './static/icons/mushroom.svg';
import pizzaIcon from './static/icons/pizza.svg';
import rottenTomatoIcon from './static/icons/rotten-tomato.svg';

export const BOARD_WIDTH: number = 30;
export const BOARD_HEIGHT: number = 20;
const CELL_SIZE: number = 20;

const GAME_OVER_AUDIO: HTMLAudioElement = new Audio(
  './src/static/music/death.mp3'
);
const BACKGROUND_MUSIC: HTMLAudioElement = new Audio(
  './src/static/music/gameplay.mp3'
);
const eatFoodMusic: HTMLAudioElement = new Audio('./src/static/music/eat.mp3');
BACKGROUND_MUSIC.volume = 0.4;
BACKGROUND_MUSIC.loop = true;
let hasInteracted: boolean = false;

const initialSnakePosition: Position[] = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
];

const initialFoods: FoodItem[] = [
  { position: { x: 10, y: 10 }, type: 'cherry' },
  { position: { x: 15, y: 15 }, type: 'mushroom' },
];

const gameState = new GameState(initialSnakePosition, initialFoods);

const svg = d3.select('#game-board');
const scoreDisplay = d3.select('#score');
const highScoreDisplay = d3.select('#high-score');
const pauseIndicator = document.getElementById('pause-indicator');
const gameOverModal = document.getElementById('game-over-modal')!;
const finalScoreDisplay = document.getElementById('final-score')!;

function startAudio(): void {
  if (BACKGROUND_MUSIC && BACKGROUND_MUSIC.paused) {
    try {
      BACKGROUND_MUSIC.play().catch((error) => {
        console.log('Background music playback failed:', error);
      });
    } catch (error) {
      console.log('Background music playback failed:', error);
    }
  }
}

function stopAudio(): void {
  if (BACKGROUND_MUSIC) {
    BACKGROUND_MUSIC.pause();
    BACKGROUND_MUSIC.currentTime = 0;
  }
}

function playGameOverSound(): void {
  if (GAME_OVER_AUDIO) {
    try {
      GAME_OVER_AUDIO.play().catch((error) => {
        console.log('Game over sound playback failed:', error);
      });
    } catch (error) {
      console.log('Game over sound playback failed:', error);
    }
  }
}

function initializeControls(): void {
  document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event: KeyboardEvent): void {
  handleFirstInteraction(event);
  handlePauseToggle(event);
  handlePlayerMovement(event);
}

function handleFirstInteraction(event: KeyboardEvent): void {
  if (!hasInteracted && (event.code === 'Space' || isMovementKey(event.code))) {
    startAudio();
    hasInteracted = true;
  }
}

function handlePauseToggle(event: KeyboardEvent): void {
  if (event.code === 'Space' && !gameState.isGameFinished()) {
    gameState.togglePause();
    togglePauseIndicator();

    if (gameState.isGamePaused()) {
      stopAudio();
    } else {
      startAudio();
      if (!gameState.isGameFinished()) {
        requestAnimationFrame(gameLoop);
      }
    }
  }
}

function handlePlayerMovement(event: KeyboardEvent): void {
  const newDirection = gameState.getDirection(event.code);
  if (newDirection && isMovementKey(newDirection)) {
    gameState.updateDirection(newDirection);
  }
}

function isMovementKey(key: string): boolean {
  return ['KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(key);
}

function togglePauseIndicator(): void {
  if (pauseIndicator) {
    pauseIndicator.style.display = gameState.isGamePaused() ? 'block' : 'none';
  }
}

function updateBoard(): void {
  svg.selectAll('*').remove();
  renderSnake();
  renderFood();
}

function renderSnake(): void {
  const snakeElements = svg
    .selectAll<SVGRectElement, Position>('rect.snake')
    .data(gameState.getSnakeBody());

  snakeElements
    .enter()
    .append('rect')
    .attr('class', 'snake')
    .merge(snakeElements)
    .attr('x', (d) => d.x * CELL_SIZE)
    .attr('y', (d) => d.y * CELL_SIZE)
    .attr('width', CELL_SIZE)
    .attr('height', CELL_SIZE)
    .style('fill', 'green');

  snakeElements.exit().remove();
}

function renderFood(): void {
  gameState
    .getFood()
    .getCurrentFood()
    .forEach((foodItem) => {
      const foodIconPath = getFoodIconPath(foodItem.type);

      svg
        .selectAll(`image.food-${foodItem.type}`)
        .data([foodItem.position])
        .join('image')
        .attr('class', `food food-${foodItem.type}`)
        .attr('x', (d) => d.x * CELL_SIZE)
        .attr('y', (d) => d.y * CELL_SIZE)
        .attr('width', CELL_SIZE)
        .attr('height', CELL_SIZE)
        .attr('href', foodIconPath);
    });
}

function getFoodIconPath(type: string): string {
  const foodIcons: Record<string, string> = {
    cherry: cherryIcon,
    mushroom: mushroomIcon,
    pizza: pizzaIcon,
    'rotten tomato': rottenTomatoIcon,
  };

  return foodIcons[type] ?? '';
}

function updateScore(): void {
  scoreDisplay.text(`Score: ${gameState.getScore()}`);
  highScoreDisplay.text(`High Score: ${gameState.getHighScore()}`);
}

function gameLoop(): void {
  if (gameState.isGamePaused() || gameState.isGameFinished()) return;

  gameState.moveSnake();
  gameState.handleFoodConsumption(eatFoodMusic);

  if (
    gameState.checkWallCollision(BOARD_WIDTH, BOARD_HEIGHT) ||
    gameState.checkSelfCollision()
  ) {
    gameState.gameOver();
    stopAudio();
    playGameOverSound();
    finalScoreDisplay.textContent = gameState.getScore().toString();
    gameOverModal.style.display = 'block';
    return;
  }

  // Make sure music is playing during gameplay
  if (
    BACKGROUND_MUSIC &&
    BACKGROUND_MUSIC.paused &&
    !gameState.isGamePaused()
  ) {
    startAudio();
  }

  updateBoard();
  updateScore();

  setTimeout(() => requestAnimationFrame(gameLoop), gameState.getSpeed());
}

export function restartGame(): void {
  gameOverModal.style.display = 'none';
  gameState.reset(initialSnakePosition, initialFoods);

  updateBoard();
  updateScore();

  if (hasInteracted) {
    startAudio();
  }

  requestAnimationFrame(gameLoop);
}

export function initializeGame(): void {
  initializeControls();
  updateBoard();
  updateScore();
  requestAnimationFrame(gameLoop);
}
