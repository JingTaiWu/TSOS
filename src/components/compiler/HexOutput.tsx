import { Send, Rocket } from 'lucide-react';
import type { OsEngine } from '../../os/OsEngine';

interface HexOutputProps {
  hexOutput: string;
  osEngine: OsEngine;
}

export function HexOutput({ hexOutput, osEngine }: HexOutputProps) {
  const hasOutput = hexOutput.length > 0;

  const sendToTsos = (autoRun: boolean) => {
    if (!hasOutput) return;
    osEngine.userProgram = hexOutput;
    if (!osEngine.running) osEngine.start();
    if (autoRun) {
      setTimeout(() => {
        osEngine.handleTerminalInput('load');
        setTimeout(() => {
          const processes = osEngine.getProcessList();
          const lastPid = processes.length > 0 ? processes[processes.length - 1].pid : 0;
          osEngine.handleTerminalInput('run ' + lastPid);
        }, 100);
      }, 200);
    }
  };

  return (
    <div className="os-panel">
      <div className="os-panel-header">
        <span>Executable Image</span>
        {hasOutput && (
          <div className="flex gap-1">
            <button onClick={() => sendToTsos(false)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold transition-all"
              style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', border: '1px solid transparent', fontSize: 10 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <Send size={9} /> SEND
            </button>
            <button onClick={() => sendToTsos(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold transition-all"
              style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', border: '1px solid transparent', fontSize: 10 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-green)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <Rocket size={9} /> SEND & RUN
            </button>
          </div>
        )}
      </div>
      <div className="os-panel-body" style={{ maxHeight: 120, overflowY: 'auto' }}>
        {!hasOutput ? (
          <div className="text-xs" style={{ color: 'var(--text-dim)' }}>No executable image generated.</div>
        ) : (
          <div className="text-xs font-mono break-all" style={{ color: 'var(--accent-amber)', lineHeight: 1.6, letterSpacing: '0.05em' }}>
            {hexOutput}
          </div>
        )}
      </div>
    </div>
  );
}
