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
                0: this.terminateProcess,
                1: this.handleSysOutput
            };
        }
        // terminates the current running process
        SystemCalls.prototype.terminateProcess = function (params) {
            var process = params;

            // changes the state of the process
            process.state = TSOS.Process.TERMINATED;

            // Remove the process in the resident queue
            _ProcessManager.removeProcess(process);

            // Remove the process in the ready queue
            // If the current running process of the scheduler is the one being terminated
            // reset the current process
            if (_CPUScheduler.currentProcess !== null) {
                if (_CPUScheduler.currentProcess.pid == process.pid) {
                    _CPUScheduler.currentProcess = null;
                    _CPUScheduler.cycle = 0;
                    _CPU.stop();
                } else {
                    for (var i = 0; i < _CPUScheduler.readyQueue.getSize(); i++) {
                        var currentProcess = _CPUScheduler.getNextProcess();

                        // If the process is not the same as the terminated one
                        // add it back to the queue
                        if (currentProcess.pid != process.pid) {
                            _CPUScheduler.readyQueue.enqueue(currentProcess);
                        }
                    }
                }
            }

            // update all the display
            _MemoryDisplay.update();
            _PCBDisplay.update();
            _CPUDisplay.update();
        };

        // this handles the output of a process when it reaches Op code FF
        SystemCalls.prototype.handleSysOutput = function (params) {
            var process = params;
            var xFlag = parseInt(process.xFlag, 16);
            var yFlag = parseInt(process.yFlag, 16);

            // if the X reg is 1, print the integer stored in the register
            if (xFlag == 1) {
                var output = yFlag + "";
                _StdOut.putText(output);
                _StdOut.advanceLine();
                _StdOut.putText(">");
                // if the X reg is 2, print the 00-terminated string stored at address
                // in the y register
            } else if (xFlag == 2) {
                var location = yFlag;
                var output = "";
                var currentByte = _MemoryManager.readByte(location, process);
                while (currentByte !== "00") {
                    // concat current byte with the output string
                    // convert character into Char
                    output += String.fromCharCode(parseInt(currentByte, 16));

                    // increment the location
                    location += 1;

                    // reassign the currentByte to a newByte in memory
                    currentByte = _MemoryManager.readByte(location, process);
                }

                // print the result to console
                _StdOut.putText(output);
                _StdOut.advanceLine();
                _StdOut.putText(">");
            }
        };
        return SystemCalls;
    })();
    TSOS.SystemCalls = SystemCalls;
})(TSOS || (TSOS = {}));
