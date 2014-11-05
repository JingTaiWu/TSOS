/*
	Cpu Scheduler - Uses Round Robin to schedule all the running processes
*/
module TSOS {
	export class CPUScheduler {
		constructor(public readyQueue = new ProcessQueue(),
                    public QUANTUM = 6,
                    public cycle = 0, // - indicate the amount of cycles current process has ran.
                    public currentProcess: Process = null) {}

        // schedule - schedule the process according to different conditions
        public schedule() {
            /*
                Two Conditions for a context switch:
                1. When the cycle reaches the quantum, aka the current process has reached its time slice
                2. When current process is null and there is a process in the ready queue
            */
            if(this.cycle == this.QUANTUM || (!this.currentProcess && this.readyQueue.getSize() > 0)) {
                _Kernel.krnInterruptHandler(CONTEXT_SWTICH_ISR, []);
            }
        }
 
        // getNextProcess - get the next process in the ready queue
        public getNextProcess(): Process {
            return this.readyQueue.dequeue();
        }
	}
}
