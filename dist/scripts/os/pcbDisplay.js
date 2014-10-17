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
            var residentQueue = _ProcessManager.residentQueue;
            for (var i = 0; i < residentQueue.length; i++) {
                var process = residentQueue[i];
                var cols = "<td>" + process.pid + "</td>" + "<td>" + process.pc + "</td>" + "<td>" + process.ir + "</td>" + "<td>" + process.acc + "</td>" + "<td>" + process.xFlag + "</td>" + "<td>" + process.yFlag + "</td>" + "<td>" + process.zFlag + "</td>";
                var row = "<tr id = 'pid-" + process.pid + "'>" + cols + "</tr>";
                $("#pcbDisplay > tbody:last").append(row);
            }
        };

        // update a single row given a process id
        PcbDisplay.prototype.updateProcess = function (pid) {
            var residentQueue = _ProcessManager.residentQueue;
            for (var i = 0; i < residentQueue.length; i++) {
                var process = residentQueue[i];

                // if it matches, update the row
                if (process.pid == pid) {
                    // get the html element
                    var processRow = $("#pid-" + pid);
                    processRow.empty();
                    var cols = "<td>" + process.pid + "</td>" + "<td>" + process.pc + "</td>" + "<td>" + process.ir + "</td>" + "<td>" + process.acc + "</td>" + "<td>" + process.xFlag + "</td>" + "<td>" + process.yFlag + "</td>" + "<td>" + process.zFlag + "</td>";
                    processRow.append(cols);
                }
            }
        };
        return PcbDisplay;
    })();
    TSOS.PcbDisplay = PcbDisplay;
})(TSOS || (TSOS = {}));
