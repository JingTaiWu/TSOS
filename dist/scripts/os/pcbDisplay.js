/// <reference path="jquery.d.ts"/>
/*
PcbDisplay - manages the display in the client OS
*/
var TSOS;
(function (TSOS) {
    var PcbDisplay = (function () {
        function PcbDisplay() {
            this.pcbTableBody = $("#pcbDisplay > tbody");
        }
        // update the entire table
        PcbDisplay.prototype.update = function () {
            // empty the table first
            this.pcbTableBody.empty();
            var processls = [];
            for (var i = 0; i < _CPUScheduler.readyQueue.getSize(); i++) {
                // get the process from the ready queue
                var currentProcess = _CPUScheduler.readyQueue.dequeue();
                if (currentProcess != _CPUScheduler.currentProcess) {
                    // push it to the process list for display
                    processls.push(currentProcess);
                }

                // push it back to the ready queue
                _CPUScheduler.readyQueue.enqueue(currentProcess);
            }

            // display the current running process
            if (_CPUScheduler.currentProcess) {
                var cols = "<td>" + _CPUScheduler.currentProcess.pid + "</td>" + "<td>" + _CPUScheduler.currentProcess.pc + "</td>" + "<td>" + _CPUScheduler.currentProcess.ir + "</td>" + "<td>" + _CPUScheduler.currentProcess.acc + "</td>" + "<td>" + _CPUScheduler.currentProcess.xFlag + "</td>" + "<td>" + _CPUScheduler.currentProcess.yFlag + "</td>" + "<td>" + _CPUScheduler.currentProcess.zFlag + "</td>" + "<td>" + _CPUScheduler.currentProcess.state + "</td>";
                var row = "<tr id = 'pid-" + _CPUScheduler.currentProcess.pid + "'>" + cols + "</tr>";
                $("#pcbDisplay > tbody:last").append(row);
            }

            for (var i = 0; i < processls.length; i++) {
                var process = processls[i];
                var cols = "<td>" + process.pid + "</td>" + "<td>" + process.pc + "</td>" + "<td>" + process.ir + "</td>" + "<td>" + process.acc + "</td>" + "<td>" + process.xFlag + "</td>" + "<td>" + process.yFlag + "</td>" + "<td>" + process.zFlag + "</td>" + "<td>" + process.state + "</td>";
                var row = "<tr id = 'pid-" + process.pid + "'>" + cols + "</tr>";
                $("#pcbDisplay > tbody:last").append(row);
            }
        };
        return PcbDisplay;
    })();
    TSOS.PcbDisplay = PcbDisplay;
})(TSOS || (TSOS = {}));
