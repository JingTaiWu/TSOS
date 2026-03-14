import { Play, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { EXAMPLE_PROGRAMS } from '../../compiler/examples';

interface CompilerToolbarProps {
  onCompile: () => void;
  verbose: boolean;
  onToggleVerbose: () => void;
  onSelectExample: (code: string) => void;
}

export function CompilerToolbar({ onCompile, verbose, onToggleVerbose, onSelectExample }: CompilerToolbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5"
      style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-dim)' }}>

      <span className="text-xs font-bold tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <span style={{ color: 'var(--accent-green)' }}>JING</span>
        <span style={{ color: 'var(--accent-amber)' }}>-PILER</span>
      </span>

      <div className="w-px h-5 mx-1" style={{ background: 'var(--border-glow)' }} />

      <button onClick={onCompile}
        className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all"
        style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', border: '1px solid transparent' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-green)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
        <Play size={11} /> COMPILE
      </button>

      <button onClick={onToggleVerbose}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all"
        style={{
          background: verbose ? 'var(--accent-amber-dim)' : 'var(--bg-surface)',
          color: verbose ? 'var(--accent-amber)' : 'var(--text-dim)',
          border: `1px solid ${verbose ? 'var(--accent-amber)' : 'var(--border-dim)'}`,
        }}>
        {verbose ? <Eye size={11} /> : <EyeOff size={11} />}
        {verbose ? 'VERBOSE' : 'QUIET'}
      </button>

      <div className="relative">
        <button onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all"
          style={{ background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', border: '1px solid transparent' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-purple)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
          EXAMPLES <ChevronDown size={11} />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 rounded-md overflow-hidden z-50 w-56"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glow)' }}>
            {EXAMPLE_PROGRAMS.map((ex, i) => (
              <button key={i}
                className="block w-full text-left px-3 py-2 text-xs transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                onClick={() => { onSelectExample(ex.code); setDropdownOpen(false); }}>
                <span style={{ color: 'var(--accent-purple)' }}>{ex.name}</span>
                <span className="ml-2" style={{ color: 'var(--text-dim)' }}>{ex.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
