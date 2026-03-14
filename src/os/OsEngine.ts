import { Queue } from './Queue';
import { Process, ProcessState, ProcessLocation } from './Process';
import { ProcessQueue } from './ProcessQueue';
import { Interrupt, TIMER_IRQ, KEYBOARD_IRQ, INVALID_MEMORY_OP, SYSTEM_CALL_IRQ, STEP_MODE_ISR, PROCESS_EXECUTION_ISR, CONTEXT_SWITCH_ISR, DISK_OPERATION_ISR } from './Interrupt';
import { MemoryManager } from './MemoryManager';
import { HardDriveManager } from './HardDriveManager';

export type LogEntry = { source: string; message: string; time: string; clock: number };
export type TerminalWriter = (text: string) => void;

export enum Algorithm { RoundRobin, FCFS, Priority }

// ─── CPU ──────────────────────────────────────────────────────────────
class Cpu {
  PC = 0; Acc = '00'; Xreg = '00'; Yreg = '00'; Zflag = '0'; IR = '00';
  currentProcess: Process | null = null;
  isExecuting = false;

  constructor(private os: OsEngine) {}

  init() {
    this.PC = 0; this.Acc = '00'; this.Xreg = '00'; this.Yreg = '00';
    this.Zflag = '0'; this.IR = '00'; this.isExecuting = false; this.currentProcess = null;
  }

  start(pcb: Process) {
    this.currentProcess = pcb;
    this.PC = pcb.pc; this.Acc = pcb.acc; this.Xreg = pcb.xFlag;
    this.Yreg = pcb.yFlag; this.Zflag = pcb.zFlag; this.IR = pcb.ir;
    this.isExecuting = true;
  }

  stop() { this.init(); }

  updateProcess() {
    if (!this.currentProcess) return;
    const p = this.currentProcess;
    p.pc = this.PC; p.acc = this.Acc; p.ir = this.IR;
    p.xFlag = this.Xreg; p.yFlag = this.Yreg; p.zFlag = this.Zflag;
    p.state = ProcessState.RUNNING;
  }

  cycle() {
    this.os.kernel.krnTrace('CPU cycle');
    if (this.currentProcess) {
      this.updateProcess();
      const instruction = this.os.memoryManager.readByte(this.currentProcess.pc, this.currentProcess);
      this.execute(instruction);
    }
  }

  execute(instruction: string) {
    instruction = instruction.toUpperCase();
    this.IR = instruction;
    const mm = this.os.memoryManager;

    switch (instruction) {
      case 'A9': this.Acc = this.readNextByte(); this.incrementPC(2); break;
      case 'AD': {
        const addr = parseInt(this.readNextTwoBytes(), 16);
        this.Acc = mm.readByte(addr, this.currentProcess!); this.incrementPC(3); break;
      }
      case '8D': {
        const addr = parseInt(this.readNextTwoBytes(), 16);
        mm.writeByte(addr, this.Acc, this.currentProcess!); this.incrementPC(3); break;
      }
      case '6D': {
        const addr = parseInt(this.readNextTwoBytes(), 16);
        const sum = parseInt(mm.readByte(addr, this.currentProcess!), 16) + parseInt(this.Acc, 16);
        this.Acc = sum.toString(16); this.incrementPC(3); break;
      }
      case 'A2': this.Xreg = this.readNextByte(); this.incrementPC(2); break;
      case 'AE': {
        const addr = parseInt(this.readNextTwoBytes(), 16);
        this.Xreg = mm.readByte(addr, this.currentProcess!); this.incrementPC(3); break;
      }
      case 'A0': this.Yreg = this.readNextByte(); this.incrementPC(2); break;
      case 'AC': {
        const addr = parseInt(this.readNextTwoBytes(), 16);
        this.Yreg = mm.readByte(addr, this.currentProcess!); this.incrementPC(3); break;
      }
      case '00':
        this.os.interruptQueue.enqueue(new Interrupt(SYSTEM_CALL_IRQ, [0, this.currentProcess]));
        this.incrementPC(1); break;
      case 'EA': this.incrementPC(1); break;
      case 'EC': {
        const addr = parseInt(this.readNextTwoBytes(), 16);
        const byte = parseInt(mm.readByte(addr, this.currentProcess!), 16);
        this.Zflag = (byte === parseInt(this.Xreg, 16)) ? '1' : '0'; this.incrementPC(3); break;
      }
      case 'D0': {
        const n = parseInt(this.readNextByte(), 16);
        this.incrementPC(2);
        if (parseInt(this.Zflag, 16) === 0) this.incrementPC(n); break;
      }
      case 'F0': {
        const n = parseInt(this.readNextByte(), 16);
        this.incrementPC(2);
        if (parseInt(this.Zflag, 16) === 1) this.incrementPC(n); break;
      }
      case 'EE': {
        const addrStr = this.readNextTwoBytes();
        const addr = parseInt(addrStr, 16);
        let byte = parseInt(mm.readByte(addr, this.currentProcess!), 16);
        byte++;
        mm.writeByte(addr, byte.toString(16), this.currentProcess!); this.incrementPC(3); break;
      }
      case 'FF':
        this.os.interruptQueue.enqueue(new Interrupt(SYSTEM_CALL_IRQ, [1, this.currentProcess]));
        this.incrementPC(1); break;
      default:
        this.os.kernel.krnTrace('Invalid Instruction!');
        this.os.interruptQueue.enqueue(new Interrupt(SYSTEM_CALL_IRQ, [0, this.currentProcess]));
        this.incrementPC(1);
    }
    if (this.currentProcess) this.updateProcess();
  }

