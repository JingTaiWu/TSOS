import { useRef, useState, useCallback, useEffect } from 'react';
import { CompilerEngine } from '../compiler/CompilerEngine';

export function useCompilerEngine() {
  const engineRef = useRef<CompilerEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new CompilerEngine();
  }
  const engine = engineRef.current;

  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    const unsub = engine.onUpdate(forceUpdate);
    return () => { unsub(); };
  }, [engine, forceUpdate]);

  return engine;
}
