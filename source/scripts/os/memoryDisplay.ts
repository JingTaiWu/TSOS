/// <reference path="jquery.d.ts"/>

/*
  This class handles how the memory will be displayed in the host OS
*/
module TSOS {
    export class MemoryDisplay {
        // This method updates the memory display in the host OS
        public update(): void {
            var displayTable = $("#memoryDisplay > tbody");
            var memory = _MemoryManager.memory;
            // To avoid any display conflict
            // Clear all the rows in the table first
            displayTable.empty();

            // display the memory
            var index: number = 0;

            while (index < memory.length) {
                // The first column should display the address
                var cols = "<td style='font-weight: bold;'>" + "0x0" + index.toString(16).toUpperCase() + "</td>";
                var row = "";
                // every address has 16 bits
                for (var col = 0; col < 8; col++) {
                    var location = index + col;
                    cols += "<td id='" + location + "'>" + memory[location].byte + "</td>";
                }

                // increment the index
                index += 8;

                // form the string for one row
                row += "<tr>" + cols + "</tr>";

                // append it to the table
                $("#memoryDisplay > tbody:last").append(row);
            }
        }
    }
}
