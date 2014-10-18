/// <reference path="../globals.ts" />
/// <reference path="../os/jquery.d.ts"/>
/* ------------
CPU.ts
Requires global.ts.
Routines for the host CPU simulation, NOT for the OS itself.
In this manner, it's A LITTLE BIT like a hypervisor,
in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
TypeScript/JavaScript in both the host and client environments.
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, IR, currentProcess, isExecuting) {
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof IR === "undefined") { IR = 0; }
            if (typeof currentProcess === "undefined") { currentProcess = null; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.IR = IR;
            this.currentProcess = currentProcess;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.IR = 0;
            this.isExecuting = false;
            this.currentProcess = null;
            this.updateDisplay();
        };

        // load the current running process and start the CPU cycle
        Cpu.prototype.start = function (pcb) {
            this.currentProcess = pcb;

            // set the properties of the pcb to the CPU
            this.PC = pcb.pc;
            this.Acc = pcb.acc;
            this.Xreg = pcb.xFlag;
            this.Yreg = pcb.yFlag;
            this.Zflag = pcb.zFlag;
            this.IR = pcb.ir;
            this.isExecuting = true;
        };

        // Stop CPU execution
        Cpu.prototype.stop = function () {
            this.init();
        };

        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');

            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            // Get the Current instruction
            var instruction = _MemoryManager.readByte(this.PC);

            // Execute the instruction
            this.execute(instruction);
            this.updateProcess();
            this.updateDisplay();
        };

        // update the current running process
        Cpu.prototype.updateProcess = function () {
            this.currentProcess.pc = this.PC;
            this.currentProcess.acc = this.Acc;
            this.currentProcess.ir = this.IR;
            this.currentProcess.xFlag = this.Xreg;
            this.currentProcess.yFlag = this.Yreg;
            this.currentProcess.zFlag = this.Zflag;

            // update the display
            _PCBDisplay.update();
        };

        // update the display in the client OS
        Cpu.prototype.updateDisplay = function () {
            // Grab a reference to the CPU Div in the HTML page
            var cpuDiv = $("#cpu > tbody");

            // Empty the table
            cpuDiv.empty();

            // Formulate string
            var cols = "<td>" + this.PC + "</td>" + "<td>" + this.IR + "</td>" + "<td>" + this.Acc + "</td>" + "<td>" + this.Xreg + "</td>" + "<td>" + this.Yreg + "</td>" + "<td>" + this.Zflag + "</td>";
            var row = "<tr>" + cols + "</tr>";

            // Append the string to the Div
            cpuDiv.append(row);
        };

        // Fetch the correct instruction
        Cpu.prototype.execute = function (instruction) {
            switch (instruction) {
                case "A9":
                    this.loadAccWithConstant();
                    break;
                case "AD":
                    this.loadAccFromMemory();
                    break;
                case "8D":
                    this.storeAccInMemory();
            }
        };

        // Increment Program Counter
        Cpu.prototype.incrementPC = function (bytes) {
            // The memory is only 256 bytes
            this.PC = (this.PC + bytes) % 256;
        };

        // Assembly instruction
        // LDA - Load the accumulator with a constant
        Cpu.prototype.loadAccWithConstant = function () {
            this.IR = parseInt(_MemoryManager.readByte(this.PC), 16);

            // Get the constant from memory
            // Set the constant to Accumulator
            this.Acc = parseInt(_MemoryManager.readByte(this.PC + 1), 16);

            // Increment the Program counter
            this.incrementPC(2);
        };

        // LDA - Load the accumulator from memory
        Cpu.prototype.loadAccFromMemory = function () {
            this.IR = parseInt(_MemoryManager.readByte(this.PC), 16);

            // Get the memory address
            var addressStr = _MemoryManager.readByte(this.PC + 1) + _MemoryManager.readByte(this.PC + 2);
            var address = parseInt(addressStr, 16);

            // Load the number into accumulator
            this.Acc = parseInt(_MemoryManager.readByte(address), 16);
            this.incrementPC(3);
        };

        // STA - Store the accumulator in memory
        Cpu.prototype.storeAccInMemory = function () {
            this.IR = parseInt(_MemoryManager.readByte(this.PC), 16);

            // Get the memory address
            var addressStr = _MemoryManager.readByte(this.PC + 1) + _MemoryManager.readByte(this.PC + 2);
            var address = parseInt(addressStr, 16);
            _MemoryManager.writeByte(address, this.Acc + "");
            this.incrementPC(3);
        };

        // BRK - break (which is really a system call)
        Cpu.prototype.breakFromProcess = function () {
            // terminate the process
            _Kernel.krnInterruptHandler(SYSTEM_CALL_IRQ, [0, this.currentProcess]);
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
