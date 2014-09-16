///<reference path="../globals.ts" />
/* ------------
Console.ts
Requires globals.ts
The OS Console - stdIn and stdOut by default.
Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer) {
            if (typeof currentFont === "undefined") { currentFont = _DefaultFontFamily; }
            if (typeof currentFontSize === "undefined") { currentFontSize = _DefaultFontSize; }
            if (typeof currentXPosition === "undefined") { currentXPosition = 0; }
            if (typeof currentYPosition === "undefined") { currentYPosition = _DefaultFontSize; }
            if (typeof buffer === "undefined") { buffer = ""; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };

        Console.prototype.clearScreen = function () {
            //_DrawingContext.fillStyle="#FFFFFF";
            //_DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);

            //reset the height of Canvas
            _Canvas.height = 500;
        };

        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };

        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();

                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);

                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) {
                    //KeyCode 8 is backspace. It should delete the last character
                    this.deleteLastChar();
                } else if (chr === String.fromCharCode(38)) {
                    //KeyCode 38 is up arrow, it should display the previous command
                    if (_CommandHistory.length !== 0) {
                        //define the cursor if it is undefined
                        if (_CommandHistoryCur === undefined || _CommandHistoryCur < 0 || _CommandHistoryCur >= _CommandHistory.length) {
                            _CommandHistoryCur = _CommandHistory.length - 1;
                        }

                        //clear the input
                        this.clearInput();
                        this.buffer = _CommandHistory[_CommandHistoryCur];
                        this.putText(this.buffer);
                        _CommandHistoryCur = _CommandHistoryCur - 1;
                    }
                } else if (chr === String.fromCharCode(40)) {
                    //KeyCode 38 is up arrow, it should display the previous command
                    if (_CommandHistory.length !== 0) {
                        //define the cursor if it is undefined
                        if (_CommandHistoryCur === undefined || _CommandHistoryCur >= _CommandHistory.length || _CommandHistoryCur < 0) {
                            _CommandHistoryCur = 0;
                        }

                        //clear the input
                        this.clearInput();
                        this.buffer = _CommandHistory[_CommandHistoryCur];
                        this.putText(this.buffer);
                        _CommandHistoryCur = _CommandHistoryCur + 1;
                    }
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);

                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };

        //Delete Text
        Console.prototype.deleteLastChar = function () {
            // Move the current X position.
            if (this.buffer.length != 0) {
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer[this.buffer.length - 1]);
                this.currentXPosition = this.currentXPosition - offset;

                //_DrawingContext.fillStyle="#FFFFFF";
                _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize - 2, offset, _DefaultFontSize + 5);

                //delete the last character in the buffer
                this.buffer = this.buffer.slice(0, -1);
            }
        };

        //clear the current input
        Console.prototype.clearInput = function () {
            //calculate the offset of the entire input
            var offset = 0;
            for (var i = 0; i < this.buffer.length; i++) {
                offset = offset + _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer[i]);
            }

            //reset the x pos
            this.currentXPosition = this.currentXPosition - offset;

            //clear the current input
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize - 2, offset, _DefaultFontSize + 5);

            //clear the buffer
            this.buffer = "";
        };

        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);

                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };

        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;

            /*
            * Font size measures from the baseline to the highest point in the font.
            * Font descent measures from the baseline to the lowest point in the font.
            * Font height margin is extra spacing between the lines.
            */
            this.currentYPosition += _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;

            // TODO: Handle scrolling. (Project 1)
            _BufferContext.clearRect(0, 0, _Buffer.width, _Buffer.height);

            //draw the current image to the buffer
            _BufferContext.drawImage(_Canvas, 0, 0);
            if (this.currentYPosition > _Canvas.height) {
                _Canvas.height = this.currentYPosition + _FontHeightMargin + 10;
                _DrawingContext.drawImage(_Buffer, 0, 0);
                _Buffer.height = this.currentYPosition + _FontHeightMargin + 50;

                //scroll to the bottom
                var displayDiv = document.getElementById("displayWrapper");
                displayDiv.scrollTop = displayDiv.scrollHeight;
            }
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
