import type { OsEngine } from '../os/OsEngine';
import { ProcessState } from '../os/Process';

export function PcbPanel({ engine }: { engine: OsEngine }) {
  const snap = engine.getSnapshot();

  return (
    <div className="os-panel">
      <div className="os-panel-header">
        <span>Processes</span>
        <span className="text-xs" style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>
          {snap.scheduler.algorithm} Q={snap.scheduler.quantum}
        </span>
      </div>
      <div className="os-panel-body" style={{ maxHeight: 180, padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>PID</th><th>PC</th><th>IR</th><th>ACC</th>
              <th>X</th><th>Y</th><th>Z</th><th>Pri</th><th>Loc</th><th>State</th>
            </tr>
          </thead>
          <tbody>
            {snap.processes.length === 0 ? (
              <tr><td colSpan={10} style={{ color: 'var(--text-dim)', padding: 12 }}>No processes</td></tr>
            ) : snap.processes.map(p => (
              <tr key={p.pid} style={{
                background: p.state === ProcessState.RUNNING ? 'var(--accent-green-dim)' : undefined,
              }}>
                <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{p.pid}</td>
                <td>{p.pc}</td>
                <td>{p.ir.toUpperCase()}</td>
                <td>{p.acc.toUpperCase()}</td>
                <td>{p.xFlag.toUpperCase()}</td>
                <td>{p.yFlag.toUpperCase()}</td>
                <td>{p.zFlag}</td>
                <td>{p.priority}</td>
                <td style={{ color: p.location === 0 ? 'var(--accent-cyan)' : 'var(--accent-amber)' }}>
                  {p.location === 0 ? 'RAM' : 'HD'}
                </td>
                <td style={{
                  fontWeight: 600,
                  color: p.state === ProcessState.RUNNING ? 'var(--accent-green)' :
                         p.state === ProcessState.READY ? 'var(--accent-cyan)' :
                         p.state === ProcessState.TERMINATED ? 'var(--accent-red)' :
                         'var(--text-secondary)',
                }}>{p.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
