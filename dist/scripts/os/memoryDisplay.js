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

            // display the memory
            var index = 0;
            while (index < memory.length) {
                // The first column should display the address
                var cols = "<td style='font-weight: bold;'>" + "0x0" + index.toString(16).toUpperCase() + "</td>";
                var row = "";

                for (var col = 0; col < 8; col++) {
                    var location = index + col;
                    cols += "<td id='" + location + "'>" + _MemoryManager.readByte(location) + "</td>";
                }

                // increment the index
                index += 8;

                // form the string for one row
                row += "<tr>" + cols + "</tr>";

                // append it to the table
                $("#memoryDisplay > tbody:last").append(row);
            }
        };
        return MemoryDisplay;
    })();
    TSOS.MemoryDisplay = MemoryDisplay;
})(TSOS || (TSOS = {}));
