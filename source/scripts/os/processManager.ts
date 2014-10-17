/*
  Process Control block - save the state of the process
  The information of the process is displayed on the Process Control Block panel
*/

module TSOS {
  export class ProcessManager {
    // where all the processes resides
    public residentQueue : Process[] = [];
    public readyQueue : Process[] = [];
    public lastPid : number = 0;

    // Add User input program to pcb
    public addProcess(program : string[]) : number{
      // reset the memory
      _MemoryManager.resetMemory();
      var process = new Process();
      process.pid = this.lastPid++;
      process.program = program;
      _MemoryManager.allocate(process);
      // add it to the resident queue
      this.residentQueue[process.pid] = process;
      _PCBDisplay.update();
      return process.pid;
    }
  }
}
