import { Power, Square, RotateCcw, StepForward, Pause, Play, Bell } from 'lucide-react';
import type { OsEngine } from '../os/OsEngine';

interface TopBarProps {
  engine: OsEngine;
}

export function TopBar({ engine }: TopBarProps) {
  const snap = engine.getSnapshot();

  return (
    <div className="flex items-center h-11 px-4 gap-4"
      style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-dim)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <Bell size={16} style={{ color: 'var(--accent-amber)' }} />
        <span className="text-sm font-bold tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <span style={{ color: 'var(--accent-cyan)' }}>JINGLE</span>
          <span style={{ color: 'var(--accent-amber)' }}> OS</span>
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5" style={{ background: 'var(--border-glow)' }} />

      {/* Controls */}
      <div className="flex items-center gap-1">
        {!snap.running ? (
          <button onClick={() => engine.start()}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all"
            style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', border: '1px solid transparent' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-green)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
            <Power size={12} /> START
          </button>
        ) : (
          <>
            <button onClick={() => engine.stop()}
              className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all"
              style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', border: '1px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-red)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <Square size={10} /> STOP
            </button>
            <button onClick={() => engine.reset()}
              className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all"
              style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', border: '1px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
              <RotateCcw size={12} /> RESET
            </button>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5" style={{ background: 'var(--border-glow)' }} />

      {/* Step Mode */}
      {snap.running && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { engine.stepMode = !engine.stepMode; engine.emitUpdate(); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all"
            style={{
              background: snap.stepMode ? 'var(--accent-amber-dim)' : 'var(--bg-surface)',
              color: snap.stepMode ? 'var(--accent-amber)' : 'var(--text-dim)',
              border: `1px solid ${snap.stepMode ? 'var(--accent-amber)' : 'var(--border-dim)'}`,
            }}>
            {snap.stepMode ? <Pause size={10} /> : <Play size={10} />}
            STEP
          </button>
          {snap.stepMode && (
            <button onClick={() => engine.nextStep()}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
              style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)', border: '1px solid var(--accent-amber)' }}>
              <StepForward size={12} /> NEXT
            </button>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className={`status-dot ${snap.running ? (snap.cpu.isExecuting ? 'running' : 'idle') : 'stopped'}`} />
          <span style={{ color: 'var(--text-dim)' }}>
            {snap.running ? (snap.cpu.isExecuting ? 'EXECUTING' : 'IDLE') : 'OFF'}
          </span>
        </div>
        <span style={{ color: 'var(--text-dim)' }}>CLK:{snap.clock}</span>
        <span style={{ color: 'var(--accent-cyan)', fontSize: 12 }}>
          {snap.scheduler.algorithm}
        </span>
        <span style={{ color: 'var(--text-dim)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {snap.statusMessage}
        </span>
      </div>
    </div>
  );
}
