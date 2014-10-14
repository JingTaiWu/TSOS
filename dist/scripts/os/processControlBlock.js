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
            this.pid = 0;
        }
        ProcessControlBlock.prototype.addProcess = function (p) {
            this.residentQueue.push(p);
        };
        return ProcessControlBlock;
    })();
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
