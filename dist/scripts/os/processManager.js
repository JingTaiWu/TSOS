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

            // try to allocate space for process
            if (_MemoryManager.allocate(process, program)) {
                // add it to the resident queue
                this.residentQueue.enqueue(process);
                return process;
            } else {
                return null;
            }
        };

        // Removes a process
        ProcessManager.prototype.removeProcess = function (process) {
            _MemoryManager.deallocate(process);
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
