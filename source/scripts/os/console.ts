///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {

        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            //_DrawingContext.fillStyle="#FFFFFF";
            //_DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            //reset the height of Canvas
            _Canvas.height = 500;
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
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
                    if(_CommandHistory.length !== 0){
                      //define the cursor if it is undefined
                      if(_CommandHistoryCur === undefined ||
                         _CommandHistoryCur < 0 ||
                         _CommandHistoryCur >= _CommandHistory.length) {
                        _CommandHistoryCur = _CommandHistory.length - 1;
                      }
                      //clear the input
                      this.clearInput();
                      this.buffer = _CommandHistory[_CommandHistoryCur]
                      this.putText(this.buffer);
                      _CommandHistoryCur = _CommandHistoryCur - 1;
                    }
                } else if (chr === String.fromCharCode(40)) {
                  //KeyCode 38 is up arrow, it should display the previous command
                  if(_CommandHistory.length !== 0){
                    //define the cursor if it is undefined
                    if(_CommandHistoryCur === undefined ||
                       _CommandHistoryCur >= _CommandHistory.length ||
                       _CommandHistoryCur < 0) {
                      _CommandHistoryCur = 0;
                    }
                    //clear the input
                    this.clearInput();
                    this.buffer = _CommandHistory[_CommandHistoryCur]
                    this.putText(this.buffer);
                    _CommandHistoryCur = _CommandHistoryCur + 1;
                  }
                } else if(chr === String.fromCharCode(9)) {
                  //if it is a tab key, auto complete the command
                  if(this.buffer !== "") {
                    //if the buffer is not an empty string, try look for the command using
                    //the first character
                    //Grab a copy of the command list from the shell
                    var commandList = _OsShell.commandList;
                    for(var i = 0; i < commandList.length; i++) {
                      var currentCommand = commandList[i].command;
                      //string.match returns a list of matching strings
                      var templs = currentCommand.match(this.buffer);
                      if(templs !== null){
                        //if there is a match, return the first element that matches
                        //clear the current line
                        this.clearInput();
                        //set the buffer to that command
                        this.buffer = currentCommand;
                        //draw it on the canvas
                        this.putText(currentCommand);
                        //break from the loop;
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
        }

        //Delete Text
        public deleteLastChar(): void {
            // Move the current X position.
            if(this.buffer.length != 0){
              var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer[this.buffer.length - 1]);
              this.currentXPosition = this.currentXPosition - offset;
              //_DrawingContext.fillStyle="#FFFFFF";
              _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize - 2, offset, _DefaultFontSize + 5);
              //delete the last character in the buffer
              this.buffer = this.buffer.slice(0,-1);
            }

        }

        //clear the current input
        public clearInput(): void {
          //calculate the offset of the entire input
          var offset: number = 0;
          for(var i = 0; i < this.buffer.length; i++){
            offset = offset + _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer[i]);
          }
          //reset the x pos
          this.currentXPosition = this.currentXPosition - offset;
          //clear the current input
          _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize - 2, offset, _DefaultFontSize + 5);
          //clear the buffer
          this.buffer = "";
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            if (text !== "") {
                for(var i = 0; i < text.length; i++){
                  // Lets print one letter at a time
                  // if the current x position is greater than the width of the canvas
                  // advance the line.
                  if(this.currentXPosition > _Canvas.width - 10){
                    this.advanceLine();
                  }
                  // Draw the text at the current X and Y coordinates.
                  _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text[i]);
                  // Move the current X position.
                  var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text[i]);
                  this.currentXPosition = this.currentXPosition + offset;
                }
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            // TODO: Handle scrolling. (Project 1)
            _BufferContext.clearRect(0,0,_Buffer.width,_Buffer.height);
            //draw the current image to the buffer
            _BufferContext.drawImage(_Canvas, 0, 0);
            if(this.currentYPosition > _Canvas.height) {
              _Canvas.height = this.currentYPosition + _FontHeightMargin + 10;
              _DrawingContext.drawImage(_Buffer, 0, 0);
              _Buffer.height = this.currentYPosition + _FontHeightMargin + 50;
              //scroll to the bottom
              var displayDiv = document.getElementById("displayWrapper");
              displayDiv.scrollTop = displayDiv.scrollHeight;
            }
        }
    }
 }
