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
        }
        ProcessManager.prototype.addToResidentQueue = function (base) {
            var process = new TSOS.Process();
            process.location = "Memory";
            this.residentQueue.push(process);

            // Set the pid of the process to the index of the process in the resident queue
            this.residentQueue[this.residentQueue.length - 1].pid = this.residentQueue.length - 1;
            return process.pid;
        };
        return ProcessManager;
    })();
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));
