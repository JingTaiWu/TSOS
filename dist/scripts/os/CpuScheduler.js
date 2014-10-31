/*
Cpu Scheduler - Uses Round Robin to schedule all the running processes
*/
var TSOS;
(function (TSOS) {
    var CPUScheduler = (function () {
        function CPUScheduler(readyQueue, QUANTUM, cycleRan) {
            if (typeof readyQueue === "undefined") { readyQueue = new TSOS.ProcessQueue(); }
            if (typeof QUANTUM === "undefined") { QUANTUM = 6; }
            if (typeof cycleRan === "undefined") { cycleRan = 0; }
            this.readyQueue = readyQueue;
            this.QUANTUM = QUANTUM;
            this.cycleRan = cycleRan;
        }
        return CPUScheduler;
    })();
    TSOS.CPUScheduler = CPUScheduler;
})(TSOS || (TSOS = {}));
