/*
  The information about the process is displayed in the process control block
  in the client OS
*/

module TSOS {
  export class Process {
    public pid : number; // Process ID
    public pc :  number = 0; // Program Counter
    public acc : number = 0;
    public ir : string = "00"; // Current Instruction
    public xFlag : number = 0; // x register
    public yFlag : number = 0; // y register
    public zFlag : number = 0; // zero flag
    public location : string; // current location of the process
    public base : number; // the base address of the program

    constructor(pid : number, base : number) {
      this.pid = pid;
      this.base = base;
    }
  }
}
