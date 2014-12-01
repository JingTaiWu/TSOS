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
            this.DATA_LENGTH = this.BLOCK_SIZE * 2 - this.HEADER_LENGTH;
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

            // TSB: 000 is reserved for MBR
            this.setHeader(0, 0, 0, "1000");
            this.setContent(0, 0, 0, "001100");
        };

        // Sets the header for a given TSB
        HardDriveManager.prototype.setHeader = function (track, sector, block, newHeader) {
            // slice the first 4 characters of the data
            // and replace it with the new header.
            var data = this.hardDrive.read(track, sector, block);
            var newData = newHeader + data.slice(0, this.HEADER_LENGTH);
            this.hardDrive.write(track, sector, block, newData);
        };

        // Sets the contents for a given TSB
        HardDriveManager.prototype.setContent = function (track, sector, block, newContent) {
            var oldData = this.read(track, sector, block);
            var header = oldData.slice(0, this.HEADER_LENGTH);
            var newData = header + this.toHexString(newContent);
            this.write(track, sector, block, newData);
        };

        // Write to a specific TSB
        HardDriveManager.prototype.write = function (track, sector, block, data) {
            for (var i = data.length; i < this.DATA_LENGTH; i++) {
                data += "0";
            }

            //data = parseInt(data, 16).toString();
            this.hardDrive.write(track, sector, block, data);
        };

        // Read a specific TSB
        HardDriveManager.prototype.read = function (track, sector, block) {
            return this.hardDrive.read(track, sector, block);
        };

        // Convert a regular String to hex
        HardDriveManager.prototype.toHexString = function (data) {
            var retVal = "";

            for (var i = 0; i < data.length; i++) {
                var hexString = data.charCodeAt(i).toString(16);
                if (hexString.length < 2) {
                    hexString = "0" + hexString;
                }
                retVal += hexString;
            }

            return retVal;
        };
        return HardDriveManager;
    })();
    TSOS.HardDriveManager = HardDriveManager;
})(TSOS || (TSOS = {}));
