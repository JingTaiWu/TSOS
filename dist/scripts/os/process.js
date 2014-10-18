/*
The information about the process is displayed in the process control block
in the client OS
*/
var TSOS;
(function (TSOS) {
    var Process = (function () {
        function Process() {
            this.pc = 0;
            this.acc = 0;
            this.ir = 0;
            this.xFlag = 0;
            this.yFlag = 0;
            this.zFlag = 0;
            this.location = "";
            this.base = 0;
            this.limit = 0;
            this.state = Process.NOT_RUNNING;
            this.program = [];
        }
        Process.RUNNING = "Running";
        Process.NOT_RUNNING = "Not Running";
        Process.TERMINATED = "Terminated";
        return Process;
    })();
    TSOS.Process = Process;
})(TSOS || (TSOS = {}));
