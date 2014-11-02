/*
  Process Control block - save the state of the process
  The information of the process is displayed on the Process Control Block panel
  */

module TSOS {
    export class ProcessManager {
        constructor(// where all the processes resides
                    public residentQueue = new ProcessQueue(),
                    // pid will not be recycled
                    public lastPid: number = 0) {
        }

        // Add User input program to pcb
        public addProcess(program: string[]): number{
            var process = new Process();
            process.pid = this.lastPid++;
            process.program = program;

            // Current memory only allows 3 programs to be in the resident queue
            // at the same time. In this case, the OS will overwrite the memory block
            if(this.residentQueue.getSize() >= _MemoryManager.numberOfBlocks) {
                // deallocate process at least recently used spot
                this.residentQueue.dequeue();
            }

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
