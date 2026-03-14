export enum ProcessLocation { IN_RAM, IN_HARD_DRIVE }

export enum ProcessState {
  RUNNING = 'Running',
  RESIDENT = 'Resident',
  TERMINATED = 'Terminated',
  READY = 'Ready',
  WAITING = 'Waiting',
}

export class Process {
  public pid: number = 0;
  public pc: number = 0;
  public acc: string = '00';
  public ir: string = '00';
  public xFlag: string = '00';
  public yFlag: string = '00';
  public zFlag: string = '0';
  public location: ProcessLocation = ProcessLocation.IN_RAM;
  public base: number = 0;
  public limit: number = 0;
  public state: ProcessState = ProcessState.RESIDENT;
  public blockNumber: number = 0;
  public priority: number = 0;
}
