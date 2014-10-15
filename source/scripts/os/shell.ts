///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";
        public history = [];
        public cursor = -1;

        constructor() {

        }

        public init() {
            var sc = null;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;


            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  " - Display the date in the CLI.");
            this.commandList[this.commandList.length] = sc;

            //whereami - where the heck am I
            sc = new ShellCommand(this.shellWhereAmI,
                                  "whereami",
                                  " - Display the a random location.");
            this.commandList[this.commandList.length] = sc;

            //status <string>
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "<string> - Display the User's input string on the webpage");
            this.commandList[this.commandList.length] = sc;

            //summonDoge
            sc = new ShellCommand(this.shellSummonDoge,
                                  "summon",
                                  " - Summon a lovely doge.");
            this.commandList[this.commandList.length] = sc;

            //hide Doge
            sc = new ShellCommand(this.shellHideDoge,
                                  "hide",
                                  " - hide a lovely doge.");
            this.commandList[this.commandList.length] = sc;

            //test the user program
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  " - validate user program input.");
            this.commandList[this.commandList.length] = sc;

            //BSOD
            sc = new ShellCommand(this.shellBsod,
                                  "bsod",
                                  " - triggers the blue screen of death.");
            this.commandList[this.commandList.length] = sc;
            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            // Fill the background color of the canvas
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = new UserCommand();
            userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // JavaScript may not support associative arrays in all browsers so we have to
            // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses. {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {    // Check for apologies. {
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }

            //add the user command to the commandhistory
            this.history[this.history.length] = userCommand.command;
        }

        // For User input history
        public traverseHistory(input) {
          switch(input) {
            case "KEY_UP":
              if(this.cursor < this.history.length - 1) {
                this.cursor++;
              }
              break;
            case "KEY_DOWN":
              if(this.cursor > -1) {
                this.cursor--;
              }
              break;
            }

            return (this.cursor === -1) ? "" : this.history[this.cursor];
          }

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer) {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("Okay. I forgive you. This time.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText("Welcome to " + APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
            //reset the height of the canvas
            _Canvas.height = 500;
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, dumbass.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }

                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        // date - Output the Current Date to the console
        public shellDate(args) {
            var currentDate = new Date();
            var currentMonth: number = currentDate.getMonth() + 1;
            _StdOut.putText("It is currently " + currentMonth + "/" + currentDate.getDate() + "/" + currentDate.getFullYear() + ".");
        }

        // whereami - display a random location for the user
        public shellWhereAmI(args) {
            var locations: string[] = ["China","Taiwan","The United States","England","Mars","Doge's planet","Summoner's Rift"];
            _StdOut.putText("You are currently at " + locations[Math.floor(Math.random() * (locations.length))] + ".");
        }

        // status - takes user's input string and render it in the status board
        public shellStatus(args){
            var statusStr: string = "Status:   ";
            for(var i = 0; i < args.length; i++){
              statusStr = statusStr + " " + args[i];
            }
            document.getElementById('statusMessage').innerHTML = statusStr;
        }

        // summonDoge - summon The Almight Doge
        public shellSummonDoge(args){
          document.getElementById('doge').style.display="block";
          window.scrollTo(0,0);
        }

        // hideDoge - hide Dodge
        public shellHideDoge(args){
          document.getElementById('doge').style.display="none";
        }

        // load - validate user program input
        public shellLoad(args){
          var textArea = <HTMLInputElement> document.getElementById('taProgramInput');
          var input = textArea.value.trim();
          var ls = input.split(" ");
          var regEx = /^([a-f]|[0-9])*$/i;
          if (input === ""){
            _StdOut.putText("Please Enter a program first!");
            return;
          }

          var sum = 0;
          for (var i = 0; i < ls.length; i++){
            // sum of the program must be even
            sum += parseInt(ls[i], 16);
            // if it is not valid, tell the user
            if (!regEx.test(ls[i]) || ls[i].length != 2) {
              _StdOut.putText("Your program is invalid. Enter a correct program, pls...");
              return;
            }
          }

          if (sum % 2 !== 0) {
            _StdOut.putText("Your Program didn't add up right... try again.");
            return;
          }

          // if it is valid, load it into the memory
          var pid = _MemoryManager.loadProgram(ls);
          _StdOut.putText("Process ID: " + pid);
        }

        // Bsod - triggers bosd
        public shellBsod(args){
          // add an irq to the queue
          var irq = new Interrupt("meant to break the OS", "BREAK IT");
          _KernelInterruptQueue.enqueue(irq);
        }
    }
}
