import { useState } from 'react';
import type { OsEngine } from '../os/OsEngine';

export function HardDrivePanel({ engine }: { engine: OsEngine }) {
  const [collapsed, setCollapsed] = useState(false);
  const data = engine.getHardDriveData();

  return (
    <div className="os-panel">
      <div className="os-panel-header" onClick={() => setCollapsed(!collapsed)}>
        <span>Hard Drive <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>4×8×8</span></span>
        <span style={{ fontSize: 10 }}>{collapsed ? '▸' : '▾'}</span>
      </div>
      {!collapsed && (
        <div className="os-panel-body" style={{ maxHeight: 180, padding: 0, fontSize: 13 }}>
          <table className="data-table" style={{ fontSize: 13 }}>
            <thead>
              <tr><th>TSB</th><th>U</th><th>Link</th><th style={{ textAlign: 'left' }}>Data</th></tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.tsb}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{row.tsb}</td>
                  <td style={{
                    color: row.used === '1' ? 'var(--accent-red)' :
                           row.used === '2' ? 'var(--accent-amber)' : 'var(--accent-green)',
                    fontWeight: 600,
                  }}>{row.used}</td>
                  <td style={{ color: row.link !== '000' ? 'var(--accent-purple)' : 'var(--text-dim)' }}>{row.link}</td>
                  <td style={{
                    textAlign: 'left',
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--text-dim)',
                  }}>{row.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
