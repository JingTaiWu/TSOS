/*
	Cpu Scheduler - Uses Round Robin to schedule all the running processes
*/
module TSOS {
    // Enumeration for various scheduling algorithm
    export enum Algorithm {RoundRobin, FCFS, Priority};
	export class CPUScheduler {
		constructor(public readyQueue = new ProcessQueue(),
                    public QUANTUM = 6,
                    public cycle = 0, // - indicate the amount of cycles current process has ran.
                    public currentProcess: Process = null,
                    public currentAlgorithm = Algorithm.RoundRobin) {}

        // schedule - schedule the process according to different scheduling algorithms
        public schedule() {
            switch (this.currentAlgorithm)
            {
                case Algorithm.FCFS: {
                    if(!this.currentProcess && this.readyQueue.getSize() > 0) {
                        _Kernel.krnInterruptHandler(CONTEXT_SWTICH_ISR, []);
                    }
                    break;
                }
                case Algorithm.Priority: {
                    if(!this.currentProcess && this.readyQueue.getSize() > 0) {
                        _Kernel.krnInterruptHandler(CONTEXT_SWTICH_ISR, []);
                    }
                    break;
                }
                default: {
                    /* The default scheduling alogrithm is RR.
                    There are two cases that require a context switch for round robin
                    1. There isn't a current process and there is more than 1 process in the queue
                    2. The current process has reached its quantum and there is more than 1 process in the queue
                    */
                    if((!this.currentProcess && this.readyQueue.getSize() > 0) || (this.cycle == this.QUANTUM && this.readyQueue.getSize() > 0)) {
                        _Kernel.krnInterruptHandler(CONTEXT_SWTICH_ISR, []);
                    }
                }
            }
        }
 
        // getNextProcess - get the next process in the ready queue
        public getNextProcess(): Process {
            return this.readyQueue.dequeue();
        }

        // getLowPriorityProcess - get the next process with the lowest priority
        public getLowPriorityProcess(): Process {
            return this.readyQueue.getLowPriority();
        }

        // set scheduling algorithm - allow user to change the current scheduling algorithm
        public setAlgorithm(algorithm: String): boolean {
            switch (algorithm)
            {
                case "rr": {
                    this.currentAlgorithm = Algorithm.RoundRobin;
                    return true;
                }
                case "fcfs": {
                    this.currentAlgorithm = Algorithm.FCFS;
                    return true;
                }
                case "priority": {
                    this.currentAlgorithm = Algorithm.Priority;
                    return true;
                }
                default: {
                    return false;
                }
            }
        }

        // return a string version of the algorithm
        public getAlgorithm(): string {
            switch (this.currentAlgorithm)
            {
                case Algorithm.FCFS: {
                    return "FCFS";
                }
                case Algorithm.Priority: {
                    return "Priority";
                }
                case Algorithm.RoundRobin: {
                    return "Round Robin";
                }
                default: {
                    return "404: Algorithm not found.";
                }
            }
        }
	}
}
