/*
Process Control block - save the state of the process
The information of the process is displayed on the Process Control Block panel
*/
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = (function () {
        function ProcessControlBlock() {
            // where all the processes resides
            this.residentQueue = [];
        }
        ProcessControlBlock.prototype.addProcess = function (base) {
            var process = new TSOS.Process();
            process.location = "Memory";
            this.residentQueue.push(process);

            // Set the pid of the process to the index of the process in the resident queue
            this.residentQueue[this.residentQueue.length - 1].pid = this.residentQueue.length - 1;
            return process.pid;
        };
        return ProcessControlBlock;
    })();
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
