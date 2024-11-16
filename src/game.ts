import { GameState } from './gameState';
import { Position, FoodItem } from './types';
import * as d3 from 'd3';

export const BOARD_WIDTH: number = 30;
export const BOARD_HEIGHT: number = 20;
const CELL_SIZE: number = 20;

let gameOverAudio: HTMLAudioElement | null = null;
let backgroundMusic: HTMLAudioElement | null = null;
const eatFoodMusic: HTMLAudioElement = new Audio('./src/static/music/eat.mp3');
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

function initializeAudio(): void {
  if (!gameOverAudio) {
    gameOverAudio = new Audio('./src/static/music/death.mp3');
  }
  if (!backgroundMusic) {
    backgroundMusic = new Audio('./src/static/music/gameplay.mp3');
    backgroundMusic.volume = 0.4;
    backgroundMusic.loop = true;
  }
}

function startAudio(): void {
  if (!backgroundMusic) {
    initializeAudio();
  }

  if (backgroundMusic && backgroundMusic.paused) {
    try {
      backgroundMusic.play().catch((error) => {
        console.log('Background music playback failed:', error);
      });
    } catch (error) {
      console.log('Background music playback failed:', error);
    }
  }
}

function stopAudio(): void {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
}

function playGameOverSound(): void {
  if (!gameOverAudio) {
    initializeAudio();
  }

  if (gameOverAudio) {
    try {
      gameOverAudio.play().catch((error) => {
        console.log('Game over sound playback failed:', error);
      });
    } catch (error) {
      console.log('Game over sound playback failed:', error);
    }
  }
}

function initializeControls(): void {
  document.addEventListener('keydown', (event) => {
    // Check if this is first interaction
    if (
      !hasInteracted &&
      (event.code === 'Space' ||
        ['KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(event.code))
    ) {
      initializeAudio();
      startAudio();
      hasInteracted = true;
    }

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

    const newDirection = gameState.getDirection(event.code);
    if (
      newDirection &&
      ['KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(newDirection)
    ) {
      gameState.updateDirection(newDirection);
    }
  });
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
      svg
        .selectAll(`rect.food-${foodItem.type}`)
        .data([foodItem.position])
        .join('rect')
        .attr('class', `food food-${foodItem.type}`)
        .attr('x', (d) => d.x * CELL_SIZE)
        .attr('y', (d) => d.y * CELL_SIZE)
        .attr('width', CELL_SIZE)
        .attr('height', CELL_SIZE)
        .style('fill', getFoodColor(foodItem.type));
    });
}

function getFoodColor(type: string): string {
  switch (type) {
    case 'cherry':
      return 'red';
    case 'mushroom':
      return 'brown';
    case 'pizza':
      return 'yellow';
    case 'rotten tomatoe':
      return 'black';
    default:
      return 'white';
  }
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
  if (backgroundMusic && backgroundMusic.paused && !gameState.isGamePaused()) {
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
