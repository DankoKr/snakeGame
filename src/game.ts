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

export class Game {
  private gameState: GameState;
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private scoreDisplay: d3.Selection<HTMLElement, unknown, HTMLElement, any>;
  private highScoreDisplay: d3.Selection<
    HTMLElement,
    unknown,
    HTMLElement,
    any
  >;
  private pauseIndicator: HTMLElement | null;
  private gameOverModal: HTMLElement;
  private finalScoreDisplay: HTMLElement;
  private hasInteracted: boolean = false;
  private initialSnakePosition: Position[];
  private initialFoods: FoodItem[];
  private GAME_OVER_AUDIO: HTMLAudioElement;
  private BACKGROUND_MUSIC: HTMLAudioElement;
  private eatFoodMusic: HTMLAudioElement;

  constructor() {
    this.GAME_OVER_AUDIO = new Audio('./src/static/music/death.mp3');
    this.BACKGROUND_MUSIC = new Audio('./src/static/music/gameplay.mp3');
    this.eatFoodMusic = new Audio('./src/static/music/eat.mp3');
    this.BACKGROUND_MUSIC.volume = 0.4;
    this.BACKGROUND_MUSIC.loop = true;

    this.initialSnakePosition = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];

    this.initialFoods = [
      { position: { x: 10, y: 10 }, type: 'cherry' },
      { position: { x: 15, y: 15 }, type: 'mushroom' },
    ];

    this.gameState = new GameState(
      this.initialSnakePosition,
      this.initialFoods
    );

    this.svg = d3.select('#game-board');
    this.scoreDisplay = d3.select('#score');
    this.highScoreDisplay = d3.select('#high-score');
    this.pauseIndicator = document.getElementById('pause-indicator');
    this.gameOverModal = document.getElementById('game-over-modal')!;
    this.finalScoreDisplay = document.getElementById('final-score')!;

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.gameLoop = this.gameLoop.bind(this);

    // Initialize game
    this.initializeControls();
    this.updateBoard();
    this.updateScore();
    requestAnimationFrame(this.gameLoop);
  }

  private startAudio(): void {
    if (this.BACKGROUND_MUSIC && this.BACKGROUND_MUSIC.paused) {
      try {
        this.BACKGROUND_MUSIC.play().catch((error) => {
          console.log('Background music playback failed:', error);
        });
      } catch (error) {
        console.log('Background music playback failed:', error);
      }
    }
  }

  private stopAudio(): void {
    if (this.BACKGROUND_MUSIC) {
      this.BACKGROUND_MUSIC.pause();
      this.BACKGROUND_MUSIC.currentTime = 0;
    }
  }

  private playGameOverSound(): void {
    if (this.GAME_OVER_AUDIO) {
      try {
        this.GAME_OVER_AUDIO.play().catch((error) => {
          console.log('Game over sound playback failed:', error);
        });
      } catch (error) {
        console.log('Game over sound playback failed:', error);
      }
    }
  }

  private initializeControls(): void {
    document.addEventListener('keydown', this.handleKeyPress);
  }

  private handleKeyPress(event: KeyboardEvent): void {
    this.handleFirstInteraction(event);
    this.handlePauseToggle(event);
    this.handlePlayerMovement(event);
  }

  private handleFirstInteraction(event: KeyboardEvent): void {
    if (
      !this.hasInteracted &&
      (event.code === 'Space' || this.isMovementKey(event.code))
    ) {
      this.startAudio();
      this.hasInteracted = true;
    }
  }

  private handlePauseToggle(event: KeyboardEvent): void {
    if (event.code === 'Space' && !this.gameState.isGameFinished()) {
      this.gameState.togglePause();
      this.togglePauseIndicator();

      if (this.gameState.isGamePaused()) {
        this.stopAudio();
      } else {
        this.startAudio();
        if (!this.gameState.isGameFinished()) {
          requestAnimationFrame(this.gameLoop);
        }
      }
    }
  }

  private handlePlayerMovement(event: KeyboardEvent): void {
    const newDirection = this.gameState.getDirection(event.code);
    if (newDirection && this.isMovementKey(newDirection)) {
      this.gameState.updateDirection(newDirection);
    }
  }

  private isMovementKey(key: string): boolean {
    return ['KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(key);
  }

  private togglePauseIndicator(): void {
    if (this.pauseIndicator) {
      this.pauseIndicator.style.display = this.gameState.isGamePaused()
        ? 'block'
        : 'none';
    }
  }

  private updateBoard(): void {
    this.svg.selectAll('*').remove();
    this.renderSnake();
    this.renderFood();
  }

  private renderSnake(): void {
    const snakeElements = this.svg
      .selectAll<SVGRectElement, Position>('rect.snake')
      .data(this.gameState.getSnakeBody());

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

  private renderFood(): void {
    this.gameState
      .getFood()
      .getCurrentFood()
      .forEach((foodItem) => {
        const foodIconPath = this.getFoodIconPath(foodItem.type);

        this.svg
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

  private getFoodIconPath(type: string): string {
    const foodIcons: Record<string, string> = {
      cherry: cherryIcon,
      mushroom: mushroomIcon,
      pizza: pizzaIcon,
      'rotten tomato': rottenTomatoIcon,
    };

    return foodIcons[type] ?? '';
  }

  private updateScore(): void {
    this.scoreDisplay.text(`Score: ${this.gameState.getScore()}`);
    this.highScoreDisplay.text(`High Score: ${this.gameState.getHighScore()}`);
  }

  private gameLoop(): void {
    if (this.gameState.isGamePaused() || this.gameState.isGameFinished())
      return;

    this.gameState.moveSnake();
    this.gameState.handleFoodConsumption(this.eatFoodMusic);

    if (
      this.gameState.checkWallCollision(BOARD_WIDTH, BOARD_HEIGHT) ||
      this.gameState.checkSelfCollision()
    ) {
      this.gameState.gameOver();
      this.stopAudio();
      this.playGameOverSound();
      this.finalScoreDisplay.textContent = this.gameState.getScore().toString();
      this.gameOverModal.style.display = 'block';
      return;
    }

    // Ensure music is playing during gameplay
    if (
      this.BACKGROUND_MUSIC &&
      this.BACKGROUND_MUSIC.paused &&
      !this.gameState.isGamePaused()
    ) {
      this.startAudio();
    }

    this.updateBoard();
    this.updateScore();

    setTimeout(
      () => requestAnimationFrame(this.gameLoop),
      this.gameState.getSpeed()
    );
  }

  restartGame(): void {
    this.gameOverModal.style.display = 'none';
    this.gameState.reset(this.initialSnakePosition, this.initialFoods);

    this.updateBoard();
    this.updateScore();

    if (this.hasInteracted) {
      this.startAudio();
    }

    requestAnimationFrame(this.gameLoop);
  }

  initializeGame(): void {
    this.initializeControls();
    this.updateBoard();
    this.updateScore();
    requestAnimationFrame(this.gameLoop);
  }
}