  incrementPC(bytes: number) {
    this.PC = (this.PC + bytes) % this.os.memoryManager.blockSize;
  }
  readNextByte(): string { return this.os.memoryManager.readByte(this.PC + 1, this.currentProcess!); }
  readNextTwoBytes(): string {
    const mm = this.os.memoryManager;
    return mm.readByte(this.PC + 2, this.currentProcess!) + mm.readByte(this.PC + 1, this.currentProcess!);
  }
}

// ─── CPU Scheduler ────────────────────────────────────────────────────
class CpuScheduler {
  readyQueue = new ProcessQueue();
  QUANTUM = 6;
  cycle = 0;
  currentProcess: Process | null = null;
  currentAlgorithm = Algorithm.RoundRobin;

  constructor(private os: OsEngine) {}

  schedule() {
    switch (this.currentAlgorithm) {
      case Algorithm.FCFS:
      case Algorithm.Priority:
        if (!this.currentProcess && this.readyQueue.getSize() > 0)
          this.os.kernel.krnInterruptHandler(CONTEXT_SWITCH_ISR, []);
        break;
      default:
        if ((!this.currentProcess && this.readyQueue.getSize() > 0) ||
            (this.cycle === this.QUANTUM && this.readyQueue.getSize() > 0))
          this.os.kernel.krnInterruptHandler(CONTEXT_SWITCH_ISR, []);
    }
  }

  getNextProcess(): Process | null { return this.readyQueue.dequeue(); }
  getLowPriorityProcess(): Process | null { return this.readyQueue.getLowPriority(); }

  setAlgorithm(alg: string): boolean {
    switch (alg) {
      case 'rr': this.currentAlgorithm = Algorithm.RoundRobin; return true;
      case 'fcfs': this.currentAlgorithm = Algorithm.FCFS; return true;
      case 'priority': this.currentAlgorithm = Algorithm.Priority; return true;
      default: return false;
    }
  }

  getAlgorithm(): string {
    switch (this.currentAlgorithm) {
      case Algorithm.FCFS: return 'FCFS';
      case Algorithm.Priority: return 'Priority';
      case Algorithm.RoundRobin: return 'Round Robin';
      default: return '404: Algorithm not found.';
    }
  }
}

// ─── Process Manager ──────────────────────────────────────────────────
class ProcessManager {
  residentQueue = new ProcessQueue();
  lastPid = 0;

  constructor(private os: OsEngine) {}

  addProcess(program: string[], priority?: number): Process | null {
    const process = new Process();
    process.pid = this.lastPid++;
    process.priority = (priority === undefined || isNaN(priority))
      ? Math.floor(Math.random() * (100 - 10 + 1) + 10)
      : priority;

    if (this.os.memoryManager.allocate(process, program)) {
      this.residentQueue.enqueue(process);
      return process;
    }
    return null;
  }

  removeProcess(process: Process): boolean {
    if (process) {
      this.os.memoryManager.deallocate(process);
      return this.residentQueue.removeProcess(process.pid);
    }
    return false;
  }

  execute(process: Process) {
    this.os.kernel.krnInterruptHandler(PROCESS_EXECUTION_ISR, [process]);
  }
}

// ─── Keyboard Driver ──────────────────────────────────────────────────
// Now handled by xterm.js — we inject characters directly into the input queue

// ─── Kernel ───────────────────────────────────────────────────────────
class Kernel {
  constructor(private os: OsEngine) {}

  krnBootstrap() {
    this.hostLog('bootstrap', 'host');
    this.os.interruptQueue = new Queue<Interrupt>();
    this.os.inputQueue = new Queue<string>();
    this.krnTrace('Creating and Launching the shell.');
    this.os.shell.init();
    this.os.hardDriveManager.initialize();
    this.os.emitUpdate();
  }

