interface SymbolEntry {
  type: string;
  name: string;
  scope: number;
  line: number;
}

export function SymbolTablePanel({ symbols }: { symbols: SymbolEntry[] | null }) {
  return (
    <div className="os-panel">
      <div className="os-panel-header">
        <span>Symbol Table</span>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{symbols?.length ?? 0}</span>
      </div>
      <div className="os-panel-body" style={{ maxHeight: 160, overflowY: 'auto', padding: 0 }}>
        {!symbols || symbols.length === 0 ? (
          <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-dim)' }}>No symbols.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Type</th><th>Name</th><th>Scope</th><th>Line</th></tr>
            </thead>
            <tbody>
              {symbols.map((s, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--accent-purple)' }}>{s.type}</td>
                  <td style={{ color: 'var(--accent-green)' }}>{s.name}</td>
                  <td style={{ color: 'var(--accent-cyan)' }}>{s.scope}</td>
                  <td style={{ color: 'var(--text-dim)' }}>{s.line}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
