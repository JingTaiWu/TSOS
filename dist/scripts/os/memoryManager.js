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
            this.memory = new TSOS.Memory(this.memorySize);
        }
        // return a specific byte in the memory
        MemoryManager.prototype.readByte = function (location) {
            if (location < this.memory.bytes.length) {
                return this.memory.bytes[location].byte;
            }
        };

        // return the entire memory
        MemoryManager.prototype.readMemory = function () {
            return this.memory.bytes;
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
