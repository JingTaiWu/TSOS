/*
  The information about the process is displayed in the process control block
  in the client OS
*/

module TSOS {
  export class Process {
    public pid : number; // Process ID
    public pc :  number; // Program Counter
    public ir : string; // Current Instruction
    public xFlag : string; // x register
    public yFlag : string; // y register
    public zFlag : string; // zero flag
    public state: string; // current state of the process
    public location : string; // current location of the process
    
  }
}
