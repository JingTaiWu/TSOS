export class Byte {
  constructor(public byte: string = '00') {}
}

export class Memory {
  public bytes: Byte[] = [];

  constructor(size: number) {
    for (let i = 0; i < size; i++) {
      this.bytes[i] = new Byte('00');
    }
  }
}
