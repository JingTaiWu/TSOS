/*
Resident Queue - where the processes reside when they are loaded into the OS
The information of the process is displayed on the Process Control Block panel
*/
var TSOS;
(function (TSOS) {
    var residentQueue = (function () {
        function residentQueue(q) {
            if (typeof q === "undefined") { q = new Array(); }
            this.q = q;
        }
        residentQueue.prototype.loadProcess = function (p) {
            this.q.push(p);
        };
        return residentQueue;
    })();
    TSOS.residentQueue = residentQueue;
})(TSOS || (TSOS = {}));
