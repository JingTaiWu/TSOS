/* This class simulates the hardware memory in the OS
*/

module TSOS {
  export class Memory {
    public bytes : Byte[] = [];

    constructor(size : number) {
      // initialize the array to size
      for (var i : number = 0; i < size; i++) {
        this.bytes[i] = new Byte("00");
      }
    }
  }

  // Represntation of a byte
  export class Byte {
    public byte : string;
    constructor(data : string) {
      this.byte = data;
    }
  }
}
