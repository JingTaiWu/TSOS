/*
This class handles all the system calls
(break generates a system call)
*/
var TSOS;
(function (TSOS) {
    var SystemCalls = (function () {
        function SystemCalls() {
            // system call interface - mapping all the systems calls
            this.systemCallInterface = {
                0: this.terminateProcess
            };
        }
        // terminates the current running process
        SystemCalls.prototype.terminateProcess = function (params) {
            var process = params[0];

            // changes the state of the process
            process.state = TSOS.Process.TERMINATED;
            _ProcessManager.removeProcess(process);

            // reinitialize CPU
            _CPU.init();

            // update all the display
            _MemoryDisplay.update();
            _PCBDisplay.update();
            _CPU.updateDisplay();
        };
        return SystemCalls;
    })();
    TSOS.SystemCalls = SystemCalls;
})(TSOS || (TSOS = {}));
