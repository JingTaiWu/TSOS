var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TSOS;
(function (TSOS) {
    var ResidentQueue = (function (_super) {
        __extends(ResidentQueue, _super);
        function ResidentQueue() {
            _super.call(this);
        }
        // Process Queue exclusive functions
        // To get a specific process
        ResidentQueue.prototype.getProcess = function (pid) {
            var currentProcess = null;
            for (var i = 0; i < this.getSize(); i++) {
                currentProcess = this.q[i];
                if (currentProcess.pid == pid) {
                    return currentProcess;
                }
            }
            return currentProcess;
        };

        // To remove a specific process
        ResidentQueue.prototype.removeProcess = function (pid) {
            for (var i = 0; i < this.getSize(); i++) {
                var currentProcess = this.q[i];
                if (currentProcess.pid == pid) {
                    this.q.splice(i, 1);
                }
            }
        };
        return ResidentQueue;
    })(TSOS.Queue);
    TSOS.ResidentQueue = ResidentQueue;
})(TSOS || (TSOS = {}));
