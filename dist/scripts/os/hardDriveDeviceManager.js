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
            this.HEADER_LENGTH = 8;
            this.DATA_LENGTH = this.BLOCK_SIZE * 2 - this.HEADER_LENGTH;
            // Set the limit of the track that stores filename
            this.FILENAME_TRACKS = 1;
            // A map that keeps track of all the filenames
            // It is faster than iterating through the hard drive
            this.filenameArray = [];
            // Constants for the hedaer string
            this.FREE = "00";
            this.IN_USE = "01";
            this.SWAP_FILE = "02";
            this.DEFAULT_LINK = "000";
            // An instance of hard drive
            this.hardDrive = new TSOS.HardDrive(this.TRACKS, this.SECTORS, this.BLOCKS, this.BLOCK_SIZE);
            // Mapping for all the functions
            this.serviceMap = {
                "create": this.createFile
            };
        }
        HardDriveManager.prototype.initialize = function () {
            for (var track = 0; track < this.TRACKS; track++) {
                for (var sector = 0; sector < this.SECTORS; sector++) {
                    for (var block = 0; block < this.BLOCKS; block++) {
                        this.write(track, sector, block, "");
                    }
                }
            }

            // TSB: 000 is reserved
            this.setHeader(0, 0, 0, this.IN_USE + this.DEFAULT_LINK);
            this.setContent(0, 0, 0, "");
        };

        // create file with a given filename
        HardDriveManager.prototype.createFile = function (filename) {
            // Limit the filename to be block size
            if (filename.length > this.BLOCK_SIZE)
                return false;

            // Check for depulicate name
            // for(var i = 0; i < this.filenameArray.length; i++) {
            //     if(filename === this.filenameArray[i]) return false;
            // }
            var tsbFileName = this.getNextAvailableFilenameLocation();
            var tsbFileLocation = this.getNextAvailableFileLocation();

            if (tsbFileName && tsbFileLocation) {
                var tsbFN = this.toTSBArray(tsbFileName);
                var header = this.IN_USE + tsbFileLocation;

                // Set the current tsb to in use
                this.setHeader(tsbFN[0], tsbFN[1], tsbFN[2], header);
                this.setContent(tsbFN[0], tsbFN[1], tsbFN[2], filename);

                // Record the filename in the map
                this.filenameArray.push(filename);

                return true;
            }

            return false;
        };

        // write data to a file
        HardDriveManager.prototype.writeFile = function (filename) {
            return true;
        };

        // delete file with the provided filename
        HardDriveManager.prototype.deleteFile = function (filename) {
            return true;
        };

        // returns a location to store the filename
        HardDriveManager.prototype.getNextAvailableFilenameLocation = function () {
            for (var x = 0; x < this.FILENAME_TRACKS; x++) {
                for (var y = 0; y < this.SECTORS; y++) {
                    for (var z = 0; z < this.BLOCKS; z++) {
                        var header = this.getHeader(x, y, z);
                        if (header.slice(0, 2) === this.FREE) {
                            var tsb = this.toByteString(x) + this.toByteString(y) + this.toByteString(z);
                            return tsb;
                        }
                    }
                }
            }

            return null;
        };

        // returns the next available tsb for content storage
        HardDriveManager.prototype.getNextAvailableFileLocation = function () {
            for (var x = this.FILENAME_TRACKS; x < this.TRACKS; x++) {
                for (var y = 0; y < this.SECTORS; y++) {
                    for (var z = 0; z < this.BLOCKS; z++) {
                        if (this.getHeader(x, y, z).slice(0, 2) === this.FREE) {
                            var tsb = this.toByteString(x) + this.toByteString(y) + this.toByteString(z);
                            return tsb;
                        }
                    }
                }
            }

            return null;
        };

        // Sets the header for a given TSB
        HardDriveManager.prototype.setHeader = function (track, sector, block, newHeader) {
            // slice the first 4 characters of the data
            // and replace it with the new header.
            var data = this.read(track, sector, block);
            var newData = newHeader + data.slice(this.HEADER_LENGTH);
            this.hardDrive.write(track, sector, block, newData);
        };

        // Get the header for a given TSB
        HardDriveManager.prototype.getHeader = function (track, sector, block) {
            var data = this.read(track, sector, block);
            return data.slice(0, this.HEADER_LENGTH);
        };

        // Sets the contents for a given TSB
        HardDriveManager.prototype.setContent = function (track, sector, block, newContent) {
            var oldData = this.read(track, sector, block);
            var header = oldData.slice(0, this.HEADER_LENGTH);
            var newData = header + this.toHexString(newContent);
            this.write(track, sector, block, newData);
        };

        // GEt the content for a given TSB
        HardDriveManager.prototype.getContent = function (track, sector, block, newContent) {
            var data = this.read(track, sector, block);
            return data.slice(this.HEADER_LENGTH);
        };

        // Write to a specific TSB
        HardDriveManager.prototype.write = function (track, sector, block, data) {
            for (var i = data.length; i < this.DATA_LENGTH; i++) {
                data += "0";
            }

            this.hardDrive.write(track, sector, block, data);
        };

        // Read a specific TSB (raw content)
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

        // Convert a hex string to characters with a given TSB
        HardDriveManager.prototype.toAsciiString = function (track, sector, block) {
            var retVal = "";
            var content = this.read(track, sector, block);
            for (var i = 0; i < content.length;) {
                var curByte = content.charAt(i) + content.charAt(i + 1);
                var character = String.fromCharCode(parseInt(curByte, 16));
                retVal += character;

                i += 2;
            }

            return retVal;
        };

        // Convert a TSB string to an array of TSB ints
        HardDriveManager.prototype.toTSBArray = function (tsb) {
            var track = parseInt(tsb.charAt(0), 10);
            var sector = parseInt(tsb.charAt(1), 10);
            var block = parseInt(tsb.charAt(2), 10);

            var retVal = [track, sector, block];

            return retVal;
        };

        // Convert a number to a byte string
        HardDriveManager.prototype.toByteString = function (num) {
            if (num > 256)
                return null;

            var retVal = num.toString(16);
            if (retVal.length < 2) {
                retVal = "0" + retVal;
            }

            return retVal;
        };
        return HardDriveManager;
    })();
    TSOS.HardDriveManager = HardDriveManager;
})(TSOS || (TSOS = {}));
