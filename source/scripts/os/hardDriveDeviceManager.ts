/**
    This class manages the harddrive
*/
module TSOS {
    export class HardDriveManager {
        // Constants for tracks sector and block
        public TRACKS: number = 4;
        public SECTORS: number = 8;
        public BLOCKS: number = 8;
        // Each block is 64 bytes long
        public BLOCK_SIZE: number = 64;
        /** The length of the header is 4 characters.
            The first character indicate whether or not the current TSB is occupied
            The following characters indicate the location of the connecting TSB
        */
        public HEADER_LENGTH: number = 4;
        public DATA_LENGTH: number = this.BLOCK_SIZE * 2 - this.HEADER_LENGTH;
        // Set the limit of the track that stores filename
        public FILENAME_TRACKS: number = 1;
        // A map that keeps track of all the filenames
        // It is faster than iterating through the hard drive
        public filenameMap = {};

        // An instance of hard drive
        private hardDrive: HardDrive;

        constructor() {
            // Initialize the hard drive
            this.hardDrive = new HardDrive(this.TRACKS, this.SECTORS, this.BLOCKS, this.BLOCK_SIZE);
        }

        public initialize(): void {
            for(var track = 0; track < this.TRACKS; track++) {
                for(var sector = 0; sector < this.SECTORS; sector++) {
                    for(var block = 0; block < this.BLOCKS; block++) {
                        this.write(track, sector, block, "");
                    }
                }
            }

            // TSB: 000 is reserved
            this.setHeader(0, 0, 0, "1000");
            this.setContent(0, 0, 0, "001100");
        }

        // create file with a given filename
        public createFile(filename: string): boolean {
            // Limit the filename to be block size
            if(filename.length > this.BLOCK_SIZE ||
               this.filenameMap[filename]) return false;

            var tsbFileName = this.getNextAvailableFilenameLocation();
            var tsbFileLocation = this.getNextAvailableFileLocation();

            if(tsbFileName && tsbFileLocation) {
                var tsbFN = this.toTSBArray(tsbFileName);          
                var header = "1" + tsbFileLocation;
                // Set the current tsb to in use
                this.setHeader(tsbFN[0], tsbFN[1], tsbFN[2], header);
                this.setContent(tsbFN[0], tsbFN[1], tsbFN[2], filename);
                // Record the filename in the map
                this.filenameMap[filename] = tsbFileName;

                return true;
            }

            return false;
        }

        // write data to a file

        // delete file with the provided filename
        public deleteFile(filename: string): boolean {
            return true;
        }

        // returns a location to store the filename
        public getNextAvailableFilenameLocation(): string {
            for(var x = 0; x < this.FILENAME_TRACKS; x++) {
                for(var y = 0; y < this.SECTORS; y++) {
                    for(var z = 0; z < this.BLOCKS; z++) {
                        var header = this.getHeader(x, y, z);
                        if(header.slice(0, 1) === "0") {
                            var retVal = "" + x + y + z;
                            return retVal;
                        }
                    }
                }
            }

            return null;
        }

        // returns the next available tsb for content storage
        public getNextAvailableFileLocation(): string {
            for(var x = this.FILENAME_TRACKS; x < this.TRACKS; x++) {
                for(var y = 0; y < this.SECTORS; y++) {
                    for(var z = 0; z < this.BLOCKS; z++) {
                        if(this.getHeader(x, y, z).charAt(0) === "0") {
                            var retVal = "" + x + y + z;
                            return retVal;
                        }
                    }
                }
            }

            return null;
        }

        // Sets the header for a given TSB
        public setHeader(track: number, sector: number, block: number, newHeader: string): void {
            // slice the first 4 characters of the data
            // and replace it with the new header.
            var data = this.read(track, sector, block);
            var newData = newHeader + data.slice(this.HEADER_LENGTH);
            this.hardDrive.write(track, sector, block, newData);
        }

        // Get the header for a given TSB
        public getHeader(track: number, sector: number, block: number): string {
            var data = this.read(track, sector, block);
            return data.slice(0, this.HEADER_LENGTH);
        }

        // Sets the contents for a given TSB
        public setContent(track: number, sector: number, block: number, newContent: string): void {
            var oldData = this.read(track, sector, block);
            var header = oldData.slice(0, this.HEADER_LENGTH);
            var newData = header + this.toHexString(newContent);
            this.write(track, sector, block, newData);
        }

        // GEt the content for a given TSB
        public getContent(track: number, sector: number, block: number, newContent: string): string {
            var data = this.read(track, sector, block);
            return data.slice(this.HEADER_LENGTH);
        }

        // Write to a specific TSB
        public write(track: number, sector: number, block: number, data: string): void {
            // pad the data with ending 0's and convert all the characters to hex
            for(var i = data.length; i < this.DATA_LENGTH; i++) {
                data += "0";
            }

            this.hardDrive.write(track, sector, block, data);
        }

        // Read a specific TSB (raw content)
        public read(track: number, sector: number, block: number): string {
            return this.hardDrive.read(track, sector, block);
        }

        // Convert a regular String to hex
        public toHexString(data: string): string {
            var retVal: string = "";
            // convert each character to ASCII number
            for(var i = 0 ; i < data.length; i++) {
                var hexString = data.charCodeAt(i).toString(16);
                if(hexString.length < 2) {
                    hexString = "0" + hexString;
                }
                retVal += hexString;
            }

            return retVal;
        }

        // Convert a hex string to characters with a given TSB
        public toAsciiString(track: number, sector: number, block: number): string {
            var retVal = "";
            var content = this.read(track, sector, block);
            for(var i = 0; i < content.length;) {
                var curByte = content.charAt(i) + content.charAt(i + 1);
                var character = String.fromCharCode(parseInt(curByte, 16));
                retVal += character;

                i += 2;
            }

            return retVal;
        }

        // Convert a TSB string to an array of TSB ints
        public toTSBArray(tsb: string): number[] {
            var track = parseInt(tsb.charAt(0), 10);
            var sector = parseInt(tsb.charAt(1), 10);
            var block = parseInt(tsb.charAt(2), 10);

            var retVal = [track, sector, block];

            return retVal;
        }
    }
}
