export class Token {
  private kind: string;
  private value: string;
  private lineNumber: number;

  constructor(kind: string, value: string, lineNumber: number) {
    this.kind = kind;
    this.value = value;
    this.lineNumber = lineNumber;
  }

  public getKind(): string { return this.kind; }
  public getValue(): string { return this.value; }
  public getLineNumber(): number { return this.lineNumber; }
  public setValue(newValue: string): void { this.value = newValue; }
  public setLineNumber(newNumber: number): void { this.lineNumber = newNumber; }
}
