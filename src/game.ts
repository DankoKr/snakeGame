import { Snake } from './snake';
import { Food } from './food';
import { GameState, Direction, Position, FoodItem } from './types';
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

const gameState: GameState = {
  snake: [...initialSnakePosition],
  direction: 'KeyD',
  food: initialFoods,
  score: 0,
  isFinished: false,
  isPaused: false,
  originalSpeed: 200,
  currentSpeed: 200,
  controlsReversed: false,
};

// Let instead of const so we can restart the game without rebuilding it
let snake = new Snake([...initialSnakePosition]);
let food = new Food([...initialFoods]);

const svg = d3.select('#game-board');
const scoreDisplay = d3.select('#score');
const pauseIndicator = document.getElementById('pause-indicator');

function initializeControls(): void {
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      gameState.isPaused = !gameState.isPaused;
      togglePauseIndicator();
      if (!gameState.isPaused && !gameState.isFinished) {
        requestAnimationFrame(gameLoop);
      }
    }

    const newDirection = getDirection(event.code);
    if (
      newDirection &&
      ['KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(newDirection)
    ) {
      if (!isOppositeDirection(newDirection, gameState.direction)) {
        gameState.direction = newDirection;
      }
    }
  });
}

function getDirection(keyCode: string): Direction | null {
  const normalMapping: { [key: string]: Direction } = {
    KeyW: 'KeyW', // Up
    KeyS: 'KeyS', // Down
    KeyA: 'KeyA', // Left
    KeyD: 'KeyD', // Right
  };

  const reversedMapping: { [key: string]: Direction } = {
    KeyW: 'KeyS', // Up key moves down
    KeyS: 'KeyW', // Down key moves up
    KeyA: 'KeyD', // Left key moves right
    KeyD: 'KeyA', // Right key moves left
  };

  if (gameState.controlsReversed) {
    return reversedMapping[keyCode] || null;
  } else {
    return normalMapping[keyCode] || null;
  }
}

function isOppositeDirection(dir1: Direction, dir2: Direction): boolean {
  return (
    (dir1 === 'KeyW' && dir2 === 'KeyS') ||
    (dir1 === 'KeyS' && dir2 === 'KeyW') ||
    (dir1 === 'KeyA' && dir2 === 'KeyD') ||
    (dir1 === 'KeyD' && dir2 === 'KeyA')
  );
}

function updateBoard(): void {
  svg.selectAll('*').remove();

  renderSnake();
  renderFood();
}

function renderSnake(): void {
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
}

function renderFood(): void {
  food.getCurrentFood().forEach((foodItem) => {
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
  scoreDisplay.text(`Score: ${gameState.score}`);
}

function togglePauseIndicator(): void {
  if (pauseIndicator) {
    pauseIndicator.style.display = gameState.isPaused ? 'block' : 'none';
  }
}

function gameLoop(): void {
  if (gameState.isPaused) return;

  snake.move(gameState.direction);
  const head = snake.getHead();

  if (food.isEaten(head)) {
    snake.grow();
    const eatenFoodType = food.getType(head);
    gameState.score += food.getValue(head);
    food.removeFoodAt(head);

    // Apply side effects based on the food type
    if (eatenFoodType === 'mushroom') {
      gameState.controlsReversed = true;
      setTimeout(() => {
        gameState.controlsReversed = false;
      }, 3000);
    } else if (eatenFoodType === 'pizza') {
      gameState.originalSpeed = gameState.currentSpeed;
      gameState.currentSpeed = Math.max(50, gameState.currentSpeed - 100); // don't go below 50ms
      setTimeout(() => {
        gameState.currentSpeed = gameState.originalSpeed;
      }, 3000);
    }

    while (food.getCurrentFood().length < 3) {
      food.spawnRandomFood();
    }

    updateBoard();
  }

  if (checkWallCollision(head) || snake.checkCollision()) {
    gameOver();
    return;
  }

  gameState.snake = snake.getBody();
  updateBoard();
  updateScore();

  setTimeout(() => requestAnimationFrame(gameLoop), gameState.currentSpeed);
}

function checkWallCollision(head: Position): boolean {
  return (
    head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT
  );
}

function gameOver(): void {
  gameState.isFinished = true;
  const gameOverModal = document.getElementById('game-over-modal')!;
  const scoreDisplay = document.getElementById('final-score')!;
  scoreDisplay.textContent = gameState.score.toString();
  gameOverModal.style.display = 'block';
}

export function restartGame(): void {
  const gameOverModal = document.getElementById('game-over-modal')!;
  gameOverModal.style.display = 'none';
  gameState.snake = [...initialSnakePosition];
  gameState.direction = 'KeyD';
  gameState.food = [...initialFoods];
  gameState.score = 0;
  gameState.isFinished = false;
  gameState.isPaused = false;
  gameState.originalSpeed = 200;
  gameState.currentSpeed = 200;
  gameState.controlsReversed = false;
  snake = new Snake([...initialSnakePosition]);
  food = new Food([...initialFoods]);

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
