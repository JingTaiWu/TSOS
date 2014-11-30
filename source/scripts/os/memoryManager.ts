/*
  Memory Manager - similar to MMU (memory management unit)
  This class has the access to the CPU's memory
  */

module TSOS {
    // Constants for block availibility
    export enum MEMORY_STATUS {AVAILABLE, UNAVAILABLE};
    export class MemoryManager {
        // Total memory size is 768
        public memorySize: number = 768;
        // There are 3 blocks, each block is 256 bytes
        public blockSize: number = 256;
        public numberOfBlocks: number = 3;
        // A reference to hardware memory
        public memory: Byte[];
        // A table to keep track of available blocks
        private availableBlocks: MEMORY_STATUS[] = [];

        constructor() {
            // Initializes the memory
            var mem = new Memory(this.memorySize);
            this.memory = mem.bytes;

            // Initalize the table for available blocks
            for(var i  = 0; i < this.blockSize; i++) {
                this.availableBlocks[i] = MEMORY_STATUS.AVAILABLE;
            }
        }

        // allocate memory for a given process
        public allocate(process: Process, program: string[]): boolean {
            // find a free block for the new process
            for(var i = 0; i < this.numberOfBlocks; i++) {
                if(this.availableBlocks[i] == MEMORY_STATUS.AVAILABLE) {
                    process.pid = _ProcessManager.lastPid++;
                    // if it find an available block, store the process in
                    // set the base and the limit of the current program
                    process.base = i * this.blockSize;
                    process.limit = process.base + this.blockSize;
                    process.blockNumber = i;
                    // reset the block
                    for(var k: number = process.base; k < process.limit; k++) {
                        this.memory[k] = new Byte("00");
                    }
                    // fill bytes in
                    for(var j = 0; j < program.length; j++) {
                        var location = process.base + j;
                        if(location < process.limit) {
                            this.memory[location] = new Byte(program[j]);
                        } else {
                            // trap error
                            _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, process);
                            return;
                        }                    
                    }
                    // givw a random priority number (for priority scheduling testing)
                    process.priority = Math.floor(Math.random()*(100 - 10 + 1) + 10);
                    // Set this block to unavailable
                    this.availableBlocks[i] = MEMORY_STATUS.UNAVAILABLE;
                    // Update the memory display
                    _MemoryDisplay.update();
                    // return true after process is loaded into the memory
                    return true;
                } 
            }

            // if it doesnt find any, return false
            return false;
        }

        // deallocate a block of memory
        public deallocate(process: Process) {
            if(process) {
                // make this block available
                this.availableBlocks[process.blockNumber] = MEMORY_STATUS.AVAILABLE;
            }
        }

        // reset memory
        public resetMemory(): void {
            var newMem = new Memory(this.memorySize);
            this.memory = newMem.bytes;
            _MemoryDisplay.update();
        }

        // return a specific byte in the memory
        public readByte(location: number, process: Process): string {
            location = location + process.base;
            if(location < process.limit && location >= process.base) {
                return this.memory[location].byte;
            } else {
                _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, [process]);
            }
        }

        // write to a specific byte in the memory
        public writeByte(location: number, byte: string, process: Process) {
            location = location + process.base;
            if(location < process.limit && location >= process.base) {
                this.memory[location] = new Byte(byte);
                _MemoryDisplay.update();
            } else {
                _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, [process]);
            }
        }
    }
}
