/*
Process Control block - save the state of the process
The information of the process is displayed on the Process Control Block panel
*/
var TSOS;
(function (TSOS) {
    var ProcessManager = (function () {
        function ProcessManager(residentQueue, // pid will not be recycled
        lastPid) {
            if (typeof residentQueue === "undefined") { residentQueue = new TSOS.ProcessQueue(); }
            if (typeof lastPid === "undefined") { lastPid = 0; }
            this.residentQueue = residentQueue;
            this.lastPid = lastPid;
        }
        // Add User input program to pcb
        ProcessManager.prototype.addProcess = function (program) {
            var process = new TSOS.Process();
            process.pid = this.lastPid++;
            process.program = program;

            // Current memory only allows 3 programs to be in the resident queue
            // at the same time. In this case, the OS will overwrite the memory block
            if (this.residentQueue.getSize() >= _MemoryManager.numberOfBlocks) {
                // deallocate process at least recently used spot
                this.residentQueue.dequeue();
            }

            // allocate space for process
            _MemoryManager.allocate(process);

            // add it to the resident queue
            this.residentQueue.enqueue(process);

            // Update the display
            _PCBDisplay.update();
            return process.pid;
        };

        // Removes a process
        ProcessManager.prototype.removeProcess = function (process) {
            this.residentQueue.removeProcess(process.pid);
        };

        // Execute Process (Avoid Calling CPU directly from shell)
        ProcessManager.prototype.execute = function (process) {
            _Kernel.krnInterruptHandler(PROCESS_EXECUTION_ISR, [process]);
        };
        return ProcessManager;
    })();
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
