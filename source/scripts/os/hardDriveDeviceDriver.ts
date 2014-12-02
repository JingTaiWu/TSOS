/**
    This is the device driver for the hard drive.
*/
module TSOS {
    export class HardDriveDeviceDriver extends DeviceDriver{
        private hardDriveManager: HardDriveManager;
        private hardDriveDisplay: HardDriveDisplay;

        constructor() {
            super(this.krnHrdDriverEntry, null);
        }

        public krnHrdDriverEntry() {
            // Initialize the hard drive and the display
            this.hardDriveManager = new HardDriveManager();
            this.hardDriveDisplay = new HardDriveDisplay();

            this.hardDriveManager.initialize();
            this.hardDriveDisplay.update();

            this.status = "loaded";
        }

        public getHardDriveManager() {
            return this.hardDriveManager;
        }

        public createFile(filename: string): string {
            if(this.hardDriveManager.createFile(filename)) {
                return "New File: " + filename;
            } else {
                return "Failed to create file.";
            }
        }
    }
}
