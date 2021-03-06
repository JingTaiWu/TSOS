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
var APP_NAME = "Jingle OS";
var APP_VERSION = "42";

var CPU_CLOCK_INTERVAL = 30;

var TIMER_IRQ = 0;

// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;

var INVALID_MEMORY_OP = 2;

var SYSTEM_CALL_IRQ = 3;

var STEP_MODE_ISR = 4;

var PROCESS_EXECUTION_ISR = 5;

var CONTEXT_SWTICH_ISR = 6;

var DISK_OPERATION_ISR = 7;

//
// Global Variables
//
var _CPU;
var _CPUDisplay;

var _CPUScheduler;

var _OSclock = 0;

var _Mode = 0;
var _StepMode = false;

var _Canvas = null;
var _Buffer = null;
var _DrawingContext = null;
var _BufferContext = null;
var _DefaultFontFamily = "sans";
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;

var _Trace = true;

// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;
var _prevTraceMessage;

// Process Control Block
var _ProcessManager;
var _PCBDisplay;

// Memory
var _MemoryManager;
var _MemoryDisplay;

// Standard input and output
var _StdIn = null;
var _StdOut = null;

// UI
var _Console;
var _OsShell;

// Hard Drive
var _krnHardDriveDriver;
var _HardDriveDisplay;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID = null;

// For testing...
var _GLaDOS = null;
var Glados = null;

// BSOD Image
var _BSOD = new Image();
_BSOD.src = "resources/BSOD.png";

var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
