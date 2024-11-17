import { Game } from '../game';

jest.mock('d3', () => ({
  select: jest.fn().mockImplementation(() => {
    let textContent = '';
    const mockSelection = {
      selectAll: jest.fn().mockReturnThis(),
      data: jest.fn().mockReturnThis(),
      enter: jest.fn().mockReturnThis(),
      append: jest.fn().mockReturnThis(),
      attr: jest.fn().mockReturnThis(),
      merge: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis(),
      exit: jest.fn().mockReturnThis(),
      remove: jest.fn().mockReturnThis(),
      join: jest.fn().mockReturnThis(),
      text: jest.fn().mockImplementation(function (this: any, value?: string) {
        if (value === undefined) {
          return textContent;
        } else {
          textContent = value;
          return this;
        }
      }),
    };
    return mockSelection;
  }),
}));

Object.defineProperty(global, 'Audio', {
  value: jest.fn().mockImplementation(() => {
    let isPaused = true;
    return {
      play: jest.fn().mockImplementation(() => {
        isPaused = false;
        return Promise.resolve();
      }),
      pause: jest.fn().mockImplementation(() => {
        isPaused = true;
      }),
      get paused() {
        return isPaused;
      },
      currentTime: 0,
      volume: 1,
      loop: false,
    };
  }),
});

