import { useState } from 'react';
import type { OsEngine } from '../os/OsEngine';

export function MemoryPanel({ engine }: { engine: OsEngine }) {
  const [collapsed, setCollapsed] = useState(false);
  const memory = engine.getSnapshot().memory;

  const rows: { addr: string; cells: string[] }[] = [];
  for (let i = 0; i < memory.length; i += 16) {
    rows.push({
      addr: '0x' + i.toString(16).toUpperCase().padStart(3, '0'),
      cells: memory.slice(i, i + 16),
    });
  }

  return (
    <div className="os-panel">
      <div className="os-panel-header" onClick={() => setCollapsed(!collapsed)}>
        <span>Memory <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>768B</span></span>
        <span style={{ fontSize: 10 }}>{collapsed ? '▸' : '▾'}</span>
      </div>
      {!collapsed && (
        <div className="os-panel-body" style={{ maxHeight: 200, padding: 0, fontSize: 13 }}>
          <table className="data-table" style={{ fontSize: 13 }}>
            <tbody>
              {rows.map((row) => (
                <tr key={row.addr}>
                  <td style={{ textAlign: 'left', fontWeight: 700, color: 'var(--accent-cyan)', paddingLeft: 6, whiteSpace: 'nowrap' }}>
                    {row.addr}
                  </td>
                  {row.cells.map((byte, j) => (
                    <td key={j} style={{
                      color: byte !== '00' ? 'var(--accent-green)' : 'var(--text-dim)',
                      padding: '2px 3px',
                      fontWeight: byte !== '00' ? 600 : 400,
                    }}>
                      {byte.toUpperCase()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
