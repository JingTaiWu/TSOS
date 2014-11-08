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
        public addProcess(program: string[]): Process{
            var process = new Process();
            // try to allocate space for process
            if(_MemoryManager.allocate(process, program)) {
                // add it to the resident queue
                this.residentQueue.enqueue(process);
                return process;
            } else {
                return null;
            }
        }

        // Removes a process
        public removeProcess(process: Process): boolean {
            if(process) {
                _MemoryManager.deallocate(process);
                var removed = this.residentQueue.removeProcess(process.pid);
                if(removed) {
                    return true;
                }
            }

            return false;
        }

        // Execute Process (Avoid Calling CPU directly from shell)
        public execute(process: Process) {
            _Kernel.krnInterruptHandler(PROCESS_EXECUTION_ISR, [process]);
        } 
    }
}
