/*
Memory Manager - similar to MMU (memory management unit)
This class has the access to the CPU's memory
*/
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            this.memorySize = 256;
            // Initializes the memory
            var mem = new TSOS.Memory(this.memorySize);
            this.memory = mem.bytes;
            this.cursor = 0;
        }
        // allocate memory for a given process
        MemoryManager.prototype.allocate = function (process) {
            // set the base and the limit of the current program
            process.base = this.cursor;
            process.limit = this.memorySize;

            for (var i = 0; i < process.program.length; i++) {
                var location = process.base + i;
                if (location < this.memory.length) {
                    this.memory[location] = new TSOS.Byte(process.program[i]);
                } else {
                    // trap error
                    _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, process);
                    return;
                }
            }

            // update the current cursor
            this.cursor += process.program.length;

            // Update the memory display
            _MemoryDisplay.update();
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
                _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, process);
            }
        };

        // write to a specific byte in the memory
        MemoryManager.prototype.writeByte = function (location, byte, process) {
            if (location < process.limit && location >= process.base) {
                this.memory[location] = new TSOS.Byte(byte);
                _MemoryDisplay.update();
            } else {
                _Kernel.krnInterruptHandler(INVALID_MEMORY_OP, process);
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
