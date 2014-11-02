/// <reference path="../globals.ts" />

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
          public Zflag: string = "0",
          public IR: string = "00",
          public currentProcess: Process = null,
          public isExecuting: boolean = false) {
        }

        public init(): void {
          this.PC = 0;
          this.Acc = "00";
          this.Xreg = "00";
          this.Yreg = "00";
          this.Zflag = "0";
          this.IR = "00";
          this.isExecuting = false;
          this.currentProcess = null;
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
          // If there is an process running, update the process
          if(this.currentProcess) {
            this.updateProcess();
            var instruction = _MemoryManager.readByte(this.currentProcess.pc, this.currentProcess);
            // Execute the instruction
            this.execute(instruction);
        }
      }

        // update the current running process
        public updateProcess(): void {
           this.currentProcess.pc = this.PC;
           this.currentProcess.acc = this.Acc;
           this.currentProcess.ir = this.IR;
           this.currentProcess.xFlag = this.Xreg;
           this.currentProcess.yFlag = this.Yreg;
           this.currentProcess.zFlag = this.Zflag;
           this.currentProcess.state = Process.RUNNING;
       }

        // Fetch the correct instruction
        public execute(instruction : string): void {
          instruction = instruction.toUpperCase();
          this.IR = instruction;
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
            case "6D":
            this.addWithCarry();
            break;
            case "A2":
            this.loadXRegWithConstant();
            break;
            case "AE":
            this.loadXRegFromMemory();
            break;
            case "A0":
            this.loadYRegWithConstant();
            break;
            case "AC":
            this.loadYRegFromMemory();
            break;
            case "00":
            this.breakFromProcess();
            break;
            case "EA":
            this.noOperation();
            break;
            case "EC":
            this.compareXReg();
            break;
            case "D0":
            this.branchNotEqual();
            break;
            case "EE":
            this.incrementValueOfByte();
            break;
            case "FF":
            this.systemCall();
            break;
            // Instruction not found
            default:
            // just terminate the process for now
            _Kernel.krnTrace("Invalid Instruction!");
            this.breakFromProcess();
        }

        if(this.currentProcess) {
            this.updateProcess();
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
          // Get the constant from memory
          // Set the constant to Accumulator
          this.Acc = this.readNextByte();
          // Increment the Program counter
          this.incrementPC(2);
      }

        // LDA - Load the accumulator from memory
        public loadAccFromMemory(): void {
          // Get the memory address
          // remember the low order bytes are first, "little endian"
          var addressStr = this.readNextTwoBytes();
          var address: number = parseInt(addressStr, 16);
          // Load the number into accumulator
          this.Acc = _MemoryManager.readByte(address, this.currentProcess);
          this.incrementPC(3);
      }

        // STA - Store the accumulator in memory
        public storeAccInMemory(): void {
          // Get the memory address
          var addressStr = this.readNextTwoBytes();
          var address: number = parseInt(addressStr, 16);
          _MemoryManager.writeByte(address, this.Acc, this.currentProcess);
          this.incrementPC(3);
      }

        // ADC - Add with carry: adds contents of an address to the contents of the accumulator and keeps
        // the result in the accumulator
        public addWithCarry(): void {
          var addressStr = this.readNextTwoBytes();
          var address: number = parseInt(addressStr, 16);
          // Add the content from the address to the accumulator (remember to convert to decimal)
          var sum: number = parseInt(_MemoryManager.readByte(address, this.currentProcess), 16) + parseInt(this.Acc, 16);
          // convert the sum back to base 16
          this.Acc = sum.toString(16);
          this.incrementPC(3);
      }

        // LDX - Load the X register with a constant
        public loadXRegWithConstant(): void {
          this.Xreg = this.readNextByte();
          this.incrementPC(2);
      }

        // LDX - Load the X register from memory
        public loadXRegFromMemory(): void {
          var addressStr = this.readNextTwoBytes();
          var address: number = parseInt(addressStr, 16);
          this.Xreg = _MemoryManager.readByte(address, this.currentProcess);
          this.incrementPC(3);
      }

        // LDY - Load the Y register with a constant
        public loadYRegWithConstant(): void {
          this.Yreg = this.readNextByte();
          this.incrementPC(2);
      }

        // LDY - Load the Y register from memory
        public loadYRegFromMemory(): void {
          var addressStr = this.readNextTwoBytes();
          var address: number = parseInt(addressStr, 16);
          this.Yreg = _MemoryManager.readByte(address, this.currentProcess);
          this.incrementPC(3);
      }

        // EA - no operation
        public noOperation(): void {
          // you literally do nothing....
          // but increase the program counter though
          this.incrementPC(1);
      }

        // BRK - break (which is really a system call)
        public breakFromProcess(): void {
          // terminate the process
          _KernelInterruptQueue.enqueue(new Interrupt(SYSTEM_CALL_IRQ, [0, this.currentProcess]));
          this.incrementPC(1);
      }

        // EC - compare a byte in memory to the X reg
        // sets the z flag  = 1 if equal
        public compareXReg(): void {
          var addressStr = this.readNextTwoBytes();
          var address: number = parseInt(addressStr, 16);
          var byte = parseInt(_MemoryManager.readByte(address, this.currentProcess), 16);
          var x = parseInt(this.Xreg, 16);
          if(byte == x) {
            this.Zflag = "1";
            } else {
              this.Zflag = "0";
          }
          this.incrementPC(3);
      }

        // D0 - Branch n bytes if Z flag = 0
        public branchNotEqual(): void {
          // read next byte and calculate number of bytes to move forward
          var numOfBytes: number = parseInt(this.readNextByte(), 16);
          this.incrementPC(2);
          var zflag: number = parseInt(this.Zflag, 16);
          // if z flag = 0, branch
          if(zflag == 0) {
            var offset = numOfBytes;
            this.incrementPC(offset);
        }
    }

        // INC - increment the value of a byte
        public incrementValueOfByte(): void {
          var addressStr = this.readNextTwoBytes();
          var data: string = _MemoryManager.readByte(parseInt(addressStr, 16), this.currentProcess);
          var byte: number = parseInt(data, 16);
          byte++;
          _MemoryManager.writeByte(parseInt(addressStr, 16), byte.toString(16), this.currentProcess);
          this.incrementPC(3);
      }

        // SYS - SystemCall
        public systemCall(): void {
          // give the current process to the queue
          _KernelInterruptQueue.enqueue(new Interrupt(SYSTEM_CALL_IRQ, [1, this.currentProcess]));
          this.incrementPC(1);
      }
        // returns the next byte after the program counter
        public readNextByte(): string {
            return _MemoryManager.readByte(this.PC + 1, this.currentProcess);
        }

        // return the next two bytes after the program counter
        public readNextTwoBytes(): string {
            // Little Endian - The second byte comes first
            return _MemoryManager.readByte(this.PC + 2, this.currentProcess) + _MemoryManager.readByte(this.PC + 1, this.currentProcess);
        }
    }
}
