export type Position = {
  x: number;
  y: number;
};

export type Direction = 'KeyW' | 'KeyS' | 'KeyA' | 'KeyD';

export type FoodType = 'cherry' | 'mushroom' | 'pizza' | 'rotten tomato';

export type FoodItem = {
  position: Position;
  type: FoodType;
};
