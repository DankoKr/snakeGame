import { Position, Direction } from './types';

export class Snake {
  private body: Position[];

  constructor(initialPosition: Position[]) {
    this.body = initialPosition;
  }

  move(direction: Direction): void {
    const head = { ...this.getHead() };
    switch (direction) {
      case 'KeyW':
        head.y -= 1;
        break;
      case 'KeyS':
        head.y += 1;
        break;
      case 'KeyA':
        head.x -= 1;
        break;
      case 'KeyD':
        head.x += 1;
        break;
    }
    this.body.unshift(head);
    this.body.pop();
  }

  grow(): void {
    this.body.push({ ...this.body[this.body.length - 1] });
  }

  getHead(): Position {
    return this.body[0];
  }

  getBody(): Position[] {
    return this.body;
  }

  checkCollision(): boolean {
    const [head, ...body] = this.body;
    return body.some((segment) => segment.x === head.x && segment.y === head.y);
  }
}
