/*
  Process Control block - save the state of the process
  The information of the process is displayed on the Process Control Block panel
*/

module TSOS {
  export class ProcessControlBlock {
    // where all the processes resides
    public residentQueue : Process[] = [];
    // Pid
    public pid : number;

    constructor() {
      this.pid = 0;
    }

    public addProcess(p : Process) {
      this.residentQueue.push(p);
    }
  }
}
