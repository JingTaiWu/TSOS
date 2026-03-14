export class Node {
  private children: Node[] = [];
  private parentNode: Node;
  private name: string;
  private lineNumber: number;
  public isDigit: boolean = false;
  public isBoolVal: boolean = false;
  public isChar: boolean = false;
  public isIdentifier: boolean = false;

  constructor(name: string) {
    this.children = [];
    this.name = name;
  }

  public setName(newName: string): void { this.name = newName; }
  public getName(): string { return this.name; }
  public setParentNode(newNode: Node): void { this.parentNode = newNode; }
  public getParentNode(): Node { return this.parentNode; }
  public addChild(newNode: Node): void { this.children.push(newNode); }
  public getChildren(): Node[] { return this.children; }
  public isLeafNode(): boolean { return this.children.length === 0; }
  public getLineNumber(): number { return this.lineNumber; }
  public setLineNumber(num: number): void { this.lineNumber = num; }
}
