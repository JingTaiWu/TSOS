import { useOsEngine } from './hooks/useOsEngine';
import { useCompilerEngine } from './hooks/useCompilerEngine';
import { CompilerPanel } from './components/compiler/CompilerPanel';
import { TsosPanel } from './components/TsosPanel';

export default function App() {
  const osEngine = useOsEngine();
  const compilerEngine = useCompilerEngine();

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-deep)' }}>
      {/* CRT scanline overlay */}
      <div className="crt-overlay" />

      {/* Split layout: Compiler | TSOS */}
      <div className="flex-1 flex min-h-0">
        <CompilerPanel compilerEngine={compilerEngine} osEngine={osEngine} />
        <div className="w-px" style={{ background: 'var(--border-glow)' }} />
        <TsosPanel engine={osEngine} />
      </div>
    </div>
  );
}
