export class Interrupt {
  constructor(public irq: number, public params: any[]) {}
}

// IRQ constants
export const TIMER_IRQ = 0;
export const KEYBOARD_IRQ = 1;
export const INVALID_MEMORY_OP = 2;
export const SYSTEM_CALL_IRQ = 3;
export const STEP_MODE_ISR = 4;
export const PROCESS_EXECUTION_ISR = 5;
export const CONTEXT_SWITCH_ISR = 6;
export const DISK_OPERATION_ISR = 7;
