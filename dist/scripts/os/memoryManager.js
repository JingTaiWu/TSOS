/*
Memory Manager - similar to MMU (memory management unit)
This class has the access to the CPU's memory
*/
var TSOS;
(function (TSOS) {
    // Constants for block availibility
    (function (MEMORY_STATUS) {
        MEMORY_STATUS[MEMORY_STATUS["AVAILABLE"] = 0] = "AVAILABLE";
        MEMORY_STATUS[MEMORY_STATUS["UNAVAILABLE"] = 1] = "UNAVAILABLE";
    })(TSOS.MEMORY_STATUS || (TSOS.MEMORY_STATUS = {}));
    var MEMORY_STATUS = TSOS.MEMORY_STATUS;
    ;
    var MemoryManager = (function () {
        function MemoryManager() {
            // Total memory size is 768
            this.memorySize = 768;
            // There are 3 blocks, each block is 256 bytes
            this.blockSize = 256;
            this.numberOfBlocks = 3;
            // A table to keep track of available blocks
            this.availableBlocks = [];
            // Initializes the memory
            var mem = new TSOS.Memory(this.memorySize);
            this.memory = mem.bytes;

            for (var i = 0; i < this.blockSize; i++) {
                this.availableBlocks[i] = 0 /* AVAILABLE */;
            }
        }
        // allocate memory for a given process
        MemoryManager.prototype.allocate = function (process, program) {
            // Give the process a pid
            process.pid = _ProcessManager.lastPid++;

            for (var i = 0; i < this.numberOfBlocks; i++) {
                if (this.availableBlocks[i] == 0 /* AVAILABLE */) {
                    // if it finds an available block, store the process in
                    // set the base and the limit of the current program
                    process.base = i * this.blockSize;
                    process.limit = process.base + this.blockSize;
                    process.blockNumber = i;
                    process.location = 0 /* IN_RAM */;

                    for (var k = process.base; k < process.limit; k++) {
                        this.memory[k] = new TSOS.Byte("00");
                    }

                    for (var j = 0; j < program.length; j++) {
                        var location = process.base + j;
                        if (location < process.limit) {
                            this.memory[location] = new TSOS.Byte(program[j]);
                        } else {
                            // trap error
                            _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, process);
                            return;
                        }
                    }

                    // Set this block to unavailable
                    this.availableBlocks[i] = 1 /* UNAVAILABLE */;

                    // Update the memory display
                    _MemoryDisplay.update();

                    // return true after process is loaded into the memory
                    return true;
                }
            }

            // if it doesnt find any, put it in the hard drive
            if (_krnHardDriveDriver.writeSwapFile(program, process.pid)) {
                process.location = 1 /* IN_HARD_DRIVE */;
                _HardDriveDisplay.update();
                return true;
            }

            return false;
        };

        // deallocate a block of memory
        MemoryManager.prototype.deallocate = function (process) {
            if (process) {
                // make this block available
                this.availableBlocks[process.blockNumber] = 0 /* AVAILABLE */;
            }
        };

        // reset memory
        MemoryManager.prototype.resetMemory = function () {
            var newMem = new TSOS.Memory(this.memorySize);
            this.memory = newMem.bytes;
            _MemoryDisplay.update();
        };

        // return a specific byte in the memory
        MemoryManager.prototype.readByte = function (location, process) {
            location = location + process.base;
            if (location < process.limit && location >= process.base) {
                return this.memory[location].byte;
            } else {
                _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, [process]);
            }
        };

        // write to a specific byte in the memory
        MemoryManager.prototype.writeByte = function (location, byte, process) {
            location = location + process.base;
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
