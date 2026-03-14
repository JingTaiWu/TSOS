import { useRef, useState, useCallback, useEffect } from 'react';
import { OsEngine } from '../os/OsEngine';

export function useOsEngine() {
  const engineRef = useRef<OsEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new OsEngine();
  }
  const engine = engineRef.current;

  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    const unsub = engine.onUpdate(forceUpdate);
    // Throttle updates to ~30fps for React rendering
    let frameId: number;
    const throttledUpdate = engine.onUpdate(() => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(forceUpdate);
    });
    return () => { unsub(); throttledUpdate(); cancelAnimationFrame(frameId); };
  }, [engine, forceUpdate]);

  return engine;
}
