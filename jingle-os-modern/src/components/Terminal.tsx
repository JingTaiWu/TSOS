import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import type { OsEngine } from '../os/OsEngine';

interface TerminalProps {
  engine: OsEngine;
}

export function Terminal({ engine }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const lineBuffer = useRef('');

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#0c0c14',
        foreground: '#c8c8d8',
        cursor: '#00e5ff',
        cursorAccent: '#0c0c14',
        selectionBackground: '#00e5ff33',
        black: '#0c0c14',
        red: '#ff2d55',
        green: '#39ff14',
        yellow: '#ffb700',
        blue: '#4488ff',
        magenta: '#b388ff',
        cyan: '#00e5ff',
        white: '#e0e0e8',
        brightBlack: '#555568',
        brightRed: '#ff6b8a',
        brightGreen: '#7aff5c',
        brightYellow: '#ffd44e',
        brightBlue: '#6ea8ff',
        brightMagenta: '#d4b3ff',
        brightCyan: '#5ceeff',
        brightWhite: '#ffffff',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 15,
      lineHeight: 1.35,
      cursorBlink: true,
      cursorStyle: 'block',
      allowProposedApi: true,
      scrollback: 1000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitRef.current = fitAddon;

    // Wire terminal writer
    engine.setTerminalWriter((text: string) => term.write(text));

    // Handle keyboard input
    term.onData((data: string) => {
      if (!engine.running) return;

      if (data === '\r') {
        // Enter key
        term.write('\r\n');
        engine.handleTerminalInput(lineBuffer.current);
        lineBuffer.current = '';
      } else if (data === '\x7f' || data === '\b') {
        // Backspace
        if (lineBuffer.current.length > 0) {
          lineBuffer.current = lineBuffer.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (data === '\x1b[A') {
        // Up arrow - command history
        if (engine.shell.cursor > 0) {
          // Clear current line
          while (lineBuffer.current.length > 0) {
            term.write('\b \b');
            lineBuffer.current = lineBuffer.current.slice(0, -1);
          }
          engine.shell.cursor--;
          const histCmd = engine.shell.history[engine.shell.cursor] || '';
          lineBuffer.current = histCmd;
          term.write(histCmd);
        }
      } else if (data === '\x1b[B') {
        // Down arrow
        while (lineBuffer.current.length > 0) {
          term.write('\b \b');
          lineBuffer.current = lineBuffer.current.slice(0, -1);
        }
        if (engine.shell.cursor < engine.shell.history.length - 1) {
          engine.shell.cursor++;
          const histCmd = engine.shell.history[engine.shell.cursor] || '';
          lineBuffer.current = histCmd;
          term.write(histCmd);
        } else {
          engine.shell.cursor = engine.shell.history.length;
          lineBuffer.current = '';
        }
      } else if (data === '\t') {
        // Tab autocomplete
        if (lineBuffer.current.length > 0) {
          const match = engine.shell.commandList.find(c =>
            c.command.startsWith(lineBuffer.current.toLowerCase())
          );
          if (match) {
            while (lineBuffer.current.length > 0) {
              term.write('\b \b');
              lineBuffer.current = lineBuffer.current.slice(0, -1);
            }
            lineBuffer.current = match.command;
            term.write(match.command);
          }
        }
      } else if (data >= ' ') {
        // Normal printable character
        lineBuffer.current += data;
        term.write(data);
      }
    });

    // Resize handler
    const resizeObserver = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch {}
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [engine]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#0c0c14' }}
    />
  );
}
