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
        // load user input program
        MemoryManager.prototype.loadProgram = function (program) {
            for (var i = 0; i < program.length; i++) {
                if (this.cursor < this.memory.length) {
                    this.memory[this.cursor] = new TSOS.Byte(program[i]);
                    this.cursor++;

                    // update the memory panel
                    _MemoryDisplay.update();
                } else {
                    // Memory run out of bound, throw error
                    _Kernel.krnTrapError("Memory Out Of Bound.");
                }
            }
        };

        // reset memory
        MemoryManager.prototype.resetMemory = function () {
            var newMem = new TSOS.Memory(this.memorySize);
            this.memory = newMem.bytes;
            this.cursor = 0;
        };

        // return a specific byte in the memory
        MemoryManager.prototype.readByte = function (location) {
            if (location < this.memory.length) {
                return this.memory[location].byte;
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