describe('Game Class', () => {
  let game: Game;
  let mockEvent: KeyboardEvent;

  beforeEach(() => {
    document.body.innerHTML = `
      <svg id="game-board"></svg>
      <div id="score"></div>
      <div id="high-score"></div>
      <div id="pause-indicator" style="display: none;"></div>
      <div id="game-over-modal" style="display: none;"></div>
      <div id="final-score"></div>
    `;

    game = new Game();
    game['BACKGROUND_MUSIC'] = new Audio();
    mockEvent = new KeyboardEvent('keydown', { code: 'KeyW' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should start the game on first interaction', () => {
    const startAudioSpy = jest.spyOn(game as any, 'startAudio');
    game['handleKeyPress'](mockEvent);
    expect(game['hasInteracted']).toBe(true);
    expect(startAudioSpy).toHaveBeenCalled();
  });

  test('should update direction on movement key press', () => {
    const updateDirectionSpy = jest.spyOn(game['gameState'], 'updateDirection');
    game['handleKeyPress'](mockEvent);
    expect(updateDirectionSpy).toHaveBeenCalledWith('KeyW');
  });

  test('should toggle pause on Space key press', () => {
    mockEvent = new KeyboardEvent('keydown', { code: 'Space' });
    const togglePauseSpy = jest.spyOn(game['gameState'], 'togglePause');

    let isPaused = false;
    jest
      .spyOn(game['gameState'], 'isGamePaused')
      .mockImplementation(() => isPaused);
    togglePauseSpy.mockImplementation(() => {
      isPaused = !isPaused;
    });

    game['handleKeyPress'](mockEvent);
    expect(togglePauseSpy).toHaveBeenCalled();

    const pauseIndicator = document.getElementById('pause-indicator');
    expect(pauseIndicator?.style.display).toBe('block');
  });

  test('should handle game over when collision occurs', () => {
    jest.spyOn(game['gameState'], 'isGamePaused').mockReturnValue(false);
    jest.spyOn(game['gameState'], 'isGameFinished').mockReturnValue(false);
    jest.spyOn(game['gameState'], 'checkWallCollision').mockReturnValue(true);
    const stopAudioSpy = jest.spyOn(game as any, 'stopAudio');
    const playGameOverSoundSpy = jest.spyOn(game as any, 'playGameOverSound');
    const gameOverSpy = jest.spyOn(game['gameState'], 'gameOver');

    game['gameLoop']();

    expect(gameOverSpy).toHaveBeenCalled();
    expect(stopAudioSpy).toHaveBeenCalled();
    expect(playGameOverSoundSpy).toHaveBeenCalled();
    expect(game['gameOverModal'].style.display).toBe('block');
  });

  test('should reset game state on restart', () => {
    const resetSpy = jest.spyOn(game['gameState'], 'reset');
    game.restartGame();
    expect(resetSpy).toHaveBeenCalledWith(
      game['initialSnakePosition'],
      game['initialFoods']
    );
    expect(game['gameOverModal'].style.display).toBe('none');
  });

  test('should not update direction if key is not a movement key', () => {
    const updateDirectionSpy = jest.spyOn(game['gameState'], 'updateDirection');
    mockEvent = new KeyboardEvent('keydown', { code: 'KeyX' });
    game['handleKeyPress'](mockEvent);
    expect(updateDirectionSpy).not.toHaveBeenCalled();
  });

  test('should update direction if key is a movement key', () => {
    const updateDirectionSpy = jest.spyOn(game['gameState'], 'updateDirection');
    mockEvent = new KeyboardEvent('keydown', { code: 'KeyD' });
    game['handleKeyPress'](mockEvent);
    expect(updateDirectionSpy).toHaveBeenCalledWith('KeyD');
  });

  test('should play background music on startAudio', () => {
    const playSpy = jest
      .spyOn(game['BACKGROUND_MUSIC'], 'play')
      .mockResolvedValue(undefined);
    game['startAudio']();
    expect(playSpy).toHaveBeenCalled();
  });

  test('should stop background music on stopAudio', () => {
    const pauseSpy = jest.spyOn(game['BACKGROUND_MUSIC'], 'pause');
    game['stopAudio']();
    expect(pauseSpy).toHaveBeenCalled();
    expect(game['BACKGROUND_MUSIC'].currentTime).toBe(0);
  });

  test('should render snake on updateBoard', () => {
    const selectAllSpy = jest.spyOn(game['svg'], 'selectAll');

    game['updateBoard']();

    expect(selectAllSpy).toHaveBeenCalledWith('*');
    expect(selectAllSpy).toHaveBeenCalledWith('rect.snake');
  });

  test('should render food on updateBoard', () => {
    const getCurrentFoodSpy = jest
      .fn()
      .mockReturnValue([{ position: { x: 10, y: 10 }, type: 'cherry' }]);
    jest
      .spyOn(game['gameState'].getFood(), 'getCurrentFood')
      .mockImplementation(getCurrentFoodSpy);

    const selectAllSpy = jest.spyOn(game['svg'], 'selectAll');

    game['updateBoard']();

    expect(selectAllSpy).toHaveBeenCalled();
    expect(getCurrentFoodSpy).toHaveBeenCalled();
  });

  test('should update score display on updateScore', () => {
    jest.spyOn(game['gameState'], 'getScore').mockReturnValue(10);
    jest.spyOn(game['gameState'], 'getHighScore').mockReturnValue(100);

    game['updateScore']();

    expect(game['scoreDisplay'].text()).toBe('Score: 10');
    expect(game['highScoreDisplay'].text()).toBe('High Score: 100');
  });

  test('should show pause indicator when game is paused', () => {
    jest.spyOn(game['gameState'], 'isGamePaused').mockReturnValue(true);
    game['togglePauseIndicator']();

    const pauseIndicator = document.getElementById('pause-indicator');
    expect(pauseIndicator?.style.display).toBe('block');
  });

  test('should hide pause indicator when game is not paused', () => {
    jest.spyOn(game['gameState'], 'isGamePaused').mockReturnValue(false);
    game['togglePauseIndicator']();

    const pauseIndicator = document.getElementById('pause-indicator');
    expect(pauseIndicator?.style.display).toBe('none');
  });

  test('should set hasInteracted to true and start audio on first interaction', () => {
    game['hasInteracted'] = false;
    const startAudioSpy = jest.spyOn(game as any, 'startAudio');
    const isMovementKeySpy = jest
      .spyOn(game as any, 'isMovementKey')
      .mockReturnValue(true);

    const event = new KeyboardEvent('keydown', { code: 'KeyW' });
    game['handleKeyPress'](event);

    expect(game['hasInteracted']).toBe(true);
    expect(startAudioSpy).toHaveBeenCalled();
    expect(isMovementKeySpy).toHaveBeenCalledWith('KeyW');
  });

  test('should not start audio if hasInteracted is true', () => {
    game['hasInteracted'] = true;
    const startAudioSpy = jest.spyOn(game as any, 'startAudio');

    const event = new KeyboardEvent('keydown', { code: 'KeyW' });
    game['handleKeyPress'](event);

    expect(startAudioSpy).not.toHaveBeenCalled();
  });

  test('should pause the game and stop audio when Space is pressed', () => {
    jest.spyOn(game['gameState'], 'isGameFinished').mockReturnValue(false);

    let isPaused = false;
    jest
      .spyOn(game['gameState'], 'isGamePaused')
      .mockImplementation(() => isPaused);
    const togglePauseSpy = jest
      .spyOn(game['gameState'], 'togglePause')
      .mockImplementation(() => {
        isPaused = !isPaused;
      });
    const stopAudioSpy = jest.spyOn(game as any, 'stopAudio');
    const event = new KeyboardEvent('keydown', { code: 'Space' });

    game['handleKeyPress'](event);

    expect(togglePauseSpy).toHaveBeenCalled();
    expect(stopAudioSpy).toHaveBeenCalled();
  });

  test('should resume the game and start audio when Space is pressed and game is paused', () => {
    jest.spyOn(game['gameState'], 'isGameFinished').mockReturnValue(false);

    let isPaused = true;
    jest
      .spyOn(game['gameState'], 'isGamePaused')
      .mockImplementation(() => isPaused);
    const togglePauseSpy = jest
      .spyOn(game['gameState'], 'togglePause')
      .mockImplementation(() => {
        isPaused = !isPaused;
      });
    const startAudioSpy = jest.spyOn(game as any, 'startAudio');
    const event = new KeyboardEvent('keydown', { code: 'Space' });

    game['handleKeyPress'](event);

    expect(togglePauseSpy).toHaveBeenCalled();
    expect(startAudioSpy).toHaveBeenCalled();
  });

  test('should start background music if paused during gameplay', () => {
    jest.spyOn(game['gameState'], 'isGamePaused').mockReturnValue(false);
    jest.spyOn(game['gameState'], 'isGameFinished').mockReturnValue(false);
    jest.spyOn(game['BACKGROUND_MUSIC'], 'paused', 'get').mockReturnValue(true);
    const startAudioSpy = jest.spyOn(game as any, 'startAudio');

    jest.spyOn(game['gameState'], 'moveSnake').mockImplementation();
    jest.spyOn(game['gameState'], 'handleFoodConsumption').mockImplementation();
    jest.spyOn(game['gameState'], 'checkWallCollision').mockReturnValue(false);
    jest.spyOn(game['gameState'], 'checkSelfCollision').mockReturnValue(false);
    jest.spyOn(game['gameState'], 'getSpeed').mockReturnValue(100);

    game['gameLoop']();

    expect(startAudioSpy).toHaveBeenCalled();
  });
});
