import { FoodItem, Position } from './types';

export class Food {
  private currentFood: FoodItem;

  constructor(initialFood: FoodItem) {
    this.currentFood = initialFood;
  }

  spawn(): void {
    this.currentFood.position = {
      x: Math.floor(Math.random() * 30),
      y: Math.floor(Math.random() * 20),
    };
  }

  isEaten(position: Position): boolean {
    return (
      position.x === this.currentFood.position.x &&
      position.y === this.currentFood.position.y
    );
  }

  getType(): string {
    return this.currentFood.type;
  }

  getValue(): number {
    switch (this.currentFood.type) {
      case 'cherry':
        return 100;
      case 'mushroom':
        return 350;
      case 'pizza':
        return 400;
    }
  }
}
