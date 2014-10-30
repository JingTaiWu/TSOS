/*
  Memory Manager - similar to MMU (memory management unit)
  This class has the access to the CPU's memory
  */

  module TSOS {
    export class MemoryManager {
      // Total memory size is 768
      public memorySize: number = 768;
      // There are 3 blocks, each block is 256
      public blockSize: number = 256;
      public numberOfBlocks: number = 3;
      // A reference to hardware memory
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
      process.base = (this.cursor % this.numberOfBlocks) * this.blockSize;
      process.limit = process.base + this.blockSize;

      // deallocate the code that is currrently in this block of memory
      this.deallocate(process.base, process.limit);

      // populate the block of memory
      for(var i = 0; i < process.program.length; i++) {
        var location = process.base + i;
        if(location < process.limit) {
          this.memory[location] = new Byte(process.program[i]);
          } else {
          // trap error
          _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, process);
          return;
        }
      }

      // update the current cursor
      this.cursor++;
      // Update the memory display
      _MemoryDisplay.update();
    }

    // deallocate a block of memory
    public deallocate(base, limit) {
      for(var i: number = base; i < limit; i++) {
        this.memory[i] = new Byte("00");
      }
    }

    // reset memory
    public resetMemory(): void {
      var newMem = new Memory(this.memorySize);
      this.memory = newMem.bytes;
      this.cursor = 0;
    }

    // return a specific byte in the memory
    public readByte(location: number, process: Process): string{
      if(location < process.limit && location >= process.base) {
        return this.memory[location].byte;
        } else {
          _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, [process]);
        }
      }

    // write to a specific byte in the memory
    public writeByte(location: number, byte: string, process: Process) {
      if(location < process.limit && location >= process.base) {
        this.memory[location] = new Byte(byte);
        _MemoryDisplay.update();
        } else {
          _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, [process]);
        }
      }
    }
  }
