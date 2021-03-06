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
                } else if (chr === "KEY_UP" || chr === "KEY_DOWN") {
                    this.clearInput();
                    this.buffer = _OsShell.traverseHistory(chr);
                    this.putText(this.buffer);
                } else if (chr === "TAB") {
                    // if it is a tab key, auto complete the command
                    if (this.buffer !== "") {
                        // if the buffer is not an empty string, try look for the command using
                        // the current input
                        // Grab a copy of the command list from the shell
                        var commandList = _OsShell.commandList;
                        for (var i = 0; i < commandList.length; i++) {
                            var currentCommand = commandList[i].command;
                            if (currentCommand.slice(0, this.buffer.length) == this.buffer) {
                                // clear the current input
                                this.clearInput();

                                // sets the current buffer to the current command
                                this.buffer = currentCommand;

                                // draw the text onto the canvas
                                this.putText(this.buffer);

                                break;
                            }
                        }
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
            if (this.buffer.length != 0) {
                if (this.currentXPosition < 0) {
                    // if the string is at a new line, go back to the previous line
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer[this.buffer.length - 1]);
                    this.currentXPosition = _Canvas.width + offset + 1.5;
                    this.currentYPosition -= _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;
                } else {
                    // else handle it like a regular delete
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer[this.buffer.length - 1]);
                    this.currentXPosition = this.currentXPosition - offset;

                    //_DrawingContext.fillStyle="#FFFFFF";
                    _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize - 2, offset, _DefaultFontSize + 10);

                    //delete the last character in the buffer
                    this.buffer = this.buffer.slice(0, -1);
                }
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
                for (var i = 0; i < text.length; i++) {
                    // Lets print one letter at a time
                    // if the current x position is greater than the width of the canvas
                    // advance the line.
                    if (this.currentXPosition > _Canvas.width) {
                        this.advanceLine();
                    }

                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text[i]);

                    // Move the current X position.
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text[i]);
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
        };

        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;

            /*
            * Font size measures from the baseline to the highest point in the font.
            * Font descent measures from the baseline to the lowest point in the font.
            * Font height margin is extra spacing between the lines.
            */
            var offset = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;
            this.currentYPosition += offset;

            // TODO: Handle scrolling. (Project 1)
            _BufferContext.clearRect(0, 0, _Buffer.width, _Buffer.height);

            // draw the current image to the buffer
            _BufferContext.drawImage(_Canvas, 0, 0);
            var imageData = _BufferContext.getImageData(0, offset, _Canvas.width, _Canvas.height - 15);
            if (this.currentYPosition > _Canvas.height) {
                //_Canvas.height = this.currentYPosition + _FontHeightMargin + 10;
                //_DrawingContext.drawImage(_Buffer, 0, 0);
                //_Buffer.height = this.currentYPosition + _FontHeightMargin + 50;
                //scroll to the bottom
                //var displayDiv = document.getElementById("displayWrapper");
                //displayDiv.scrollTop = displayDiv.scrollHeight;
                _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
                _DrawingContext.putImageData(imageData, 0, 0);
                this.currentYPosition -= offset;
            }
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
