import { useState, useRef, useCallback } from 'react';

interface UseStopwatchReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  stop: () => number;
  reset: () => void;
}

export function useStopwatch(): UseStopwatchReturn {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const startTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const currentTimeRef = useRef<number>(0);

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const rounded = Math.round(elapsed * 1000) / 1000;
    currentTimeRef.current = rounded;
    setTime(rounded);
    rafIdRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    currentTimeRef.current = 0;
    setTime(0);
    setIsRunning(true);
    startTimeRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback((): number => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    const finalTime = (performance.now() - startTimeRef.current) / 1000;
    const rounded = Math.round(finalTime * 1000) / 1000;
    currentTimeRef.current = rounded;
    setTime(rounded);
    setIsRunning(false);
    return rounded;
  }, []);

  const reset = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    currentTimeRef.current = 0;
    setTime(0);
    setIsRunning(false);
  }, []);

  return { time, isRunning, start, stop, reset };
}
