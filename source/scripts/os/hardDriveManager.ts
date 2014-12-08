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
        public DATA_LENGTH: number = this.BLOCK_SIZE - this.HEADER_LENGTH;
        // Set the limit of the track that stores filename
        public FILENAME_TRACKS: number = 1;
        // A map that keeps track of all the filenames
        // It is faster than iterating through the hard drive
        public filenameArray = [];
        // Constants for the hedaer string
        public FREE: string = "0";
        public IN_USE: string = "1";
        public SWAP_FILE: string = "2";
        public DEFAULT_LINK: string = "000";

        // An instance of hard drive
        public hardDrive: HardDrive = new HardDrive(this.TRACKS, this.SECTORS, this.BLOCKS, this.BLOCK_SIZE);

        public initialize(): void {
            for(var track = 0; track < this.TRACKS; track++) {
                for(var sector = 0; sector < this.SECTORS; sector++) {
                    for(var block = 0; block < this.BLOCKS; block++) {
                        var data = "";
                        for(var i = 0; i < this.BLOCK_SIZE * 2 - this.HEADER_LENGTH; i++) {
                            data += "0";
                        }

                        this.write(track, sector, block, data);
                    }
                }
            }

            // TSB: 000 is reserved
            this.setHeader(0, 0, 0, this.IN_USE + this.DEFAULT_LINK);
            this.setContent(0, 0, 0, "Reserved", true);
        }

        // create file with a given filename
        public createFile(filename: string): boolean {
            // Limit the filename to be block size
            if(filename.length > this.DATA_LENGTH) return false;
            // Check for duplicate name
            for(var i = 0; i < this.filenameArray.length; i++) {
                if(filename === this.filenameArray[i]) return false;
            }

            var tsbFileName = this.getNextAvailableFilenameLocation();
            var tsbFileLocation = this.getNextAvailableFileLocation();

            if(tsbFileName && tsbFileLocation) {
                var tsbFN = this.toTSBArray(tsbFileName);          
                // Set the current tsb to in use
                this.setHeader(tsbFN[0], tsbFN[1], tsbFN[2], this.IN_USE + tsbFileLocation);
                this.setContent(tsbFN[0], tsbFN[1], tsbFN[2], filename, true);
                // Set the filelocation to unavilable
                var tsbFL = this.toTSBArray(tsbFileLocation);
                this.setHeader(tsbFL[0], tsbFL[1], tsbFL[2], this.IN_USE + this.DEFAULT_LINK);
                // Record the filename in the map
                this.filenameArray.push(filename);

                return true;
            }

            return false;
        }

        // read a file with a given file name
        public readFile(filename: string): string {
            var filenameTsbStr = this.findTsbWithFilename(filename);
            if(filenameTsbStr) {
                var filenameTsb = this.toTSBArray(filenameTsbStr);
                var output = "";
                var link = this.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(1);

                while(link !== this.DEFAULT_LINK) {
                    var fileTsb = this.toTSBArray(link);
                    // Read the data
                    output += this.toAsciiString(fileTsb[0], fileTsb[1], fileTsb[2]);
                    // Set the link to the next one 
                    link = this.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);
                }

                return output;
            }

            return null;
        }

        // write data to a file
        public writeFile(filename: string, data: string): boolean {
            // figure out how much bytes the data requires
            var convertedData = this.toHexString(data);
            var requiredBlocks = Math.ceil(convertedData.length / this.DATA_LENGTH);
            var availableBlocks = this.getNumOfAvailableBlocks();

            // If the data requires too many blocks or filename does not exist, do not write
            if(requiredBlocks > availableBlocks || !this.findTsbWithFilename(filename)) {
                return false;
            } else {
                // Get the starting point
                var startTsb = this.toTSBArray(this.findTsbWithFilename(filename));
                var startHeader = this.getHeader(startTsb[0], startTsb[1], startTsb[2]);
                var link = startHeader.slice(1);
                var nextLocation = this.toTSBArray(link);
                // split the hexstring
                var partitionedData = data.match(new RegExp(".{1," + (this.DATA_LENGTH) + "}", "g"));
                // Delete all the MSB reference in the tsb
                while(link !== this.DEFAULT_LINK) {
                    var linkTsb = this.toTSBArray(link);
                    // set the link to the next location before resetting the header
                    link = this.getHeader(linkTsb[0], linkTsb[1], linkTsb[2]).slice(1);
                    // set the header to free
                    this.setHeader(linkTsb[0], linkTsb[1], linkTsb[2], this.FREE + this.DEFAULT_LINK);
                }

                for(var i = 0; i < partitionedData.length; i++) {
                    // set the next file location if it is not the last partition
                    var nextFileLocation = (i < partitionedData.length - 1) ? this.getNextAvailableFileLocation() : this.DEFAULT_LINK;
                    // set the header of the current file location
                    this.setHeader(nextLocation[0], nextLocation[1], nextLocation[2], this.IN_USE + nextFileLocation);
                    // set the content
                    this.setContent(nextLocation[0], nextLocation[1], nextLocation[2], partitionedData[i], true);
                    // set the next location
                    nextLocation = this.toTSBArray(this.getNextAvailableFileLocation());
                }

                return true;
            }
        }

        // delete file with the provided filename
        public deleteFile(filename: string): boolean {
            var filenameTsbStr = this.findTsbWithFilename(filename);
            if(filenameTsbStr) {
                var filenameTsb = this.toTSBArray(this.findTsbWithFilename(filename));
                var usedBit = this.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(0,1);

                // If it is a swap file, do not let user delete
                if(usedBit === this.SWAP_FILE) {return false;}

                var header = this.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(1);
                while(header !== this.DEFAULT_LINK) {
                    var link = this.toTSBArray(header);
                    // Get the next header
                    header = this.getHeader(link[0], link[1], link[2]).slice(1);
                    // Set the block to free
                    this.setHeader(link[0], link[1], link[2], this.FREE + this.DEFAULT_LINK);
                }

                // Set the filename block to free
                this.setHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2], this.FREE + this.DEFAULT_LINK);
                return true;
            }

            return false;
        }

        // write swap files (for process swapping)
        public writeSwapFile(program: string[], pid: number): boolean {
            var data = "";

            for(var i = 0; i < program.length; i++) {
                data += program[i];
            }

            var requiredBlocks = Math.ceil(_MemoryManager.blockSize / (this.DATA_LENGTH * 2));
            var filenameLink = this.getNextAvailableFilenameLocation();
            var fileLink = this.getNextAvailableFileLocation();

            if(requiredBlocks < this.getNumOfAvailableBlocks() && filenameLink) {
                // Set the file name for this swap file
                var filenameTsb = this.toTSBArray(filenameLink);
                this.setHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2], this.SWAP_FILE + fileLink);
                this.setContent(filenameTsb[0], filenameTsb[1], filenameTsb[2], ".Process" + pid, true);

                var fileLinkTsb = this.toTSBArray(fileLink);
                this.setHeader(fileLinkTsb[0], fileLinkTsb[1], fileLinkTsb[2], this.SWAP_FILE + this.DEFAULT_LINK);

                // Swap files are different from regular files
                // It does not require each character to be converted into hexadecimals
                // However, the string needs to be split by 120 half-bytes (hence DATA_LENGTH * 2) 
                var partitionedData = data.match(new RegExp(".{1," + (this.DATA_LENGTH * 2) + "}", "g"));
                // Each block in RAM is 256 bytes, if the partitioned data is less than 3, fill the empty element
                for(var j = partitionedData.length; j < requiredBlocks; j++) {
                    partitionedData.push("00");
                }
                // Create a file name for this swap file
                
                var nextLink = this.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(1);
                var nextTSB = this.toTSBArray(nextLink);             

                for(var i = 0; i < partitionedData.length; i++) {
                    nextLink = (i < partitionedData.length - 1) ? this.getNextAvailableFileLocation() : this.DEFAULT_LINK;
                    this.setHeader(nextTSB[0], nextTSB[1], nextTSB[2], this.SWAP_FILE + nextLink);
                    this.setContent(nextTSB[0], nextTSB[1], nextTSB[2], partitionedData[i].toLowerCase(), false);
                    nextTSB = this.toTSBArray(this.getNextAvailableFileLocation());
                }

                return true;
            }
            return false;
        }

        // returns a location to store the filename
        public getNextAvailableFilenameLocation(): string {
            for(var x = 0; x < this.FILENAME_TRACKS; x++) {
                for(var y = 0; y < this.SECTORS; y++) {
                    for(var z = 0; z < this.BLOCKS; z++) {
                        var header = this.getHeader(x, y, z);
                        if(header.slice(0, 1) === this.FREE) {
                            var tsb = "" + x + y + z;
                            return tsb;
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
                        if(this.getHeader(x, y, z).slice(0, 1) === this.FREE) {
                            var tsb = "" + x + y + z;
                            return tsb;
                        }
                    }
                }
            }

            return null;
        }

        // returns the number of available blocks in the hard drive
        public getNumOfAvailableBlocks(): number {
            var count: number = 0;
            for(var x = this.FILENAME_TRACKS; x < this.TRACKS; x++) {
                for(var y = 0; y < this.SECTORS; y++) {
                    for(var z = 0; z < this.BLOCKS; z++) {
                        if(this.getHeader(x, y, z).slice(0, 1) === this.FREE) {
                            count++;
                        }
                    }
                }
            }

            return count;            
        }

        // find the track sector block of a given filename
        public findTsbWithFilename(filename: string): string {
            for(var x = 0; x < this.TRACKS; x++) {
                for(var y = 0; y < this.SECTORS; y++) {
                    for(var z = 0; z < this.BLOCKS; z++) {
                        if(this.getHeader(x, y, z).slice(0,1) === this.IN_USE || this.getHeader(x, y, z).slice(0,1) === this.SWAP_FILE) {
                            var content = this.toAsciiString(x, y, z);
                            if(filename === content) {
                                var tsb = "" + x + y + z;
                                return tsb;
                            }
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
        public setContent(track: number, sector: number, block: number, newContent: string, toHex: boolean): void {
            var oldData = this.read(track, sector, block);
            var header = oldData.slice(0, this.HEADER_LENGTH);
            var newData = (toHex) ? this.toHexString(newContent) : newContent;
            var base = (toHex) ? newContent.length : newContent.length / 2; 
            // Pad 00's at the end of the string
            for(; base < this.DATA_LENGTH; base++) {
                newData = newData + "00";
            }

            // Append the header
            newData = header + newData;
            this.write(track, sector, block, newData);
        }

        // GEt the content for a given TSB
        public getContent(track: number, sector: number, block: number): string {
            var data = this.read(track, sector, block);
            return data.slice(this.HEADER_LENGTH);
        }

        // Write to a specific TSB
        public write(track: number, sector: number, block: number, data: string): void {
            // pad the data with ending 0's and convert all the characters to hex
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
            var content = this.getContent(track, sector, block);
            for(var i = 0; i < content.length;) {
                var curByte = content.charAt(i) + content.charAt(i + 1);
                var character = (curByte === "00") ? "" : String.fromCharCode(parseInt(curByte, 16));
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

        // Convert a number to a byte string
        public toByteString(num: number): string {
            if(num > 256) return null;

            var retVal = num.toString(16);
            if(retVal.length < 2) {
                retVal = "0" + retVal;
            }

            return retVal;
        }
    }
}
