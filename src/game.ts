import { GameState } from './gameState';
import { Position, FoodItem } from './types';
import * as d3 from 'd3';

export const BOARD_WIDTH: number = 30;
export const BOARD_HEIGHT: number = 20;
const CELL_SIZE: number = 20;

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

function initializeControls(): void {
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !gameState.isGameFinished()) {
      gameState.togglePause();
      togglePauseIndicator();
      if (!gameState.isGamePaused() && !gameState.isGameFinished()) {
        requestAnimationFrame(gameLoop);
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
  gameState.handleFoodConsumption();

  if (
    gameState.checkWallCollision(BOARD_WIDTH, BOARD_HEIGHT) ||
    gameState.checkSelfCollision()
  ) {
    gameState.gameOver();
    finalScoreDisplay.textContent = gameState.getScore().toString();
    gameOverModal.style.display = 'block';
    return;
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

  // Restart the game loop
  requestAnimationFrame(gameLoop);
}

export function initializeGame(): void {
  initializeControls();
  updateBoard();
  updateScore();
  requestAnimationFrame(gameLoop);
}
