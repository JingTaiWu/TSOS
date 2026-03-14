import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import type { OsEngine } from '../os/OsEngine';

export function ProgramInput({ engine }: { engine: OsEngine }) {
  const [open, setOpen] = useState(false);
  const [program, setProgram] = useState(
    'A9 03 8D 41 00 A9 01 8D 40 00 AC 40 00 A2 01 FF EE 40 00 AE 40 00 EC 41 00 D0 EF A9 44 8D 42 00 A9 4F 8D 43 00 A9 4E 8D 44 00 A9 45 8D 45 00 A9 00 8D 46 00 A2 02 A0 42 FF 00'
  );

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all"
        style={{ background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', border: '1px solid transparent' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-purple)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
        <Upload size={11} /> LOAD PROGRAM
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-[520px] rounded-lg overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glow)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-dim)' }}>
              <span className="text-xs font-bold tracking-wider" style={{ color: 'var(--accent-purple)' }}>USER PROGRAM INPUT</span>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-dim)' }}><X size={16} /></button>
            </div>
            <div className="p-4">
              <textarea
                value={program}
                onChange={e => setProgram(e.target.value)}
                className="w-full h-32 p-3 rounded text-xs resize-none outline-none"
                style={{
                  background: 'var(--bg-deep)',
                  color: 'var(--accent-green)',
                  border: '1px solid var(--border-dim)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                placeholder="Enter hex program (e.g., A9 03 8D 41 00 ...)"
                spellCheck={false}
              />
              <p className="mt-2 text-xs" style={{ color: 'var(--text-dim)' }}>
                Enter space-separated hex bytes (6502 opcodes). Default: a counting program that prints "DONE".
              </p>
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setOpen(false)}
                  className="px-3 py-1.5 rounded text-xs"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-dim)', border: '1px solid var(--border-dim)' }}>
                  Cancel
                </button>
                <button onClick={() => { engine.userProgram = program; setOpen(false); }}
                  className="px-3 py-1.5 rounded text-xs font-semibold"
                  style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', border: '1px solid var(--accent-green)' }}>
                  Set Program
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
