/*
    ProcessQueue - Extends from Queue which is designed for resident/ready queues
*/

module TSOS {
    export class ProcessQueue extends Queue {
        constructor() {
            // Typescript requires calling the super constuctor
            super();
        }

        // Process Queue exclusive functions
        // To get a specific process
        public getProcess(pid: number): Process {
            var retVal = undefined;
            for(var i = 0; i < this.getSize(); i++) {
                var currentProcess: Process = this.q[i];
                if(currentProcess.pid == pid) {
                    return currentProcess;
                }
            }
            return retVal;
        } 

        // To remove a specific process
        public removeProcess(pid: number): boolean {
            var retVal: boolean = false;
            for(var i = 0; i < this.getSize(); i++) {
                var currentProcess = this.q[i];
                if(currentProcess.pid == pid) {
                    this.q.splice(i, 1);
                    retVal = true;
                }
            }

            return retVal;
        }
    }
}
