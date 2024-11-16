import { BOARD_WIDTH, BOARD_HEIGHT } from './game';
import { FoodItem, Position, FoodType } from './types';

export class Food {
  private currentFood: FoodItem[];

  constructor(initialFoods: FoodItem[]) {
    this.currentFood = initialFoods;
  }

  spawnRandomFood(): void {
    const foodTypes: FoodType[] = [
      'cherry',
      'mushroom',
      'pizza',
      'rotten tomato',
    ];
    const randomIndex = Math.floor(Math.random() * foodTypes.length);
    const randomFoodType = foodTypes[randomIndex];

    const newFoodPosition = {
      x: Math.floor(Math.random() * BOARD_WIDTH),
      y: Math.floor(Math.random() * BOARD_HEIGHT),
    };

    // Ensure the new position is not already occupied by another food
    const isOccupied = this.currentFood.some(
      (food) =>
        food.position.x === newFoodPosition.x &&
        food.position.y === newFoodPosition.y
    );

    if (!isOccupied) {
      this.currentFood.push({
        position: newFoodPosition,
        type: randomFoodType,
      });
    } else {
      // If the position is occupied, try spawning again
      this.spawnRandomFood();
    }
  }

  removeFoodAt(position: Position): void {
    this.currentFood = this.currentFood.filter(
      (food) => food.position.x !== position.x || food.position.y !== position.y
    );
  }

  isEaten(position: Position): boolean {
    return this.currentFood.some(
      (food) => position.x === food.position.x && position.y === food.position.y
    );
  }

  getType(position: Position): FoodType {
    const food = this.currentFood.find(
      (f) => f.position.x === position.x && f.position.y === position.y
    );
    return food?.type || 'cherry';
  }

  getCurrentFood(): FoodItem[] {
    return this.currentFood;
  }

  getValue(position: Position): number {
    const foodType = this.getType(position);
    switch (foodType) {
      case 'cherry':
        return 100;
      case 'mushroom':
        return 350;
      case 'pizza':
        return 400;
      case 'rotten tomato':
        return -150;
      default:
        return 0;
    }
  }
}
