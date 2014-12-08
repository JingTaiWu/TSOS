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
        ProcessManager.prototype.addProcess = function (program, priority) {
            var process = new TSOS.Process();

            if (isNaN(priority)) {
                // give a random priority number (for priority scheduling testing)
                process.priority = Math.floor(Math.random() * (100 - 10 + 1) + 10);
            } else {
                process.priority = parseInt(priority);
            }

            // try to allocate space for process
            if (_MemoryManager.allocate(process, program)) {
                // add it to the resident queue
                this.residentQueue.enqueue(process);
                return process;
            } else {
                // store the process into the hard drive instead
                return null;
            }
        };

        // Removes a process
        ProcessManager.prototype.removeProcess = function (process) {
            if (process) {
                _MemoryManager.deallocate(process);
                var removed = this.residentQueue.removeProcess(process.pid);
                if (removed) {
                    return true;
                }
            }

            return false;
        };

        // Execute Process (Avoid Calling CPU directly from shell)
        ProcessManager.prototype.execute = function (process) {
            _Kernel.krnInterruptHandler(PROCESS_EXECUTION_ISR, [process]);
        };
        return ProcessManager;
    })();
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
