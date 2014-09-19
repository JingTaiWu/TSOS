///<reference path="deviceDriver.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/* ----------------------------------
DeviceDriverKeyboard.ts
Requires deviceDriver.ts
The Kernel Keyboard Device Driver.
---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            _super.call(this, this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };

        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";

            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 97) && (keyCode <= 123))) {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);

                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }

                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (isShifted && (keyCode >= 48 && keyCode <= 57)) {
                // HardCode the array with those symbols
                var ls = [];

                // I will insert the array starting from 48 so the keycode can just be the index
                ls[48] = ")";
                ls[49] = "!";
                ls[50] = "@";
                ls[51] = "#";
                ls[52] = "$";
                ls[53] = "%";
                ls[54] = "^";
                ls[55] = "&";
                ls[56] = "*";
                ls[57] = "(";

                chr = ls[keyCode];

                // put the character in the kernel queue
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode >= 186 && keyCode <= 192) || (keyCode >= 219 && keyCode <= 222)) {
                if (isShifted) {
                    // the list for the string
                    var ls = [];
                    ls[186] = ":";
                    ls[187] = "+";
                    ls[188] = "<";
                    ls[189] = "_";
                    ls[190] = ">";
                    ls[191] = "?";
                    ls[192] = "~";
                    ls[219] = "{";
                    ls[220] = "|";
                    ls[221] = "}";
                    ls[222] = "\"";

                    chr = ls[keyCode];

                    // put the character in the kernel queue
                    _KernelInputQueue.enqueue(chr);
                } else {
                    // the list for the string
                    var ls = [];
                    ls[186] = ";";
                    ls[187] = "=";
                    ls[188] = ",";
                    ls[189] = "-";
                    ls[190] = ".";
                    ls[191] = "/";
                    ls[192] = "`";
                    ls[219] = "[";
                    ls[220] = "\\";
                    ls[221] = "]";
                    ls[222] = "'";

                    chr = ls[keyCode];

                    // put the character in the kernel queue
                    _KernelInputQueue.enqueue(chr);
                }
            } else if (((keyCode >= 48) && (keyCode <= 57)) || (keyCode == 32) || (keyCode == 13) || (keyCode == 8)) {
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode == 38) || (keyCode == 40) || (keyCode == 9)) {
                switch (keyCode) {
                    case 9:
                        chr = "TAB";
                        _KernelInputQueue.enqueue(chr);
                        break;
                    case 38:
                        chr = "KEY_UP";
                        _KernelInputQueue.enqueue(chr);
                        break;
                    case 40:
                        chr = "KEY_DOWN";
                        _KernelInputQueue.enqueue(chr);
                        break;
                }
            }
        };
        return DeviceDriverKeyboard;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
