import type { OsEngine } from '../os/OsEngine';
import { TopBar } from './TopBar';
import { Terminal } from './Terminal';
import { CpuPanel } from './CpuPanel';
import { PcbPanel } from './PcbPanel';
import { MemoryPanel } from './MemoryPanel';
import { HardDrivePanel } from './HardDrivePanel';
import { LogPanel } from './LogPanel';
import { ProgramInput } from './ProgramInput';

export function TsosPanel({ engine }: { engine: OsEngine }) {
  return (
    <div className="flex flex-col min-w-0 h-full" style={{ flex: '1 1 50%' }}>
      {/* TSOS top bar */}
      <TopBar engine={engine} />

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Terminal */}
        <div className="flex-1 flex flex-col min-w-0">
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
          <div className="flex-1 min-h-0">
            <Terminal engine={engine} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-1 p-1 overflow-y-auto"
          style={{
            width: 380,
            minWidth: 340,
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