  krnShutdown() {
    this.krnTrace('begin shutdown OS');
    this.krnTrace('end shutdown OS');
  }

  krnOnCPUClockPulse() {
    if (this.os.interruptQueue.getSize() > 0) {
      const interrupt = this.os.interruptQueue.dequeue()!;
      this.krnInterruptHandler(interrupt.irq, interrupt.params);
    } else if (this.os.cpu.isExecuting && !this.os.stepMode) {
      this.os.scheduler.schedule();
      this.os.scheduler.cycle++;
      this.os.cpu.cycle();
      this.os.emitUpdate();
    } else {
      // Idle
    }
    this.os.scheduler.schedule();
  }

  krnInterruptHandler(irq: number, params: any[]) {
    this.krnTrace('Handling IRQ~' + irq);
    switch (irq) {
      case TIMER_IRQ: break;
      case KEYBOARD_IRQ: break; // Handled by xterm
      case INVALID_MEMORY_OP: this.invalidMemoryOp(params); break;
      case SYSTEM_CALL_IRQ: this.systemCallISR(params); break;
      case STEP_MODE_ISR: this.stepISR(); break;
      case PROCESS_EXECUTION_ISR: this.processExecutionISR(params); break;
      case CONTEXT_SWITCH_ISR: this.contextSwitchISR(params); break;
      case DISK_OPERATION_ISR: this.hardDriveIsr(params); break;
      default:
        this.krnTrapError('Invalid Interrupt Request. irq=' + irq);
    }
  }

  invalidMemoryOp(params: any[]) {
    const process = params[0] as Process;
    this.systemCallISR([0, process]);
    this.os.scheduler.schedule();
    this.krnTrace('Invalid memory operation from process ' + process.pid + '.');
    this.os.emitUpdate();
  }

  processExecutionISR(params: any[]) {
    const process = params[0] as Process;
    process.state = ProcessState.READY;
    this.os.scheduler.readyQueue.enqueue(process);
  }

  contextSwitchISR(_params: any[]) {
    this.krnTrace('Performing a context switch.');
    const lastProcess = this.os.scheduler.currentProcess;
    if (lastProcess) {
      this.os.cpu.stop();
      lastProcess.state = ProcessState.READY;
      this.os.scheduler.readyQueue.enqueue(lastProcess);
    }

    // Get next process
    if (this.os.scheduler.currentAlgorithm === Algorithm.Priority) {
      this.os.scheduler.currentProcess = this.os.scheduler.getLowPriorityProcess();
    } else {
      this.os.scheduler.currentProcess = this.os.scheduler.getNextProcess();
    }

    const nextProcess = this.os.scheduler.currentProcess;
    if (!nextProcess) return;

    // Handle hard drive swap
    if (nextProcess.location === ProcessLocation.IN_HARD_DRIVE) {
      const currentFilename = '.Process' + nextProcess.pid;
      const fullProgramString = this.os.hardDriveManager.readFile(currentFilename, true);
      if (fullProgramString) {
        const currentProcessString = (fullProgramString.match(/.{1,2}/g) || []).slice(0, this.os.memoryManager.blockSize);
        if (!lastProcess) {
          this.os.memoryManager.allocate(nextProcess, currentProcessString);
        } else {
          const lastProcessString = this.os.memoryManager.readAllBytes(lastProcess);
          this.os.hardDriveManager.writeSwapFile(lastProcessString, lastProcess.pid);
          lastProcess.location = ProcessLocation.IN_HARD_DRIVE;
          this.os.memoryManager.deallocate(lastProcess);
          this.os.hardDriveManager.deleteSwapFile(currentFilename);
          this.os.memoryManager.allocate(nextProcess, currentProcessString);
        }
      }
    }

    nextProcess.state = ProcessState.RUNNING;
    this.os.scheduler.cycle = 0;
    this.os.cpu.start(nextProcess);
    this.os.emitUpdate();
  }

  stepISR() {
    this.os.scheduler.schedule();
    this.os.scheduler.cycle++;
    this.os.cpu.cycle();
    this.os.emitUpdate();
  }

