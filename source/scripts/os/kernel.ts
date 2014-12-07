/// <reference path="../os/jquery.d.ts"/>
/* ------------
     Kernel.ts

     Requires globals.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        // System call library
        private systemCalls = new SystemCalls();
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
            _Console = new Console();          // The command line interface / console I/O device.
            _CPUScheduler = new CPUScheduler();

            // Initialize Memory Manager
            _MemoryManager = new MemoryManager(); // Initialize memory manager
            _MemoryDisplay = new MemoryDisplay(); // Initialize memory display
            _MemoryDisplay.update();

            // Initialize Process Control Block
            _ProcessManager = new ProcessManager();
            _PCBDisplay = new PcbDisplay();
            _PCBDisplay.update();

            // Initialize CPU Display
            _CPUDisplay = new CPUDisplay();

            // Initialize the console.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load the Hard Drive Device Driver
            this.krnTrace("Loading the hard drive device driver.");
            _krnHardDriveDriver = new HardDriveManager();
            _krnHardDriveDriver.initialize();
            _HardDriveDisplay = new HardDriveDisplay();
            _HardDriveDisplay.update();

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate testing.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
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
        }


        public krnOnCPUClockPulse() {
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
            } else if (_CPU.isExecuting && !_StepMode) { // If there are no interrupts then run one CPU cycle if there is anything being processed. {
                // increment the cycle counter in cpu scheduler (for round robin)
                _CPUScheduler.schedule();
                _CPUScheduler.cycle++;
                _CPU.cycle();

                // Update all displays
                _CPUDisplay.update();
                _PCBDisplay.update();
                _MemoryDisplay.update();
            } else {                      // If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }

            // Start the CPU Scheduler
            _CPUScheduler.schedule();
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
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
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }

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
        public invalidMemoryOp(params) {
          var process: Process = params[0];
          this.systemCallISR([0, process]);
          // reschedule the next process (avoid CPU null error)
          _CPUScheduler.schedule();
          // Throw error in host log
          this.krnTrace("Invalid memory operation from process " + process.pid + ".");  
          // update the display
          _PCBDisplay.update();
          _CPUDisplay.update();
          _MemoryDisplay.update();
        }

        // Process Execution - Moving the execution of the process from process manager to cpu scheduler
        public processExecutionISR(params) {
            var process = params[0];
            process.state = Process.READY;
            _CPUScheduler.readyQueue.enqueue(process);
        }

        // Context Switch - switch processes
        public contextSwitchISR(params) {
            this.krnTrace("Performing a context switch.");
            // Stop the last running process if there is any
            var lastProcess: Process = _CPUScheduler.currentProcess;
            if(lastProcess) {
                _CPU.stop();
                lastProcess.state = Process.READY;
                _CPUScheduler.readyQueue.enqueue(lastProcess);
            }

            // Update the displays
            _PCBDisplay.update();
            _CPUDisplay.update();
            _MemoryDisplay.update();

            // Set the current process to the next process
            // if the current scheduling algorithm is priority
            // Set the current process to the next process with the lowest priority
            if(_CPUScheduler.currentAlgorithm == Algorithm.Priority) {
                _CPUScheduler.currentProcess = _CPUScheduler.getLowPriorityProcess();
            } else {
                _CPUScheduler.currentProcess = _CPUScheduler.getNextProcess();
            }
            _CPUScheduler.currentProcess.state = Process.RUNNING;
            // Reset the cycle
            _CPUScheduler.cycle = 0;

            // execute the new process
            _CPU.start(_CPUScheduler.currentProcess);
        }

        // For step mode
        public stepISR() {
            _CPUScheduler.schedule();
            _CPUScheduler.cycle++;
            _CPU.cycle();
            // Update the display
            _CPUDisplay.update();
            _MemoryDisplay.update();
            _PCBDisplay.update();
        }

        // handles system calls from a process
        public systemCallISR(params) {
          var callId = params[0];
          var param = params[1];
          var sysCall = this.systemCalls.systemCallInterface[callId];
          if(sysCall) {
            sysCall(param);
          } else {
            // stop CPU from running
            _CPU.stop();
          }
        }

        // handles hard drive operations
        public hardDriveIsr(params) {
            var operation = params[0];
            var filename = params[1];
            //var diskOp = _krnHardDriveDriver.serviceMap[operation];
        }
        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                        _prevTraceMessage = msg;
                    }
                } else {
                    Control.hostLog(msg, "OS");
                    _prevTraceMessage = msg;
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Perhaps blue?)
            _DrawingContext.drawImage(_BSOD, 0, 0);
            this.krnShutdown();
            clearInterval(_hardwareClockID);
        }
    }
}
