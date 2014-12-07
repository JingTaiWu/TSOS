/// <reference path="jquery.d.ts"/>
/**
This class manages the display for the hard drive
*/
var TSOS;
(function (TSOS) {
    var HardDriveDisplay = (function () {
        function HardDriveDisplay() {
            this.displayTable = $("#hardDriveDisplay > tbody");
        }
        HardDriveDisplay.prototype.update = function () {
            // As usuall, empty the table first
            this.displayTable.empty();

            for (var track = 0; track < _krnHardDriveDriver.TRACKS; track++) {
                for (var sector = 0; sector < _krnHardDriveDriver.SECTORS; sector++) {
                    for (var block = 0; block < _krnHardDriveDriver.BLOCKS; block++) {
                        var data = _krnHardDriveDriver.read(track, sector, block);

                        // Track sector block
                        var tsb = "<td><strong>" + track + sector + block + "</strong></td>";

                        // One bit used to determine whether the current TSB is in use
                        var usedBit = "<td>" + data.slice(0, 1) + "</td>";

                        // Link to the next TSB if there is any
                        var link = "<td>" + data.slice(1, _krnHardDriveDriver.HEADER_LENGTH) + "</td>";

                        // The actual content contained in TSB
                        var content = "<td>" + data.slice(_krnHardDriveDriver.HEADER_LENGTH) + "</td>";

                        var row = (data.slice(0, 1) === _krnHardDriveDriver.IN_USE) ? "<tr class='text-danger'>" + tsb + usedBit + link + content + "</tr>" : "<tr class='text-success'>" + tsb + usedBit + link + content + "</tr>";
                        $("#hardDriveDisplay > tbody:last").append(row);
                    }
                }
            }
        };
        return HardDriveDisplay;
    })();
    TSOS.HardDriveDisplay = HardDriveDisplay;
})(TSOS || (TSOS = {}));
