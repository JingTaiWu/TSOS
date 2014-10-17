/*
Process Control block - save the state of the process
The information of the process is displayed on the Process Control Block panel
*/
var TSOS;
(function (TSOS) {
    var ProcessManager = (function () {
        function ProcessManager() {
            // where all the processes resides
            this.residentQueue = [];
            this.readyQueue = [];
            this.lastPid = 0;
        }
        // Add User input program to pcb
        ProcessManager.prototype.addProcess = function (program) {
            // reset the memory
            _MemoryManager.resetMemory();
            var process = new TSOS.Process();
            process.pid = this.lastPid++;
            process.program = program;
            _MemoryManager.allocate(process);

            // add it to the resident queue
            this.residentQueue[process.pid] = process;
            _PCBDisplay.update();
            return process.pid;
        };
        return ProcessManager;
    })();
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
