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
        }

        // Sets the header for a given TSB
        public setHeader(track: number, sector: number, block: number, newHeader: string): void {
            // slice the first 4 characters of the data
            // and replace it with the new header.
            var data = this.hardDrive.read(track, sector, block);
            var newData = newHeader + data.slice(0, this.HEADER_LENGTH);
            this.hardDrive.write(track, sector, block, newData);
        }

        // write to a specific TSB
        public write(track: number, sector: number, block: number, data: string): void {
            // pad the data with ending 0's and convert all the characters to hex
            for(var i = data.length; i < this.BLOCK_SIZE; i++) {
                data += "00";
            }

            //data = parseInt(data, 16).toString();
            this.hardDrive.write(track, sector, block, data);
        }

        // read a specific TSB
        public read(track: number, sector: number, block: number): string {
            return this.hardDrive.read(track, sector, block);
        }
    }
}
