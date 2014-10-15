/*
  Process Control block - save the state of the process
  The information of the process is displayed on the Process Control Block panel
*/

module TSOS {
  export class ProcessControlBlock {
    // where all the processes resides
    public residentQueue : Process[] = [];
    // Pid
    public currentPid : number = 0;

    public addProcess(base : number) : number {
      var process = new Process(this.currentPid, base);
      process.location = "Memory";
      this.residentQueue.push(process);
      // increment the pid (we don't want to recycle the ID)
      this.currentPid++;
      // update the PCB
      _PCBDisplay.update();

      return process.pid;
    }
  }
}
