import { Snake } from './snake';
import { Food } from './food';
import { GameState, Direction, Position, FoodItem } from './types';
import * as d3 from 'd3';

const BOARD_WIDTH: number = 30;
const BOARD_HEIGHT: number = 20;
const CELL_SIZE: number = 20;

// Initial positions
const initialSnakePosition: Position[] = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
];
const initialFood: FoodItem = {
  position: { x: 10, y: 10 },
  type: 'cherry',
};

const gameState: GameState = {
  snake: initialSnakePosition,
  direction: 'KeyD',
  food: [initialFood],
  score: 0,
  isPaused: false,
  speed: 200,
};

const snake = new Snake(initialSnakePosition);
const food = new Food(initialFood);

const svg = d3.select('#game-board');
const scoreDisplay = d3.select('#score');
const pauseIndicator = document.getElementById('pause-indicator');

function initializeControls(): void {
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      gameState.isPaused = !gameState.isPaused;

      if (pauseIndicator) {
        pauseIndicator.style.display = gameState.isPaused ? 'block' : 'none';
      }

      if (!gameState.isPaused) {
        requestAnimationFrame(gameLoop);
      }
    }

    const newDirection = event.code as Direction;
    if (['KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(newDirection)) {
      gameState.direction = newDirection;
    }
  });
}

function updateBoard(): void {
  const snakeElements = svg
    .selectAll<SVGRectElement, Position>('rect.snake')
    .data(gameState.snake);

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

  const foodPosition = food['currentFood'].position;
  svg
    .selectAll('rect.food')
    .data([foodPosition])
    .join('rect')
    .attr('class', 'food')
    .attr('x', (d) => d.x * CELL_SIZE)
    .attr('y', (d) => d.y * CELL_SIZE)
    .attr('width', CELL_SIZE)
    .attr('height', CELL_SIZE)
    .style('fill', 'red');
}

function updateScore(): void {
  scoreDisplay.text(`Score: ${gameState.score}`);
}

function gameLoop(): void {
  if (gameState.isPaused) return;

  snake.move(gameState.direction);
  const head = snake.getHead();

  if (food.isEaten(head)) {
    snake.grow();
    gameState.score += food.getValue();
    food.spawn();
  }

  if (checkWallCollision(head) || snake.checkCollision()) {
    gameOver();
    return;
  }

  gameState.snake = snake.getBody();
  updateBoard();
  updateScore();

  setTimeout(() => requestAnimationFrame(gameLoop), gameState.speed);
}

function checkWallCollision(head: Position): boolean {
  return (
    head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT
  );
}

function gameOver(): void {
  gameState.isPaused = true;
  alert('Game Over! Your score was: ' + gameState.score);
}

export function initializeGame(): void {
  initializeControls();
  updateBoard();
  updateScore();
  requestAnimationFrame(gameLoop);
}
