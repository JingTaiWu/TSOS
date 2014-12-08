/*
  The information about the process is displayed in the process control block
  in the client OS
*/

module TSOS {
    export enum ProcessLocation {IN_RAM, IN_HARD_DRIVE}
    export class Process {
        public static RUNNING: string = "Running";
        public static NOT_RUNNING: string = "Resident";
        public static TERMINATED: string = "Terminated";
        public static READY: string = "Ready";
        public static WAITING: string = "Waiting";

        public pid: number; // Process ID
        public pc:  number = 0; // Program Counter
        public acc: string = "00";
        public ir: string = "00"; // Current Instruction
        public xFlag: string = "00"; // x register
        public yFlag: string = "00"; // y register
        public zFlag: string = "0"; // zero flag
        public location: ProcessLocation; // current location of the process
        public base: number = 0;
        public limit: number = 0;
        public state: string = Process.NOT_RUNNING;
        public blockNumber: number;
        public priority: number;
    }
}
