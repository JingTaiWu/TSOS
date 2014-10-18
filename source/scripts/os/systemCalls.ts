/*
  This class handles all the system calls
  (break generates a system call)
*/

module TSOS {
  export class SystemCalls {
    // system call interface - mapping all the systems calls
    public systemCallInterface = {
      0: this.terminateProcess
    }
    
    // terminates the current running process
    public terminateProcess(params) {
      var process: Process = params[0];
      // changes the state of the process
      process.state = Process.TERMINATED;
      _ProcessManager.removeProcess(process);
      // reinitialize CPU
      _CPU.init();

      // update all the display
      _MemoryDisplay.update();
      _PCBDisplay.update();
      _CPU.updateDisplay();
    }
  }
}
