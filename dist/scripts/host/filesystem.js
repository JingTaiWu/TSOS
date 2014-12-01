/**
This is the "hardware" for the file system.
This class uses HTML5 web storage (session storage) for the hardware simulation.
*/
var TSOS;
(function (TSOS) {
    var FileSystem = (function () {
        // Constructor - initailize the size of the harddrive
        function FileSystem(tracks, sectors, blocks, blockSize) {
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.blockSize = blockSize;
        }
        // write - write to a specific track, sector, and block
        FileSystem.prototype.write = function (track, sector, block, data) {
            var key = this.getKey(track, sector, block);
            sessionStorage.setItem(key, data);
        };

        // read - read data from a specific track, sector and block
        FileSystem.prototype.read = function (track, sector, block) {
            var key = this.getKey(track, sector, block);
            return sessionStorage.getItem(key);
        };

        // getKey - return the string version of track, sector and block for table look up
        FileSystem.prototype.getKey = function (track, sector, block) {
            return track + sector + block;
        };
        return FileSystem;
    })();
    TSOS.FileSystem = FileSystem;
})(TSOS || (TSOS = {}));