  systemCallISR(params: any[]) {
    const callId = params[0];
    const param = params[1] as Process;

    if (callId === 0) {
      // Terminate process
      param.state = ProcessState.TERMINATED;
      this.os.processManager.removeProcess(param);
      if (this.os.scheduler.currentProcess?.pid === param.pid) {
        this.os.scheduler.currentProcess = null;
        this.os.scheduler.cycle = 0;
        this.os.cpu.stop();
      } else {
        // Clean up ready queue
        const size = this.os.scheduler.readyQueue.getSize();
        for (let i = 0; i < size; i++) {
          const p = this.os.scheduler.readyQueue.dequeue()!;
          if (p.pid !== param.pid) this.os.scheduler.readyQueue.enqueue(p);
        }
      }
      this.os.hardDriveManager.deleteSwapFile('.Process' + param.pid);
      this.os.emitUpdate();
    } else if (callId === 1) {
      // System output
      const xFlag = parseInt(param.xFlag, 16);
      const yFlag = parseInt(param.yFlag, 16);
      if (xFlag === 1) {
        this.os.writeTerminal(yFlag + '\r\n');
        this.os.shell.putPrompt();
      } else if (xFlag === 2) {
        let location = yFlag;
        let output = '';
        let currentByte = this.os.memoryManager.readByte(location, param);
        while (currentByte !== '00') {
          output += String.fromCharCode(parseInt(currentByte, 16));
          location++;
          currentByte = this.os.memoryManager.readByte(location, param);
        }
        this.os.writeTerminal(output + '\r\n');
        this.os.shell.putPrompt();
      }
    }
  }

  hardDriveIsr(params: any[]) {
    const operation = params[0];
    const filename = params[1];
    const data = params[2];
    const hdm = this.os.hardDriveManager;

    switch (operation) {
      case 'create':
        this.os.writeTerminal(hdm.createFile(filename) ? 'New File: ' + filename : 'Failed to create new file.');
        break;
      case 'write':
        this.os.writeTerminal(hdm.writeFile(filename, data) ? 'Success!' : 'Failed to write new file.');
        break;
      case 'delete':
        this.os.writeTerminal(hdm.deleteFile(filename) ? 'Success!' : 'Failed to delete file.');
        break;
      case 'read': {
        const content = hdm.readFile(filename, false);
        this.os.writeTerminal(content || 'Failed to read file.');
        break;
      }
      case 'ls': {
        const ls = hdm.getFileLs();
        this.os.writeTerminal(ls.length > 0 ? ls.join('\r\n') : 'No files found.');
        break;
      }
      case 'format':
        if (this.os.cpu.isExecuting) {
          this.os.writeTerminal('Cannot format hard drive right now.');
        } else {
          hdm.initialize();
          this.os.writeTerminal('Success.');
        }
        break;
    }
    this.os.emitUpdate();
  }

  krnTrace(msg: string) {
    if (this.os.trace) this.hostLog(msg, 'OS');
  }

  krnTrapError(msg: string) {
    this.hostLog('OS ERROR - TRAP: ' + msg, 'OS');
    this.os.writeTerminal('\r\n\x1b[41m\x1b[37m SYSTEM ERROR: ' + msg + ' \x1b[0m\r\n');
    this.krnShutdown();
    this.os.stop();
  }

  hostLog(msg: string, source = '?') {
    const entry: LogEntry = {
      source,
      message: msg,
      time: new Date().toLocaleTimeString(),
      clock: this.os.clock,
    };
    this.os.logs.unshift(entry);
    if (this.os.logs.length > 200) this.os.logs.pop();
    this.os.emitUpdate();
  }
}

// ─── Shell ────────────────────────────────────────────────────────────
class Shell {
  promptStr = '> ';
  commandList: { command: string; description: string; func: (args: string[]) => void }[] = [];
  history: string[] = [];
  cursor = -1;
  buffer = '';
  sarcasticMode = false;

  constructor(private os: OsEngine) {}

