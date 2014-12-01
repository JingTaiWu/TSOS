/// <reference path="jquery.d.ts"/>
/**
This class manages the display for the hard drive
*/
var TSOS;
(function (TSOS) {
    var HardDriveDisplay = (function () {
        function HardDriveDisplay() {
            this.displayTable = $("#hardDriveDisplay > tbody");
            this.update();
        }
        HardDriveDisplay.prototype.update = function () {
            // As usuall, empty the table first
            this.displayTable.empty();

            for (var track = 0; track < _HardDriveManager.TRACKS; track++) {
                for (var sector = 0; sector < _HardDriveManager.SECTORS; sector++) {
                    for (var block = 0; block < _HardDriveManager.BLOCKS; block++) {
                        var data = _HardDriveManager.read(track, sector, block);
                        var row = "<tr><small>" + "<td>" + track + sector + block + " </td><td>" + data.slice(0, _HardDriveManager.HEADER_LENGTH) + "</td><td>" + data.slice(_HardDriveManager.HEADER_LENGTH) + "</td>" + "</small></tr>";
                        $("#hardDriveDisplay > tbody:last").append(row);
                    }
                }
            }
        };
        return HardDriveDisplay;
    })();
    TSOS.HardDriveDisplay = HardDriveDisplay;
})(TSOS || (TSOS = {}));
