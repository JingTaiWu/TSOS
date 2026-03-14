import { Byte, Memory } from './Memory';
import { Process, ProcessLocation } from './Process';
import type { OsEngine } from './OsEngine';

export enum MEMORY_STATUS { AVAILABLE, UNAVAILABLE }

export class MemoryManager {
  public memorySize = 768;
  public blockSize = 256;
  public numberOfBlocks = 3;
  public memory: Byte[];
  public availableBlocks: MEMORY_STATUS[] = [];

  constructor(private os: OsEngine) {
    const mem = new Memory(this.memorySize);
    this.memory = mem.bytes;
    for (let i = 0; i < this.numberOfBlocks; i++) {
      this.availableBlocks[i] = MEMORY_STATUS.AVAILABLE;
    }
  }

  allocate(process: Process, program: string[]): boolean {
    for (let i = 0; i < this.numberOfBlocks; i++) {
      if (this.availableBlocks[i] === MEMORY_STATUS.AVAILABLE) {
        process.base = i * this.blockSize;
        process.limit = process.base + this.blockSize;
        process.blockNumber = i;
        process.location = ProcessLocation.IN_RAM;

        for (let k = process.base; k < process.limit; k++) {
          this.memory[k] = new Byte('00');
        }
        for (let j = 0; j < program.length; j++) {
          const location = process.base + j;
          if (location < process.limit) {
            this.memory[location] = new Byte(program[j]);
          } else {
            this.os.kernel.krnInterruptHandler(2, [process]);
            return false;
          }
        }
        this.availableBlocks[i] = MEMORY_STATUS.UNAVAILABLE;
        this.os.emitUpdate();
        return true;
      }
    }

    // Try hard drive swap
    if (this.os.hardDriveManager.writeSwapFile(program, process.pid)) {
      process.location = ProcessLocation.IN_HARD_DRIVE;
      this.os.emitUpdate();
      return true;
    }
    return false;
  }

  deallocate(process: Process): void {
    if (process) {
      this.availableBlocks[process.blockNumber] = MEMORY_STATUS.AVAILABLE;
    }
  }

  resetMemory(): void {
    const newMem = new Memory(this.memorySize);
    this.memory = newMem.bytes;
    this.os.emitUpdate();
  }

  readByte(location: number, process: Process): string {
    location = location + process.base;
    if (location < process.limit && location >= process.base) {
      return this.memory[location].byte;
    } else {
      this.os.kernel.krnInterruptHandler(2, [process]);
      return '00';
    }
  }

  writeByte(location: number, byte: string, process: Process): void {
    location = location + process.base;
    if (byte.length < 2) byte = '0' + byte;
    if (location < process.limit && location >= process.base) {
      this.memory[location] = new Byte(byte);
    } else {
      this.os.kernel.krnInterruptHandler(2, [process]);
    }
  }

  readAllBytes(process: Process): string[] {
    const result: string[] = [];
    for (let i = 0; i < this.blockSize; i++) {
      result.push(this.readByte(i, process));
    }
    return result;
  }
}
