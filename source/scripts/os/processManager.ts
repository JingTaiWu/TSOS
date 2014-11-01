/*
  Process Control block - save the state of the process
  The information of the process is displayed on the Process Control Block panel
  */

module TSOS {
    export class ProcessManager {
        // where all the processes resides
        public residentQueue = new ProcessQueue();
        public lastPid: number = 0;

        // Add User input program to pcb
        public addProcess(program: string[]): number{
            var process = new Process();
            process.pid = this.lastPid++;
            process.program = program;
            // allocate space for process
            _MemoryManager.allocate(process);
            // add it to the resident queue
            this.residentQueue.enqueue(process);
            // Update the display
            _PCBDisplay.update();
            return process.pid;
        }

        // Removes a process
        public removeProcess(process: Process) {
            this.residentQueue.removeProcess(process.pid);
        }

        // Execute Process (Avoid Calling CPU directly from shell)
        public execute(process: Process) {
            _Kernel.krnInterruptHandler(PROCESS_EXECUTION_ISR, [process]);
        } 
    }
}
