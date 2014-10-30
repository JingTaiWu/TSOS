/*
Memory Manager - similar to MMU (memory management unit)
This class has the access to the CPU's memory
*/
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            // Total memory size is 768
            this.memorySize = 768;
            // There are 3 blocks, each block is 256
            this.blockSize = 256;
            this.numberOfBlocks = 3;
            // Initializes the memory
            var mem = new TSOS.Memory(this.memorySize);
            this.memory = mem.bytes;
            this.cursor = 0;
        }
        // allocate memory for a given process
        MemoryManager.prototype.allocate = function (process) {
            // set the base and the limit of the current program
            process.base = (this.cursor % this.numberOfBlocks) * this.blockSize;
            process.limit = process.base + this.blockSize;

            // deallocate the code that is currrently in this block of memory
            this.deallocate(process.base, process.limit);

            for (var i = 0; i < process.program.length; i++) {
                var location = process.base + i;
                if (location < process.limit) {
                    this.memory[location] = new TSOS.Byte(process.program[i]);
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
        };

        // deallocate a block of memory
        MemoryManager.prototype.deallocate = function (base, limit) {
            for (var i = base; i < limit; i++) {
                this.memory[i] = new TSOS.Byte("00");
            }
        };

        // reset memory
        MemoryManager.prototype.resetMemory = function () {
            var newMem = new TSOS.Memory(this.memorySize);
            this.memory = newMem.bytes;
            this.cursor = 0;
        };

        // return a specific byte in the memory
        MemoryManager.prototype.readByte = function (location, process) {
            if (location < process.limit && location >= process.base) {
                return this.memory[location].byte;
            } else {
                _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, [process]);
            }
        };

        // write to a specific byte in the memory
        MemoryManager.prototype.writeByte = function (location, byte, process) {
            if (location < process.limit && location >= process.base) {
                this.memory[location] = new TSOS.Byte(byte);
                _MemoryDisplay.update();
            } else {
                _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, [process]);
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
