/*
Process Control block - save the state of the process
The information of the process is displayed on the Process Control Block panel
*/
var TSOS;
(function (TSOS) {
    var ProcessManager = (function () {
        function ProcessManager() {
            // where all the processes resides
            this.residentQueue = new TSOS.ProcessQueue();
            this.lastPid = 0;
        }
        // Add User input program to pcb
        ProcessManager.prototype.addProcess = function (program) {
            var process = new TSOS.Process();
            process.pid = this.lastPid++;
            process.program = program;

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
