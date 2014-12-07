/**
This is the device driver for the hard drive.
*/
var TSOS;
(function (TSOS) {
    var HardDriveDeviceDriver = (function () {
        function HardDriveDeviceDriver() {
            this.hardDriveManager = new TSOS.HardDriveManager();
        }
        HardDriveDeviceDriver.prototype.krnHrdDriverEntry = function () {
            this.hardDriveDisplay.update();
            this.hardDriveManager.initialize();
        };

        HardDriveDeviceDriver.prototype.createFile = function (filename) {
            var success = this.hardDriveManager.createFile(filename);
            if (success) {
                return true;
            }

            return false;
        };
        return HardDriveDeviceDriver;
    })();
    TSOS.HardDriveDeviceDriver = HardDriveDeviceDriver;
})(TSOS || (TSOS = {}));
