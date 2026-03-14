interface TokenEntry {
  index: number;
  kind: string;
  value: string;
}

export function TokenTable({ tokens }: { tokens: TokenEntry[] }) {
  return (
    <div className="os-panel">
      <div className="os-panel-header">
        <span>Tokens</span>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{tokens.length}</span>
      </div>
      <div className="os-panel-body" style={{ maxHeight: 180, overflowY: 'auto', padding: 0 }}>
        {tokens.length === 0 ? (
          <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-dim)' }}>No tokens generated.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Value</th></tr>
            </thead>
            <tbody>
              {tokens.map(t => (
                <tr key={t.index}>
                  <td style={{ color: 'var(--text-dim)' }}>{t.index}</td>
                  <td style={{ color: 'var(--accent-cyan)', fontSize: 11 }}>{t.kind}</td>
                  <td style={{ color: 'var(--accent-green)' }}>{t.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