  init() {
    const cmd = (name: string, desc: string, fn: (args: string[]) => void) => {
      this.commandList.push({ command: name, description: desc, func: fn });
    };

    cmd('ver', 'Displays the current version', (a) => this.shellVer(a));
    cmd('help', 'Lists all commands', (a) => this.shellHelp(a));
    cmd('shutdown', 'Shuts down the OS', (a) => this.shellShutdown(a));
    cmd('cls', 'Clears the screen', (a) => this.shellCls(a));
    cmd('man', '<topic> - Manual page', (a) => this.shellMan(a));
    cmd('trace', '<on|off> - Toggle OS trace', (a) => this.shellTrace(a));
    cmd('rot13', '<string> - ROT13 cipher', (a) => this.shellRot13(a));
    cmd('prompt', '<string> - Set prompt', (a) => this.shellPrompt(a));
    cmd('date', 'Display date/time', (a) => this.shellDate(a));
    cmd('whereami', 'Display a random location', (a) => this.shellWhereAmI(a));
    cmd('status', '<string> - Set status message', (a) => this.shellStatus(a));
    cmd('load', '[priority] - Load user program', (a) => this.shellLoad(a));
    cmd('run', '<pid> - Run a process', (a) => this.shellRun(a));
    cmd('runall', 'Run all loaded processes', (a) => this.shellRunAll(a));
    cmd('ps', 'List running processes', (a) => this.shellPs(a));
    cmd('kill', '<pid> - Kill a process', (a) => this.shellKill(a));
    cmd('clearmem', 'Clear all memory', (a) => this.shellClearmem(a));
    cmd('quantum', '<int> - Set RR quantum', (a) => this.shellQuantum(a));
    cmd('setschedule', '<rr|fcfs|priority>', (a) => this.shellSetSchedule(a));
    cmd('getschedule', 'Get current algorithm', (a) => this.shellGetSchedule(a));
    cmd('create', '<filename> - Create file', (a) => this.shellCreate(a));
    cmd('write', '<filename> "data" - Write file', (a) => this.shellWrite(a));
    cmd('read', '<filename> - Read file', (a) => this.shellRead(a));
    cmd('delete', '<filename> - Delete file', (a) => this.shellDelete(a));
    cmd('ls', 'List all files', (a) => this.shellLs(a));
    cmd('format', 'Format hard drive', (a) => this.shellFormat(a));
    cmd('bsod', 'Trigger BSOD', (a) => this.shellBsod(a));

    this.putPrompt();
  }

  putPrompt() {
    this.os.writeTerminal('\x1b[36m' + this.promptStr + '\x1b[0m');
  }

