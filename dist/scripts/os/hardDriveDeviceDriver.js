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
            _super.call(this, this.krnHrdDriverEntry, null);
        }
        HardDriveDeviceDriver.prototype.krnHrdDriverEntry = function () {
            // Initialize the hard drive and the display
            this.hardDriveManager = new TSOS.HardDriveManager();
            this.hardDriveDisplay = new TSOS.HardDriveDisplay();

            this.hardDriveManager.initialize();
            this.hardDriveDisplay.update();

            this.status = "loaded";
        };

        HardDriveDeviceDriver.prototype.getHardDriveManager = function () {
            return this.hardDriveManager;
        };

        HardDriveDeviceDriver.prototype.createFile = function (filename) {
            if (this.hardDriveManager.createFile(filename)) {
                return "New File: " + filename;
            } else {
                return "Failed to create file.";
            }
        };
        return HardDriveDeviceDriver;
    })(TSOS.DeviceDriver);
    TSOS.HardDriveDeviceDriver = HardDriveDeviceDriver;
})(TSOS || (TSOS = {}));
