/*
  Memory Manager - similar to MMU (memory management unit)
  This class has the access to the CPU's memory
*/

module TSOS {
  export class MemoryManager {
    public memorySize: number = 256;
    public memory: Byte[];
    private cursor: number;

    constructor() {
      // Initializes the memory
      var mem = new Memory(this.memorySize);
      this.memory = mem.bytes;
      this.cursor = 0;
    }

    // allocate memory for a given process
    public allocate(process: Process) {
      // set the base and the limit of the current program
      process.base = this.cursor;
      process.limit = this.memorySize;

      for(var i = 0; i < process.program.length; i++) {
        var location = process.base + i;
        if(location < this.memory.length) {
          this.memory[location] = new Byte(process.program[i]);
        } else {
          // trap error
          _Kernel.krnInterruptHandler(EXCEED_MEMORY_SIZE_IRQ, process);
          return;
        }
      }

      // update the current cursor
      this.cursor += process.program.length;
      // Update the memory display
      _MemoryDisplay.update();
    }
    // reset memory
    public resetMemory(): void {
      var newMem = new Memory(this.memorySize);
      this.memory = newMem.bytes;
      this.cursor = 0;
    }

    // return a specific byte in the memory
    public readByte(location: number): string{
      if(location < this.memory.length) {
        return this.memory[location].byte;
      } else {
        _Kernel.krnInterruptHandler(MEMORY_OUT_OF_BOUND, location);
      }
    }

    // write to a specific byte in the memory
    public writeByte(location: number, byte: string) {
      if(location < this.memory.length) {
        this.memory[location] = new Byte(byte);
      }
    }
  }
}
