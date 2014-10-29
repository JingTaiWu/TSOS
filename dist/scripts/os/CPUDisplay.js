var TSOS;
(function (TSOS) {
    var CPUDisplay = (function () {
        function CPUDisplay() {
        }
        // update the display in the client OS
        CPUDisplay.prototype.updateDisplay = function () {
            // Grab a reference to the CPU Div in the HTML page
            var cpuDiv = $("#cpu > tbody");

            // Empty the table
            cpuDiv.empty();

            // Formulate string
            var cols = "<td>" + _CPU.PC + "</td>" + "<td>" + _CPU.IR + "</td>" + "<td>" + _CPU.Acc + "</td>" + "<td>" + _CPU.Xreg + "</td>" + "<td>" + _CPU.Yreg + "</td>" + "<td>" + _CPU.Zflag + "</td>";
            var row = "<tr>" + cols + "</tr>";

            // Append the string to the Div
            cpuDiv.append(row);
        };
        return CPUDisplay;
    })();
    TSOS.CPUDisplay = CPUDisplay;
})(TSOS || (TSOS = {}));
