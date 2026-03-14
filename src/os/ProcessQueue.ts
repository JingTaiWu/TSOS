import { Queue } from './Queue';
import type { Process } from './Process';

export class ProcessQueue extends Queue<Process> {
  getProcess(pid: number): Process | undefined {
    return this.q.find(p => p.pid === pid);
  }

  removeProcess(pid: number): boolean {
    const idx = this.q.findIndex(p => p.pid === pid);
    if (idx >= 0) {
      this.q.splice(idx, 1);
      return true;
    }
    return false;
  }

  getLowPriority(): Process | null {
    if (this.isEmpty()) return null;
    let min = this.q[0];
    for (const p of this.q) {
      if (p.priority < min.priority) min = p;
    }
    this.removeProcess(min.pid);
    return min;
  }
}
