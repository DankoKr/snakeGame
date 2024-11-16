import { Position, Direction, FoodItem } from './types';
import { Snake } from './snake';
import { Food } from './food';

export class GameState {
  private snake: Snake;
  private direction: Direction;
  private food: Food;
  private score: number;
  private isPaused: boolean;
  private isFinished: boolean;
  private snakeSpeed: number;
  private controlsReversed: boolean;
  private highScore: number;

  constructor(
    initialSnakePosition: Position[],
    initialFoods: FoodItem[],
    initialDirection: Direction = 'KeyD',
    initialSpeed: number = 200
  ) {
    this.snake = new Snake([...initialSnakePosition]);
    this.direction = initialDirection;
    this.food = new Food([...initialFoods]);
    this.score = 0;
    this.isPaused = false;
    this.isFinished = false;
    this.snakeSpeed = initialSpeed;
    this.controlsReversed = false;
    this.highScore = 0;
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
  }

  updateDirection(newDirection: Direction): void {
    if (!this.isOppositeDirection(newDirection, this.direction)) {
      this.direction = newDirection;
    }
  }

  isOppositeDirection(dir1: Direction, dir2: Direction): boolean {
    return (
      (dir1 === 'KeyW' && dir2 === 'KeyS') ||
      (dir1 === 'KeyS' && dir2 === 'KeyW') ||
      (dir1 === 'KeyA' && dir2 === 'KeyD') ||
      (dir1 === 'KeyD' && dir2 === 'KeyA')
    );
  }

  getDirection(keyCode: string): Direction | null {
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

    return this.controlsReversed
      ? reversedMapping[keyCode] || null
      : normalMapping[keyCode] || null;
  }

  getSnakeBody(): Position[] {
    return this.snake.getBody();
  }

  getScore(): number {
    return this.score;
  }

  getHighScore(): number {
    return this.highScore;
  }

  getSpeed(): number {
    return this.snakeSpeed;
  }

  getFood(): Food {
    return this.food;
  }

  moveSnake(): void {
    this.snake.move(this.direction);
  }

  checkWallCollision(boardWidth: number, boardHeight: number): boolean {
    const head = this.snake.getHead();
    return (
      head.x < 0 || head.x >= boardWidth || head.y < 0 || head.y >= boardHeight
    );
  }

  checkSelfCollision(): boolean {
    return this.snake.checkCollision();
  }

  handleFoodConsumption(): void {
    const head = this.snake.getHead();
    if (this.food.isEaten(head)) {
      this.snake.grow();
      const eatenFoodType = this.food.getType(head);
      this.score += this.food.getValue(head);
      this.food.removeFoodAt(head);

      // Apply side effects based on the food type
      if (eatenFoodType === 'mushroom') {
        this.controlsReversed = true;
        setTimeout(() => {
          this.controlsReversed = false;
        }, 30000);
      } else if (eatenFoodType === 'pizza') {
        this.snakeSpeed = Math.max(50, this.snakeSpeed - 100); // don't go below 50ms
      }

      while (this.food.getCurrentFood().length < 3) {
        this.food.spawnRandomFood();
      }
    }
  }

  isGameFinished(): boolean {
    return this.isFinished;
  }

  isGamePaused(): boolean {
    return this.isPaused;
  }

  gameOver(): void {
    this.isFinished = true;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  reset(
    initialSnakePosition: Position[],
    initialFoods: FoodItem[],
    initialDirection: Direction = 'KeyD',
    initialSpeed: number = 200
  ): void {
    this.snake = new Snake([...initialSnakePosition]);
    this.direction = initialDirection;
    this.food = new Food([...initialFoods]);
    this.score = 0;
    this.isFinished = false;
    this.isPaused = false;
    this.snakeSpeed = initialSpeed;
    this.controlsReversed = false;
  }
}
