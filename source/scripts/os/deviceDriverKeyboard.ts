///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (isShifted &&
                       (keyCode >= 48 && keyCode <= 57)) { // symbols on 1 to 0
                // HardCode the array with those symbols
                var ls: string[] = [];
                // I will insert the array starting from 48 so the keycode can just be the index
                ls[48] = ")"; ls[49] = "!"; ls[50] = "@"; ls[51] = "#";
                ls[52] = "$"; ls[53] = "%"; ls[54] = "^"; ls[55] = "&";
                ls[56] = "*"; ls[57] = "(";

                chr = ls[keyCode];
                // put the character in the kernel queue
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode >= 186 && keyCode <= 192) || // the rest of the symbols
                       (keyCode >= 219 && keyCode <= 222)) {
                if(isShifted){
                  // the list for the string
                  var ls: string[] = [];
                  ls[186] = ":"; ls[187] = "+"; ls[188] = "<"; ls[189] = "_";
                  ls[190] = ">"; ls[191] = "?"; ls[192] = "~"; ls[219] = "{";
                  ls[220] = "|"; ls[221] = "}"; ls[222] = "\"";

                  chr = ls[keyCode];
                  // put the character in the kernel queue
                  _KernelInputQueue.enqueue(chr);
                } else {
                  // the list for the string
                  var ls: string[] = [];
                  ls[186] = ";"; ls[187] = "="; ls[188] = ","; ls[189] = "-";
                  ls[190] = "."; ls[191] = "/"; ls[192] = "`"; ls[219] = "[";
                  ls[220] = "\\"; ls[221] = "]"; ls[222] = "'";

                  chr = ls[keyCode];
                  // put the character in the kernel queue
                  _KernelInputQueue.enqueue(chr);
                }
            } else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits
                        (keyCode == 32)                     ||   // space
                        (keyCode == 13)                     ||   // enter
                        (keyCode == 8)) {                        // backspace
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode == 38)                     ||   // up
                       (keyCode == 40)                     ||   // down
                       (keyCode == 9)) {                        // tab
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
        }
    }
}
