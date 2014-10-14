/// <reference path="jquery.d.ts"/>
/*
This class handles how the memory will be displayed in the host OS
*/
var TSOS;
(function (TSOS) {
    var MemoryDisplay = (function () {
        function MemoryDisplay() {
        }
        // This method updates the memory display in the host OS
        MemoryDisplay.prototype.update = function () {
            var displayTable = $("#memoryDisplay > tbody");
            var memory = _MemoryManager.readMemory();

            // To avoid any display conflict
            // Clear all the rows in the table first
            displayTable.empty();

            for (var row = 0; row < memory.length; row = row + 8) {
                var cols = "";
                for (var col = 0; col < 8; col++) {
                    var actualIndex = col + row;
                    cols += "<td>" + _MemoryManager.readByte(actualIndex) + "</td>";
                }
                var address = "<td style='font-weight: bold'>" + row + "</td>";
                var rowStr = "<tr>" + address + cols + "</tr>";
                $("#memoryDisplay > tbody:last").append(rowStr);
            }
        };
        return MemoryDisplay;
    })();
    TSOS.MemoryDisplay = MemoryDisplay;
})(TSOS || (TSOS = {}));
