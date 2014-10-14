/*
  Resident Queue - where the processes reside when they are loaded into the OS
  The information of the process is displayed on the Process Control Block panel
*/

module TSOS {
  export class processControlBlock {
    // where all the processes resides
    public residentQueue : Process[] = [];

    public loadProcess(p : Process) {
      this.residentQueue.push(p);
    }
  }
}
