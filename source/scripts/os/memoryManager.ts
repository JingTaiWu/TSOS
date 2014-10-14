/*
  Memory Manager - similar to MMU (memory management unit)
  This class has the access to the CPU's memory
*/

module TSOS {
  export class MemoryManager {
    public memorySize : number = 256;
    private memory : Memory;

    constructor() {
      // Initializes the memory
      this.memory = new Memory(this.memorySize);
    }

    // return a specific byte in the memory
    public readByte(location : number) : String{
      if (location < this.memory.bytes.length) {
        return this.memory.bytes[location].byte;
      }
    }

    // return the entire memory
    public readMemory() : Byte[] {
      return this.memory.bytes;
    }
  }
}
