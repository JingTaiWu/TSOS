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
            /*
            Two Conditions for a context switch:
            1. When the cycle reaches the quantum, aka the current process has reached its time slice
            2. When current process is null and there is a process in the ready queue
            */
            if (this.cycle == this.QUANTUM || (!this.currentProcess && this.readyQueue.getSize() > 0)) {
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
