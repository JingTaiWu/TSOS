/*
Cpu Scheduler - Uses Round Robin to schedule all the running processes
*/
var TSOS;
(function (TSOS) {
    // Enumeration for various scheduling algorithm
    (function (Algorithm) {
        Algorithm[Algorithm["RoundRobin"] = 0] = "RoundRobin";
        Algorithm[Algorithm["FCFS"] = 1] = "FCFS";
        Algorithm[Algorithm["Priority"] = 2] = "Priority";
    })(TSOS.Algorithm || (TSOS.Algorithm = {}));
    var Algorithm = TSOS.Algorithm;
    ;
    var CPUScheduler = (function () {
        function CPUScheduler(readyQueue, QUANTUM, cycle, currentProcess, currentAlgorithm) {
            if (typeof readyQueue === "undefined") { readyQueue = new TSOS.ProcessQueue(); }
            if (typeof QUANTUM === "undefined") { QUANTUM = 6; }
            if (typeof cycle === "undefined") { cycle = 0; }
            if (typeof currentProcess === "undefined") { currentProcess = null; }
            if (typeof currentAlgorithm === "undefined") { currentAlgorithm = 0 /* RoundRobin */; }
            this.readyQueue = readyQueue;
            this.QUANTUM = QUANTUM;
            this.cycle = cycle;
            this.currentProcess = currentProcess;
            this.currentAlgorithm = currentAlgorithm;
        }
        // schedule - schedule the process according to different scheduling algorithms
        CPUScheduler.prototype.schedule = function () {
            switch (this.currentAlgorithm) {
                case 1 /* FCFS */: {
                    if (!this.currentProcess && this.readyQueue.getSize() > 0) {
                        _Kernel.krnInterruptHandler(CONTEXT_SWTICH_ISR, []);
                    }
                    break;
                }
                case 2 /* Priority */: {
                    if (!this.currentProcess && this.readyQueue.getSize() > 0) {
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
                    if ((!this.currentProcess && this.readyQueue.getSize() > 0) || (this.cycle == this.QUANTUM && this.readyQueue.getSize() > 0)) {
                        _Kernel.krnInterruptHandler(CONTEXT_SWTICH_ISR, []);
                    }
                }
            }
        };

        // getNextProcess - get the next process in the ready queue
        CPUScheduler.prototype.getNextProcess = function () {
            return this.readyQueue.dequeue();
        };

        // getLowPriorityProcess - get the next process with the lowest priority
        CPUScheduler.prototype.getLowPriorityProcess = function () {
            return this.readyQueue.getLowPriority();
        };

        // set scheduling algorithm - allow user to change the current scheduling algorithm
        CPUScheduler.prototype.setAlgorithm = function (algorithm) {
            switch (algorithm) {
                case "rr": {
                    this.currentAlgorithm = 0 /* RoundRobin */;
                    return true;
                }
                case "fcfs": {
                    this.currentAlgorithm = 1 /* FCFS */;
                    return true;
                }
                case "priority": {
                    this.currentAlgorithm = 2 /* Priority */;
                    return true;
                }
                default: {
                    return false;
                }
            }
        };

        // return a string version of the algorithm
        CPUScheduler.prototype.getAlgorithm = function () {
            switch (this.currentAlgorithm) {
                case 1 /* FCFS */: {
                    return "FCFS";
                }
                case 2 /* Priority */: {
                    return "Priority";
                }
                case 0 /* RoundRobin */: {
                    return "Round Robin";
                }
                default: {
                    return "404: Algorithm not found.";
                }
            }
        };
        return CPUScheduler;
    })();
    TSOS.CPUScheduler = CPUScheduler;
})(TSOS || (TSOS = {}));
