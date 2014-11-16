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

            // if((this.cycle == this.QUANTUM && !this.currentProcess) || (!this.currentProcess && this.readyQueue.getSize() > 0)) {
            // }

            /* There are two cases that require a context switch
                1. There isn't a current process and there is more than 1 process in the queue
                2. The current process has reached its quantum and there is more than 1 process in the queue
            */
            if((!this.currentProcess && this.readyQueue.getSize() > 0) || (this.cycle == this.QUANTUM && this.readyQueue.getSize() > 0)) {
                _Kernel.krnInterruptHandler(CONTEXT_SWTICH_ISR, []);
            }
        }
 
        // getNextProcess - get the next process in the ready queue
        public getNextProcess(): Process {
            return this.readyQueue.dequeue();
        }
	}
}
