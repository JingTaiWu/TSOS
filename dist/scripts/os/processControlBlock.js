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
            // Pid
            this.currentPid = 0;
        }
        ProcessControlBlock.prototype.addProcess = function (base) {
            var process = new TSOS.Process(this.currentPid, base);
            process.location = "Memory";
            this.residentQueue.push(process);

            // increment the pid (we don't want to recycle the ID)
            this.currentPid++;

            // update the PCB
            _PCBDisplay.update();

            return process.pid;
        };
        return ProcessControlBlock;
    })();
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
