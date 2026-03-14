import { useState } from 'react';
import type { OsEngine } from '../os/OsEngine';

export function LogPanel({ engine }: { engine: OsEngine }) {
  const [collapsed, setCollapsed] = useState(false);
  const logs = engine.getSnapshot().logs;

  return (
    <div className="os-panel">
      <div className="os-panel-header" onClick={() => setCollapsed(!collapsed)}>
        <span>Host Log</span>
        <span style={{ fontSize: 13 }}>{collapsed ? '▸' : '▾'}</span>
      </div>
      {!collapsed && (
        <div className="os-panel-body" style={{ maxHeight: 160, padding: 4, fontSize: 13 }}>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', padding: 8, textAlign: 'center' }}>No logs yet</div>
          ) : logs.map((log, i) => (
            <div key={i} className="flex gap-2 py-0.5" style={{ borderBottom: '1px solid #ffffff04' }}>
              <span className="shrink-0 px-1 rounded text-xs font-bold"
                style={{
                  background: log.source === 'host' ? 'var(--accent-purple-dim)' : 'var(--accent-cyan-dim)',
                  color: log.source === 'host' ? 'var(--accent-purple)' : 'var(--accent-cyan)',
                }}>
                {log.source}
              </span>
              <span style={{ color: 'var(--text-dim)' }}>{log.time}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
