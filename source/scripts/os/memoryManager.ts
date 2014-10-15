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
    // return the base address of the program
    public loadProgram(program : string[]) : number {
      // add the instructions into the memory, byte by byte
      for (var offset = 0; offset < program.length; offset++) {
        if(this.cursor < this.memory.length) {
          this.memory[this.cursor + offset] = new Byte(program[offset]);
        } else {
          // Memory run out of bound, throw error
          _Kernel.krnTrapError("Memory Out Of Bound.");
        }
      }

      // temp variable for return later
      var temp : number = this.cursor;
      // update the cursor in the memory
      this.cursor += program.length;
      // update the memory panel
      _MemoryDisplay.update();
      // create a new process and add it to the resident queue
      var pid = _PCB.addProcess(temp);

      return pid;
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
