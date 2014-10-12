/*
  Resident Queue - where the processes reside when they are loaded into the OS
  The information of the process is displayed on the Process Control Block panel
*/

module TSOS {
  export class residentQueue {
    constructor (public q = new Array()) {

    }

    public loadProcess(p : Process) {
      this.q.push(p);
    }
  }
}
