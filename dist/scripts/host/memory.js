/* This class simulates the hardware memory in the OS
*/
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(size) {
            this.bytes = [];
            for (var i = 0; i < size; i++) {
                this.bytes[i] = new Byte("00");
            }
        }
        return Memory;
    })();
    TSOS.Memory = Memory;

    // Represntation of a byte
    var Byte = (function () {
        function Byte(data) {
            this.byte = data;
        }
        return Byte;
    })();
    TSOS.Byte = Byte;
})(TSOS || (TSOS = {}));
