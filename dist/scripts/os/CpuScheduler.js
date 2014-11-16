/*
Cpu Scheduler - Uses Round Robin to schedule all the running processes
*/
var TSOS;
(function (TSOS) {
    var CPUScheduler = (function () {
        function CPUScheduler(readyQueue, QUANTUM, cycle, currentProcess) {
            if (typeof readyQueue === "undefined") { readyQueue = new TSOS.ProcessQueue(); }
            if (typeof QUANTUM === "undefined") { QUANTUM = 6; }
            if (typeof cycle === "undefined") { cycle = 0; }
            if (typeof currentProcess === "undefined") { currentProcess = null; }
            this.readyQueue = readyQueue;
            this.QUANTUM = QUANTUM;
            this.cycle = cycle;
            this.currentProcess = currentProcess;
        }
        // schedule - schedule the process according to different conditions
        CPUScheduler.prototype.schedule = function () {
            // if((this.cycle == this.QUANTUM && !this.currentProcess) || (!this.currentProcess && this.readyQueue.getSize() > 0)) {
            // }
            /* There are two cases that require a context switch
            1. There isn't a current process and there is more than 1 process in the queue
            2. The current process has reached its quantum and there is more than 1 process in the queue
            */
            if ((!this.currentProcess && this.readyQueue.getSize() > 0) || (this.cycle == this.QUANTUM && this.readyQueue.getSize() > 0)) {
                _Kernel.krnInterruptHandler(CONTEXT_SWTICH_ISR, []);
            }
        };

        // getNextProcess - get the next process in the ready queue
        CPUScheduler.prototype.getNextProcess = function () {
            return this.readyQueue.dequeue();
        };
        return CPUScheduler;
    })();
    TSOS.CPUScheduler = CPUScheduler;
})(TSOS || (TSOS = {}));
