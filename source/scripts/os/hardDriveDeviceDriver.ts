/**
    This is the device driver for the hard drive.
*/
module TSOS {
    export class HardDriveDeviceDriver {
        public hardDriveManager: HardDriveManager;
        public hardDriveDisplay: HardDriveDisplay;

        constructor() {
            this.hardDriveManager = new HardDriveManager();
        }
        public krnHrdDriverEntry() {
            this.hardDriveDisplay.update();
            this.hardDriveManager.initialize();
        }

        public createFile(filename: string): boolean {
            var success = this.hardDriveManager.createFile(filename);
            if(success) {
                return true;
            }

            return false;
        }
    }
}
