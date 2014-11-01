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

            //
            // ... more?
            //
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
            // Throw error in host log
            this.krnTrace("Invalid memory operation. Stopping the CPU.");

            // Stopping the CPU
            _CPU.stop();
            var process = params[0];
            process.state = TSOS.Process.TERMINATED;

            // update the pcb
            _PCBDisplay.update();

            // reset the memory
            _MemoryManager.resetMemory();
        };

        // Process Execution - Moving the execution of the process from process manager to cpu scheduler
        Kernel.prototype.processExecutionISR = function (params) {
            _CPUScheduler.readyQueue.enqueue(params[0]);
        };

        // Context Switch - switch processes
        Kernel.prototype.contextSwitchISR = function (params) {
            this.krnTrace("Performing a context switch.");

            // Stop the last running process if there is any
            var lastProcess = _CPUScheduler.currentProcess;
            if (lastProcess) {
                _CPU.stop();
                lastProcess.state = TSOS.Process.WAITING;
                _CPUScheduler.readyQueue.enqueue(_CPUScheduler.currentProcess);
            }

            // Update the pcb display
            _PCBDisplay.update();

            // Set the current process to the next process
            _CPUScheduler.currentProcess = _CPUScheduler.getNextProcess();

            // execute the new process
            _CPU.start(_CPUScheduler.currentProcess);

            // Reset the cycle
            _CPUScheduler.cycle = 0;
        };

        // For step mode
        Kernel.prototype.stepISR = function () {
            _CPUScheduler.cycle++;
            _CPUScheduler.schedule();
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
