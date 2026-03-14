import type { CompilerLogEntry } from '../../compiler/types';

const levelColors: Record<string, string> = {
  info: 'var(--accent-cyan)',
  success: 'var(--accent-green)',
  warning: 'var(--accent-amber)',
  error: 'var(--accent-red)',
};

const levelBg: Record<string, string> = {
  info: 'var(--accent-cyan-dim)',
  success: 'var(--accent-green-dim)',
  warning: 'var(--accent-amber-dim)',
  error: 'var(--accent-red-dim)',
};

export function CompilerLog({ logs }: { logs: CompilerLogEntry[] }) {
  return (
    <div className="os-panel">
      <div className="os-panel-header">
        <span>Compilation Log</span>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{logs.length}</span>
      </div>
      <div className="os-panel-body" style={{ maxHeight: 200, overflowY: 'auto', padding: 0 }}>
        {logs.length === 0 ? (
          <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-dim)' }}>No compilation output yet.</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-1.5 text-xs"
              style={{ borderBottom: '1px solid #ffffff06', background: levelBg[log.level] || 'transparent' }}>
              <span className="shrink-0 px-1.5 py-0.5 rounded text-xs font-semibold uppercase"
                style={{ background: 'var(--bg-elevated)', color: levelColors[log.level] || 'var(--text-dim)', fontSize: 10 }}>
                {log.source}
              </span>
              <span style={{ color: levelColors[log.level] || 'var(--text-secondary)' }}>
                {log.level === 'error' && 'ERROR: '}
                {log.level === 'warning' && 'WARNING: '}
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
