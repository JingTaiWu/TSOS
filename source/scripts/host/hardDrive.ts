/**
    This is the "hardware" for the file system.
    This class uses HTML5 web storage (session storage) for the hardware simulation.
*/
module TSOS {
    export class HardDrive {
        // Properties of the class
        private tracks: number;
        private sectors: number;
        private blocks: number;
        private blockSize: number;

        // Constructor - initailize the size of the harddrive
        constructor(tracks: number,
                    sectors: number,
                    blocks: number,
                    blockSize: number) {
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.blockSize = blockSize;
        }

        // write - write to a specific track, sector, and block
        public write(track, sector, block, data): void {
            var key = this.getKey(track, sector, block);
            sessionStorage.setItem(key, data);
        }

        // read - read data from a specific track, sector and block
        public read(track, sector, block): string {
            var key = this.getKey(track, sector, block);
            return sessionStorage.getItem(key); 
        }

        // getKey - return the string version of track, sector and block for table look up
        public getKey(track, sector, block): string {
            return "" + track + sector + block;
        }
    }
}
