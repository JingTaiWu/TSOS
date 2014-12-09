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
            switch (_CPUScheduler.currentAlgorithm) {
                case 1 /* FCFS */: {
                    $("#schedulingAlg").text("FCFS");
                    break;
                }
                case 2 /* Priority */: {
                    $("#schedulingAlg").text("Priority");
                    break;
                }
                default: {
                    $("#schedulingAlg").text("RoundRobin");
                }
            }

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
                processls.push(_CPUScheduler.currentProcess);
            }

            // define sort function
            function compareProcesses(a, b) {
                if (a.pid < b.pid) {
                    return -1;
                } else if (a.pid > b.pid) {
                    return 1;
                } else {
                    return 0;
                }
            }

            // pass it into array sort
            processls.sort(compareProcesses);

            for (var i = 0; i < processls.length; i++) {
                var process = processls[i];
                var processLocation = (process.location == 0 /* IN_RAM */) ? "RAM" : "HD";
                var cols = "<td>" + process.pid + "</td>" + "<td>" + process.pc + "</td>" + "<td>" + process.ir + "</td>" + "<td>" + process.acc + "</td>" + "<td>" + process.xFlag + "</td>" + "<td>" + process.yFlag + "</td>" + "<td>" + process.zFlag + "</td>" + "<td>" + processLocation + "</td>" + "<td style='font-weight: bold;'>" + process.state + "</td>";
                var row = "";

                // Show the running process in green
                if (process.state == TSOS.Process.RUNNING) {
                    row = '<tr class="success">' + cols + "</tr>";
                } else {
                    row = '<tr class="warning">' + cols + "</tr>";
                }
                $("#pcbDisplay > tbody:last").append(row);
            }
        };
        return PcbDisplay;
    })();
    TSOS.PcbDisplay = PcbDisplay;
})(TSOS || (TSOS = {}));
