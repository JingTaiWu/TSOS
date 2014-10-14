/*
Resident Queue - where the processes reside when they are loaded into the OS
The information of the process is displayed on the Process Control Block panel
*/
var TSOS;
(function (TSOS) {
    var processControlBlock = (function () {
        function processControlBlock() {
            // where all the processes resides
            this.residentQueue = [];
        }
        processControlBlock.prototype.loadProcess = function (p) {
            this.residentQueue.push(p);
        };
        return processControlBlock;
    })();
    TSOS.processControlBlock = processControlBlock;
})(TSOS || (TSOS = {}));
