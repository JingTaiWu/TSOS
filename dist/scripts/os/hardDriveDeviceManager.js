/**
This class manages the harddrive
*/
var TSOS;
(function (TSOS) {
    var HardDriveManager = (function () {
        function HardDriveManager() {
            // Constants for tracks sector and block
            this.TRACKS = 4;
            this.SECTORS = 8;
            this.BLOCKS = 8;
            // Each block is 64 bytes long
            this.BLOCK_SIZE = 64;
            /** The length of the header is 4 characters.
            The first character indicate whether or not the current TSB is occupied
            The following characters indicate the location of the connecting TSB
            */
            this.HEADER_LENGTH = 4;
            // Initialize the hard drive
            this.hardDrive = new TSOS.HardDrive(this.TRACKS, this.SECTORS, this.BLOCKS, this.BLOCK_SIZE);
        }
        HardDriveManager.prototype.initialize = function () {
            for (var track = 0; track < this.TRACKS; track++) {
                for (var sector = 0; sector < this.SECTORS; sector++) {
                    for (var block = 0; block < this.BLOCKS; block++) {
                        this.write(track, sector, block, "");
                    }
                }
            }
        };

        // Sets the header for a given TSB
        HardDriveManager.prototype.setHeader = function (track, sector, block, newHeader) {
            // slice the first 4 characters of the data
            // and replace it with the new header.
            var data = this.hardDrive.read(track, sector, block);
            var newData = newHeader + data.slice(0, this.HEADER_LENGTH);
            this.hardDrive.write(track, sector, block, newData);
        };

        // write to a specific TSB
        HardDriveManager.prototype.write = function (track, sector, block, data) {
            for (var i = data.length; i < this.BLOCK_SIZE; i++) {
                data += "00";
            }

            //data = parseInt(data, 16).toString();
            this.hardDrive.write(track, sector, block, data);
        };

        // read a specific TSB
        HardDriveManager.prototype.read = function (track, sector, block) {
            return this.hardDrive.read(track, sector, block);
        };
        return HardDriveManager;
    })();
    TSOS.HardDriveManager = HardDriveManager;
})(TSOS || (TSOS = {}));
