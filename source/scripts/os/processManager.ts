/*
  Process Control block - save the state of the process
  The information of the process is displayed on the Process Control Block panel
*/

module TSOS {
  export class ProcessManager {
    // where all the processes resides
    public residentQueue : Process[] = [];
    public readyQueue : Process [] = [];

    public addToResidentQueue(base : number) : number {
      var process = new Process();
      process.location = "Memory";
      this.residentQueue.push(process);
      // Set the pid of the process to the index of the process in the resident queue
      this.residentQueue[this.residentQueue.length - 1].pid = this.residentQueue.length - 1;
      return process.pid;
    }
  }
}
