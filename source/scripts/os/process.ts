/*
  ReadyQueue - Where the processes resides
  The information about the process is displayed in the process control block
  in the client OS
*/

module TSOS {
  export class Process {
    public pid : number;
    public pc :  number;
    public ir : string;
    public xFlag : string;
    public yFlag : string;
    public zFlag : string;
    public state: string;
    public location : string;
  }
}
