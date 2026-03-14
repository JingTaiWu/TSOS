export class Queue<T = any> {
  public q: T[] = [];

  getSize(): number { return this.q.length; }
  isEmpty(): boolean { return this.q.length === 0; }
  enqueue(element: T): void { this.q.push(element); }

  dequeue(): T | null {
    if (this.q.length > 0) return this.q.shift()!;
    return null;
  }

  toString(): string {
    return this.q.map(e => `[${e}]`).join(' ');
  }
}
