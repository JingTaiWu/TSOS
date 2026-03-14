import { useState, useCallback } from 'react';
import type { CompilerEngine } from '../../compiler/CompilerEngine';
import type { OsEngine } from '../../os/OsEngine';
import { CodeEditor } from './CodeEditor';
import { CompilerToolbar } from './CompilerToolbar';
import { CompilerLog } from './CompilerLog';
import { TokenTable } from './TokenTable';
import { SymbolTablePanel } from './SymbolTablePanel';
import { TreeDisplay } from './TreeDisplay';
import { HexOutput } from './HexOutput';

interface CompilerPanelProps {
  compilerEngine: CompilerEngine;
  osEngine: OsEngine;
}

export function CompilerPanel({ compilerEngine, osEngine }: CompilerPanelProps) {
  const [source, setSource] = useState('{\n\tint a\n\ta = 0\n\tint b\n\tb = 0\n\tprint(b)\n\tstring c\n\tstring d\n\tprint(a)\n}$');

  const result = compilerEngine.lastResult;

  const handleCompile = useCallback(() => {
    compilerEngine.compile(source);
  }, [compilerEngine, source]);

  const handleToggleVerbose = useCallback(() => {
    compilerEngine.verbose = !compilerEngine.verbose;
    compilerEngine.emitUpdate();
  }, [compilerEngine]);

  return (
    <div className="flex flex-col min-w-0 h-full" style={{ flex: '1 1 50%' }}>
      <CompilerToolbar
        onCompile={handleCompile}
        verbose={compilerEngine.verbose}
        onToggleVerbose={handleToggleVerbose}
        onSelectExample={setSource}
      />

      <div className="flex-1 flex min-h-0">
        {/* Code editor */}
        <div className="flex-1 min-w-0">
          <CodeEditor value={source} onChange={setSource} />
        </div>

        {/* Output panels */}
        <div className="flex flex-col gap-1 p-1 overflow-y-auto"
          style={{
            width: 340,
            minWidth: 280,
            background: 'var(--bg-deep)',
            borderLeft: '1px solid var(--border-dim)',
          }}>
          <CompilerLog logs={result?.logs ?? []} />
          <TokenTable tokens={result?.tokens ?? []} />
          <TreeDisplay root={result?.cstRoot} label="CST" />
          <TreeDisplay root={result?.astRoot} label="AST" />
          <SymbolTablePanel symbols={result?.symbolTable ?? null} />
          <HexOutput hexOutput={result?.hexOutput ?? ''} osEngine={osEngine} />
        </div>
      </div>
    </div>
  );
}
