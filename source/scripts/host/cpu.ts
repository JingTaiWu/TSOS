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
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public IR: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.IR = 0;
            this.isExecuting = false;
            this.updateDisplay();
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            // Get the Current instruction
            var instruction = _MemoryManager.readByte(this.PC);
            // Execute the instruction
            this.execute(instruction);
            this.updateDisplay();
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
        public execute(instruction : string) : void {
          switch(instruction) {
            case "A9":
            this.loadAccWithConstant();
            break;
          }
        }

        // Increment Program Counter
        public incrementPC(bytes : number) : void {
          // The memory is only 256 bytes
          this.PC = (this.PC + bytes) % 256;
        }
        // Assembly instruction
        // LDA - Load the accumulator with a constant
        public loadAccWithConstant() : void {
          // Get the constant from memory
          var constant = parseInt(_MemoryManager.readByte(++this.PC), 16);
          // Set the constant to Accumulator
          this.Acc = constant;
          // Increment the Program counter
          this.incrementPC(1);
        }
    }
}
