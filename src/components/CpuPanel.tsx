import type { OsEngine } from '../os/OsEngine';

export function CpuPanel({ engine }: { engine: OsEngine }) {
  const { cpu } = engine.getSnapshot();

  const reg = (label: string, value: string | number, color: string) => (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs font-semibold tracking-wider" style={{ color: 'var(--text-dim)' }}>{label}</span>
      <span className="text-lg font-bold tabular-nums" style={{ color }}>{String(value).toUpperCase().padStart(2, '0')}</span>
    </div>
  );

  return (
    <div className="os-panel">
      <div className="os-panel-header">
        <span>CPU</span>
        <span className={`status-dot ${cpu.isExecuting ? 'running' : 'idle'}`} />
      </div>
      <div className="os-panel-body">
        <div className="flex justify-between px-1">
          {reg('PC', cpu.PC, 'var(--accent-cyan)')}
          {reg('IR', cpu.IR, 'var(--accent-green)')}
          {reg('ACC', cpu.Acc, 'var(--accent-amber)')}
          {reg('X', cpu.Xreg, 'var(--accent-purple)')}
          {reg('Y', cpu.Yreg, 'var(--accent-purple)')}
          {reg('Z', cpu.Zflag, cpu.Zflag === '1' ? 'var(--accent-green)' : 'var(--text-secondary)')}
        </div>
      </div>
    </div>
  );
}
