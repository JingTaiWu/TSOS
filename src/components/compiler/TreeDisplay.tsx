interface TreeNode {
  name: string;
  isLeaf: boolean;
  children: TreeNode[];
}

function TreeRow({ node, depth }: { node: TreeNode; depth: number }) {
  const indent = depth * 16;

  return (
    <>
      <div className="flex items-center text-xs py-0.5" style={{ paddingLeft: indent }}>
        {depth > 0 && (
          <span className="mr-1" style={{ color: 'var(--text-dim)' }}>-</span>
        )}
        <span className="px-1.5 py-0.5 rounded text-xs"
          style={{
            background: node.isLeaf ? 'var(--accent-green-dim)' : 'var(--accent-cyan-dim)',
            color: node.isLeaf ? 'var(--accent-green)' : 'var(--accent-cyan)',
            fontSize: 11,
          }}>
          {node.isLeaf ? `[${node.name}]` : `<${node.name}>`}
        </span>
      </div>
      {node.children.map((child, i) => (
        <TreeRow key={i} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

export function TreeDisplay({ root, label }: { root: TreeNode | null; label: string }) {
  return (
    <div className="os-panel">
      <div className="os-panel-header">
        <span>{label}</span>
      </div>
      <div className="os-panel-body" style={{ maxHeight: 200, overflowY: 'auto', padding: '4px 8px' }}>
        {!root ? (
          <div className="text-xs" style={{ color: 'var(--text-dim)' }}>No tree generated.</div>
        ) : (
          <TreeRow node={root} depth={0} />
        )}
      </div>
    </div>
  );
}
