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
        CPUScheduler.prototype.schedule = function () {
            // If there is something in the ready queue and current process is null
            // Assign the current process to the first process in the ready queue
            if (this.currentProcess == null && this.readyQueue.getSize() > 0) {
                this.currentProcess = this.getNextProcess();

                // Start the CPU
                _CPU.start(this.currentProcess);
            }

            // If the current cycle is equal to the quantum
            // Generate an context switch isr
            // Also check if there is more than one process in the readyQueue
            if (this.cycle == this.QUANTUM && this.readyQueue.getSize() > 1) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWTICH_ISR, []));
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
