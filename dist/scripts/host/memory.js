/* This class simulates the hardware memory in the OS
*/
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(size) {
            if (typeof size === "undefined") { size = 768; }
            this.size = size;
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < this.size; i++) {
                this.bytes[i] = new Byte("00");
            }
        };
        return Memory;
    })();
    TSOS.Memory = Memory;

    // Byte of length 8
    var Byte = (function () {
        function Byte(data) {
            this.data = data;
        }
        return Byte;
    })();
    TSOS.Byte = Byte;
})(TSOS || (TSOS = {}));
