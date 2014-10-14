/*
  Memory Manager - similar to MMU (memory management unit)
  This class has the access to the CPU's memory
*/

module TSOS {
  export class MemoryManager {
    public memorySize : number = 256;
    public memory : Byte[];
    private cursor : number;

    constructor() {
      // Initializes the memory
      var mem = new Memory(this.memorySize);
      this.memory = mem.bytes;
      this.cursor = 0;
    }
    // load user input program
    public loadProgram(program : string[]) : void {
      // add the instructions into the memory, byte by byte
      for (var i = 0; i < program.length; i++) {
        if(this.cursor < this.memory.length) {
          this.memory[this.cursor] = new Byte(program[i]);
          this.cursor++;
          // update the memory panel
          _MemoryDisplay.update();
        } else {
          // Memory run out of bound, throw error
          _Kernel.krnTrapError("Memory Out Of Bound.");
        }
      }
    }

    // reset memory
    public resetMemory() : void {
      var newMem = new Memory(this.memorySize);
      this.memory = newMem.bytes;
      this.cursor = 0;
    }

    // return a specific byte in the memory
    public readByte(location : number) : String{
      if (location < this.memory.length) {
        return this.memory[location].byte;
      }
    }
  }
}
