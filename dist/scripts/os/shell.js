///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />
/* ------------
Shell.ts
The OS Shell - The "command line interface" (CLI) for the console.
------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
            this.history = [];
            this.cursor = -1;
        }
        Shell.prototype.init = function () {
            var sc = null;

            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", " - Display the date in the CLI.");
            this.commandList[this.commandList.length] = sc;

            //whereami - where the heck am I
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", " - Display the a random location.");
            this.commandList[this.commandList.length] = sc;

            //status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Display the User's input string on the webpage");
            this.commandList[this.commandList.length] = sc;

            //summonDoge
            sc = new TSOS.ShellCommand(this.shellSummonDoge, "summon", " - Summon a lovely doge.");
            this.commandList[this.commandList.length] = sc;

            //hide Doge
            sc = new TSOS.ShellCommand(this.shellHideDoge, "hide", " - hide a lovely doge.");
            this.commandList[this.commandList.length] = sc;

            //test the user program
            sc = new TSOS.ShellCommand(this.shellLoad, "load", " - validate user program input.");
            this.commandList[this.commandList.length] = sc;

            // run a process in the resident queue
            sc = new TSOS.ShellCommand(this.shellRun, "run", " - a process in the resident queue.");
            this.commandList[this.commandList.length] = sc;

            // BSOD
            sc = new TSOS.ShellCommand(this.shellBsod, "bsod", " - triggers the blue screen of death.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearmem, "clearmem", " - clears the current memory.");
            this.commandList[this.commandList.length] = sc;

            // quantum <int>
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", " - sets the quantum for Round Robin Scheduling.");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            sc = new TSOS.ShellCommand(this.shellPs, "ps", " - list all the running processes.");
            this.commandList[this.commandList.length] = sc;

            // runall - execute all the processes currently in the resident queue
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", " - Run all the processes stored in memory.");
            this.commandList[this.commandList.length] = sc;

            // kill <id> - kills the specified process id.
            sc = new TSOS.ShellCommand(this.shellKill, "kill", " - kills the specified process id.");
            this.commandList[this.commandList.length] = sc;

            sc = new TSOS.ShellCommand(this.shellsetSchedule, "setschedule", " - set a scheduling algorithm {rr, fcfs, priority}.");
            this.commandList[this.commandList.length] = sc;

            sc = new TSOS.ShellCommand(this.shellgetSchedule, "getschedule", " - get the current algorithm.");
            this.commandList[this.commandList.length] = sc;

            sc = new TSOS.ShellCommand(this.shellCreate, "create", " <filename> - create a new file on the hard drive.");
            this.commandList[this.commandList.length] = sc;

            sc = new TSOS.ShellCommand(this.shellWrite, "write", " <filename> 'data'- write to a file on the hard drive.");
            this.commandList[this.commandList.length] = sc;

            sc = new TSOS.ShellCommand(this.shellDelete, "delete", " <filename> - delete a file on the hard drive.");
            this.commandList[this.commandList.length] = sc;

            sc = new TSOS.ShellCommand(this.shellRead, "read", " <filename> - read a file on the hard drive.");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
        };

        Shell.prototype.putPrompt = function () {
            // Fill the background color of the canvas
            _StdOut.putText(this.promptStr);
        };

        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);

            //
            // Parse the input...
            //
            var userCommand = new TSOS.UserCommand();
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
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                } else {
                    this.execute(this.shellInvalidCommand);
                }
            }

            //add the user command to the commandhistory
            this.history[this.history.length] = userCommand.command;
        };

        // For User input history
        Shell.prototype.traverseHistory = function (input) {
            switch (input) {
                case "KEY_UP":
                    if (this.cursor < this.history.length - 1) {
                        this.cursor++;
                    }
                    break;
                case "KEY_DOWN":
                    if (this.cursor > -1) {
                        this.cursor--;
                    }
                    break;
            }

            return (this.cursor === -1) ? "" : this.history[this.cursor];
        };

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        Shell.prototype.execute = function (fn, args) {
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
        };

        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();

            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);

            // 4.2 Record it in the return value.
            retVal.command = cmd;

            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };

        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };

        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("Okay. I forgive you. This time.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        };

        Shell.prototype.shellVer = function (args) {
            _StdOut.putText("Welcome to " + APP_NAME + " version " + APP_VERSION);
        };

        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };

        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");

            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };

        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();

            //reset the height of the canvas
            _Canvas.height = 500;
        };

        Shell.prototype.shellMan = function (args) {
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
        };

        Shell.prototype.shellTrace = function (args) {
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
        };

        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };

        // date - Output the Current Date to the console
        Shell.prototype.shellDate = function (args) {
            var currentDate = new Date();
            var currentMonth = currentDate.getMonth() + 1;
            _StdOut.putText("It is currently " + currentMonth + "/" + currentDate.getDate() + "/" + currentDate.getFullYear() + ".");
        };

        // whereami - display a random location for the user
        Shell.prototype.shellWhereAmI = function (args) {
            var locations = ["China", "Taiwan", "The United States", "England", "Mars", "Doge's planet", "Summoner's Rift"];
            _StdOut.putText("You are currently at " + locations[Math.floor(Math.random() * (locations.length))] + ".");
        };

        // status - takes user's input string and render it in the status board
        Shell.prototype.shellStatus = function (args) {
            var statusStr = "Status:   ";
            for (var i = 0; i < args.length; i++) {
                statusStr = statusStr + " " + args[i];
            }
            document.getElementById('statusMessage').innerHTML = statusStr;
        };

        // summonDoge - summon The Almight Doge
        Shell.prototype.shellSummonDoge = function (args) {
            document.getElementById('doge').style.display = "block";
            window.scrollTo(0, 0);
        };

        // hideDoge - hide Dodge
        Shell.prototype.shellHideDoge = function (args) {
            document.getElementById('doge').style.display = "none";
        };

        // load - validate user program input
        Shell.prototype.shellLoad = function (args) {
            var textArea = document.getElementById('taProgramInput');
            var input = textArea.value.trim();
            var ls = input.split(" ");
            var regEx = /^([a-f]|[0-9])*$/i;
            var priority = args[0];

            if (input === "") {
                _StdOut.putText("Please Enter a program first!");
                return;
            }

            for (var i = 0; i < ls.length; i++) {
                // if it is not valid, tell the user
                if (!regEx.test(ls[i]) || ls[i].length != 2) {
                    _StdOut.putText("Your program is invalid. Enter a correct program, pls...");
                    return;
                }
            }

            var addedProcess = _ProcessManager.addProcess(ls, priority);

            if (addedProcess != null) {
                _StdOut.putText("Process ID: " + addedProcess.pid);
            } else {
                _StdOut.putText("Cannot add process.");
            }
        };

        // run - a process in the resident queue
        Shell.prototype.shellRun = function (args) {
            if (args.length <= 0) {
                _StdOut.putText("Please give me a process id to run.");
            } else if (!_ProcessManager.residentQueue.getProcess(parseInt(args[0], 10))) {
                _StdOut.putText("This process does not exist.");
            } else {
                var process = _ProcessManager.residentQueue.getProcess(parseInt(args[0], 10));
                if (process.state != TSOS.Process.TERMINATED) {
                    _ProcessManager.execute(process);
                } else {
                    _StdOut.putText("Process was terminated.");
                }
            }
        };

        // Bsod - triggers bosd
        Shell.prototype.shellBsod = function (args) {
            // add an irq to the queue
            var irq = new TSOS.Interrupt("meant to break the OS", "BREAK IT");
            _KernelInterruptQueue.enqueue(irq);
        };

        // clearmem - Clears current memory
        Shell.prototype.shellClearmem = function (args) {
            // Make sure CPU isn't running, things can go horribly wrong
            if (!_CPU.isExecuting) {
                _MemoryManager.resetMemory();
                _StdOut.putText("Memory has been cleared.");
            } else {
                _StdOut.putText("Please wait until the CPU stops executing!");
            }
        };

        // quantum - sets the quantum for Round Robin scheduling
        Shell.prototype.shellQuantum = function (args) {
            if (args.length != 0) {
                var newQuantum = args[0];

                // make sure the evil user doesn't set the quantum to 0.
                if (newQuantum > 0) {
                    _CPUScheduler.QUANTUM = newQuantum;
                    _StdOut.putText("Set current quantum to " + _CPUScheduler.QUANTUM + ".");
                } else {
                    _StdOut.putText("Please don't be evil....");
                }
            } else {
                _StdOut.putText("Please Give me a number.");
            }
        };

        // ps - Display all the running processes
        Shell.prototype.shellPs = function (args) {
            // display all the processes in the ready queue
            var processQueue = _CPUScheduler.readyQueue;
            if (!processQueue.isEmpty() || _CPUScheduler.currentProcess) {
                _StdOut.putText("PID \t" + "PC \t" + "IR \t" + "ACC   \t" + "X   \t" + "Y   \t" + "Z \t");

                // Display the current running process if there is any
                if (_CPUScheduler.currentProcess) {
                    _StdOut.advanceLine();
                    _StdOut.putText(_CPUScheduler.currentProcess.pid + "   \t" + _CPUScheduler.currentProcess.pc + "  \t" + _CPUScheduler.currentProcess.ir + "  \t" + _CPUScheduler.currentProcess.acc + "  \t" + _CPUScheduler.currentProcess.xFlag + " \t" + _CPUScheduler.currentProcess.yFlag + " \t" + _CPUScheduler.currentProcess.zFlag + " \t");
                }
                _StdOut.advanceLine();
                for (var i = 0; i < processQueue.getSize(); i++) {
                    var process = processQueue.q[i];
                    _StdOut.putText(process.pid + "   \t" + process.pc + "  \t" + process.ir + "  \t" + process.acc + "  \t" + process.xFlag + " \t" + process.yFlag + " \t" + process.zFlag + " \t");
                    _StdOut.advanceLine();
                }
            } else {
                _StdOut.putText("There are no running processes.");
            }
        };

        // runall - run all the processes in the resident queue with round robin scheduling
        Shell.prototype.shellRunAll = function (args) {
            for (var i = 0; i < _ProcessManager.residentQueue.getSize(); i++) {
                var process = _ProcessManager.residentQueue.q[i];
                _ProcessManager.execute(process);
            }
        };

        // kill <pid> - kill a specific pid
        Shell.prototype.shellKill = function (args) {
            // In this case, we just want to remove the process in the ready queue and in the resident queue
            // Thankfully, Enhanced Process Queue has a function that does that
            if (args.length > 0) {
                var pid = parseInt(args[0], 10);
                var removedFromReady = _CPUScheduler.readyQueue.removeProcess(pid);
                var removedFromResident = _ProcessManager.removeProcess(_ProcessManager.residentQueue.getProcess(pid));

                if (_CPUScheduler.currentProcess) {
                    // If the current running process is the process to kill
                    // terminate the process with a system call
                    if (pid == _CPUScheduler.currentProcess.pid) {
                        _Kernel.krnInterruptHandler(SYSTEM_CALL_IRQ, [0, _CPUScheduler.currentProcess]);
                        _StdOut.putText("Process " + pid + " has been terminated and removed.");
                        _StdOut.advanceLine();
                    }
                }

                if (removedFromReady || removedFromResident) {
                    _StdOut.putText("Process " + pid + " has been removed.");
                }
            } else {
                _StdOut.putText("Give me a process to kill.");
            }
        };

        // setschedule -- allow user to select a CPU scheduling algorithm {rr, fcfs, priority}
        Shell.prototype.shellsetSchedule = function (args) {
            if (args.length > 0) {
                var newAlg = args[0].toLowerCase();
                if (!_CPUScheduler.setAlgorithm(newAlg)) {
                    // User has selected a non existent algorithm. warn them.
                    _StdOut.putText("Please choose rr (Round Robin), fcfs (First Come First Serve) or priority (Priority Scheduling).");
                } else {
                    _StdOut.putText("Current algorithm is set to " + newAlg);
                }

                // update the display
                _PCBDisplay.update();
            }
        };

        // getschedule -- display the current scheduling algorithm
        Shell.prototype.shellgetSchedule = function (args) {
            _StdOut.putText(_CPUScheduler.getAlgorithm());
        };

        // createfile
        Shell.prototype.shellCreate = function (args) {
            if (args.length == 0) {
                _StdOut.putText("I need a filename.");
                return;
            }

            var filename = args[0];
            _Kernel.krnInterruptHandler(DISK_OPERATION_ISR, ["create", filename]);
        };

        // write to file
        Shell.prototype.shellWrite = function (args) {
            if (args.length < 2) {
                _StdOut.putText("Please give me a file name and some data.");
                return;
            }

            var filename = args[0];
            var data = "";

            for (var i = 1; i < args.length; i++) {
                if (i == args.length - 1) {
                    data += args[i];
                } else {
                    data += args[i] + " ";
                }
            }

            if (data.charAt(0) !== "\"" || data.charAt(data.length - 1) !== "\"") {
                _StdOut.putText("Please put the data in two quotation marks.");
                return;
            }

            _Kernel.krnInterruptHandler(DISK_OPERATION_ISR, ["write", filename, data]);
        };

        // delete a file
        Shell.prototype.shellDelete = function (args) {
            var filename = args[0];
            if (filename) {
                _Kernel.krnInterruptHandler(DISK_OPERATION_ISR, ["delete", filename]);
            } else {
                _StdOut.putText("Please provide a filename.");
            }
        };

        // read a file
        Shell.prototype.shellRead = function (args) {
            var filename = args[0];

            if (filename) {
                var output = _krnHardDriveDriver.readFile(filename);
                _Kernel.krnInterruptHandler(DISK_OPERATION_ISR, ["read", filename]);
            } else {
                _StdOut.putText("Please provide a file name.");
            }
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