  handleInput(buffer: string) {
    this.os.kernel.krnTrace('Shell Command~' + buffer);
    const trimmed = buffer.trim();
    if (!trimmed) { this.putPrompt(); return; }

    const parts = trimmed.split(' ');
    const cmd = parts.shift()!.toLowerCase();
    const args = parts;

    const found = this.commandList.find(c => c.command === cmd);
    if (found) {
      found.func(args);
    } else {
      const rot13 = (s: string) => s.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
      });
      const curses = '[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]';
      if (curses.indexOf('[' + rot13(cmd) + ']') >= 0) {
        this.os.writeTerminal("Oh, so that's how it's going to be, eh? Fine.\r\nBitch.\r\n");
        this.sarcasticMode = true;
      } else if (cmd === 'sorry') {
        this.os.writeTerminal(this.sarcasticMode ? 'Okay. I forgive you. This time.\r\n' : 'For what?\r\n');
        this.sarcasticMode = false;
      } else {
        this.os.writeTerminal('Invalid Command. ' + (this.sarcasticMode
          ? 'Duh. Go back to your Speak & Spell.\r\n'
          : "Type 'help' for, well... help.\r\n"));
      }
    }

    this.history.push(trimmed);
    this.cursor = this.history.length;
    this.putPrompt();
  }

  // ─── Command implementations ─────────────────────────────
  shellVer(_a: string[]) { this.os.writeTerminal('\x1b[33mJingle OS\x1b[0m v42\r\n'); }

  shellHelp(_a: string[]) {
    this.os.writeTerminal('\x1b[1m\x1b[36mAvailable Commands:\x1b[0m\r\n');
    for (const c of this.commandList) {
      this.os.writeTerminal(`  \x1b[32m${c.command.padEnd(14)}\x1b[0m ${c.description}\r\n`);
    }
  }

  shellShutdown(_a: string[]) {
    this.os.writeTerminal('Shutting down...\r\n');
    this.os.stop();
  }

  shellCls(_a: string[]) { this.os.writeTerminal('\x1bc'); }

  shellMan(args: string[]) {
    if (args.length > 0) {
      const cmd = this.commandList.find(c => c.command === args[0]);
      if (cmd) {
        this.os.writeTerminal(`\x1b[1m${cmd.command}\x1b[0m - ${cmd.description}\r\n`);
      } else {
        this.os.writeTerminal('No manual entry for ' + args[0] + '.\r\n');
      }
    } else {
      this.os.writeTerminal('Usage: man <topic>\r\n');
    }
  }

  shellTrace(args: string[]) {
    if (args[0] === 'on') { this.os.trace = true; this.os.writeTerminal('Trace \x1b[32mON\x1b[0m\r\n'); }
    else if (args[0] === 'off') { this.os.trace = false; this.os.writeTerminal('Trace \x1b[31mOFF\x1b[0m\r\n'); }
    else this.os.writeTerminal('Usage: trace <on|off>\r\n');
  }

  shellRot13(args: string[]) {
    if (args.length > 0) {
      const input = args.join(' ');
      const result = input.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
      });
      this.os.writeTerminal(input + " = '" + result + "'\r\n");
    } else {
      this.os.writeTerminal('Usage: rot13 <string>\r\n');
    }
  }

  shellPrompt(args: string[]) {
    if (args.length > 0) this.promptStr = args[0] + ' ';
    else this.os.writeTerminal('Usage: prompt <string>\r\n');
  }

  shellDate(_a: string[]) {
    this.os.writeTerminal(new Date().toLocaleString() + '\r\n');
  }

  shellWhereAmI(_a: string[]) {
    const locs = ['China', 'Taiwan', 'The United States', 'England', 'Mars', "Doge's planet", "Summoner's Rift"];
    this.os.writeTerminal('You are currently at ' + locs[Math.floor(Math.random() * locs.length)] + '.\r\n');
  }

  shellStatus(args: string[]) {
    if (args.length > 0) {
      this.os.statusMessage = args.join(' ');
      this.os.writeTerminal('Status updated.\r\n');
      this.os.emitUpdate();
    } else {
      this.os.writeTerminal('Usage: status <string>\r\n');
    }
  }

  shellLoad(args: string[]) {
    const input = this.os.userProgram.trim();
    if (!input) { this.os.writeTerminal('\x1b[31mPlease enter a program first!\x1b[0m\r\n'); return; }

    const parts = input.split(/\s+/);
    const regEx = /^[a-f0-9]{2}$/i;
    for (const part of parts) {
      if (!regEx.test(part)) {
        this.os.writeTerminal('\x1b[31mInvalid program. Check your hex codes.\x1b[0m\r\n');
        return;
      }
    }

    const priority = args[0] !== undefined ? parseInt(args[0], 10) : undefined;
    const process = this.os.processManager.addProcess(parts, priority);
    if (process) {
      this.os.writeTerminal('\x1b[32mProcess loaded\x1b[0m - PID: \x1b[33m' + process.pid + '\x1b[0m\r\n');
    } else {
      this.os.writeTerminal('\x1b[31mCannot add process. Memory full.\x1b[0m\r\n');
    }
  }

  shellRun(args: string[]) {
    if (args.length <= 0) { this.os.writeTerminal('Please give me a process id to run.\r\n'); return; }
    const pid = parseInt(args[0], 10);
    const process = this.os.processManager.residentQueue.getProcess(pid);
    if (!process) { this.os.writeTerminal('Process not found.\r\n'); return; }
    if (process.state !== ProcessState.TERMINATED) {
      this.os.processManager.execute(process);
    } else {
      this.os.writeTerminal('Process was terminated.\r\n');
    }
  }

  shellRunAll(_a: string[]) {
    for (let i = 0; i < this.os.processManager.residentQueue.getSize(); i++) {
      this.os.processManager.execute(this.os.processManager.residentQueue.q[i]);
    }
    this.os.writeTerminal('\x1b[32mAll processes queued.\x1b[0m\r\n');
  }

  shellPs(_a: string[]) {
    const q = this.os.scheduler.readyQueue;
    const cp = this.os.scheduler.currentProcess;
    if (q.isEmpty() && !cp) { this.os.writeTerminal('No running processes.\r\n'); return; }

    this.os.writeTerminal('\x1b[1mPID  PC   IR   ACC  X    Y    Z\x1b[0m\r\n');
    if (cp) {
      this.os.writeTerminal(`\x1b[32m${String(cp.pid).padEnd(5)}${String(cp.pc).padEnd(5)}${cp.ir.padEnd(5)}${cp.acc.padEnd(5)}${cp.xFlag.padEnd(5)}${cp.yFlag.padEnd(5)}${cp.zFlag}\x1b[0m\r\n`);
    }
    for (const p of q.q) {
      this.os.writeTerminal(`${String(p.pid).padEnd(5)}${String(p.pc).padEnd(5)}${p.ir.padEnd(5)}${p.acc.padEnd(5)}${p.xFlag.padEnd(5)}${p.yFlag.padEnd(5)}${p.zFlag}\r\n`);
    }
  }

  shellKill(args: string[]) {
    if (args.length === 0) { this.os.writeTerminal('Give me a process to kill.\r\n'); return; }
    const pid = parseInt(args[0], 10);
    const cp = this.os.scheduler.currentProcess;
    if (cp && cp.pid === pid) {
      this.os.kernel.krnInterruptHandler(SYSTEM_CALL_IRQ, [0, cp]);
      this.os.writeTerminal(`Process ${pid} terminated.\r\n`);
      return;
    }
    const removed = this.os.scheduler.readyQueue.removeProcess(pid);
    const resident = this.os.processManager.residentQueue.getProcess(pid);
    if (resident) this.os.processManager.removeProcess(resident);
    if (removed || resident) this.os.writeTerminal(`Process ${pid} removed.\r\n`);
    else this.os.writeTerminal('Process not found.\r\n');
  }

  shellClearmem(_a: string[]) {
    if (!this.os.cpu.isExecuting) {
      this.os.memoryManager.resetMemory();
      this.os.writeTerminal('\x1b[32mMemory cleared.\x1b[0m\r\n');
    } else {
      this.os.writeTerminal('\x1b[31mWait for CPU to stop executing!\x1b[0m\r\n');
    }
  }

  shellQuantum(args: string[]) {
    if (args.length > 0 && parseInt(args[0], 10) > 0) {
      this.os.scheduler.QUANTUM = parseInt(args[0], 10);
      this.os.writeTerminal('Quantum set to \x1b[33m' + this.os.scheduler.QUANTUM + '\x1b[0m\r\n');
    } else {
      this.os.writeTerminal('Usage: quantum <positive number>\r\n');
    }
  }

  shellSetSchedule(args: string[]) {
    if (args.length > 0 && this.os.scheduler.setAlgorithm(args[0].toLowerCase())) {
      this.os.writeTerminal('Algorithm set to \x1b[33m' + args[0] + '\x1b[0m\r\n');
      this.os.emitUpdate();
    } else {
      this.os.writeTerminal('Usage: setschedule <rr|fcfs|priority>\r\n');
    }
  }

  shellGetSchedule(_a: string[]) {
    this.os.writeTerminal('Current: \x1b[33m' + this.os.scheduler.getAlgorithm() + '\x1b[0m\r\n');
  }

  shellCreate(args: string[]) {
    if (args.length === 0) { this.os.writeTerminal('Provide a filename.\r\n'); return; }
    this.os.kernel.krnInterruptHandler(DISK_OPERATION_ISR, ['create', args[0]]);
    this.os.writeTerminal('\r\n');
  }

  shellWrite(args: string[]) {
    if (args.length < 2) { this.os.writeTerminal('Usage: write <filename> "data"\r\n'); return; }
    const filename = args[0];
    const data = args.slice(1).join(' ');
    if (data.charAt(0) !== '"' || data.charAt(data.length - 1) !== '"') {
      this.os.writeTerminal('Please wrap data in quotes.\r\n'); return;
    }
    this.os.kernel.krnInterruptHandler(DISK_OPERATION_ISR, ['write', filename, data]);
    this.os.writeTerminal('\r\n');
  }

  shellRead(args: string[]) {
    if (args.length === 0) { this.os.writeTerminal('Provide a filename.\r\n'); return; }
    this.os.kernel.krnInterruptHandler(DISK_OPERATION_ISR, ['read', args[0]]);
    this.os.writeTerminal('\r\n');
  }

  shellDelete(args: string[]) {
    if (args.length === 0) { this.os.writeTerminal('Provide a filename.\r\n'); return; }
    this.os.kernel.krnInterruptHandler(DISK_OPERATION_ISR, ['delete', args[0]]);
    this.os.writeTerminal('\r\n');
  }

  shellLs(_a: string[]) {
    this.os.kernel.krnInterruptHandler(DISK_OPERATION_ISR, ['ls']);
    this.os.writeTerminal('\r\n');
  }

  shellFormat(_a: string[]) {
    this.os.kernel.krnInterruptHandler(DISK_OPERATION_ISR, ['format']);
    this.os.writeTerminal('\r\n');
  }

  shellBsod(_a: string[]) {
    this.os.kernel.krnTrapError('User-triggered BSOD');
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Main OS Engine - orchestrates all components
// ═══════════════════════════════════════════════════════════════════════
export class OsEngine {
  cpu: Cpu;
  kernel: Kernel;
  scheduler: CpuScheduler;
  processManager: ProcessManager;
  memoryManager: MemoryManager;
  hardDriveManager: HardDriveManager;
  shell: Shell;

  interruptQueue = new Queue<Interrupt>();
  inputQueue = new Queue<string>();

  logs: LogEntry[] = [];
  clock = 0;
  trace = true;
  stepMode = false;
  running = false;
  statusMessage = 'Welcome to Jingle OS';
  userProgram = '';

  private clockIntervalId: ReturnType<typeof setInterval> | null = null;
  private terminalWriter: TerminalWriter | null = null;
  private updateListeners: Set<() => void> = new Set();

  constructor() {
    this.cpu = new Cpu(this);
    this.kernel = new Kernel(this);
    this.scheduler = new CpuScheduler(this);
    this.processManager = new ProcessManager(this);
    this.memoryManager = new MemoryManager(this);
    this.hardDriveManager = new HardDriveManager();
    this.hardDriveManager.os_blockSize = this.memoryManager.blockSize;
    this.shell = new Shell(this);
  }

  setTerminalWriter(writer: TerminalWriter) { this.terminalWriter = writer; }
  writeTerminal(text: string) { this.terminalWriter?.(text); }

  onUpdate(listener: () => void) {
    this.updateListeners.add(listener);
    return () => { this.updateListeners.delete(listener); };
  }

  emitUpdate() {
    for (const fn of this.updateListeners) fn();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.cpu.init();
    this.clock = 0;

    this.writeTerminal('\x1bc'); // clear
    this.writeTerminal('\x1b[36m');
    this.writeTerminal('   ╔═══════════════════════════════════╗\r\n');
    this.writeTerminal('   ║     🔔  J I N G L E   O S  🔔    ║\r\n');
    this.writeTerminal('   ║         Version 42  (Modern)      ║\r\n');
    this.writeTerminal('   ╚═══════════════════════════════════╝\r\n');
    this.writeTerminal('\x1b[0m\r\n');

    this.kernel.krnBootstrap();

    this.clockIntervalId = setInterval(() => {
      this.clock++;
      this.kernel.krnOnCPUClockPulse();
    }, 30);

    this.emitUpdate();
  }

  stop() {
    if (this.clockIntervalId) {
      clearInterval(this.clockIntervalId);
      this.clockIntervalId = null;
    }
    this.running = false;
    this.kernel.krnShutdown();
    this.emitUpdate();
  }

  reset() {
    this.stop();
    this.cpu = new Cpu(this);
    this.scheduler = new CpuScheduler(this);
    this.processManager = new ProcessManager(this);
    this.memoryManager = new MemoryManager(this);
    this.hardDriveManager = new HardDriveManager();
    this.hardDriveManager.os_blockSize = this.memoryManager.blockSize;
    this.shell = new Shell(this);
    this.interruptQueue = new Queue<Interrupt>();
    this.inputQueue = new Queue<string>();
    this.logs = [];
    this.clock = 0;
    this.stepMode = false;
    this.statusMessage = 'Welcome to Jingle OS';
    this.emitUpdate();
  }

  handleTerminalInput(data: string) {
    if (!this.running) return;
    this.shell.handleInput(data);
  }

  nextStep() {
    if (this.stepMode && this.running) {
      this.interruptQueue.enqueue(new Interrupt(STEP_MODE_ISR, []));
    }
  }

  // Snapshot for React state
  getSnapshot() {
    return {
      running: this.running,
      stepMode: this.stepMode,
      clock: this.clock,
      statusMessage: this.statusMessage,
      cpu: {
        PC: this.cpu.PC, IR: this.cpu.IR, Acc: this.cpu.Acc,
        Xreg: this.cpu.Xreg, Yreg: this.cpu.Yreg, Zflag: this.cpu.Zflag,
        isExecuting: this.cpu.isExecuting,
      },
      scheduler: {
        algorithm: this.scheduler.getAlgorithm(),
        quantum: this.scheduler.QUANTUM,
        currentProcess: this.scheduler.currentProcess,
        readyQueue: [...this.scheduler.readyQueue.q],
      },
      memory: this.memoryManager.memory.map(b => b.byte),
      processes: this.getProcessList(),
      logs: this.logs.slice(0, 50),
    };
  }

  getProcessList(): Process[] {
    const list: Process[] = [];
    const seen = new Set<number>();
    if (this.scheduler.currentProcess) {
      list.push(this.scheduler.currentProcess);
      seen.add(this.scheduler.currentProcess.pid);
    }
    for (const p of this.scheduler.readyQueue.q) {
      if (!seen.has(p.pid)) { list.push(p); seen.add(p.pid); }
    }
    for (const p of this.processManager.residentQueue.q) {
      if (!seen.has(p.pid)) { list.push(p); seen.add(p.pid); }
    }
    return list.sort((a, b) => a.pid - b.pid);
  }

  getHardDriveData(): { tsb: string; used: string; link: string; data: string }[] {
    const result: { tsb: string; used: string; link: string; data: string }[] = [];
    const hdm = this.hardDriveManager;
    for (let t = 0; t < hdm.TRACKS; t++) {
      for (let s = 0; s < hdm.SECTORS; s++) {
        for (let b = 0; b < hdm.BLOCKS; b++) {
          const raw = hdm.read(t, s, b);
          result.push({
            tsb: `${t}${s}${b}`,
            used: raw.slice(0, 1),
            link: raw.slice(1, hdm.HEADER_LENGTH),
            data: raw.slice(hdm.HEADER_LENGTH),
          });
        }
      }
    }
    return result;
  }
}
