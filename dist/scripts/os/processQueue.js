/*
ProcessQueue - Extends from Queue which is designed for resident/ready queues
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TSOS;
(function (TSOS) {
    var ProcessQueue = (function (_super) {
        __extends(ProcessQueue, _super);
        function ProcessQueue() {
            // Typescript requires calling the super constuctor
            _super.call(this);
        }
        // Process Queue exclusive functions
        // To get a specific process
        ProcessQueue.prototype.getProcess = function (pid) {
            var retVal = undefined;
            for (var i = 0; i < this.getSize(); i++) {
                var currentProcess = this.q[i];
                if (currentProcess.pid == pid) {
                    return currentProcess;
                }
            }
            return retVal;
        };

        // To remove a specific process
        ProcessQueue.prototype.removeProcess = function (pid) {
            var retVal = false;
            for (var i = 0; i < this.getSize(); i++) {
                var currentProcess = this.q[i];
                if (currentProcess.pid == pid) {
                    this.q.splice(i, 1);
                    retVal = true;
                }
            }

            return retVal;
        };
        return ProcessQueue;
    })(TSOS.Queue);
    TSOS.ProcessQueue = ProcessQueue;
})(TSOS || (TSOS = {}));
