/*
ReadyQueue - Where the processes resides
The information about the process is displayed in the process control block
in the client OS
*/
var TSOS;
(function (TSOS) {
    var Process = (function () {
        function Process() {
        }
        return Process;
    })();
    TSOS.Process = Process;
})(TSOS || (TSOS = {}));
