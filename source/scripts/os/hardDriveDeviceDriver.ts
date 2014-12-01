/**
    This is the device driver for the hard drive.
*/
module TSOS {
    export class HardDriveDeviceDriver extends DeviceDriver{
        constructor() {
            super();
        }

        public krnHrdDriverEntry() {
            this.status = "loaded";
        }
    }
}
