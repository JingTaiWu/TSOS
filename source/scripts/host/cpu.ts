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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: string = "00",
                    public Xreg: string = "00",
                    public Yreg: string = "00",
                    public Zflag: string = "00",
                    public IR: string = "00",
                    public currentProcess: Process = null,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = "00";
            this.Xreg = "00";
            this.Yreg = "00";
            this.Zflag = "00";
            this.IR = "00";
            this.isExecuting = false;
            this.currentProcess = null;
            this.updateDisplay();
        }

        // load the current running process and start the CPU cycle
        public start(pcb: Process) {
          this.currentProcess = pcb;
          // set the properties of the pcb to the CPU
          this.PC = pcb.pc;
          this.Acc = pcb.acc;
          this.Xreg = pcb.xFlag;
          this.Yreg = pcb.yFlag;
          this.Zflag = pcb.zFlag;
          this.IR = pcb.ir;
          this.isExecuting = true;
        }

        // Stop CPU execution
        public stop() {
          this.init();
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            // Get the Current instruction
            var instruction = _MemoryManager.readByte(this.PC);
            // Execute the instruction
            this.execute(instruction);
            // If there is an process running, update the process
            if(this.currentProcess) {
              this.updateProcess();
            }
            this.updateDisplay();
        }

        // update the current running process
        public updateProcess(): void {
           this.currentProcess.pc = this.PC;
           this.currentProcess.acc = this.Acc;
           this.currentProcess.ir = this.IR;
           this.currentProcess.xFlag = this.Xreg;
           this.currentProcess.yFlag = this.Yreg;
           this.currentProcess.zFlag = this.Zflag;
           // update the display
           _PCBDisplay.update();
        }

        // update the display in the client OS
        public updateDisplay() {
          // Grab a reference to the CPU Div in the HTML page
          var cpuDiv = $("#cpu > tbody");
          // Empty the table
          cpuDiv.empty();
          // Formulate string
          var cols = "<td>" + this.PC + "</td>" +
                     "<td>" + this.IR + "</td>" +
                     "<td>" + this.Acc + "</td>" +
                     "<td>" + this.Xreg + "</td>" +
                     "<td>" + this.Yreg + "</td>" +
                     "<td>" + this.Zflag + "</td>";
          var row = "<tr>" + cols + "</tr>";
          // Append the string to the Div
          cpuDiv.append(row);
        }

        // Fetch the correct instruction
        public execute(instruction : string): void {
          switch(instruction) {
            case "A9":
            this.loadAccWithConstant();
            break;
            case "AD":
            this.loadAccFromMemory();
            break;
            case "8D":
            this.storeAccInMemory();
            break;
            case "00":
            this.breakFromProcess();
          }
        }

        // Increment Program Counter
        public incrementPC(bytes: number): void {
          // The memory is only 256 bytes
          this.PC = (this.PC + bytes) % 256;
        }

        // Assembly instruction
        // LDA - Load the accumulator with a constant
        public loadAccWithConstant(): void {
          this.IR = _MemoryManager.readByte(this.PC);
          // Get the constant from memory
          // Set the constant to Accumulator
          this.Acc = _MemoryManager.readByte(this.PC + 1);
          // Increment the Program counter
          this.incrementPC(2);
        }

        // LDA - Load the accumulator from memory
        public loadAccFromMemory(): void {
          this.IR = _MemoryManager.readByte(this.PC);
          // Get the memory address
          var addressStr = _MemoryManager.readByte(this.PC + 1) + _MemoryManager.readByte(this.PC + 2);
          var address: number = parseInt(addressStr, 16);
          // Load the number into accumulator
          this.Acc = _MemoryManager.readByte(address);
          this.incrementPC(3);
        }

        // STA - Store the accumulator in memory
        public storeAccInMemory(): void {
          this.IR = _MemoryManager.readByte(this.PC);
          // Get the memory address
          var addressStr = _MemoryManager.readByte(this.PC + 1) + _MemoryManager.readByte(this.PC + 2);
          var address: number = parseInt(addressStr, 16);
          _MemoryManager.writeByte(address, this.Acc + "");
          this.incrementPC(3);
        }

        // BRK - break (which is really a system call)
        public breakFromProcess(): void {
          // terminate the process
          _Kernel.krnInterruptHandler(SYSTEM_CALL_IRQ, [0, this.currentProcess]);
        }
    }
}
