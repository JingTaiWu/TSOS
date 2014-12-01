var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
This is the device driver for the hard drive.
*/
var TSOS;
(function (TSOS) {
    var HardDriveDeviceDriver = (function (_super) {
        __extends(HardDriveDeviceDriver, _super);
        function HardDriveDeviceDriver() {
            _super.call(this);
        }
        HardDriveDeviceDriver.prototype.krnHrdDriverEntry = function () {
            this.status = "loaded";
        };
        return HardDriveDeviceDriver;
    })(TSOS.DeviceDriver);
    TSOS.HardDriveDeviceDriver = HardDriveDeviceDriver;
})(TSOS || (TSOS = {}));
