export type GameState = {
  snake: Position[];
  direction: Direction;
  food: FoodItem[];
  score: number;
  isPaused: boolean;
  isFinished: boolean;
  speed: number;
};

export type Position = {
  x: number;
  y: number;
};

export type Direction = 'KeyW' | 'KeyS' | 'KeyA' | 'KeyD';

export type FoodType = 'cherry' | 'mushroom' | 'pizza';

export type FoodItem = {
  position: Position;
  type: FoodType;
};
