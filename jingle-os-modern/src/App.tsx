import { useOsEngine } from './hooks/useOsEngine';
import { Terminal } from './components/Terminal';
import { TopBar } from './components/TopBar';
import { CpuPanel } from './components/CpuPanel';
import { PcbPanel } from './components/PcbPanel';
import { MemoryPanel } from './components/MemoryPanel';
import { HardDrivePanel } from './components/HardDrivePanel';
import { LogPanel } from './components/LogPanel';
import { ProgramInput } from './components/ProgramInput';

export default function App() {
  const engine = useOsEngine();

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-deep)' }}>
      {/* CRT scanline overlay */}
      <div className="crt-overlay" />

      {/* Top bar */}
      <TopBar engine={engine} />

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Terminal (dominant left panel) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Terminal toolbar */}
          <div className="flex items-center gap-2 px-3 py-1.5"
            style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-dim)' }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
            </div>
            <span className="text-xs ml-2" style={{ color: 'var(--text-dim)' }}>
              jingle-os — terminal
            </span>
            <div className="flex-1" />
            <ProgramInput engine={engine} />
          </div>
          {/* Terminal area */}
          <div className="flex-1 min-h-0">
            <Terminal engine={engine} />
          </div>
        </div>

        {/* Right sidebar panels */}
        <div className="flex flex-col gap-1 p-1 overflow-y-auto"
          style={{
            width: 440,
            minWidth: 400,
            background: 'var(--bg-deep)',
            borderLeft: '1px solid var(--border-dim)',
          }}>
          <CpuPanel engine={engine} />
          <PcbPanel engine={engine} />
          <MemoryPanel engine={engine} />
          <HardDrivePanel engine={engine} />
          <LogPanel engine={engine} />
        </div>
      </div>
    </div>
  );
}
