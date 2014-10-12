/* This class simulates the hardware memory in the OS
*/

module TSOS {
  export class Memory {
    bytes : Byte[];
    constructor(public size : number = 768) {
    }

    public init() {
      // initialize the array to size
      for (var i : number = 0; i < this.size; i++) {
        this.bytes[i] = new Byte("00");
      }
    }
  }

  // Byte of length 8
  export class Byte {
    constructor(public data : string) {
    }
  }
}
