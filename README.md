# Snake Game in TypeScript

This is a classic Snake game implemented in TypeScript, utilizing the D3 library for SVG rendering.

## Game Rules

The player can control the direction of the snake by using the `WASD` keys:

- W = ArrowUp -> change direction up
- A = ArrowLeft -> change direction left
- S = ArrowDown -> change direction down
- D = ArrowRight -> change direction right

The player can pause the game by pressing the `Space bar`

### Snake

The snake continually gets longer as it eats food items.

### Food

We have different types of food:

- cherries 🍒 - value: 100 points
- mushrooms 🍄 - value: 350 points side effect: controls are inverted for 30 seconds (up <-> down, left <-> right)
- pizza 🍕 - value: 400 points. Side effect: make the snake move faster (to burn off the calories)
- rotten tomato 🍅 - side effect: peanlty of 150 points (User can have negative score)

Every time the snake eats, a new food item will spawn on an available spot within the plane.

### End Game

The **game ends** once the snake collides with itself or the border of the plane.

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/DankoKr/snakeGame.git
   ```

2. Navigate to the project directory:

   ```bash
   cd snakeGame
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

## Play the Game

```bash
 npm run dev
```

## Playable Devices

The game is compatible with all devices except mobile, as it relies on keyboard controls and is not optimized for smaller screen sizes.

## Acknowledgements

- [D3.js](https://d3js.org/) - Data-Driven Documents library for SVG rendering.
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at Any Scale.

Enjoy playing the game! 🐍🎮

## Issues

Currently the music is played after the user presses a button instead of as soon as the game starts.
