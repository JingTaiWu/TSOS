/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//a
// Global "CONSTANTS" (There is currently no const or final or readonly type annotation in TypeScript.)
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var APP_NAME: string    = "Jingle OS";   // 'cause Bob and I were at a loss for a better name.
var APP_VERSION: string = "42";   // What did you expect?

var CPU_CLOCK_INTERVAL: number = 30;   // This is in ms, or milliseconds, so 1000 = 1 second.

var TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                            // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ: number = 1;

var INVALID_MEMORY_OP: number = 2;

var SYSTEM_CALL_IRQ: number = 3;

var STEP_MODE_ISR: number = 4;

var PROCESS_EXECUTION_ISR: number = 5;

var CONTEXT_SWTICH_ISR: number = 6;

var DISK_OPERATION_ISR: number = 7;

//
// Global Variables
//
var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _CPUDisplay: TSOS.CPUDisplay; // For CPU display update

var _CPUScheduler: TSOS.CPUScheduler; // Global instance for CPU scheduler

var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _StepMode: boolean = false;

var _Canvas: HTMLCanvasElement = null;  // Initialized in hostInit().
var _Buffer: HTMLCanvasElement = null;  // to redraw the canvas initlized in hostInit().
var _DrawingContext = null;             // Initialized in hostInit().
var _BufferContext = null;
var _DefaultFontFamily = "sans";        // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;              // Additional space added to font size when advancing a line.

var _Trace: boolean = true;  // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers: any[] = null;
var _KernelInputQueue = null;
var _prevTraceMessage;

// Process Control Block
var _ProcessManager: TSOS.ProcessManager;
var _PCBDisplay: TSOS.PcbDisplay;

// Memory
var _MemoryManager: TSOS.MemoryManager;
var _MemoryDisplay: TSOS.MemoryDisplay;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// Hard Drive
var _krnHardDriveDriver: TSOS.HardDriveManager;
var _HardDriveDisplay: TSOS.HardDriveDisplay;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID: number = null;

// For testing...
var _GLaDOS: any = null;
var Glados: any = null;

// BSOD Image
var _BSOD = new Image();
_BSOD.src = "resources/BSOD.png";

var onDocumentLoad = function() {
	TSOS.Control.hostInit();
};
