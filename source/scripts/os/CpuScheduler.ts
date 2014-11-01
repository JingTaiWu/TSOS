/*
	Cpu Scheduler - Uses Round Robin to schedule all the running processes
*/
module TSOS {
	export class CPUScheduler {
		constructor(public readyQueue = new ProcessQueue(),
                    public QUANTUM = 6,
                    public cycle = 0,
                    public currentProcess: Process = null) {}
        public schedule() {
            // If the current cycle is equal to the quantum
            // Generate an context switch isr
            // Also check if there is more than one process in the readyQueue
            if((this.cycle == this.QUANTUM || !this.currentProcess) && this.readyQueue.getSize()) {
                _Kernel.krnInterruptHandler(CONTEXT_SWTICH_ISR, []);
            }
        }
 
        // getNextProcess - get the next process in the ready queue
        public getNextProcess(): Process {
            return this.readyQueue.dequeue();
        }
	}
}
