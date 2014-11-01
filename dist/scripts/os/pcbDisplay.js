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

                // push it to the process list for display
                processls.push(currentProcess);

                // push it back to the ready queue
                _CPUScheduler.readyQueue.enqueue(currentProcess);
            }

            for (var i = 0; i < processls.length; i++) {
                var process = processls[i];
                var cols = "<td>" + process.pid + "</td>" + "<td>" + process.pc + "</td>" + "<td>" + process.ir + "</td>" + "<td>" + process.acc + "</td>" + "<td>" + process.xFlag + "</td>" + "<td>" + process.yFlag + "</td>" + "<td>" + process.zFlag + "</td>" + "<td>" + process.state + "</td>";
                var row = "<tr id = 'pid-" + process.pid + "'>" + cols + "</tr>";
                $("#pcbDisplay > tbody:last").append(row);
            }
        };

        // update a single row given a process id
        PcbDisplay.prototype.updateProcess = function (pid) {
            var readyQueue = _CPUScheduler.readyQueue;
            for (var i = 0; i < readyQueue.getSize(); i++) {
                var process = readyQueue.getProcess(i);

                // if it matches, update the row
                if (process.pid == pid) {
                    // get the html element
                    var processRow = $("#pid-" + pid);
                    processRow.empty();
                    var cols = "<td>" + process.pid + "</td>" + "<td>" + process.pc + "</td>" + "<td>" + process.ir + "</td>" + "<td>" + process.acc + "</td>" + "<td>" + process.xFlag + "</td>" + "<td>" + process.yFlag + "</td>" + "<td>" + process.zFlag + "</td>" + "<td>" + process.state + "</td>";
                    processRow.append(cols);
                }
            }
        };
        return PcbDisplay;
    })();
    TSOS.PcbDisplay = PcbDisplay;
})(TSOS || (TSOS = {}));
