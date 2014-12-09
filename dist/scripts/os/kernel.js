/// <reference path="../os/jquery.d.ts"/>
/* ------------
Kernel.ts
Requires globals.ts
Routines for the Operating System, NOT the host.
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
var TSOS;
(function (TSOS) {
    var Kernel = (function () {
        function Kernel() {
            //
            // OS Startup and Shutdown Routines
            //
            // System call library
            this.systemCalls = new TSOS.SystemCalls();
        }
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _CPUScheduler = new TSOS.CPUScheduler();

            // Initialize Memory Manager
            _MemoryManager = new TSOS.MemoryManager(); // Initialize memory manager
            _MemoryDisplay = new TSOS.MemoryDisplay(); // Initialize memory display
            _MemoryDisplay.update();

            // Initialize Process Control Block
            _ProcessManager = new TSOS.ProcessManager();
            _PCBDisplay = new TSOS.PcbDisplay();
            _PCBDisplay.update();

            // Initialize CPU Display
            _CPUDisplay = new TSOS.CPUDisplay();

            // Initialize the console.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load the Hard Drive Device Driver
            this.krnTrace("Loading the hard drive device driver.");
            _krnHardDriveDriver = new TSOS.HardDriveManager();
            _krnHardDriveDriver.initialize();
            _HardDriveDisplay = new TSOS.HardDriveDisplay();
            _HardDriveDisplay.update();

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();

            // Finally, initiate testing.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };

        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");

            // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();

            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        };

        Kernel.prototype.krnOnCPUClockPulse = function () {
            /* This gets called from the host hardware sim every time there is a hardware clock pulse.
            This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
            This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel
            that it has to look for interrupts and process them if it finds any.                           */
            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting && !_StepMode) {
                // increment the cycle counter in cpu scheduler (for round robin)
                _CPUScheduler.schedule();
                _CPUScheduler.cycle++;
                _CPU.cycle();

                // Update all displays
                _CPUDisplay.update();
                _PCBDisplay.update();
                _MemoryDisplay.update();
            } else {
                this.krnTrace("Idle");
            }

            // Start the CPU Scheduler
            _CPUScheduler.schedule();
        };

        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };

        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };

        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case INVALID_MEMORY_OP:
                    this.invalidMemoryOp(params);
                    break;
                case SYSTEM_CALL_IRQ:
                    this.systemCallISR(params);
                    break;
                case STEP_MODE_ISR:
                    this.stepISR();
                    break;
                case PROCESS_EXECUTION_ISR:
                    this.processExecutionISR(params);
                    break;
                case CONTEXT_SWTICH_ISR:
                    this.contextSwitchISR(params);
                    break;
                case DISK_OPERATION_ISR:
                    this.hardDriveIsr(params);
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };

        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        };

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        // Memory boundary enforcement
        Kernel.prototype.invalidMemoryOp = function (params) {
            var process = params[0];
            this.systemCallISR([0, process]);

            // reschedule the next process (avoid CPU null error)
            _CPUScheduler.schedule();

            // Throw error in host log
            this.krnTrace("Invalid memory operation from process " + process.pid + ".");

            // update the display
            _PCBDisplay.update();
            _CPUDisplay.update();
            _MemoryDisplay.update();
        };

        // Process Execution - Moving the execution of the process from process manager to cpu scheduler
        Kernel.prototype.processExecutionISR = function (params) {
            var process = params[0];
            process.state = TSOS.Process.READY;
            _CPUScheduler.readyQueue.enqueue(process);
        };

        // Context Switch - switch processes
        Kernel.prototype.contextSwitchISR = function (params) {
            this.krnTrace("Performing a context switch.");

            // Stop the last running process if there is any
            var lastProcess = _CPUScheduler.currentProcess;
            if (lastProcess) {
                _CPU.stop();
                lastProcess.state = TSOS.Process.READY;
                _CPUScheduler.readyQueue.enqueue(lastProcess);
            }

            // Update the displays
            _PCBDisplay.update();
            _CPUDisplay.update();
            _MemoryDisplay.update();

            // Set the current process to the next process
            // if the current scheduling algorithm is priority
            // Set the current process to the next process with the lowest priority
            if (_CPUScheduler.currentAlgorithm == 2 /* Priority */) {
                _CPUScheduler.currentProcess = _CPUScheduler.getLowPriorityProcess();
            } else {
                _CPUScheduler.currentProcess = _CPUScheduler.getNextProcess();
            }

            // Swap process from the hard drive if it is not in the memory
            if (_CPUScheduler.currentProcess.location == 1 /* IN_HARD_DRIVE */) {
                // If there isn't a last process, find one in the memory
                if (!lastProcess) {
                    for (var i = 0; i < _ProcessManager.residentQueue.getSize(); i++) {
                        var process = _ProcessManager.residentQueue.getProcess(i);
                        if (process.location == 0 /* IN_RAM */) {
                            lastProcess = process;
                            break;
                        }
                    }
                }

                // Take the last process and write it back to the hard drive
                var lastProcessString = [];
                var currentProcessString = [];

                for (var j = lastProcess.base; j < lastProcess.limit; j++) {
                    lastProcessString.push(_MemoryManager.readByte(j, lastProcess));
                }

                _krnHardDriveDriver.writeSwapFile(lastProcessString, lastProcess.pid);

                // Deallocate the process from memory
                _MemoryManager.deallocate(lastProcess);

                // Read the process and store it into the memory
                var currentFilename = ".Process" + _CPUScheduler.currentProcess.pid;
                var fullProgramString = _krnHardDriveDriver.readFile(currentFilename, true);

                for (var h = 0; h < _MemoryManager.blockSize;) {
                    var curByte = fullProgramString.charAt(h) + fullProgramString.charAt(h + 1);
                    currentProcessString.push(curByte);
                    h += 2;
                }

                // delete the swap file from hard drive
                _krnHardDriveDriver.deleteSwapFile(currentFilename);

                // allocate space
                _MemoryManager.allocate(_CPUScheduler.currentProcess, currentProcessString);
            }

            _CPUScheduler.currentProcess.state = TSOS.Process.RUNNING;

            // Reset the cycle
            _CPUScheduler.cycle = 0;

            // execute the new process
            _CPU.start(_CPUScheduler.currentProcess);
        };

        // For step mode
        Kernel.prototype.stepISR = function () {
            _CPUScheduler.schedule();
            _CPUScheduler.cycle++;
            _CPU.cycle();

            // Update the display
            _CPUDisplay.update();
            _MemoryDisplay.update();
            _PCBDisplay.update();
        };

        // handles system calls from a process
        Kernel.prototype.systemCallISR = function (params) {
            var callId = params[0];
            var param = params[1];
            var sysCall = this.systemCalls.systemCallInterface[callId];
            if (sysCall) {
                sysCall(param);
            } else {
                // stop CPU from running
                _CPU.stop();
            }
        };

        // handles hard drive operations
        Kernel.prototype.hardDriveIsr = function (params) {
            var operation = params[0];
            var filename = params[1];
            var data = params[2];

            switch (operation) {
                case "create":
                    if (_krnHardDriveDriver.createFile(filename)) {
                        _StdOut.putText("New File: " + filename);
                    } else {
                        _StdOut.putText("Failed to create new file.");
                    }
                    break;
                case "write":
                    if (_krnHardDriveDriver.writeFile(filename, data)) {
                        _StdOut.putText("Success!");
                    } else {
                        _StdOut.putText("Failed to write new file.");
                    }
                    break;
                case "delete":
                    if (_krnHardDriveDriver.deleteFile(filename)) {
                        _StdOut.putText("Success!");
                    } else {
                        _StdOut.putText("Failed to delete file.");
                    }
                    break;
                case "read":
                    if (_krnHardDriveDriver.readFile(filename, false)) {
                        _StdOut.putText(_krnHardDriveDriver.readFile(filename, false));
                    } else {
                        _StdOut.putText("Failed to read file.");
                    }
                    break;
                case "ls":
                    var ls = _krnHardDriveDriver.getFileLs();

                    for (var i = 0; i < ls.length; i++) {
                        _StdOut.putText(ls[i]);
                        _StdOut.advanceLine();
                    }
                    break;
                case "format":
                    if (_CPU.isExecuting) {
                        _StdOut.putText("Cannot format hard drive right now.");
                    } else {
                        _krnHardDriveDriver.initialize();
                        _StdOut.putText("Success.");
                    }
                default:
                    this.krnTrace("Operation not found. Check Shell commands.");
            }

            _HardDriveDisplay.update();
        };

        //
        // OS Utility Routines
        //
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                        _prevTraceMessage = msg;
                    }
                } else {
                    TSOS.Control.hostLog(msg, "OS");
                    _prevTraceMessage = msg;
                }
            }
        };

        Kernel.prototype.krnTrapError = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);

            // TODO: Display error on console, perhaps in some sort of colored screen. (Perhaps blue?)
            _DrawingContext.drawImage(_BSOD, 0, 0);
            this.krnShutdown();
            clearInterval(_hardwareClockID);
        };
        return Kernel;
    })();
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
